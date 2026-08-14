(() => {
  "use strict";

  const GROWTH_URL = "data/pal-growth-v1.json?v=118";
  const WORK_ORDER = typeof WORKS !== "undefined" ? WORKS : [];
  const growthState = {
    status: "loading",
    error: "",
    byName: new Map(),
    selectedStar: new Map(),
    skillFilter: new Map(),
  };

  const previousRenderPalDetail = window.renderPalDetail;
  const previousRenderPaldex = window.renderPaldex;
  const previousSortPaldexPals = window.sortPaldexPals;

  const normalizeGrowthKey = value => String(value || "").normalize("NFKC").toLowerCase().replace(/[^a-z0-9]+/g, "");
  const numeric = value => value === null || value === undefined || value === "" ? null : (Number.isFinite(Number(value)) ? Number(value) : null);

  function growthForPal(pal) {
    return pal ? growthState.byName.get(normalizeGrowthKey(pal.enName)) || null : null;
  }

  function selectedStarFor(pal) {
    return Math.max(0, Math.min(4, Number(growthState.selectedStar.get(pal?.id) || 0)));
  }

  function statRank(pal, key) {
    const value = numeric(pal?.[key]);
    if (value === null) return null;
    const values = state.pals.map(item => numeric(item?.[key])).filter(item => item !== null);
    return 1 + values.filter(item => item > value).length;
  }

  function rankLabel(rank) {
    if (!rank) return "順位 —";
    const total = state.pals.length || 299;
    if (rank === 1) return `1位 / ${total}`;
    const rate = rank / total;
    const tier = rate <= 0.1 ? "上位10%" : rate <= 0.25 ? "上位25%" : "";
    return `${rank}位 / ${total}${tier ? `・${tier}` : ""}`;
  }

  function decorateStatRanks(root, pal) {
    if (!root || !pal) return;
    const statRoot = root.querySelector(".pal-stats--detail");
    if (!statRoot) return;
    const keyByLabel = { "HP": "hp", "攻撃": "attack", "防御": "defense", "合計": "statTotal" };
    statRoot.querySelectorAll(":scope > span").forEach(cell => {
      const label = cell.querySelector("small")?.textContent?.trim();
      const key = keyByLabel[label];
      if (!key) return;
      cell.querySelector(".pal-stat-rank")?.remove();
      const rank = statRank(pal, key);
      cell.insertAdjacentHTML("beforeend", `<em class="pal-stat-rank${rank && rank <= 10 ? " is-top" : ""}">${escapeHtml(rankLabel(rank))}</em>`);
    });
  }

  function starStatBonus(star) {
    return star <= 0 ? "補正なし" : `HP・攻撃・防御 +${star * 5}%`;
  }

  function workBoostState(pal, star) {
    const works = Array.isArray(pal?.works) ? pal.works : [];
    if (!works.length) return [];
    const boosted = Number(star) >= 4;
    return works.map(work => ({
      ...work,
      boost: boosted ? "guaranteed" : "none",
      displayLevel: Number(work.level || 0) + (boosted ? 1 : 0),
    }));
  }

  function workPreview(pal, star) {
    const works = workBoostState(pal, star);
    if (!works.length) return `<p class="form-help">作業適性はありません。</p>`;
    return `<div class="growth-work-grid">${works.map(work => {
      const changed = work.boost === "guaranteed";
      return `<span class="growth-work-chip${changed ? " is-boosted" : ""}"><small>${escapeHtml(work.name)}</small><strong>Lv.${escapeHtml(work.displayLevel)}</strong>${changed ? `<em>+1</em>` : ""}</span>`;
    }).join("")}</div>`;
  }

  function partnerStar(growth, star) {
    return growth?.partnerSkill?.stars?.find(item => Number(item.star) === Number(star)) || null;
  }

  function partnerStarMarkup(growth, star) {
    const row = partnerStar(growth, star);
    if (!row) return `<p class="form-help">この★段階の数値データはPalDBで確認できませんでした。</p>`;
    const effects = Array.isArray(row.effects) ? row.effects : [];
    return `<div class="growth-partner-value"><div><span class="section-kicker">PARTNER SKILL Lv.${row.partnerLevel || star + 1}</span><strong>${escapeHtml(growth?.partnerSkill?.name || "パートナースキル")}</strong></div><div class="growth-effect-list">${effects.length ? effects.map(effect => `<span>${escapeHtml(effect)}</span>`).join("") : `<span>数値変化なし / 未判定</span>`}</div></div>`;
  }

  function starTabs(pal, selected) {
    return `<div class="growth-star-tabs" role="tablist" aria-label="★強化段階">${[0,1,2,3,4].map(star => `<button type="button" role="tab" class="growth-star-tab${selected === star ? " is-active" : ""}" aria-selected="${selected === star}" data-growth-star="${escapeHtml(pal.id)}|${star}"><span>${star === 0 ? "☆0" : "★".repeat(star)}</span><small>${starStatBonus(star)}</small></button>`).join("")}</div>`;
  }

  function skillFilterFor(pal) {
    return growthState.skillFilter.get(pal?.id) || "all";
  }

  function filteredSkills(pal, growth) {
    const filter = skillFilterFor(pal);
    const skills = Array.isArray(growth?.activeSkills) ? growth.activeSkills : [];
    if (filter === "high") return skills.filter(skill => Number(skill.level) >= 40);
    if (filter === "exclusive") return skills.filter(skill => skill.exclusive);
    return skills;
  }

  function skillMarkup(pal, growth) {
    const all = Array.isArray(growth?.activeSkills) ? growth.activeSkills : [];
    if (!all.length) return `<p class="form-help">PalDBでLv習得スキルを確認できませんでした。</p>`;
    const active = skillFilterFor(pal);
    const skills = filteredSkills(pal, growth);
    const buttons = [["all",`すべて ${all.length}`],["high",`Lv40+ ${all.filter(s=>Number(s.level)>=40).length}`],["exclusive",`専用 ${all.filter(s=>s.exclusive).length}`]];
    return `<div class="growth-skill-toolbar">${buttons.map(([key,label]) => `<button type="button" class="growth-skill-filter${active === key ? " is-active" : ""}" data-growth-skill-filter="${escapeHtml(pal.id)}|${key}">${escapeHtml(label)}</button>`).join("")}</div><div class="growth-skill-list">${skills.length ? skills.map(skill => `<article class="growth-skill-row"><span class="growth-skill-level">Lv.${escapeHtml(skill.level)}</span><div class="growth-skill-main"><div class="growth-skill-title"><strong>${escapeHtml(skill.name)}</strong>${skill.exclusive ? `<span class="issue-badge">専用</span>` : ""}${skill.element ? `<span class="element-tag">${escapeHtml(skill.element)}</span>` : ""}</div><div class="growth-skill-metrics"><span><small>威力</small><strong>${skill.power ?? "—"}</strong></span><span><small>CT</small><strong>${skill.ct ?? "—"}</strong></span></div>${Array.isArray(skill.effects) && skill.effects.length ? `<div class="growth-skill-effects">${skill.effects.map(effect => `<span>${escapeHtml(effect)}</span>`).join("")}</div>` : ""}</div></article>`).join("") : `<p class="form-help">この条件に該当するスキルはありません。</p>`}</div>`;
  }

  function growthMarkup(pal, growth) {
    if (growthState.status === "loading") return `<section class="detail-section pal-growth-loading"><h3>★強化・習得スキル</h3><p class="form-help">育成データを読み込んでいます。</p></section>`;
    if (!growth) return `<section class="detail-section pal-growth-loading"><h3>★強化・習得スキル</h3><p class="form-help">このパルの固定育成データを確認できませんでした。</p></section>`;
    const star = selectedStarFor(pal);
    return `<div class="pal-growth" data-growth-pal="${escapeHtml(pal.id)}">
      <section class="detail-section pal-growth-section">
        <div class="pal-growth-heading"><div><span class="section-kicker">CONDENSATION</span><h3>★強化シミュレーター</h3></div><span class="growth-source">PalDB / Palworld Wiki 1.0</span></div>
        <p class="form-help">★を選ぶと、パートナースキルの実値と作業適性の変化を同時に確認できます。HP・攻撃・防御は★ごとに5%ずつ上昇します。</p>
        ${starTabs(pal, star)}
        <div class="growth-star-detail">
          ${partnerStarMarkup(growth, star)}
          <div class="growth-work-panel"><div class="growth-subheading"><strong>作業適性</strong><span>${star === 4 ? "★4で全適性+1" : star > 0 ? `★${star}では適性Lvは基礎値のまま` : "基礎値"}</span></div>${workPreview(pal, star)}${star > 0 && star < 4 ? `<p class="form-help growth-work-note">★1〜3では作業適性Lvは変化しません。★4になると、元から持つすべての作業適性が+1されます。</p>` : ""}</div>
        </div>
      </section>
      <details class="detail-section pal-growth-section pal-growth-skills" open>
        <summary><span>Lv習得スキル</span><small>${growth.activeSkills?.length || 0}件</small></summary>
        <div class="pal-growth-skills__body"><p class="form-help">レベルアップで自然習得するスキルです。CTは再使用までの時間、威力はPalDBの基礎威力です。</p>${skillMarkup(pal, growth)}</div>
      </details>
      <div class="pal-growth-source"><span>固定データ取得日: ${escapeHtml(growthState.retrieved || "—")}</span><a href="${escapeHtml(growth.sourceUrl || "https://paldb.cc/ja/")}" target="_blank" rel="noopener noreferrer">PalDBで確認</a></div>
    </div>`;
  }

  function appendGrowth(root, pal) {
    if (!root || !pal) return;
    root.querySelectorAll(".pal-growth,.pal-growth-loading").forEach(node => node.remove());
    const body = root.querySelector(".pal-detail-body") || root;
    const extra = root.querySelector(".pal-extra-v111");
    if (extra) extra.insertAdjacentHTML("afterend", growthMarkup(pal, growthForPal(pal)));
    else body.insertAdjacentHTML("beforeend", growthMarkup(pal, growthForPal(pal)));
  }

  window.renderPalDetail = function renderPalDetailGrowth(root = byId("palDetail")) {
    previousRenderPalDetail(root);
    if (!root) return;
    const available = availablePalsForPaldex();
    const pal = getPal(state.selectedPalId) || available[0];
    if (!pal) return;
    decorateStatRanks(root, pal);
    appendGrowth(root, pal);
  };

  function workSortValue(pal) {
    const selected = byId("paldexWork")?.value || "";
    const works = Array.isArray(pal?.works) ? pal.works : [];
    if (selected) return numeric(works.find(work => work.name === selected)?.level) ?? -1;
    return works.length ? Math.max(...works.map(work => Number(work.level || 0))) : -1;
  }

  window.sortPaldexPals = function sortPaldexPalsGrowth(pals) {
    const mode = state.paldexSort || "numberAsc";
    if (mode !== "workDesc" && mode !== "workAsc") return previousSortPaldexPals(pals);
    const direction = mode === "workDesc" ? -1 : 1;
    return [...pals].sort((a, b) => {
      const delta = workSortValue(a) - workSortValue(b);
      return (delta * direction) || paldexNumberCompare(a, b) || a.name.localeCompare(b.name, "ja");
    });
  };

  function decorateWorkSortCards() {
    const mode = state.paldexSort || "numberAsc";
    const selectedWork = byId("paldexWork")?.value || "";
    byId("paldexGrid")?.querySelectorAll("[data-pal-detail]").forEach(card => {
      card.querySelector(".paldex-work-score")?.remove();
      if (mode !== "workDesc" && mode !== "workAsc") return;
      const pal = getPal(card.dataset.palDetail);
      if (!pal) return;
      const value = workSortValue(pal);
      const label = selectedWork || "最高適性";
      card.insertAdjacentHTML("beforeend", `<span class="paldex-work-score"><small>${escapeHtml(label)}</small><strong>${value >= 0 ? `Lv.${value}` : "—"}</strong></span>`);
    });
  }

  window.renderPaldex = function renderPaldexGrowth() {
    previousRenderPaldex();
    decorateWorkSortCards();
  };

  function injectWorkSortOptions() {
    const sort = byId("paldexSort");
    if (!sort || sort.querySelector('[value="workDesc"]')) return;
    const group = document.createElement("optgroup");
    group.label = "作業適性";
    group.innerHTML = `<option value="workDesc">作業適性Lvが高い順</option><option value="workAsc">作業適性Lvが低い順</option>`;
    sort.appendChild(group);
  }

  function handleGrowthClick(event) {
    const starButton = event.target.closest("[data-growth-star]");
    if (starButton) {
      const [palId, star] = starButton.dataset.growthStar.split("|");
      growthState.selectedStar.set(palId, Number(star));
      renderPalDetail();
      return;
    }
    const filterButton = event.target.closest("[data-growth-skill-filter]");
    if (filterButton) {
      const [palId, filter] = filterButton.dataset.growthSkillFilter.split("|");
      growthState.skillFilter.set(palId, filter);
      renderPalDetail();
    }
  }

  function handleDialogBackdrop(event) {
    const dialog = event.target;
    if (!(dialog instanceof HTMLDialogElement) || !dialog.open) return;
    const rect = dialog.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (!outside) return;
    event.preventDefault();
    dialog.close();
  }

  async function loadGrowthData() {
    try {
      const response = await fetch(GROWTH_URL, { cache: "default" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (!Array.isArray(payload?.records) || payload.records.length !== 299) throw new Error("育成データ件数が不正です");
      growthState.byName.clear();
      payload.records.forEach(record => growthState.byName.set(normalizeGrowthKey(record.enName), record));
      growthState.retrieved = payload.retrieved || "";
      growthState.status = "ready";
      injectWorkSortOptions();
      if (typeof renderPaldex === "function") renderPaldex();
      if (typeof renderPalDetail === "function") renderPalDetail();
    } catch (error) {
      console.error("Pal growth data load failed", error);
      growthState.status = "error";
      growthState.error = error.message;
      if (typeof renderPalDetail === "function") renderPalDetail();
    }
  }

  document.addEventListener("click", handleGrowthClick);
  document.addEventListener("click", handleDialogBackdrop, true);
  injectWorkSortOptions();
  loadGrowthData();
})();
