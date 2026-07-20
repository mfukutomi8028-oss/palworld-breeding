(() => {
  "use strict";

  const VERSION = "52";
  const REFRESH_DEBOUNCE_MS = 350;
  const state = {
    records: [],
    palNames: [],
    missingLimit: 48,
    refreshTimer: null,
    initialized: false,
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/[ぁ-ゖ]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0x60))
      .toLowerCase()
      .replace(/[\s\u3000・_\-ーｰ'’.]/g, "");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getRoomId() {
    const params = new URLSearchParams(location.hash.replace(/^#/, ""));
    return params.get("room") || localStorage.getItem("palBoardRoomId") || "default";
  }

  function normalizeRecord(id, record) {
    if (!record || typeof record !== "object") return null;
    return {
      id: String(id || record.id || ""),
      parentA: String(record.parentA || "").trim(),
      parentB: String(record.parentB || "").trim(),
      resultPal: String(record.resultPal || "").trim(),
      eggType: String(record.eggType || "").trim(),
      mutation: Boolean(record.mutation ?? record.isMutation ?? record.mutated),
      status: String(record.resultPal || "").trim() ? "配合確認済み" : "確認中",
      recorder: String(record.recorder || "").trim(),
      note: String(record.note || "").trim(),
      updatedAt: Number(record.updatedAt || 0),
    };
  }

  function recordsFromPayload(payload) {
    if (Array.isArray(payload)) {
      return payload
        .map((record, index) => normalizeRecord(record?.id || index, record))
        .filter(Boolean);
    }
    if (!payload || typeof payload !== "object") return [];
    return Object.entries(payload)
      .filter(([id]) => !String(id).startsWith("sample-"))
      .map(([id, record]) => normalizeRecord(id, record))
      .filter(Boolean);
  }

  async function loadAllRecords() {
    const roomId = getRoomId();
    const databaseURL = window.firebaseConfig?.databaseURL;

    if (databaseURL) {
      try {
        const url = `${String(databaseURL).replace(/\/$/, "")}/rooms/${encodeURIComponent(roomId)}/records.json`;
        const response = await fetch(url, { cache: "no-store" });
        if (response.ok) return recordsFromPayload(await response.json());
      } catch (error) {
        console.warn("配合ナビ: Firebaseデータの取得に失敗しました。", error);
      }
    }

    try {
      const local = JSON.parse(localStorage.getItem(`pal-breeding-records:${roomId}`) || "[]");
      return recordsFromPayload(local);
    } catch (error) {
      console.warn("配合ナビ: ローカルデータの取得に失敗しました。", error);
      return [];
    }
  }

  function getPalNames() {
    const names = $$("#palOptions option")
      .map(option => String(option.value || option.textContent || "").trim())
      .filter(Boolean);
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b, "ja", { numeric: true }));
  }

  function getDiscoveredSet() {
    const discovered = new Set();
    for (const record of state.records) {
      [record.parentA, record.parentB, record.resultPal]
        .map(name => String(name || "").trim())
        .filter(Boolean)
        .forEach(name => discovered.add(normalizeText(name)));
    }
    return discovered;
  }

  function showToast(message, isError = false) {
    let toast = $("#enhancementToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "enhancementToast";
      toast.className = "enh-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.toggle("is-error", isError);
    toast.classList.add("is-visible");
    window.clearTimeout(toast._hideTimer);
    toast._hideTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  async function copyText(text, successMessage = "コピーしました") {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      showToast(successMessage);
      return true;
    } catch (error) {
      console.warn("コピーに失敗しました。", error);
      showToast("コピーに失敗しました", true);
      return false;
    }
  }

  function injectToolkit() {
    if ($("#breedingToolkit")) return;
    const kpiGrid = $(".kpi-grid");
    if (!kpiGrid) return;

    const section = document.createElement("section");
    section.id = "breedingToolkit";
    section.className = "breeding-toolkit";
    section.setAttribute("aria-label", "配合ナビ");
    section.innerHTML = `
      <div class="breeding-toolkit-head">
        <div>
          <p class="eyebrow">BREEDING NAVI</p>
          <h2>配合ナビ</h2>
          <p>このルームに記録した実績から親ペアを逆引きし、未発見パルも確認できます。</p>
        </div>
        <div class="breeding-toolkit-actions">
          <span class="enh-version-badge">v${VERSION}</span>
          <button type="button" class="enh-secondary-button" id="enhRefreshData">↻ 更新</button>
        </div>
      </div>
      <div class="breeding-toolkit-grid">
        <article class="breeding-tool-card reverse-card">
          <div class="breeding-tool-card-head">
            <div><span class="tool-number">01</span><h3>結果パルから親ペアを逆引き</h3></div>
            <span id="enhRecipeCount" class="tool-count">0件</span>
          </div>
          <p class="tool-description">汎用計算表ではなく、このワールドで実際に確認した記録だけを表示します。</p>
          <div class="enh-input-row">
            <input id="enhTargetPal" type="search" list="palOptions" autocomplete="off" placeholder="結果パルを選択・入力" aria-label="逆引きする結果パル" />
            <button type="button" class="enh-primary-button" id="enhFindRecipes">逆引き</button>
          </div>
          <div id="enhRecipeResults" class="enh-recipe-results" aria-live="polite"></div>
        </article>

        <article class="breeding-tool-card progress-card">
          <div class="breeding-tool-card-head">
            <div><span class="tool-number">02</span><h3>発見進捗・未発見一覧</h3></div>
            <span id="enhProgressPercent" class="tool-count">0%</span>
          </div>
          <p class="tool-description">親・結果として一度でも登録されたパルを「発見済み」として集計します。</p>
          <div class="enh-progress-track" aria-hidden="true"><span id="enhProgressBar"></span></div>
          <div class="enh-progress-stats">
            <span><strong id="enhDiscoveredCount">0</strong> 発見済み</span>
            <span><strong id="enhMissingCount">0</strong> 未発見</span>
            <span><strong id="enhRosterCount">0</strong> リスト総数</span>
          </div>
          <input id="enhMissingSearch" class="enh-missing-search" type="search" placeholder="未発見パルを検索" aria-label="未発見パルを検索" />
          <div id="enhMissingList" class="enh-missing-list"></div>
          <button type="button" class="enh-text-button" id="enhShowMoreMissing" hidden>さらに表示</button>
        </article>
      </div>`;

    kpiGrid.insertAdjacentElement("afterend", section);

    $("#enhRefreshData")?.addEventListener("click", () => refreshData(true));
    $("#enhFindRecipes")?.addEventListener("click", renderReverseLookup);
    $("#enhTargetPal")?.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        renderReverseLookup();
      }
    });
    $("#enhTargetPal")?.addEventListener("input", () => {
      const value = $("#enhTargetPal").value.trim();
      if (!value) renderReverseLookup();
    });
    $("#enhMissingSearch")?.addEventListener("input", () => {
      state.missingLimit = 48;
      renderDiscoveryProgress();
    });
    $("#enhShowMoreMissing")?.addEventListener("click", () => {
      state.missingLimit += 48;
      renderDiscoveryProgress();
    });
  }

  function renderReverseLookup() {
    const input = $("#enhTargetPal");
    const container = $("#enhRecipeResults");
    const count = $("#enhRecipeCount");
    if (!input || !container || !count) return;

    const rawTarget = input.value.trim();
    const targetKey = normalizeText(rawTarget);
    if (!targetKey) {
      count.textContent = "0件";
      container.innerHTML = `<div class="enh-empty-state">結果パルを選ぶと、記録済みの親ペアを表示します。</div>`;
      return;
    }

    const matches = state.records
      .filter(record => record.resultPal && normalizeText(record.resultPal) === targetKey)
      .sort((a, b) => b.updatedAt - a.updatedAt);

    const unique = [];
    const seen = new Set();
    for (const record of matches) {
      const pairKey = [normalizeText(record.parentA), normalizeText(record.parentB)].sort().join("::");
      if (!pairKey || seen.has(pairKey)) continue;
      seen.add(pairKey);
      unique.push(record);
    }

    count.textContent = `${unique.length}件`;
    if (!unique.length) {
      container.innerHTML = `<div class="enh-empty-state"><strong>${escapeHtml(rawTarget)}</strong>を結果とする確認済み記録はまだありません。</div>`;
      return;
    }

    container.innerHTML = unique.map(record => `
      <div class="enh-recipe-item" data-record-id="${escapeHtml(record.id)}">
        <button type="button" class="enh-recipe-main" data-open-record="${escapeHtml(record.id)}">
          <span class="enh-pal-pill">${escapeHtml(record.parentA || "未入力")}</span>
          <span class="enh-recipe-symbol">＋</span>
          <span class="enh-pal-pill">${escapeHtml(record.parentB || "未入力")}</span>
          <span class="enh-recipe-symbol">→</span>
          <strong>${escapeHtml(record.resultPal)}</strong>
        </button>
        <div class="enh-recipe-meta">
          <span>${escapeHtml(record.eggType || "タマゴ未設定")}</span>
          ${record.mutation ? `<span class="enh-mutation-chip">✦ 突然変異</span>` : ""}
          <button type="button" class="enh-copy-button" data-copy-record="${escapeHtml(record.id)}" title="レシピをコピー">コピー</button>
        </div>
      </div>`).join("");

    $$('[data-open-record]', container).forEach(button => {
      button.addEventListener("click", () => openRecordFromLookup(button.dataset.openRecord, rawTarget));
    });
    $$('[data-copy-record]', container).forEach(button => {
      button.addEventListener("click", () => {
        const record = state.records.find(item => item.id === button.dataset.copyRecord);
        if (record) copyText(formatRecipe(record), "配合レシピをコピーしました");
      });
    });
  }

  function clearMainFilters() {
    $(".nav-item[data-view='records']")?.click();
    $("#clearFilters")?.click();
    const search = $("#searchInput");
    if (search) {
      search.value = "";
      search.dispatchEvent(new Event("input", { bubbles: true }));
    }
    const pendingOnly = $("#unverifiedOnly");
    if (pendingOnly?.checked) {
      pendingOnly.checked = false;
      pendingOnly.dispatchEvent(new Event("input", { bubbles: true }));
    }
    const newOnly = $("#newPalOnly");
    if (newOnly?.checked) {
      newOnly.checked = false;
      newOnly.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function openRecordFromLookup(recordId, targetName) {
    clearMainFilters();
    const resultFilter = $("#resultFilter");
    if (resultFilter) {
      resultFilter.value = targetName;
      resultFilter.dispatchEvent(new Event("input", { bubbles: true }));
    }
    window.setTimeout(() => {
      const row = $(`#recordRows tr[data-id="${CSS.escape(recordId)}"]`);
      if (row) {
        row.click();
        row.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        $(".board-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);
  }

  function renderDiscoveryProgress() {
    const list = $("#enhMissingList");
    if (!list) return;

    state.palNames = getPalNames();
    const discovered = getDiscoveredSet();
    const roster = state.palNames;
    const discoveredCount = roster.filter(name => discovered.has(normalizeText(name))).length;
    const missing = roster.filter(name => !discovered.has(normalizeText(name)));
    const total = roster.length;
    const percent = total ? Math.round((discoveredCount / total) * 100) : 0;

    $("#enhDiscoveredCount").textContent = String(discoveredCount);
    $("#enhMissingCount").textContent = String(missing.length);
    $("#enhRosterCount").textContent = String(total);
    $("#enhProgressPercent").textContent = `${percent}%`;
    $("#enhProgressBar").style.width = `${percent}%`;

    const query = normalizeText($("#enhMissingSearch")?.value || "");
    const filtered = missing.filter(name => !query || normalizeText(name).includes(query));
    const visible = filtered.slice(0, state.missingLimit);

    if (!total) {
      list.innerHTML = `<div class="enh-empty-state">パル一覧の読み込みを待っています。</div>`;
    } else if (!filtered.length) {
      list.innerHTML = `<div class="enh-empty-state">該当する未発見パルはありません。</div>`;
    } else {
      list.innerHTML = visible.map(name => `
        <button type="button" class="enh-missing-chip" data-new-result="${escapeHtml(name)}" title="${escapeHtml(name)}を結果として新規記録">
          <span>＋</span>${escapeHtml(name)}
        </button>`).join("");
      $$('[data-new-result]', list).forEach(button => {
        button.addEventListener("click", () => openNewRecordForResult(button.dataset.newResult));
      });
    }

    const more = $("#enhShowMoreMissing");
    if (more) {
      more.hidden = filtered.length <= visible.length;
      more.textContent = `さらに表示（残り${Math.max(0, filtered.length - visible.length)}件）`;
    }
  }

  function openNewRecordForResult(resultName) {
    $("#addRecord")?.click();
    window.setTimeout(() => {
      const result = $("#resultPal");
      if (!result) return;
      result.value = resultName;
      result.dispatchEvent(new Event("input", { bubbles: true }));
      $("#parentA")?.focus();
      showToast(`${resultName}を結果パルに設定しました`);
    }, 80);
  }

  function injectSwapButton() {
    const actions = $("#recordDialog .dialog-actions");
    if (!actions || $("#enhSwapParents")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.id = "enhSwapParents";
    button.className = "enh-swap-button";
    button.textContent = "⇄ 親A・親Bを入れ替え";
    button.addEventListener("click", () => {
      const parentA = $("#parentA");
      const parentB = $("#parentB");
      if (!parentA || !parentB) return;
      [parentA.value, parentB.value] = [parentB.value, parentA.value];
      parentA.dispatchEvent(new Event("input", { bubbles: true }));
      parentB.dispatchEvent(new Event("input", { bubbles: true }));
      showToast("親A・親Bを入れ替えました");
    });
    actions.insertBefore(button, actions.firstChild);
  }

  function formatRecipe(record) {
    const result = record.resultPal || "未確認";
    const extras = [record.eggType, record.mutation ? "突然変異" : ""].filter(Boolean);
    return `${record.parentA || "未入力"} ＋ ${record.parentB || "未入力"} → ${result}${extras.length ? `（${extras.join(" / ")}）` : ""}`;
  }

  function getSelectedRecord() {
    const selectedId = $("#recordRows tr.selected")?.dataset.id;
    return state.records.find(record => record.id === selectedId) || null;
  }

  function enhanceDetailToolbar() {
    const toolbar = $("#detailBody .detail-toolbar");
    if (!toolbar || $("#detailBody [data-enh-detail-copy]")) return;
    const record = getSelectedRecord();
    if (!record) return;

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "enh-detail-button";
    copyButton.dataset.enhDetailCopy = "true";
    copyButton.textContent = "レシピをコピー";
    copyButton.addEventListener("click", () => copyText(formatRecipe(record), "配合レシピをコピーしました"));

    const reverseButton = document.createElement("button");
    reverseButton.type = "button";
    reverseButton.className = "enh-detail-button";
    reverseButton.dataset.enhDetailReverse = "true";
    reverseButton.textContent = "この結果を逆引き";
    reverseButton.disabled = !record.resultPal;
    reverseButton.addEventListener("click", () => {
      const target = $("#enhTargetPal");
      if (!target || !record.resultPal) return;
      target.value = record.resultPal;
      renderReverseLookup();
      $("#breedingToolkit")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    toolbar.insertBefore(reverseButton, toolbar.firstChild);
    toolbar.insertBefore(copyButton, toolbar.firstChild);
  }

  function injectShareButton() {
    const card = $(".minimal-collab");
    if (!card || $("#enhCopyRoomLink")) return;
    const row = document.createElement("div");
    row.className = "enh-share-row";
    row.innerHTML = `
      <button type="button" id="enhCopyRoomLink" class="enh-share-button">🔗 共有リンクをコピー</button>
      <span class="enh-share-note">同じURLを開くと同じルームを共有</span>`;
    card.appendChild(row);
    $("#enhCopyRoomLink")?.addEventListener("click", () => copyText(location.href, "共有リンクをコピーしました"));
  }

  function observeAppChanges() {
    const rows = $("#recordRows");
    if (rows) {
      new MutationObserver(() => scheduleRefresh()).observe(rows, { childList: true });
    }
    const datalist = $("#palOptions");
    if (datalist) {
      new MutationObserver(() => scheduleRefresh()).observe(datalist, { childList: true });
    }
    const detail = $("#detailBody");
    if (detail) {
      new MutationObserver(() => window.requestAnimationFrame(enhanceDetailToolbar))
        .observe(detail, { childList: true, subtree: true });
    }
  }

  function scheduleRefresh() {
    window.clearTimeout(state.refreshTimer);
    state.refreshTimer = window.setTimeout(() => refreshData(false), REFRESH_DEBOUNCE_MS);
  }

  async function refreshData(showMessage = false) {
    state.records = await loadAllRecords();
    state.palNames = getPalNames();
    renderReverseLookup();
    renderDiscoveryProgress();
    enhanceDetailToolbar();
    if (showMessage) showToast("配合ナビを更新しました");
  }

  function waitForApp(attempt = 0) {
    if ($("#recordRows") && $("#palOptions") && $(".kpi-grid")) {
      init();
      return;
    }
    if (attempt < 80) window.setTimeout(() => waitForApp(attempt + 1), 100);
  }

  function init() {
    if (state.initialized) return;
    state.initialized = true;
    injectToolkit();
    injectSwapButton();
    injectShareButton();
    observeAppChanges();
    refreshData(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => waitForApp(), { once: true });
  } else {
    waitForApp();
  }
})();
