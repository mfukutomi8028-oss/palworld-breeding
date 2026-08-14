(() => {
  "use strict";

  const growth = window.PalGrowthV119;
  if (!growth) return;

  const originalRenderPalDetail = window.renderPalDetail;
  const ELEMENT_JA = { Neutral: "無", Normal: "無", Fire: "炎", Water: "水", Electric: "雷", Electricity: "雷", Thunder: "雷", Grass: "草", Ice: "氷", Ground: "地", Dark: "闇", Dragon: "竜" };
  const workStarByPal = new Map();
  const skillFilterByPal = new Map();

  function effectLabel(key, index) {
    const elements = { Fire: "炎", Water: "水", Electric: "雷", Electricity: "雷", Thunder: "雷", Grass: "草", Ice: "氷", Ground: "地", Dark: "闇", Dragon: "竜", Normal: "無" };
    if (/TrainerDEF/i.test(key)) return "プレイヤー防御力";
    if (/TrainerATK/i.test(key)) return "プレイヤー攻撃力";
    if (/TrainerHP/i.test(key)) return "プレイヤーHP";
    if (/MoveSpeed/i.test(key)) return "移動速度";
    if (/WorkSpeed/i.test(key)) return "作業速度";
    if (/Weight/i.test(key)) return "最大所持重量";
    const match = key.match(/(?:ElementAddDrop|ElementBoostWeakness|ElementBoost|ElementResist)_([A-Za-z]+)/i);
    if (match) {
      const element = elements[match[1]] || match[1];
      if (/ElementAddDrop/i.test(key)) return `${element}属性パルのドロップ増加`;
      if (/ElementBoostWeakness/i.test(key)) return `${element}属性・弱点強化`;
      if (/ElementBoost/i.test(key)) return `${element}属性ダメージ強化`;
      return `${element}属性耐性`;
    }
    if (/Heal/i.test(key)) return "回復効果";
    if (/Drop/i.test(key)) return "ドロップ増加";
    if (/Damage|Attack|ATK/i.test(key)) return "攻撃効果";
    if (/Defense|DEF/i.test(key)) return "防御効果";
    return `効果${index + 1}`;
  }

  function unitFor(key) {
    return /(TrainerDEF|TrainerATK|TrainerHP|MoveSpeed|WorkSpeed|ElementAddDrop|ElementBoost|ElementResist|DropRate)/i.test(key) ? "%" : "";
  }

  function rankSeries(raw) {
    const rows = [];
    const pattern = /([A-Za-z0-9_]+)\(1★=([-+\d.]+)\s+2★=([-+\d.]+)\s+3★=([-+\d.]+)\s+4★=([-+\d.]+)\s+5★=([-+\d.]+)\)/g;
    let match;
    while ((match = pattern.exec(String(raw?.description || "")))) rows.push({ key: match[1], values: match.slice(2, 7).map(Number) });
    if (!rows.length && Array.isArray(raw?.values) && raw.values.length >= 5) rows.push({ key: raw.skillType || "PartnerSkill", values: raw.values.slice(0, 5).map(Number) });
    return rows.filter(row => row.values.every(Number.isFinite));
  }

  function partnerMarkup(pal, root) {
    const raw = growth.data.partner.get(pal.engineCode);
    const rows = rankSeries(raw);
    if (!rows.length) return '<div class="progression-empty-v119"><strong>★別効果データなし</strong></div>';
    const name = root.querySelector(".partner-skill-copy-v113 h4")?.textContent?.trim() || "パートナースキル";
    return `<div class="partner-rank-head-v119"><h4>${escapeHtml(name)}</h4><span>★0 → ★4</span></div>
      <div class="partner-effects-v119">${rows.map((row, index) => `<div class="partner-effect-v119"><strong>${escapeHtml(effectLabel(row.key, index))}</strong><div class="partner-effect-values-v119">${row.values.map((value, star) => `<span class="${star === 4 ? "is-max" : ""}"><small>★${star}</small><b>${escapeHtml(`${Number.isInteger(value) ? value : value.toFixed(2)}${unitFor(row.key)}`)}</b></span>`).join("")}</div></div>`).join("")}</div>`;
  }

  function workLevelsAtStar(pal, star) {
    const works = Array.isArray(pal?.works) ? pal.works.map((work, index) => ({ name: work.name, level: Number(work.level) || 0, index })) : [];
    const rank = Math.max(0, Math.min(4, Number(star) || 0));
    if (!works.length || rank === 0) return works;
    const levels = new Map(works.map(work => [work.name, work.level]));
    const priority = [...works].sort((a, b) => b.level - a.level || a.index - b.index);
    for (let step = 1; step <= Math.min(rank, 3); step += 1) {
      const target = priority[(step - 1) % priority.length];
      levels.set(target.name, Math.min(10, (levels.get(target.name) || 0) + 1));
    }
    if (rank >= 4) {
      works.forEach(work => levels.set(work.name, Math.min(10, (levels.get(work.name) || 0) + 1));
    }
    return works.map(work => ({ ...work, level: levels.get(work.name) || 0 }));
  }

  function starLabel(star) {
    return `${"★".repeat(star)}${"☆".repeat(4 - star)}`;
  }

  function workMarkup(pal, selectedStar = 0) {
    const base = Array.isArray(pal.works) ? pal.works : [];
    if (!base.length) return '<p class="form-help">作業適性データなし</p>';
    const current = workLevelsAtStar(pal, selectedStar);
    const baseByName = new Map(base.map(work => [work.name, Number(work.level) || 0]));
    return `<div class="work-star-selector-v119" role="radiogroup" aria-label="凝縮ランク">${[0,1,2,3,4].map(star => `<button type="button" role="radio" aria-checked="${star === selectedStar}" class="work-star-button-v119${star === selectedStar ? " is-active" : ""}" data-work-star-v119="${star}" data-pal-id="${escapeHtml(pal.id)}"><b>${starLabel(star)}</b><small>★${star}</small></button>`).join("")}</div>
      <div class="work-star-result-v119">${current.map(work => {
        const before = baseByName.get(work.name) || 0;
        const delta = work.level - before;
        return `<span class="work-star-chip-v119${delta > 0 ? " is-up" : ""}"><strong>${escapeHtml(work.name)}</strong><b>Lv.${escapeHtml(work.level)}</b>${delta > 0 ? `<small>+${delta}</small>` : ""}</span>`;
      }).join("")}</div>`;
  }

  function skillFilters(pal, skills) {
    const saved = skillFilterByPal.get(pal.id) || { sort: "asc", element: "", unique: false };
    const elements = [...new Set(skills.map(skill => ELEMENT_JA[skill.detail?.element] || skill.detail?.element || "").filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja"));
    return `<div class="skill-tools-v119" data-skill-tools-v119="${escapeHtml(pal.id)}">
      <label><span>表示順</span><select data-skill-sort-v119><option value="asc"${saved.sort === "asc" ? " selected" : ""}>習得Lvが低い順</option><option value="desc"${saved.sort === "desc" ? " selected" : ""}>習得Lvが高い順</option></select></label>
      <label><span>属性</span><select data-skill-element-v119><option value="">すべて</option>${elements.map(element => `<option value="${escapeHtml(element)}"${saved.element === element ? " selected" : ""}>${escapeHtml(element)}</option>`).join("")}</select></label>
      <label class="skill-unique-toggle-v119"><input type="checkbox" data-skill-unique-v119${saved.unique ? " checked" : ""}><span>専用技のみ</span></label>
    </div>`;
  }

  function skillsMarkup(pal) {
    const all = growth.skillsFor(pal);
    if (!all.length) return '<div class="progression-empty-v119"><strong>習得スキルデータなし</strong></div>';
    const filter = skillFilterByPal.get(pal.id) || { sort: "asc", element: "", unique: false };
    let skills = all.filter(skill => {
      const element = ELEMENT_JA[skill.detail?.element] || skill.detail?.element || "";
      if (filter.element && element !== filter.element) return false;
      if (filter.unique && !skill.exclusive) return false;
      return true;
    });
    skills = [...skills].sort((a, b) => (filter.sort === "desc" ? b.level - a.level : a.level - b.level) || a.id.localeCompare(b.id));
    return `${skillFilters(pal, all)}<div class="skill-list-v119">${skills.map(skill => {
      const detail = skill.detail || {};
      const element = ELEMENT_JA[detail.element] || detail.element || "—";
      const power = Number.isFinite(Number(detail.power)) ? Number(detail.power) : "—";
      const cooldownRaw = detail.cooldown_seconds ?? detail.cooldown ?? detail.cool_time;
      const cooldown = Number.isFinite(Number(cooldownRaw)) ? `${Number(cooldownRaw)}秒` : "—";
      const description = skill.description || detail.description || "効果詳細なし";
      return `<article class="skill-row-v119${skill.exclusive ? " is-unique" : ""}"><div class="skill-level-v119"><small>習得</small><strong>Lv.${skill.level}</strong></div><div class="skill-main-v119"><div class="skill-title-v119"><h4>${escapeHtml(skill.name)}</h4>${skill.name !== skill.english ? `<small>${escapeHtml(skill.english)}</small>` : ""}${skill.exclusive ? '<span class="skill-unique-badge-v119">専用技</span>' : ""}</div><div class="skill-metrics-v119"><span>属性 <b>${escapeHtml(element)}</b></span><span>威力 <b>${power}</b></span><span>CT <b>${cooldown}</b></span></div><p>${escapeHtml(description)}</p></div></article>`;
    }).join("")}</div>${skills.length ? "" : '<div class="progression-empty-v119"><strong>条件に一致するスキルはありません</strong></div>'}`;
  }

  function sideShell(pal) {
    const star = workStarByPal.get(pal.id) || 0;
    return `<div class="pal-growth-side-v119" data-progression-side-v119="${escapeHtml(pal.id)}">
      <section class="progression-card-v119"><div class="progression-card-title-v119"><h4>パートナースキル ★別効果</h4><span>凝縮</span></div><div data-partner-ranks-v119><div class="progression-loading-v119">★別データを読み込み中</div></div></section>
      <section class="progression-card-v119"><div class="progression-card-title-v119"><h4>作業適性の★強化</h4><span>拠点</span></div><div data-work-ranks-v119>${workMarkup(pal, star)}</div></section>
    </div>`;
  }

  function skillsShell(pal) {
    return `<section class="detail-section progression-card-v119 progression-skills-v119" data-progression-skills-v119="${escapeHtml(pal.id)}"><div class="progression-card-title-v119"><div><span class="section-kicker">ACTIVE SKILLS</span><h3>レベル習得アクティブスキル</h3></div><span>戦闘</span></div><div data-active-skills-v119><div class="progression-loading-v119">習得スキルを読み込み中</div></div></section>`;
  }

  function cleanVisibleSources(root) {
    root.querySelectorAll(".pal-extra-source,.progression-source-v118").forEach(node => node.remove());
    root.querySelectorAll(".form-help,.progression-note-v118").forEach(node => {
      const text = node.textContent || "";
      if (/PalDB|参照:|出典ページ|固定データ取得日|ゲーム抽出データ|palworld-kb/i.test(text)) node.remove();
    });
  }

  function arrange(root, pal) {
    const body = root.querySelector(".pal-detail-body") || root;
    body.querySelectorAll(".pal-growth-overview-v119,.pal-growth-side-v119,.progression-skills-v119").forEach(node => {
      if (!node.matches(".pal-growth-overview-v119")) node.remove();
    });
    const oldWrapper = body.querySelector(".pal-growth-overview-v119");
    if (oldWrapper) {
      const partnerInside = oldWrapper.querySelector(".pal-extra-accordion");
      if (partnerInside) oldWrapper.before(partnerInside);
      oldWrapper.remove();
    }

    const partner = [...body.querySelectorAll(".pal-extra-accordion")].find(item => item.querySelector("summary")?.textContent?.includes("パートナースキル"));
    if (!partner) {
      body.insertAdjacentHTML("beforeend", sideShell(pal) + skillsShell(pal));
      return;
    }
    partner.insertAdjacentHTML("afterend", sideShell(pal) + skillsShell(pal));
    const side = partner.nextElementSibling;
    const wrapper = document.createElement("div");
    wrapper.className = "pal-growth-overview-v119";
    partner.before(wrapper);
    wrapper.append(partner, side);
    cleanVisibleSources(root);
  }

  async function hydrate(root, pal) {
    try {
      await growth.load();
      if (!root.isConnected) return;
      const side = root.querySelector(`[data-progression-side-v119="${CSS.escape(pal.id)}"]`);
      const skills = root.querySelector(`[data-progression-skills-v119="${CSS.escape(pal.id)}"]`);
      if (side) side.querySelector("[data-partner-ranks-v119]").innerHTML = partnerMarkup(pal, root);
      if (skills) skills.querySelector("[data-active-skills-v119]").innerHTML = skillsMarkup(pal);
    } catch (error) {
      console.warn("v119 growth data load failed", error);
      root.querySelectorAll("[data-partner-ranks-v119],[data-active-skills-v119]").forEach(node => { node.innerHTML = '<div class="progression-empty-v119"><strong>追加データを取得できませんでした</strong></div>'; });
    }
  }

  function append(root) {
    if (!root) return;
    const pal = getPal(state.selectedPalId) || availablePalsForPaldex()[0];
    if (!pal) return;
    root.querySelectorAll(".pal-progression-v118").forEach(node => node.remove());
    arrange(root, pal);
    const paldexView = root.closest?.("#view-paldex");
    if (!paldexView || state.currentView === "paldex") hydrate(root, pal);
  }

  function refreshWorkPanel(button) {
    const pal = getPal(button.dataset.palId);
    if (!pal) return;
    const star = Math.max(0, Math.min(4, Number(button.dataset.workStarV119) || 0));
    workStarByPal.set(pal.id, star);
    const panel = button.closest("[data-work-ranks-v119]");
    if (panel) panel.innerHTML = workMarkup(pal, star);
  }

  function refreshSkills(control) {
    const tools = control.closest("[data-skill-tools-v119]");
    if (!tools) return;
    const pal = getPal(tools.dataset.skillToolsV119);
    if (!pal) return;
    skillFilterByPal.set(pal.id, {
      sort: tools.querySelector("[data-skill-sort-v119]")?.value || "asc",
      element: tools.querySelector("[data-skill-element-v119]")?.value || "",
      unique: Boolean(tools.querySelector("[data-skill-unique-v119]")?.checked),
    });
    const section = tools.closest("[data-progression-skills-v119]");
    const target = section?.querySelector("[data-active-skills-v119]");
    if (target) target.innerHTML = skillsMarkup(pal);
  }

  document.addEventListener("click", event => {
    const starButton = event.target.closest("[data-work-star-v119]");
    if (starButton) refreshWorkPanel(starButton);
  });
  document.addEventListener("change", event => {
    if (event.target.matches("[data-skill-sort-v119],[data-skill-element-v119],[data-skill-unique-v119]")) refreshSkills(event.target);
  });

  window.PalGrowthWorkLevelsV119 = workLevelsAtStar;
  window.renderPalDetail = function renderPalDetailV119(root = byId("palDetail")) {
    originalRenderPalDetail(root);
    append(root);
  };
})();
