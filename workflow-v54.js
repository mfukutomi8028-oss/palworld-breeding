(() => {
  "use strict";

  const VERSION = "54";
  const GAME_VERSION = "Palworld 1.0";
  const V1_RELEASE_AT = Date.parse("2026-07-09T00:00:00+09:00");
  const REFRESH_DELAY = 350;
  const META_LOCAL_PREFIX = "pal-workflow-meta-v54:";

  const state = {
    records: [],
    palNames: [],
    palNameMap: new Map(),
    recordMeta: {},
    initialized: false,
    refreshTimer: null,
    detailRecordId: "",
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/[ぁ-ゖ]/g, char => String.fromCharCode(char.charCodeAt(0) + 0x60))
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

  function selectorEscape(value) {
    if (window.CSS?.escape) return CSS.escape(String(value));
    return String(value).replace(/["\\]/g, "\\$&");
  }

  function dispatchInput(element) {
    if (!element) return;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function getRoomId() {
    const params = new URLSearchParams(location.hash.replace(/^#/, ""));
    return params.get("room") || localStorage.getItem("palBoardRoomId") || "default";
  }

  function getCurrentRecorder() {
    return $("#currentRecorderSelect")?.value?.trim()
      || $("#currentRecorderLabel")?.textContent?.trim()
      || "未設定";
  }

  function localMetaKey() {
    return `${META_LOCAL_PREFIX}${getRoomId()}`;
  }

  function formatDateTime(value) {
    const timestamp = Number(value || 0);
    if (!timestamp) return "—";
    const date = new Date(timestamp);
    const parts = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ];
    const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    return `${parts.join("/")} ${time}`;
  }

  function ageDays(value) {
    const timestamp = Number(value || 0);
    return timestamp ? Math.max(0, Math.floor((Date.now() - timestamp) / 86400000)) : 0;
  }

  function normalizeRecord(id, value) {
    if (!value || typeof value !== "object") return null;
    return {
      id: String(id || value.id || ""),
      parentA: String(value.parentA || "").trim(),
      parentB: String(value.parentB || "").trim(),
      resultPal: String(value.resultPal || "").trim(),
      eggType: String(value.eggType || "").trim(),
      recorder: String(value.recorder || "").trim(),
      note: String(value.note || "").trim(),
      mutation: Boolean(value.mutation ?? value.isMutation ?? value.mutated),
      updatedAt: Number(value.updatedAt || 0),
    };
  }

  function recordsFromPayload(payload) {
    if (Array.isArray(payload)) {
      return payload.map((record, index) => normalizeRecord(record?.id || index, record)).filter(Boolean);
    }
    if (!payload || typeof payload !== "object") return [];
    return Object.entries(payload)
      .filter(([id]) => !String(id).startsWith("sample-"))
      .map(([id, record]) => normalizeRecord(id, record))
      .filter(Boolean);
  }

  async function loadRecords() {
    const databaseURL = window.firebaseConfig?.databaseURL;
    if (databaseURL) {
      try {
        const url = `${String(databaseURL).replace(/\/$/, "")}/rooms/${encodeURIComponent(getRoomId())}/records.json`;
        const response = await fetch(url, { cache: "no-store" });
        if (response.ok) return recordsFromPayload(await response.json());
      } catch (error) {
        console.warn("配合ワークフロー: Firebase記録の取得に失敗しました。", error);
      }
    }

    try {
      const local = JSON.parse(localStorage.getItem(`pal-breeding-records:${getRoomId()}`) || "[]");
      return recordsFromPayload(local);
    } catch (error) {
      console.warn("配合ワークフロー: ローカル記録の取得に失敗しました。", error);
      return [];
    }
  }

  function loadPalNames() {
    const names = $$("#palOptions option")
      .map(option => String(option.value || option.textContent || "").trim())
      .filter(Boolean);
    state.palNames = Array.from(new Set(names)).sort((a, b) => a.localeCompare(b, "ja", { numeric: true }));
    state.palNameMap = new Map(state.palNames.map(name => [normalizeText(name), name]));
  }

  function canonicalPalName(value) {
    const raw = String(value || "").trim();
    return state.palNameMap.get(normalizeText(raw)) || raw;
  }

  function isKnownPalName(value) {
    return !value || state.palNameMap.has(normalizeText(value));
  }

  async function loadRecordMeta() {
    const databaseURL = window.firebaseConfig?.databaseURL;
    if (databaseURL) {
      try {
        const url = `${String(databaseURL).replace(/\/$/, "")}/rooms/${encodeURIComponent(getRoomId())}/enhancementMeta/v54/recordMeta.json`;
        const response = await fetch(url, { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          state.recordMeta = data && typeof data === "object" ? data : {};
          localStorage.setItem(localMetaKey(), JSON.stringify(state.recordMeta));
          return;
        }
      } catch (error) {
        console.warn("配合ワークフロー: バージョン情報の取得に失敗しました。", error);
      }
    }

    try {
      state.recordMeta = JSON.parse(localStorage.getItem(localMetaKey()) || "{}") || {};
    } catch {
      state.recordMeta = {};
    }
  }

  async function saveMetaPatch(patch) {
    if (!patch || !Object.keys(patch).length) return;
    Object.assign(state.recordMeta, patch);
    localStorage.setItem(localMetaKey(), JSON.stringify(state.recordMeta));

    const databaseURL = window.firebaseConfig?.databaseURL;
    if (!databaseURL) return;
    try {
      const url = `${String(databaseURL).replace(/\/$/, "")}/rooms/${encodeURIComponent(getRoomId())}/enhancementMeta/v54/recordMeta.json`;
      await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch (error) {
      console.warn("配合ワークフロー: バージョン情報の保存に失敗しました。", error);
    }
  }

  function makeInitialMeta(record) {
    const basisAt = record.updatedAt || Date.now();
    const isV1Record = basisAt >= V1_RELEASE_AT;
    const verified = Boolean(record.resultPal && isV1Record);
    return {
      sourceVersion: isV1Record ? GAME_VERSION : "1.0以前（更新日時基準）",
      basisAt,
      lastVerifiedVersion: verified ? GAME_VERSION : "",
      lastVerifiedAt: verified ? basisAt : 0,
      lastVerifiedBy: verified ? (record.recorder || "不明") : "",
      needsReview: Boolean(record.resultPal && !isV1Record),
    };
  }

  async function ensureRecordMeta() {
    const patch = {};
    for (const record of state.records) {
      if (!state.recordMeta[record.id]) patch[record.id] = makeInitialMeta(record);
    }
    await saveMetaPatch(patch);
  }

  function showToast(message, isError = false) {
    let toast = $("#enhancementToast") || $("#workflowToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "workflowToast";
      toast.className = "enh-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.toggle("is-error", isError);
    toast.classList.add("is-visible");
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  function clearMainFilters() {
    $(".nav-item[data-view='records']")?.click();
    $("#clearFilters")?.click();
    const search = $("#searchInput");
    if (search) {
      search.value = "";
      dispatchInput(search);
    }
  }

  function findRecordRow(recordId) {
    return $(`#recordRows tr[data-id="${selectorEscape(recordId)}"]`);
  }

  function openRecord(recordId, options = {}) {
    clearMainFilters();
    setTimeout(() => {
      const row = findRecordRow(recordId);
      if (!row) {
        showToast("対象の記録を一覧で開けませんでした", true);
        return;
      }
      row.click();
      if (options.edit) {
        setTimeout(() => {
          row.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
          if (options.focus) setTimeout(() => $(options.focus)?.focus(), 120);
        }, 40);
      } else {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 140);
  }

  function openNewRecord(prefill = {}, focus = "#parentA") {
    $("#addRecord")?.click();
    setTimeout(() => {
      for (const [key, value] of Object.entries(prefill)) {
        const element = $(`#${key}`);
        if (!element) continue;
        element.value = value || "";
        dispatchInput(element);
      }
      $(focus)?.focus();
    }, 100);
  }

  function selectedRecord() {
    const id = $("#recordRows tr.selected")?.dataset.id;
    return state.records.find(record => record.id === id) || null;
  }

  function pairKey(record) {
    return [normalizeText(record.parentA), normalizeText(record.parentB)].filter(Boolean).sort().join("::");
  }

  function duplicatePairIds() {
    const groups = new Map();
    for (const record of state.records) {
      const key = pairKey(record);
      if (!key) continue;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(record.id);
    }
    return new Set(Array.from(groups.values()).filter(ids => ids.length > 1).flat());
  }

  function rowHasBrokenImage(recordId) {
    const row = findRecordRow(recordId);
    if (!row) return false;
    return $$("img", row).some(image => image.complete && image.naturalWidth === 0);
  }

  function getReviewIssues(record, duplicateIds) {
    const issues = [];
    const meta = state.recordMeta[record.id] || makeInitialMeta(record);

    if (!record.resultPal) issues.push("結果未確認");
    if (!record.eggType) issues.push("卵未設定");
    if ([record.parentA, record.parentB, record.resultPal].filter(Boolean).some(name => !isKnownPalName(name))) {
      issues.push("パル名不整合");
    }
    if (meta.needsReview && record.resultPal) issues.push("1.0再確認候補");
    if (!record.resultPal && ageDays(record.updatedAt) >= 7) issues.push("長期確認中");
    if (duplicateIds.has(record.id)) issues.push("重複候補");
    if (rowHasBrokenImage(record.id)) issues.push("画像読込失敗");

    return Array.from(new Set(issues));
  }

  function injectCards() {
    const toolkit = $("#breedingToolkit");
    const grid = toolkit?.querySelector(".breeding-toolkit-grid");
    if (!toolkit || !grid) return false;

    toolkit.querySelector(".enh-version-badge").textContent = `v${VERSION}`;
    const description = toolkit.querySelector(".breeding-toolkit-head > div > p:last-child");
    if (description) description.textContent = "登録済みの配合記録から、逆引き・未発見確認・関係図・片親検索を利用できます。";
    grid.classList.add("workflow-main-grid");

    if (!$("#workflowRelationCard")) {
      grid.insertAdjacentHTML("beforeend", `
        <article class="breeding-tool-card relation-card" id="workflowRelationCard">
          <div class="breeding-tool-card-head">
            <div><span class="tool-number">03</span><h3>パル単位の配合関係図</h3></div>
            <span id="workflowRelationCount" class="tool-count">0件</span>
          </div>
          <p class="tool-description">このパルを親にした配合、作れる配合、その先につながる2段階ルートを表示します。</p>
          <div class="enh-input-row">
            <input id="workflowRelationPal" type="search" list="palOptions" autocomplete="off" placeholder="パル名を選択・入力" />
            <button type="button" class="enh-primary-button" id="workflowShowRelation">表示</button>
          </div>
          <div id="workflowRelationResults" class="workflow-relation-results"></div>
        </article>

        <article class="breeding-tool-card parent-search-card" id="workflowParentCard">
          <div class="breeding-tool-card-head">
            <div><span class="tool-number">04</span><h3>片親から登録済み配合を検索</h3></div>
            <span id="workflowParentCount" class="tool-count">0件</span>
          </div>
          <p class="tool-description">指定したパルを親A・親Bのどちらかに含む配合を一覧表示します。</p>
          <div class="enh-input-row">
            <input id="workflowParentPal" type="search" list="palOptions" autocomplete="off" placeholder="親にしたいパルを選択・入力" />
            <button type="button" class="enh-primary-button" id="workflowSearchParent">検索</button>
          </div>
          <div id="workflowParentResults" class="workflow-parent-results"></div>
        </article>`);

      $("#workflowShowRelation")?.addEventListener("click", renderRelationGraph);
      $("#workflowRelationPal")?.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          renderRelationGraph();
        }
      });
      $("#workflowSearchParent")?.addEventListener("click", renderParentSearch);
      $("#workflowParentPal")?.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          renderParentSearch();
        }
      });
    }
    return true;
  }

  function injectReviewBoard() {
    if ($("#workflowReviewBoard")) return;
    const toolkit = $("#breedingToolkit");
    if (!toolkit) return;
    toolkit.insertAdjacentHTML("afterend", `
      <section class="breeding-toolkit workflow-review-board" id="workflowReviewBoard">
        <div class="breeding-toolkit-head">
          <div>
            <p class="eyebrow">REVIEW WORKBOARD</p>
            <h2>確認作業ボード</h2>
            <p>既存記録から次に確認すべき項目を自動抽出し、確認中の記録をここから処理できます。</p>
          </div>
          <button type="button" class="enh-secondary-button" id="workflowRefresh">↻ 更新</button>
        </div>
        <div class="workflow-review-summary">
          <button type="button" data-review-filter="結果未確認"><strong id="workflowPendingCount">0</strong><span>結果未確認</span></button>
          <button type="button" data-review-filter="卵未設定"><strong id="workflowEggCount">0</strong><span>卵未設定</span></button>
          <button type="button" data-review-filter="1.0再確認候補"><strong id="workflowVersionCount">0</strong><span>1.0再確認候補</span></button>
          <button type="button" data-review-filter="パル名不整合"><strong id="workflowNameCount">0</strong><span>パル名不整合</span></button>
        </div>
        <div class="workflow-review-controls">
          <label>表示対象
            <select id="workflowReviewFilter">
              <option value="">要確認をすべて表示</option>
              <option value="結果未確認">結果未確認</option>
              <option value="卵未設定">卵未設定</option>
              <option value="1.0再確認候補">1.0再確認候補</option>
              <option value="パル名不整合">パル名不整合</option>
              <option value="長期確認中">長期確認中</option>
              <option value="重複候補">重複候補</option>
              <option value="画像読込失敗">画像読込失敗</option>
            </select>
          </label>
          <span id="workflowReviewVisibleCount">0件</span>
        </div>
        <div id="workflowReviewList" class="workflow-review-list"></div>
      </section>`);

    $("#workflowRefresh")?.addEventListener("click", () => refresh(true));
    $("#workflowReviewFilter")?.addEventListener("change", renderReviewBoard);
    $$("[data-review-filter]", $("#workflowReviewBoard")).forEach(button => {
      button.addEventListener("click", () => {
        $("#workflowReviewFilter").value = button.dataset.reviewFilter || "";
        renderReviewBoard();
        $("#workflowReviewList")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function renderRelationGraph() {
    const input = $("#workflowRelationPal");
    const container = $("#workflowRelationResults");
    if (!input || !container) return;

    const palName = canonicalPalName(input.value);
    const target = normalizeText(palName);
    if (!target) {
      $("#workflowRelationCount").textContent = "0件";
      container.innerHTML = '<div class="enh-empty-state">パルを選ぶと、登録済みの配合関係を表示します。</div>';
      return;
    }

    const parentRecords = state.records.filter(record =>
      normalizeText(record.parentA) === target || normalizeText(record.parentB) === target
    );
    const resultRecords = state.records.filter(record => normalizeText(record.resultPal) === target);

    const routes = [];
    const routeKeys = new Set();
    for (const first of parentRecords) {
      if (!first.resultPal) continue;
      const middle = normalizeText(first.resultPal);
      for (const second of state.records) {
        if (second.id === first.id || !second.resultPal) continue;
        if (normalizeText(second.parentA) !== middle && normalizeText(second.parentB) !== middle) continue;
        const key = `${first.id}:${second.id}`;
        if (routeKeys.has(key)) continue;
        routeKeys.add(key);
        routes.push({ first, second });
      }
    }

    $("#workflowRelationCount").textContent = `${parentRecords.length + resultRecords.length}件`;

    const parentHtml = parentRecords.length ? parentRecords.map(record => {
      const other = normalizeText(record.parentA) === target ? record.parentB : record.parentA;
      return `<button type="button" class="workflow-relation-item" data-open-record="${escapeHtml(record.id)}">
        <strong>${escapeHtml(palName)} ＋ ${escapeHtml(other || "未入力")} → ${escapeHtml(record.resultPal || "未確認")}</strong>
        <span>${escapeHtml(record.eggType || "タマゴ未設定")}</span>
      </button>`;
    }).join("") : '<div class="workflow-empty-mini">このパルを親にした記録はありません。</div>';

    const resultHtml = resultRecords.length ? resultRecords.map(record => `
      <button type="button" class="workflow-relation-item" data-open-record="${escapeHtml(record.id)}">
        <strong>${escapeHtml(record.parentA || "未入力")} ＋ ${escapeHtml(record.parentB || "未入力")} → ${escapeHtml(palName)}</strong>
        <span>${escapeHtml(record.eggType || "タマゴ未設定")}</span>
      </button>`).join("") : '<div class="workflow-empty-mini">このパルを結果とする記録はありません。</div>';

    const routeHtml = routes.length ? routes.map(({ first, second }) => {
      const firstOther = normalizeText(first.parentA) === target ? first.parentB : first.parentA;
      const secondOther = normalizeText(second.parentA) === normalizeText(first.resultPal) ? second.parentB : second.parentA;
      return `<button type="button" class="workflow-route-item" data-open-record="${escapeHtml(second.id)}">
        <span>${escapeHtml(palName)} ＋ ${escapeHtml(firstOther || "未入力")} → <strong>${escapeHtml(first.resultPal)}</strong></span>
        <b>↓</b>
        <span><strong>${escapeHtml(first.resultPal)}</strong> ＋ ${escapeHtml(secondOther || "未入力")} → ${escapeHtml(second.resultPal)}</span>
      </button>`;
    }).join("") : '<div class="workflow-empty-mini">このパルから続く2段階ルートはまだありません。</div>';

    container.innerHTML = `
      <div class="workflow-relation-columns">
        <section><h4>このパルを親にした配合</h4>${parentHtml}</section>
        <section><h4>このパルを作れる配合</h4>${resultHtml}</section>
        <section><h4>その先に作れるパル</h4>${routeHtml}</section>
      </div>`;

    $$("[data-open-record]", container).forEach(button => {
      button.addEventListener("click", () => openRecord(button.dataset.openRecord));
    });
  }

  function renderParentSearch() {
    const input = $("#workflowParentPal");
    const container = $("#workflowParentResults");
    if (!input || !container) return;

    const palName = canonicalPalName(input.value);
    const target = normalizeText(palName);
    if (!target) {
      $("#workflowParentCount").textContent = "0件";
      container.innerHTML = '<div class="enh-empty-state">親パルを選ぶと、登録済み配合を表示します。</div>';
      return;
    }

    const records = state.records
      .filter(record => normalizeText(record.parentA) === target || normalizeText(record.parentB) === target)
      .sort((a, b) => b.updatedAt - a.updatedAt);

    $("#workflowParentCount").textContent = `${records.length}件`;
    if (!records.length) {
      container.innerHTML = `<div class="enh-empty-state"><strong>${escapeHtml(palName)}</strong>を親に含む記録はありません。</div>`;
      return;
    }

    container.innerHTML = records.map(record => {
      const other = normalizeText(record.parentA) === target ? record.parentB : record.parentA;
      return `<article class="workflow-parent-item">
        <button type="button" data-open-record="${escapeHtml(record.id)}">
          <span>${escapeHtml(palName)}</span><b>＋</b><span>${escapeHtml(other || "未入力")}</span><b>→</b><strong>${escapeHtml(record.resultPal || "未確認")}</strong>
        </button>
        <div><span class="workflow-status ${record.resultPal ? "is-verified" : "is-pending"}">${record.resultPal ? "配合確認済み" : "確認中"}</span><small>${escapeHtml(record.eggType || "タマゴ未設定")}</small></div>
      </article>`;
    }).join("");

    $$("[data-open-record]", container).forEach(button => {
      button.addEventListener("click", () => openRecord(button.dataset.openRecord));
    });
  }

  function renderReviewBoard() {
    const container = $("#workflowReviewList");
    if (!container) return;

    const duplicateIds = duplicatePairIds();
    const allItems = state.records
      .map(record => ({ record, issues: getReviewIssues(record, duplicateIds) }))
      .filter(item => item.issues.length)
      .sort((a, b) => {
        if (!a.record.resultPal && b.record.resultPal) return -1;
        if (a.record.resultPal && !b.record.resultPal) return 1;
        return a.record.updatedAt - b.record.updatedAt;
      });

    const count = issue => allItems.filter(item => item.issues.includes(issue)).length;
    $("#workflowPendingCount").textContent = String(count("結果未確認"));
    $("#workflowEggCount").textContent = String(count("卵未設定"));
    $("#workflowVersionCount").textContent = String(count("1.0再確認候補"));
    $("#workflowNameCount").textContent = String(count("パル名不整合"));

    const filter = $("#workflowReviewFilter")?.value || "";
    const items = filter ? allItems.filter(item => item.issues.includes(filter)) : allItems;
    $("#workflowReviewVisibleCount").textContent = `${items.length}件`;

    if (!items.length) {
      container.innerHTML = '<div class="enh-empty-state">現在、この条件で確認が必要な記録はありません。</div>';
      return;
    }

    container.innerHTML = items.map(({ record, issues }) => {
      const meta = state.recordMeta[record.id] || makeInitialMeta(record);
      return `<article class="workflow-review-item">
        <div class="workflow-review-item-head">
          <div>
            <h3>${escapeHtml(record.parentA || "未入力")} ＋ ${escapeHtml(record.parentB || "未入力")} → ${escapeHtml(record.resultPal || "未確認")}</h3>
            <p>${escapeHtml(record.recorder || "記録者不明")} / 更新 ${escapeHtml(formatDateTime(record.updatedAt))} / ${ageDays(record.updatedAt)}日経過</p>
          </div>
          <div class="workflow-issue-list">${issues.map(issue => `<span>${escapeHtml(issue)}</span>`).join("")}</div>
        </div>
        <div class="workflow-version-line">
          <span><strong>記録時データ：</strong>${escapeHtml(meta.sourceVersion || "—")}</span>
          <span><strong>最終確認：</strong>${escapeHtml(meta.lastVerifiedVersion || "未確認")}${meta.lastVerifiedAt ? `（${escapeHtml(formatDateTime(meta.lastVerifiedAt))}）` : ""}</span>
        </div>
        <div class="workflow-review-actions">
          <button type="button" data-detail-record="${escapeHtml(record.id)}">詳細</button>
          <button type="button" data-edit-record="${escapeHtml(record.id)}">編集</button>
          ${!record.resultPal ? `<button type="button" data-result-record="${escapeHtml(record.id)}">結果を入力</button>` : ""}
          ${!record.eggType ? `<button type="button" data-egg-record="${escapeHtml(record.id)}">卵を入力</button>` : ""}
          ${record.resultPal && meta.lastVerifiedVersion !== GAME_VERSION ? `<button type="button" data-verify-record="${escapeHtml(record.id)}">1.0確認済みにする</button>` : ""}
        </div>
      </article>`;
    }).join("");

    $$("[data-detail-record]", container).forEach(button => button.addEventListener("click", () => openRecord(button.dataset.detailRecord)));
    $$("[data-edit-record]", container).forEach(button => button.addEventListener("click", () => openRecord(button.dataset.editRecord, { edit: true })));
    $$("[data-result-record]", container).forEach(button => button.addEventListener("click", () => openRecord(button.dataset.resultRecord, { edit: true, focus: "#resultPal" })));
    $$("[data-egg-record]", container).forEach(button => button.addEventListener("click", () => openRecord(button.dataset.eggRecord, { edit: true, focus: "#eggType" })));
    $$("[data-verify-record]", container).forEach(button => button.addEventListener("click", () => markVerified(button.dataset.verifyRecord)));
  }

  async function markVerified(recordId) {
    const record = state.records.find(item => item.id === recordId);
    if (!record?.resultPal) return;
    const current = state.recordMeta[recordId] || makeInitialMeta(record);
    await saveMetaPatch({
      [recordId]: {
        ...current,
        lastVerifiedVersion: GAME_VERSION,
        lastVerifiedAt: Date.now(),
        lastVerifiedBy: getCurrentRecorder(),
        needsReview: false,
      },
    });
    renderReviewBoard();
    enhanceDetail();
    showToast("1.0確認済みにしました");
  }

  function makeDetailButton(label, handler, disabled = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "enh-detail-button workflow-detail-button";
    button.dataset.workflowDetail = "true";
    button.textContent = label;
    button.disabled = disabled;
    button.addEventListener("click", handler);
    return button;
  }

  function enhanceDetail() {
    const toolbar = $("#detailBody .detail-toolbar");
    const record = selectedRecord();
    if (!toolbar || !record) return;
    if (state.detailRecordId === record.id && $("#detailBody .workflow-version-panel")) return;

    state.detailRecordId = record.id;
    $$("[data-workflow-detail]", toolbar).forEach(button => button.remove());
    $("#detailBody .workflow-version-panel")?.remove();

    const buttons = [
      makeDetailButton("結果→親Aで追加", () => openNewRecord({ parentA: record.resultPal }, "#parentB"), !record.resultPal),
      makeDetailButton("結果→親Bで追加", () => openNewRecord({ parentB: record.resultPal }, "#parentA"), !record.resultPal),
      makeDetailButton("親Aを引き継いで追加", () => openNewRecord({ parentA: record.parentA }, "#parentB"), !record.parentA),
      makeDetailButton("親Bを引き継いで追加", () => openNewRecord({ parentB: record.parentB }, "#parentA"), !record.parentB),
      makeDetailButton("1.0確認済みにする", () => markVerified(record.id), !record.resultPal),
    ];
    buttons.reverse().forEach(button => toolbar.insertBefore(button, toolbar.firstChild));

    const meta = state.recordMeta[record.id] || makeInitialMeta(record);
    const panel = document.createElement("div");
    panel.className = "detail-section workflow-version-panel";
    panel.innerHTML = `<h3>配合データのバージョン</h3>
      <div class="workflow-version-grid">
        <p><strong>記録時データ：</strong>${escapeHtml(meta.sourceVersion || "—")}</p>
        <p><strong>判定基準日時：</strong>${escapeHtml(formatDateTime(meta.basisAt || record.updatedAt))}</p>
        <p><strong>最終確認：</strong>${escapeHtml(meta.lastVerifiedVersion || "未確認")}</p>
        <p><strong>最終確認日時：</strong>${escapeHtml(formatDateTime(meta.lastVerifiedAt))}</p>
        <p><strong>最終確認者：</strong>${escapeHtml(meta.lastVerifiedBy || "—")}</p>
        <p><strong>状態：</strong>${meta.lastVerifiedVersion === GAME_VERSION ? "1.0確認済み" : "確認待ち"}</p>
      </div>`;
    $("#detailBody").appendChild(panel);
  }

  function observeChanges() {
    const rows = $("#recordRows");
    if (rows) new MutationObserver(scheduleRefresh).observe(rows, { childList: true });

    const options = $("#palOptions");
    if (options) new MutationObserver(scheduleRefresh).observe(options, { childList: true });

    const detail = $("#detailBody");
    if (detail) {
      new MutationObserver(() => requestAnimationFrame(enhanceDetail))
        .observe(detail, { childList: true, subtree: true });
    }
  }

  function scheduleRefresh() {
    clearTimeout(state.refreshTimer);
    state.refreshTimer = setTimeout(() => refresh(false), REFRESH_DELAY);
  }

  async function refresh(showMessage = false) {
    state.records = await loadRecords();
    loadPalNames();
    await loadRecordMeta();
    await ensureRecordMeta();
    renderRelationGraph();
    renderParentSearch();
    renderReviewBoard();
    enhanceDetail();
    if (showMessage) showToast("確認作業ボードを更新しました");
  }

  function init() {
    if (state.initialized) return;
    if (!injectCards()) return;
    state.initialized = true;
    injectReviewBoard();
    observeChanges();
    refresh(false);
  }

  function waitForBase(attempt = 0) {
    if ($("#recordRows") && $("#palOptions") && $("#breedingToolkit")) {
      init();
      return;
    }
    if (attempt < 100) setTimeout(() => waitForBase(attempt + 1), 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => waitForBase(), { once: true });
  } else {
    waitForBase();
  }
})();
