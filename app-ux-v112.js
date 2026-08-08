(() => {
  "use strict";

  const PROFILE_HASH_KEY = "pal";
  const DETAIL_URL = "data/pal-details-v1.json?v=111";
  const uxDetailByName = new Map();
  let eggSizeMode = "通常";
  let applyingProfileHash = false;

  const originalRenderPalDetailV112 = window.renderPalDetail;
  const originalRenderPaldexV112 = window.renderPaldex;

  function normalizeDetailKey(value) {
    return String(value || "").normalize("NFKC").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
  }

  function currentPal() {
    const available = typeof availablePalsForPaldex === "function" ? availablePalsForPaldex() : [];
    return getPal(state.selectedPalId) || available[0] || null;
  }

  function eggNameFor(baseName, size) {
    if (size === "デカ") return String(baseName).replace("タマゴ", "デカタマゴ");
    if (size === "キョダイ") return String(baseName).replace("タマゴ", "キョダイタマゴ");
    return String(baseName);
  }

  function eggSizeFromValue(value) {
    const text = String(value || "");
    if (text.includes("キョダイタマゴ")) return "キョダイ";
    if (text.includes("デカタマゴ")) return "デカ";
    return "通常";
  }

  function renderEggPickerContents() {
    const grid = byId("eggPickerGrid");
    if (!grid) return;
    const currentValue = byId("openEggPicker")?.dataset.value || "";
    const sizes = [
      ["通常", "通常", "前置きなし"],
      ["デカ", "デカ", "デカタマゴ"],
      ["キョダイ", "キョダイ", "キョダイタマゴ"],
    ];
    grid.innerHTML = `<div class="egg-picker-v112">
      <section class="egg-picker-step">
        <div class="egg-picker-step__heading"><span>1</span><div><strong>サイズを選択</strong><small>先にサイズを決めると、タマゴ種類は9個だけ表示されます。</small></div></div>
        <div class="egg-size-tabs" role="radiogroup" aria-label="タマゴサイズ">${sizes.map(([value, label, note]) => `<button class="egg-size-tab${eggSizeMode === value ? " is-active" : ""}" type="button" data-egg-size="${value}" role="radio" aria-checked="${eggSizeMode === value}"><strong>${label}</strong><small>${note}</small></button>`).join("")}</div>
      </section>
      <section class="egg-picker-step">
        <div class="egg-picker-step__heading egg-picker-step__heading--with-action"><span>2</span><div><strong>タマゴの種類を選択</strong><small>${eggSizeMode === "通常" ? "通常サイズは名称に前置きを付けません。" : `${eggSizeMode}サイズとして保存します。`}</small></div><button class="text-button" type="button" data-egg-unset>未設定にする</button></div>
        <div class="egg-kind-grid">${EGG_BASES.map(base => {
          const value = eggNameFor(base.name, eggSizeMode);
          const selected = currentValue === value;
          return `<button class="egg-kind-option${selected ? " is-selected" : ""}" type="button" data-egg-choice="${escapeHtml(value)}" aria-pressed="${selected}"><img src="${escapeHtml(base.icon)}" alt=""><span><strong>${escapeHtml(base.name)}</strong><small>${eggSizeMode === "通常" ? "通常" : eggSizeMode}</small></span></button>`;
        }).join("")}</div>
      </section>
    </div>`;

    $$('[data-egg-size]', grid).forEach(button => button.addEventListener("click", () => {
      eggSizeMode = button.dataset.eggSize || "通常";
      renderEggPickerContents();
    }));
    $$('[data-egg-choice]', grid).forEach(button => button.addEventListener("click", () => {
      syncEggSelection(button.dataset.eggChoice || "");
      byId("eggPickerDialog")?.close();
    }));
    $('[data-egg-unset]', grid)?.addEventListener("click", () => {
      syncEggSelection("");
      byId("eggPickerDialog")?.close();
    });
  }

  function openEggPickerV112() {
    if (byId("recordMutation")?.checked) return;
    const currentValue = byId("openEggPicker")?.dataset.value || "";
    eggSizeMode = eggSizeFromValue(currentValue);
    renderEggPickerContents();
    const dialog = byId("eggPickerDialog");
    if (dialog && !dialog.open) dialog.showModal();
  }

  window.openEggPicker = openEggPickerV112;

  function roomOnlyUrl() {
    const url = new URL(location.href);
    const params = new URLSearchParams();
    params.set("room", state.roomId);
    url.hash = params.toString();
    return url.toString();
  }

  function profilePalIdFromHash() {
    return new URLSearchParams(location.hash.replace(/^#/, "")).get(PROFILE_HASH_KEY) || "";
  }

  function updateProfileHash(palId) {
    const params = new URLSearchParams(location.hash.replace(/^#/, ""));
    if (!params.get("room")) params.set("room", state.roomId);
    if (palId) params.set(PROFILE_HASH_KEY, palId);
    else params.delete(PROFILE_HASH_KEY);
    location.hash = params.toString();
  }

  function profilePalOrder() {
    const pals = typeof availablePalsForPaldex === "function" ? [...availablePalsForPaldex()] : [];
    return pals.sort((a, b) => paldexNumberCompare(a, b) || a.name.localeCompare(b.name, "ja"));
  }

  function profileNavMarkup(pal) {
    const pals = profilePalOrder();
    const index = pals.findIndex(item => item.id === pal.id);
    const previous = index > 0 ? pals[index - 1] : null;
    const next = index >= 0 && index < pals.length - 1 ? pals[index + 1] : null;
    return `<div class="pal-profile-nav-v112">
      <button class="button button--ghost" type="button" data-pal-profile-close>← 図鑑一覧へ</button>
      <div class="pal-profile-nav-v112__title"><small>PALDECK No.${escapeHtml(pal.no)}</small><strong>${escapeHtml(pal.name)}</strong></div>
      <div class="pal-profile-nav-v112__actions">
        <button class="button button--ghost" type="button" data-pal-profile-step="${escapeHtml(previous?.id || "")}" ${previous ? "" : "disabled"}>前へ</button>
        <button class="button button--ghost" type="button" data-pal-profile-step="${escapeHtml(next?.id || "")}" ${next ? "" : "disabled"}>次へ</button>
        <button class="button button--ghost" type="button" data-pal-profile-share>このパルを共有</button>
        <button class="button button--primary" type="button" data-pal-breeding-target="${escapeHtml(pal.id)}">このパルの配合を探す</button>
      </div>
    </div>`;
  }

  function removeRedundantRelations(root) {
    const unnecessary = new Set([
      "このルームで発見した作り方",
      "このルームで発見した派生先",
      "このパルを作れる配合",
      "このパルを親にした配合",
    ]);
    root.querySelectorAll(".pal-detail-body > .detail-section").forEach(section => {
      const heading = section.querySelector("h3")?.textContent?.trim();
      if (unnecessary.has(heading)) section.remove();
    });
  }

  function enhanceRecordShortcut(root, pal) {
    const section = Array.from(root.querySelectorAll(".pal-detail-body > .detail-section")).find(item => item.querySelector("h3")?.textContent?.trim() === "このルームの関連記録");
    if (!section || section.querySelector("[data-pal-record-search]")) return;
    const heading = section.querySelector("h3");
    if (heading) heading.textContent = "配合記録へのショートカット";
    const addButton = section.querySelector("[data-add-pal-record]");
    addButton?.insertAdjacentHTML("beforebegin", `<button class="button button--ghost button--block" type="button" data-pal-record-search="${escapeHtml(pal.id)}">このパルの配合記録を見る</button>`);
  }

  function advancedStatsMarkup(detail) {
    const stats = detail?.stats || {};
    const value = (label, data, suffix = "") => `<span class="pal-extra-metric"><small>${escapeHtml(label)}</small><strong>${data === null || data === undefined || data === "" ? "—" : escapeHtml(data)}</strong>${suffix ? `<em>${escapeHtml(suffix)}</em>` : ""}</span>`;
    const male = stats.maleProbability === null || stats.maleProbability === undefined ? null : `${stats.maleProbability}%`;
    return `<details class="detail-section pal-extra-accordion pal-advanced-stats-v112">
      <summary><span>詳細ステータス</span><small>内部比較値</small></summary>
      <div class="pal-extra-accordion__body"><p class="form-help">PalDBの比較用内部値です。ゲーム内画面に直接表示されない項目を含むため、パル同士の比較目安として利用してください。</p><div class="pal-movement-grid">
        ${value("近接攻撃係数", stats.meleeAttack)}${value("作業速度係数", stats.workSpeed)}${value("サポート値", stats.support)}${value("捕獲補正", stats.captureRate)}${value("オス確率", male)}
      </div></div>
    </details>`;
  }

  function enhanceExtraDetails(root, pal) {
    const extra = root.querySelector(".pal-extra-v111");
    if (!extra) return;
    const detail = uxDetailByName.get(normalizeDetailKey(pal.enName));
    if (detail && !extra.querySelector(".pal-advanced-stats-v112")) {
      const movement = Array.from(extra.querySelectorAll("details")).find(item => item.querySelector("summary span")?.textContent?.trim() === "移動性能");
      if (movement) movement.insertAdjacentHTML("beforebegin", advancedStatsMarkup(detail));
    }
    const heading = extra.querySelector(".pal-extra-heading");
    const compare = heading?.querySelector("[data-compare-pal]");
    if (heading && compare && !heading.querySelector(".pal-extra-heading__actions")) {
      const actions = document.createElement("div");
      actions.className = "pal-extra-heading__actions";
      compare.replaceWith(actions);
      actions.insertAdjacentHTML("beforeend", `<button class="button button--ghost" type="button" data-pal-profile-open="${escapeHtml(pal.id)}">詳細ページ</button>`);
      actions.append(compare);
    }
  }

  function ensureProfileNav(root, pal) {
    root.querySelector(".pal-profile-nav-v112")?.remove();
    root.insertAdjacentHTML("afterbegin", profileNavMarkup(pal));
  }

  function enhancePalDetail(root) {
    if (!root) return;
    const pal = currentPal();
    if (!pal) return;
    removeRedundantRelations(root);
    enhanceRecordShortcut(root, pal);
    enhanceExtraDetails(root, pal);
    ensureProfileNav(root, pal);
  }

  window.renderPalDetail = function renderPalDetailV112(root = byId("palDetail")) {
    originalRenderPalDetailV112(root);
    enhancePalDetail(root);
  };

  function injectPaldexReset() {
    const toolbar = document.querySelector("#view-paldex .paldex-toolbar");
    if (!toolbar || byId("paldexResetFilters")) return;
    const count = byId("paldexCount");
    count?.insertAdjacentHTML("beforebegin", `<button class="button button--ghost paldex-reset-v112" id="paldexResetFilters" type="button">条件をリセット</button>`);
  }

  function applyProfileModeFromHash() {
    if (applyingProfileHash) return;
    const requestedId = profilePalIdFromHash();
    const requested = getPal(requestedId);
    const available = typeof availablePalsForPaldex === "function" ? availablePalsForPaldex() : [];
    const allowed = requested && available.some(pal => pal.id === requested.id);
    if (requestedId && allowed && state.currentView !== "paldex") {
      applyingProfileHash = true;
      state.selectedPalId = requested.id;
      switchView("paldex");
      applyingProfileHash = false;
    } else if (allowed) {
      state.selectedPalId = requested.id;
    }
    const active = Boolean(allowed && state.currentView === "paldex");
    byId("view-paldex")?.classList.toggle("is-pal-profile-open", active);
    if (active) {
      enhancePalDetail(byId("palDetail"));
      document.title = `${requested.name}｜パル配合ノート`;
    } else {
      document.title = "パル配合ノート";
    }
  }

  window.renderPaldex = function renderPaldexV112() {
    originalRenderPaldexV112();
    injectPaldexReset();
    applyProfileModeFromHash();
    enhancePalDetail(byId("palDetail"));
  };

  function resetPaldexFilters() {
    if (byId("paldexSearch")) byId("paldexSearch").value = "";
    if (byId("paldexElement")) byId("paldexElement").value = "";
    if (byId("paldexWork")) byId("paldexWork").value = "";
    if (byId("paldexPurpose")) byId("paldexPurpose").value = "";
    if (byId("paldexSort")) byId("paldexSort").value = "numberAsc";
    state.paldexSort = "numberAsc";
    renderPaldex();
    toast("図鑑の検索条件をリセットしました");
  }

  function openProfile(palId) {
    const pal = getPal(palId);
    if (!pal) return;
    state.selectedPalId = pal.id;
    document.querySelector("#palModal[open]")?.close();
    updateProfileHash(pal.id);
    if (state.currentView !== "paldex") switchView("paldex");
    else renderPaldex();
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function closeProfile() {
    const selectedId = state.selectedPalId;
    updateProfileHash("");
    byId("view-paldex")?.classList.remove("is-pal-profile-open");
    document.title = "パル配合ノート";
    requestAnimationFrame(() => document.querySelector(`[data-pal-detail="${CSS.escape(selectedId)}"]`)?.scrollIntoView({ block: "center" }));
  }

  function showPalRecords(palId) {
    const pal = getPal(palId);
    if (!pal) return;
    if (byId("recordSearch")) byId("recordSearch").value = pal.name;
    state.recordSearch = pal.name;
    updateProfileHash("");
    document.querySelector("#palModal[open]")?.close();
    switchView("records");
  }

  function showPalBreeding(palId) {
    const pal = getPal(palId);
    if (!pal) return;
    state.pickerValues.breedTarget = pal.id;
    state.breedingMode = "target";
    updateProfileHash("");
    document.querySelector("#palModal[open]")?.close();
    switchView("breeding");
  }

  document.addEventListener("click", event => {
    const eggTrigger = event.target.closest("#openEggPicker");
    if (eggTrigger && !eggTrigger.disabled && !byId("recordMutation")?.checked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openEggPickerV112();
      return;
    }
    const roomShare = event.target.closest("#copyRoomLink");
    if (roomShare) {
      event.preventDefault();
      event.stopImmediatePropagation();
      copyText(roomOnlyUrl(), "ルームURLをコピーしました");
    }
  }, true);

  document.addEventListener("click", event => {
    const profileOpen = event.target.closest("[data-pal-profile-open]");
    if (profileOpen) openProfile(profileOpen.dataset.palProfileOpen);
    const profileClose = event.target.closest("[data-pal-profile-close]");
    if (profileClose) closeProfile();
    const profileStep = event.target.closest("[data-pal-profile-step]");
    if (profileStep?.dataset.palProfileStep) openProfile(profileStep.dataset.palProfileStep);
    if (event.target.closest("[data-pal-profile-share]")) copyText(location.href, "このパルのURLをコピーしました");
    const recordSearch = event.target.closest("[data-pal-record-search]");
    if (recordSearch) showPalRecords(recordSearch.dataset.palRecordSearch);
    const breeding = event.target.closest("[data-pal-breeding-target]");
    if (breeding) showPalBreeding(breeding.dataset.palBreedingTarget);
    if (event.target.closest("#paldexResetFilters")) resetPaldexFilters();
  });

  window.addEventListener("hashchange", () => {
    applyProfileModeFromHash();
    if (state.currentView === "paldex") renderPalDetail();
  });

  async function loadUxDetails() {
    try {
      const response = await fetch(DETAIL_URL, { cache: "default" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      for (const record of payload.records || []) uxDetailByName.set(normalizeDetailKey(record.name), record);
      if (state.currentView === "paldex") renderPalDetail();
    } catch (error) {
      console.warn("v112 detail enhancement data load failed", error);
    }
  }

  injectPaldexReset();
  loadUxDetails();
  setTimeout(applyProfileModeFromHash, 0);
})();
