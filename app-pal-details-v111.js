(() => {
  "use strict";

  const DETAIL_URL = "data/pal-details-v1.json?v=111";
  const DETAIL_CACHE_KEY = "pal-breeding-note:pal-details:111";
  const COMPARE_LIMIT = 3;
  const compareStorageKey = () => `pal-breeding-note:compare:v111:${state.roomId}`;
  const detailState = { status: "loading", error: "", byName: new Map(), selected: [] };

  const originalRenderPalDetail = window.renderPalDetail;
  const originalSortPaldexPals = window.sortPaldexPals;

  function normalizeKey(value) {
    return String(value || "").normalize("NFKC").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
  }

  function numeric(value) {
    if (value === null || value === undefined || value === "") return null;
    const result = Number(value);
    return Number.isFinite(result) ? result : null;
  }

  function formatNumber(value) {
    const number = numeric(value);
    return number === null ? "—" : number.toLocaleString("ja-JP");
  }

  function detailForPal(pal) {
    if (!pal) return null;
    return detailState.byName.get(normalizeKey(pal.enName)) || null;
  }

  function eggIcon(name) {
    const normalized = String(name || "").replace(/\s+/g, "");
    const eggTypes = typeof EGG_TYPES !== "undefined" && Array.isArray(EGG_TYPES) ? EGG_TYPES : [];
    const found = eggTypes.find(item => String(item.name || "").replace(/\s+/g, "") === normalized);
    return found?.icon || PLAIN_EGG_ICON;
  }

  function mountTypeLabel(types) {
    return Array.isArray(types) && types.length ? types.join("・") : "騎乗不可または未判定";
  }

  function textMetric(label, value, note = "") {
    const text = value === null || value === undefined || value === "" ? "—" : String(value);
    return `<span class="pal-extra-metric"><small>${escapeHtml(label)}</small><strong>${escapeHtml(text)}</strong>${note ? `<em>${escapeHtml(note)}</em>` : ""}</span>`;
  }

  function numberMetric(label, value, note = "") {
    return `<span class="pal-extra-metric"><small>${escapeHtml(label)}</small><strong>${formatNumber(value)}</strong>${note ? `<em>${escapeHtml(note)}</em>` : ""}</span>`;
  }

  function customSortValue(pal, mode) {
    const detail = detailForPal(pal);
    const movement = detail?.movement || {};
    const stats = detail?.stats || {};
    const mountTypes = detail?.mountTypes || [];
    const values = {
      rideSprintDesc: mountTypes.length ? movement.rideSprint : null,
      runDesc: movement.run,
      swimDashDesc: mountTypes.includes("水上") ? movement.swimDash : null,
      staminaDesc: mountTypes.length ? movement.stamina : null,
      foodAsc: stats.food,
      rarityDesc: stats.rarity ?? pal.rarity,
      priceDesc: stats.price,
    };
    return numeric(values[mode]);
  }

  window.sortPaldexPals = function sortPaldexPalsV111(pals) {
    const mode = state.paldexSort || "numberAsc";
    const customModes = new Set(["rideSprintDesc", "runDesc", "swimDashDesc", "staminaDesc", "foodAsc", "rarityDesc", "priceDesc"]);
    if (!customModes.has(mode)) return originalSortPaldexPals(pals);
    const sorted = [...pals];
    const fallback = (a, b) => paldexNumberCompare(a, b) || a.name.localeCompare(b.name, "ja");
    const ascending = mode.endsWith("Asc");
    sorted.sort((a, b) => {
      const left = customSortValue(a, mode);
      const right = customSortValue(b, mode);
      if (left === null && right === null) return fallback(a, b);
      if (left === null) return 1;
      if (right === null) return -1;
      const difference = left - right;
      return (ascending ? difference : -difference) || fallback(a, b);
    });
    return sorted;
  };

  window.filteredPals = function filteredPalsV111() {
    const q = normalizeText(byId("paldexSearch")?.value);
    const element = byId("paldexElement")?.value;
    const work = byId("paldexWork")?.value;
    const purpose = byId("paldexPurpose")?.value || "";
    const filtered = availablePalsForPaldex().filter(pal => {
      const detail = detailForPal(pal);
      const types = detail?.mountTypes || [];
      const partnerName = detail?.partnerSkill?.name || "";
      const effectTags = Array.isArray(detail?.partnerSkill?.effectTags) ? detail.partnerSkill.effectTags.join(" ") : "";
      const matchesText = !q || normalizeText(`${pal.name} ${pal.enName} ${pal.no} ${partnerName} ${effectTags}`).includes(q);
      const matchesElement = !element || pal.elements.includes(element);
      const matchesWork = !work || pal.works.some(item => item.name === work);
      let matchesPurpose = true;
      if (purpose === "mount") matchesPurpose = types.length > 0;
      if (purpose === "ground") matchesPurpose = types.includes("陸上");
      if (purpose === "air") matchesPurpose = types.includes("空中");
      if (purpose === "water") matchesPurpose = types.includes("水上");
      if (purpose === "drops") matchesPurpose = Boolean(detail?.drops?.length);
      return matchesText && matchesElement && matchesWork && matchesPurpose;
    });
    return window.sortPaldexPals(filtered);
  };

  function renderDrops(drops) {
    if (!Array.isArray(drops) || !drops.length) return `<p class="form-help">確認できるドロップ情報はありません。</p>`;
    return `<div class="pal-drop-list">${drops.slice(0, 12).map(item => `<div><strong>${escapeHtml(item.item || "不明")}</strong><span>${escapeHtml(item.probability || "—")}</span></div>`).join("")}</div>`;
  }

  function partnerSkillBody(partner) {
    const tags = Array.isArray(partner.effectTags) ? partner.effectTags : [];
    const tagMarkup = tags.length ? `<div class="pal-extra-tag-list">${tags.map(tag => `<span class="work-tag">${escapeHtml(tag)}</span>`).join("")}</div>` : `<p class="form-help">効果分類は未確認です。出典ページで詳細を確認できます。</p>`;
    return `<h4>${escapeHtml(partner.name || "名称未確認")}</h4>${tagMarkup}<p class="form-help">長い説明文は転載せず、用途を短い分類で表示しています。</p>`;
  }

  function extraDetailMarkup(pal, detail) {
    if (!detail) {
      const message = detailState.status === "error" ? `詳細データを読み込めませんでした。${detailState.error}` : "詳細データを読み込んでいます。";
      return `<section class="detail-section pal-extra-loading"><h3>追加データ</h3><p class="form-help">${escapeHtml(message)}</p></section>`;
    }
    const stats = detail.stats || {};
    const movement = detail.movement || {};
    const partner = detail.partnerSkill || {};
    const selected = detailState.selected.includes(pal.id);
    return `<div class="pal-extra-v111" data-extra-pal-id="${escapeHtml(pal.id)}">
      <section class="detail-section pal-extra-overview">
        <div class="pal-extra-heading"><div><span class="section-kicker">PALDB DETAIL</span><h3>パル詳細</h3></div><button class="button button--ghost" type="button" data-compare-pal="${escapeHtml(pal.id)}" aria-pressed="${selected}">${selected ? "比較から外す" : "比較に追加"}</button></div>
        <div class="pal-extra-facts">
          <span><img src="${escapeHtml(eggIcon(stats.egg))}" alt=""><small>孵化するタマゴ</small><strong>${escapeHtml(stats.egg || "—")}</strong></span>
          ${numberMetric("食事量", stats.food)}
          ${textMetric("体格", stats.size)}
          ${numberMetric("レア度", stats.rarity)}
          ${numberMetric("売却目安", stats.price, "金貨")}
          ${numberMetric("配合ランク", stats.breedingPower)}
        </div>
      </section>
      <details class="detail-section pal-extra-accordion" open>
        <summary><span>パートナースキル</span><small>${escapeHtml(partner.name || "名称未確認")}</small></summary>
        <div class="pal-extra-accordion__body">${partnerSkillBody(partner)}</div>
      </details>
      <details class="detail-section pal-extra-accordion" open>
        <summary><span>移動性能</span><small>${escapeHtml(mountTypeLabel(detail.mountTypes))}</small></summary>
        <div class="pal-extra-accordion__body"><p class="form-help">PalDBの比較用内部値です。実際のm/sではなく、騎乗できないパルにも内部パラメータが設定されている場合があります。</p><div class="pal-movement-grid">
          ${numberMetric("ゆっくり歩行", movement.slowWalk)}${numberMetric("通常歩行", movement.walk)}${numberMetric("走行", movement.run)}${numberMetric("騎乗ダッシュ値", movement.rideSprint)}${numberMetric("運搬時", movement.transport)}${numberMetric("水上移動", movement.swim)}${numberMetric("水上ダッシュ", movement.swimDash)}${numberMetric("スタミナ", movement.stamina)}
        </div></div>
      </details>
      <details class="detail-section pal-extra-accordion">
        <summary><span>主なドロップ</span><small>${Array.isArray(detail.drops) ? `${detail.drops.length}件` : "0件"}</small></summary>
        <div class="pal-extra-accordion__body">${renderDrops(detail.drops)}</div>
      </details>
      <div class="pal-extra-source"><span>固定データ取得日: ${escapeHtml(detail.retrieved || "—")}</span>${detail.sourceUrl ? `<a href="${escapeHtml(detail.sourceUrl)}" target="_blank" rel="noopener noreferrer">PalDBで詳細を確認</a>` : ""}</div>
    </div>`;
  }

  function appendExtraDetail(root) {
    if (!root) return;
    const available = availablePalsForPaldex();
    const pal = getPal(state.selectedPalId) || available[0];
    if (!pal) return;
    const existing = Array.from(root.querySelectorAll(".pal-extra-v111")).find(node => node.dataset.extraPalId === pal.id);
    if (existing) {
      syncCompareButtons();
      return;
    }
    root.querySelectorAll(".pal-extra-v111,.pal-extra-loading").forEach(node => node.remove());
    const body = root.querySelector(".pal-detail-body") || root;
    body.insertAdjacentHTML("beforeend", extraDetailMarkup(pal, detailForPal(pal)));
  }

  window.renderPalDetail = function renderPalDetailV111(root = byId("palDetail")) {
    originalRenderPalDetail(root);
    appendExtraDetail(root);
  };

  function loadCompareSelection() {
    const values = safeJsonParse(localStorage.getItem(compareStorageKey()), []);
    detailState.selected = Array.isArray(values) ? values.filter(id => getPal(id)).slice(0, COMPARE_LIMIT) : [];
  }

  function saveCompareSelection() {
    try {
      localStorage.setItem(compareStorageKey(), JSON.stringify(detailState.selected));
    } catch (error) {
      console.warn("Pal comparison storage failed", error);
    }
  }

  function ensureCompareUi() {
    if (!byId("palCompareTray")) {
      document.body.insertAdjacentHTML("beforeend", `<aside class="pal-compare-tray" id="palCompareTray" hidden><div id="palCompareItems" class="pal-compare-tray__items"></div><div class="pal-compare-tray__actions"><button class="button button--ghost" type="button" data-compare-clear>クリア</button><button class="button button--primary" type="button" data-compare-open>比較する</button></div></aside>`);
    }
    if (!byId("palCompareDialog")) {
      document.body.insertAdjacentHTML("beforeend", `<dialog class="dialog pal-compare-dialog" id="palCompareDialog"><div class="dialog__header"><div><span class="section-kicker">PAL COMPARISON</span><h2>パル比較</h2></div><button class="icon-button" type="button" data-close-dialog="palCompareDialog" aria-label="閉じる"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><div class="dialog__body" id="palCompareBody"></div></dialog>`);
      if (typeof bindDialogClose === "function") bindDialogClose(byId("palCompareDialog"));
    }
  }

  function syncCompareButtons() {
    document.querySelectorAll("[data-compare-pal]").forEach(button => {
      const selected = detailState.selected.includes(button.dataset.comparePal);
      button.textContent = selected ? "比較から外す" : "比較に追加";
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function renderCompareTray() {
    ensureCompareUi();
    const tray = byId("palCompareTray");
    const pals = detailState.selected.map(getPal).filter(Boolean);
    tray.hidden = pals.length === 0;
    byId("palCompareItems").innerHTML = pals.map(pal => `<button type="button" class="pal-compare-chip" data-compare-remove="${escapeHtml(pal.id)}"><img ${palImageAttrs(pal)}><span><strong>${escapeHtml(pal.name)}</strong><small>削除</small></span></button>`).join("");
    const openButton = tray.querySelector("[data-compare-open]");
    if (openButton) openButton.disabled = pals.length < 2;
    attachImageFallbacks(byId("palCompareItems"));
    syncCompareButtons();
  }

  function comparableMovement(pal, key, requiredType = "") {
    const detail = detailForPal(pal);
    if (requiredType && !detail?.mountTypes?.includes(requiredType)) return null;
    if (key === "rideSprint" && !detail?.mountTypes?.length) return null;
    return detail?.movement?.[key];
  }

  function compareRows(pals) {
    const rows = [
      { label: "HP", get: pal => pal.hp, best: "max" },
      { label: "攻撃", get: pal => pal.attack, best: "max" },
      { label: "防御", get: pal => pal.defense, best: "max" },
      { label: "合計", get: pal => pal.statTotal, best: "max" },
      { label: "食事量", get: pal => detailForPal(pal)?.stats?.food, best: "min" },
      { label: "走行", get: pal => comparableMovement(pal, "run"), best: "max" },
      { label: "騎乗ダッシュ", get: pal => comparableMovement(pal, "rideSprint"), best: "max" },
      { label: "水上ダッシュ", get: pal => comparableMovement(pal, "swimDash", "水上"), best: "max" },
      { label: "スタミナ", get: pal => detailForPal(pal)?.mountTypes?.length ? comparableMovement(pal, "stamina") : null, best: "max" },
    ];
    return rows.map(row => {
      const values = pals.map(row.get).map(numeric);
      const valid = values.filter(value => value !== null);
      const bestValue = valid.length ? (row.best === "min" ? Math.min(...valid) : Math.max(...valid)) : null;
      return `<tr><th>${escapeHtml(row.label)}</th>${values.map(value => `<td class="${value !== null && value === bestValue ? "is-best" : ""}">${formatNumber(value)}</td>`).join("")}</tr>`;
    }).join("");
  }

  function openCompareDialog() {
    const pals = detailState.selected.map(getPal).filter(Boolean);
    if (pals.length < 2) return;
    ensureCompareUi();
    byId("palCompareBody").innerHTML = `<div class="pal-compare-scroll"><table class="pal-compare-table"><thead><tr><th>項目</th>${pals.map(pal => `<th><img ${palImageAttrs(pal)}><strong>${escapeHtml(pal.name)}</strong><small>${escapeHtml(mountTypeLabel(detailForPal(pal)?.mountTypes))}</small></th>`).join("")}</tr></thead><tbody>${compareRows(pals)}</tbody></table></div><p class="form-help">強調表示は、攻撃・速度などは最大値、食事量は最小値です。「—」は用途外または未確認を表します。</p>`;
    attachImageFallbacks(byId("palCompareBody"));
    byId("palCompareDialog").showModal();
  }

  function toggleCompare(id) {
    if (!getPal(id)) return;
    const index = detailState.selected.indexOf(id);
    if (index >= 0) {
      detailState.selected.splice(index, 1);
      toast("比較リストから外しました");
    } else {
      if (detailState.selected.length >= COMPARE_LIMIT) {
        toast(`比較できるのは${COMPARE_LIMIT}体までです。`, "error");
        return;
      }
      detailState.selected.push(id);
      toast("比較リストへ追加しました");
    }
    saveCompareSelection();
    renderCompareTray();
  }

  function injectPaldexControls() {
    const sort = byId("paldexSort");
    if (sort && !sort.querySelector('[value="rideSprintDesc"]')) {
      const options = [
        ["rideSprintDesc", "騎乗ダッシュが速い順"], ["runDesc", "走行値が高い順"], ["swimDashDesc", "水上ダッシュが速い順"],
        ["staminaDesc", "騎乗スタミナが高い順"], ["foodAsc", "食事量が少ない順"], ["rarityDesc", "レア度が高い順"], ["priceDesc", "売却額が高い順"],
      ];
      sort.insertAdjacentHTML("beforeend", options.map(([value, label]) => `<option value="${value}">${label}</option>`).join(""));
    }
    if (!byId("paldexPurpose")) {
      const count = byId("paldexCount");
      count?.insertAdjacentHTML("beforebegin", `<label class="select-field paldex-purpose-field"><span>用途</span><select id="paldexPurpose"><option value="">すべて</option><option value="mount">騎乗可能</option><option value="ground">地上騎乗</option><option value="air">飛行騎乗</option><option value="water">水上騎乗</option><option value="drops">ドロップ情報あり</option></select></label>`);
      byId("paldexPurpose")?.addEventListener("change", renderPaldex);
    }
    if (typeof PAGE_META !== "undefined" && PAGE_META.paldex) PAGE_META.paldex[2] = "種族値・作業適性・移動性能を比較し、配合関係までまとめて確認します。";
  }

  function bindDelegatedEvents() {
    document.addEventListener("click", event => {
      const compare = event.target.closest("[data-compare-pal]");
      if (compare) toggleCompare(compare.dataset.comparePal);
      const remove = event.target.closest("[data-compare-remove]");
      if (remove) toggleCompare(remove.dataset.compareRemove);
      if (event.target.closest("[data-compare-clear]")) {
        detailState.selected = [];
        saveCompareSelection();
        renderCompareTray();
      }
      if (event.target.closest("[data-compare-open]")) openCompareDialog();
    });
  }

  async function waitForPals() {
    for (let attempt = 0; attempt < 180; attempt += 1) {
      if (Array.isArray(state.pals) && state.pals.length > 0) return;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error("パル一覧の準備が完了しませんでした。");
  }

  function validatePayload(payload) {
    if (!Array.isArray(payload?.records) || payload.records.length !== 299) return false;
    const names = new Set(payload.records.map(record => normalizeKey(record.name)).filter(Boolean));
    return names.size === 299;
  }

  async function fetchDetailsPayload() {
    try {
      const response = await fetch(DETAIL_URL, { cache: "default" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (!validatePayload(payload)) throw new Error("詳細データの件数または識別子が不正です。");
      try { localStorage.setItem(DETAIL_CACHE_KEY, JSON.stringify(payload)); } catch {}
      return payload;
    } catch (networkError) {
      const cached = safeJsonParse(localStorage.getItem(DETAIL_CACHE_KEY), null);
      if (validatePayload(cached)) return cached;
      throw networkError;
    }
  }

  async function loadDetails() {
    try {
      const payload = await fetchDetailsPayload();
      for (const record of payload.records) detailState.byName.set(normalizeKey(record.name), { ...record, retrieved: payload.retrieved });
      detailState.status = "ready";
      await waitForPals();
      loadCompareSelection();
      injectPaldexControls();
      renderCompareTray();
      renderPaldex();
      renderPalDetail();
    } catch (error) {
      console.error("Pal detail data load failed", error);
      detailState.status = "error";
      detailState.error = error.message;
      appendExtraDetail(byId("palDetail"));
    }
  }

  injectPaldexControls();
  ensureCompareUi();
  bindDelegatedEvents();
  loadDetails();
})();
