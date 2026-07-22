(() => {
  "use strict";

  const VERSION = "60";
  const MUTATION_EGG_ICON = "assets/mutation-egg-v59.svg?v=59";
  const RECORDER_STORAGE_KEY = "palBoardRecorder";
  const RECORDER_LIST_PREFIX = "pal-breeding-recorders:";
  const RECORDER_COLOR_PREFIX = "pal-breeding-recorder-colors:";
  const RECORDER_TOMBSTONE_PREFIX = "pal-breeding-deleted-recorders-v60:";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const state = {
    records: [],
    deletedRecorders: new Set(),
    timer: 0,
    syncing: false,
    initialized: false,
  };

  function roomId() {
    const params = new URLSearchParams(location.hash.replace(/^#/, ""));
    return params.get("room") || localStorage.getItem("palBoardRoomId") || "default";
  }

  function recorderListKey() {
    return `${RECORDER_LIST_PREFIX}${roomId()}`;
  }

  function recorderColorKey() {
    return `${RECORDER_COLOR_PREFIX}${roomId()}`;
  }

  function recorderTombstoneKey() {
    return `${RECORDER_TOMBSTONE_PREFIX}${roomId()}`;
  }

  function sanitizeRecorder(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/\s+/g, "")
      .trim()
      .slice(0, 12);
  }

  function uniqueNames(list) {
    const result = [];
    for (const value of Array.isArray(list) ? list : []) {
      const name = sanitizeRecorder(value);
      if (name && !result.includes(name)) result.push(name);
    }
    return result;
  }

  function dispatchInput(element) {
    if (!element) return;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function showToast(message, isError = false) {
    const toast = $("#toast") || $("#enhancementToast") || $("#workflowToast");
    if (!toast) return;
    toast.textContent = message;
    if (toast.id === "toast") toast.classList.add("show");
    else toast.classList.add("is-visible");
    toast.classList.toggle("is-error", isError);
    clearTimeout(toast._v60Timer);
    toast._v60Timer = setTimeout(() => toast.classList.remove("show", "is-visible", "is-error"), 2400);
  }

  function normalizeRecord(id, value) {
    if (!value || typeof value !== "object") return null;
    return {
      id: String(id || value.id || ""),
      mutation: Boolean(value.mutation ?? value.isMutation ?? value.mutated ?? value.mutationEgg),
    };
  }

  function recordsFromPayload(payload) {
    if (Array.isArray(payload)) {
      return payload.map((item, index) => normalizeRecord(item?.id || index, item)).filter(Boolean);
    }
    if (!payload || typeof payload !== "object") return [];
    return Object.entries(payload)
      .filter(([id]) => !String(id).startsWith("sample-"))
      .map(([id, item]) => normalizeRecord(id, item))
      .filter(Boolean);
  }

  async function loadRecords() {
    const databaseURL = window.firebaseConfig?.databaseURL;
    if (databaseURL) {
      try {
        const url = `${String(databaseURL).replace(/\/$/, "")}/rooms/${encodeURIComponent(roomId())}/records.json`;
        const response = await fetch(url, { cache: "no-store" });
        if (response.ok) return recordsFromPayload(await response.json());
      } catch (error) {
        console.warn("v60: 配合記録の取得に失敗しました。", error);
      }
    }
    try {
      return recordsFromPayload(JSON.parse(localStorage.getItem(`pal-breeding-records:${roomId()}`) || "[]"));
    } catch {
      return [];
    }
  }

  function recordById(id) {
    return state.records.find(record => record.id === String(id || "")) || null;
  }

  function mutationEggHtml() {
    return `<span class="v58-mutation-egg v60-mutation-egg">
      <img src="${MUTATION_EGG_ICON}" alt="突然変異タマゴ" loading="eager">
      <strong>突然変異タマゴ</strong>
    </span>`;
  }

  function selectedRecord() {
    return recordById($("#recordRows tr.selected")?.dataset.id);
  }

  function renderMutationDetail() {
    const detail = $("#detailBody");
    if (!detail) return;
    const record = selectedRecord();
    const sections = $$(":scope > .detail-section", detail);
    const eggSection = sections.find(section => section.querySelector(":scope > h3")?.textContent.trim() === "タマゴの種類");

    if (record?.mutation && eggSection) {
      if (eggSection.dataset.v60Mutation !== record.id) {
        eggSection.dataset.v60Mutation = record.id;
        eggSection.innerHTML = `<h3>タマゴの種類</h3>${mutationEggHtml()}`;
      }
    }

    detail.classList.remove("v60-detail-preparing");
  }

  function prepareDetailForRow(row) {
    const detail = $("#detailBody");
    const record = recordById(row?.dataset.id);
    if (!detail) return;
    detail.classList.toggle("v60-detail-preparing", Boolean(record?.mutation));
    requestAnimationFrame(() => requestAnimationFrame(renderMutationDetail));
  }

  function syncMutationInput() {
    const checkbox = $("#mutationEgg");
    const eggInput = $("#eggType");
    const quick = $("#eggQuickSelect");
    if (!checkbox || !eggInput) return;

    const active = checkbox.checked;
    const field = eggInput.closest(".egg-picker-field");
    const picker = eggInput.closest(".egg-picker");
    const preview = picker?.querySelector(".egg-picker-preview");
    const suggestions = picker?.querySelector(".egg-suggestions");

    if (!eggInput.dataset.v60OriginalPlaceholder) {
      eggInput.dataset.v60OriginalPlaceholder = eggInput.placeholder || "例：平凡なタマゴ";
    }

    if (active) {
      if (eggInput.value) {
        eggInput.value = "";
        dispatchInput(eggInput);
      }
      eggInput.disabled = true;
      eggInput.placeholder = "突然変異タマゴとして自動設定";
      eggInput.setAttribute("aria-disabled", "true");
      field?.classList.add("v60-mutation-locked");
      picker?.classList.add("v60-mutation-locked");
      if (suggestions) suggestions.hidden = true;
      if (preview) preview.innerHTML = `<img src="${MUTATION_EGG_ICON}" alt="突然変異タマゴ">`;
      if (quick) {
        quick.hidden = true;
        quick.setAttribute("aria-hidden", "true");
        $$("button, input, select", quick).forEach(control => { control.disabled = true; });
      }
    } else {
      eggInput.disabled = false;
      eggInput.placeholder = eggInput.dataset.v60OriginalPlaceholder;
      eggInput.removeAttribute("aria-disabled");
      field?.classList.remove("v60-mutation-locked");
      picker?.classList.remove("v60-mutation-locked");
      if (quick) {
        quick.hidden = false;
        quick.removeAttribute("aria-hidden");
        $$("button, input, select", quick).forEach(control => { control.disabled = false; });
      }
      dispatchInput(eggInput);
    }
  }

  function loadLocalTombstones() {
    try {
      state.deletedRecorders = new Set(uniqueNames(JSON.parse(localStorage.getItem(recorderTombstoneKey()) || "[]")));
    } catch {
      state.deletedRecorders = new Set();
    }
  }

  function saveLocalTombstones() {
    localStorage.setItem(recorderTombstoneKey(), JSON.stringify(Array.from(state.deletedRecorders)));
  }

  async function loadRemoteTombstones() {
    const databaseURL = window.firebaseConfig?.databaseURL;
    if (!databaseURL) return;
    try {
      const url = `${String(databaseURL).replace(/\/$/, "")}/rooms/${encodeURIComponent(roomId())}/meta/recorderTombstonesV60.json`;
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) return;
      const remote = uniqueNames(await response.json());
      state.deletedRecorders = new Set(remote);
      saveLocalTombstones();
    } catch (error) {
      console.warn("v60: 削除済みユーザー情報の取得に失敗しました。", error);
    }
  }

  function readRecorderList() {
    let names = [];
    try {
      names = uniqueNames(JSON.parse(localStorage.getItem(recorderListKey()) || "[]"));
    } catch {
      names = [];
    }
    if (!names.length) {
      names = uniqueNames([
        ...$$("#currentRecorderSelect option").map(option => option.value),
        ...$$("#startupRecorder option").map(option => option.value),
        ...$$("[data-delete-recorder]").map(button => button.dataset.deleteRecorder),
      ]);
    }
    return names;
  }

  function readRecorderColors() {
    try {
      const value = JSON.parse(localStorage.getItem(recorderColorKey()) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? { ...value } : {};
    } catch {
      return {};
    }
  }

  function effectiveRecorderList() {
    return readRecorderList().filter(name => !state.deletedRecorders.has(name));
  }

  async function persistRecorderSettings(list, colors) {
    const cleanList = uniqueNames(list).filter(name => !state.deletedRecorders.has(name));
    localStorage.setItem(recorderListKey(), JSON.stringify(cleanList));
    localStorage.setItem(recorderColorKey(), JSON.stringify(colors || {}));
    saveLocalTombstones();

    const databaseURL = window.firebaseConfig?.databaseURL;
    if (!databaseURL) return;
    try {
      const url = `${String(databaseURL).replace(/\/$/, "")}/rooms/${encodeURIComponent(roomId())}/meta.json`;
      await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recorders: cleanList,
          recorderColors: colors || {},
          recorderTombstonesV60: Array.from(state.deletedRecorders),
          recordersUpdatedAt: Date.now(),
        }),
      });
    } catch (error) {
      console.warn("v60: ユーザー設定の共有保存に失敗しました。", error);
      showToast("ユーザー設定の共有保存に失敗しました。", true);
    }
  }

  function managerItemName(item) {
    return sanitizeRecorder(item.querySelector("[data-delete-recorder]")?.dataset.deleteRecorder
      || item.querySelector(".recorder-badge span:last-child")?.textContent);
  }

  function syncRecorderUi() {
    if (state.syncing) return;
    state.syncing = true;
    try {
      const visible = effectiveRecorderList();
      if (!visible.length) return;

      for (const select of [$("#currentRecorderSelect"), $("#startupRecorder")]) {
        if (!select) continue;
        $$("option", select).forEach(option => {
          const deleted = state.deletedRecorders.has(sanitizeRecorder(option.value));
          option.hidden = deleted;
          option.disabled = deleted;
        });
        if (state.deletedRecorders.has(sanitizeRecorder(select.value))) {
          const next = visible[0];
          let option = $$("option", select).find(item => sanitizeRecorder(item.value) === next);
          if (!option) {
            option = document.createElement("option");
            option.value = next;
            option.textContent = next;
            select.appendChild(option);
          }
          select.value = next;
          if (select.id === "currentRecorderSelect") {
            localStorage.setItem(RECORDER_STORAGE_KEY, next);
            dispatchInput(select);
          }
        }
      }

      $$("#recorderList .recorder-list-item").forEach(item => {
        const name = managerItemName(item);
        const deleted = state.deletedRecorders.has(name);
        item.hidden = deleted;
        item.classList.toggle("v60-recorder-deleted", deleted);
      });

      const visibleButtons = $$("[data-delete-recorder]").filter(button => !state.deletedRecorders.has(sanitizeRecorder(button.dataset.deleteRecorder)));
      visibleButtons.forEach(button => { button.disabled = visibleButtons.length <= 1; });

      const local = readRecorderList();
      const filtered = local.filter(name => !state.deletedRecorders.has(name));
      if (JSON.stringify(local) !== JSON.stringify(filtered)) {
        localStorage.setItem(recorderListKey(), JSON.stringify(filtered));
      }
    } finally {
      state.syncing = false;
    }
  }

  async function deleteRecorder(name) {
    const target = sanitizeRecorder(name);
    const visible = effectiveRecorderList();
    if (!target || state.deletedRecorders.has(target)) return;
    if (visible.length <= 1) {
      showToast("ユーザーは最低1人必要です。", true);
      return;
    }
    if (!confirm(`${target}をユーザー一覧から削除しますか？\n既存の配合記録の記録者名は残ります。`)) return;

    state.deletedRecorders.add(target);
    const next = visible.filter(name => name !== target);
    const colors = readRecorderColors();
    delete colors[target];

    if (sanitizeRecorder(localStorage.getItem(RECORDER_STORAGE_KEY)) === target) {
      localStorage.setItem(RECORDER_STORAGE_KEY, next[0]);
    }

    await persistRecorderSettings(next, colors);
    syncRecorderUi();
    showToast(`${target}を削除しました`);
  }

  async function restoreRecorder(name, color) {
    const target = sanitizeRecorder(name);
    if (!target) return;
    state.deletedRecorders.delete(target);
    const list = uniqueNames([...readRecorderList(), target]);
    const colors = readRecorderColors();
    if (color) colors[target] = color;
    await persistRecorderSettings(list, colors);
    syncRecorderUi();
    showToast(`${target}を追加しました`);
    setTimeout(() => location.reload(), 250);
  }

  function scheduleEnhance() {
    clearTimeout(state.timer);
    state.timer = setTimeout(() => {
      syncRecorderUi();
      syncMutationInput();
      renderMutationDetail();
    }, 40);
  }

  function bindEvents() {
    $("#recordRows")?.addEventListener("click", event => {
      const row = event.target.closest("tr[data-id]");
      if (row) prepareDetailForRow(row);
    }, true);

    $("#mutationEgg")?.addEventListener("change", syncMutationInput);
    $("#eggType")?.addEventListener("beforeinput", event => {
      if ($("#mutationEgg")?.checked) event.preventDefault();
    });

    document.addEventListener("click", event => {
      const deleteButton = event.target.closest("[data-delete-recorder]");
      if (!deleteButton) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      void deleteRecorder(deleteButton.dataset.deleteRecorder);
    }, true);

    $("#recorderManageForm")?.addEventListener("submit", event => {
      const name = sanitizeRecorder($("#newRecorderName")?.value);
      if (!name || !state.deletedRecorders.has(name)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const color = $("#newRecorderColor")?.value || "";
      void restoreRecorder(name, color);
    }, true);

    $("#manageUsers")?.addEventListener("click", () => setTimeout(async () => {
      await loadRemoteTombstones();
      syncRecorderUi();
    }, 50));

    const dialog = $("#recordDialog");
    if (dialog) {
      new MutationObserver(scheduleEnhance).observe(dialog, { attributes: true, attributeFilter: ["open"] });
    }

    new MutationObserver(scheduleEnhance).observe(document.body, { childList: true, subtree: true });
  }

  async function init() {
    if (state.initialized) return;
    state.initialized = true;
    loadLocalTombstones();
    await Promise.all([loadRemoteTombstones(), loadRecords().then(records => { state.records = records; })]);
    bindEvents();
    syncRecorderUi();
    syncMutationInput();
    renderMutationDetail();
    setInterval(async () => {
      await loadRemoteTombstones();
      syncRecorderUi();
    }, 10000);
  }

  function wait(attempt = 0) {
    if ($("#recordRows") && $("#recordDialog") && $("#recorderManageDialog")) {
      void init();
      return;
    }
    if (attempt < 160) setTimeout(() => wait(attempt + 1), 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => wait(), { once: true });
  } else {
    wait();
  }
})();
