(() => {
  "use strict";

  const VERSION = "56";
  const UNKNOWN_ICON = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="24" fill="#e8f1f7"/>
      <circle cx="48" cy="48" r="31" fill="#fff" stroke="#b8cada" stroke-width="4"/>
      <text x="48" y="61" text-anchor="middle" font-family="Arial,sans-serif" font-size="40" font-weight="700" fill="#7891a6">?</text>
    </svg>`);

  const state = {
    records: [],
    iconMap: new Map(),
    knownNames: new Set(),
    initialized: false,
    refreshTimer: null,
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function normalize(value) {
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
    return window.CSS?.escape ? CSS.escape(String(value)) : String(value).replace(/["\\]/g, "\\$&");
  }

  function dispatchInput(element) {
    if (!element) return;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function roomId() {
    const params = new URLSearchParams(location.hash.replace(/^#/, ""));
    return params.get("room") || localStorage.getItem("palBoardRoomId") || "default";
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
        const url = `${String(databaseURL).replace(/\/$/, "")}/rooms/${encodeURIComponent(roomId())}/records.json`;
        const response = await fetch(url, { cache: "no-store" });
        if (response.ok) return recordsFromPayload(await response.json());
      } catch (error) {
        console.warn("配合画面v56: Firebase記録の取得に失敗しました。", error);
      }
    }

    try {
      return recordsFromPayload(JSON.parse(localStorage.getItem(`pal-breeding-records:${roomId()}`) || "[]"));
    } catch (error) {
      console.warn("配合画面v56: ローカル記録の取得に失敗しました。", error);
      return [];
    }
  }

  function formatDate(value) {
    const timestamp = Number(value || 0);
    if (!timestamp) return "—";
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  }

  function ageDays(value) {
    const timestamp = Number(value || 0);
    return timestamp ? Math.max(0, Math.floor((Date.now() - timestamp) / 86400000)) : 0;
  }

  function captureKnownNames() {
    state.knownNames = new Set(
      $$("#palOptions option")
        .map(option => normalize(option.value || option.textContent))
        .filter(Boolean)
    );
  }

  function captureIcons() {
    const next = new Map(state.iconMap);

    $$("#recordRows .pal-record-card").forEach(card => {
      const name = card.querySelector(".pal-record-name")?.textContent?.trim();
      const image = card.querySelector("img");
      const src = image?.currentSrc || image?.src || "";
      if (name && name !== "未確認" && src) next.set(normalize(name), src);
    });

    $$("#detailBody .recipe-pal").forEach(card => {
      const spans = $$(':scope > span', card);
      const name = spans.at(-1)?.textContent?.trim();
      const image = card.querySelector("img");
      const src = image?.currentSrc || image?.src || "";
      if (name && name !== "未確認" && src) next.set(normalize(name), src);
    });

    $$('img[alt]').forEach(image => {
      const name = image.alt?.trim();
      const src = image.currentSrc || image.src || "";
      if (name && !["パルワールド", "タマゴ"].includes(name) && src) next.set(normalize(name), src);
    });

    try {
      const cached = JSON.parse(localStorage.getItem("pal-breeding-board:current-roster:v51") || "null");
      const list = Array.isArray(cached) ? cached : (Array.isArray(cached?.pals) ? cached.pals : []);
      list.forEach(item => {
        const name = String(item?.name || item?.displayName || "").trim();
        const src = String(item?.paldbIcon || item?.icon || "").trim();
        if (name && src) next.set(normalize(name), src);
      });
    } catch {
      // キャッシュ形式が異なる場合はDOMから取得した画像を利用します。
    }

    state.iconMap = next;
  }

  function iconUrl(name) {
    return state.iconMap.get(normalize(name)) || UNKNOWN_ICON;
  }

  function palChip(name, options = {}) {
    const label = String(name || options.fallback || "未確認").trim() || "未確認";
    const pending = !name;
    return `<span class="v56-pal-chip ${pending ? "is-pending" : ""}">
      <span class="v56-pal-image"><img src="${escapeHtml(pending ? UNKNOWN_ICON : iconUrl(label))}" alt="${escapeHtml(label)}" loading="lazy"></span>
      <strong>${escapeHtml(label)}</strong>
    </span>`;
  }

  function recipeVisual(record, options = {}) {
    const compact = options.compact ? " is-compact" : "";
    return `<div class="v56-recipe-visual${compact}">
      ${palChip(record.parentA, { fallback: "親A未入力" })}
      <span class="v56-recipe-symbol">＋</span>
      ${palChip(record.parentB, { fallback: "親B未入力" })}
      <span class="v56-recipe-symbol arrow">→</span>
      ${palChip(record.resultPal, { fallback: "未確認" })}
    </div>`;
  }

  function recipeMeta(record) {
    return `<div class="v56-recipe-meta">
      <span>${escapeHtml(record.eggType || "タマゴ未設定")}</span>
      ${record.mutation ? "<span class=\"v56-mutation\">✦ 突然変異</span>" : ""}
      <span class="v56-status ${record.resultPal ? "is-verified" : "is-pending"}">${record.resultPal ? "配合確認済み" : "確認中"}</span>
    </div>`;
  }

  function openRecord(recordId, options = {}) {
    $(".nav-item[data-view='records']")?.click();
    $("#clearFilters")?.click();
    const search = $("#searchInput");
    if (search) {
      search.value = "";
      dispatchInput(search);
    }

    setTimeout(() => {
      const row = $(`#recordRows tr[data-id="${selectorEscape(recordId)}"]`);
      if (!row) return;
      row.click();
      if (options.edit) {
        setTimeout(() => {
          row.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
          if (options.focus) setTimeout(() => $(options.focus)?.focus(), 120);
        }, 50);
      } else {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
  }

  function setNaviNumbers() {
    const numberPairs = [
      ["#breedingToolkit .reverse-card .tool-number", "01"],
      ["#workflowRelationCard .tool-number", "02"],
      ["#workflowParentCard .tool-number", "03"],
    ];
    numberPairs.forEach(([selector, number]) => {
      const element = $(selector);
      if (element) element.textContent = number;
    });
  }

  function renderReverse() {
    const input = $("#enhTargetPal");
    const container = $("#enhRecipeResults");
    const count = $("#enhRecipeCount");
    if (!input || !container || !count) return;

    const target = normalize(input.value);
    if (!target) {
      count.textContent = "0件";
      container.innerHTML = '<div class="enh-empty-state">結果パルを選ぶと、記録済みの親ペアを画像付きで表示します。</div>';
      return;
    }

    const seen = new Set();
    const matches = state.records
      .filter(record => normalize(record.resultPal) === target)
      .filter(record => {
        const key = [normalize(record.parentA), normalize(record.parentB)].sort().join("::");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);

    count.textContent = `${matches.length}件`;
    container.innerHTML = matches.length
      ? matches.map(record => `<button type="button" class="v56-recipe-card" data-v56-open="${escapeHtml(record.id)}">
          ${recipeVisual(record)}${recipeMeta(record)}
        </button>`).join("")
      : '<div class="enh-empty-state">この結果パルの登録済み配合はありません。</div>';

    $$('[data-v56-open]', container).forEach(button => button.addEventListener("click", () => openRecord(button.dataset.v56Open)));
  }

  function renderRelation() {
    const input = $("#workflowRelationPal");
    const container = $("#workflowRelationResults");
    const count = $("#workflowRelationCount");
    if (!input || !container || !count) return;

    const targetName = input.value.trim();
    const target = normalize(targetName);
    if (!target) {
      count.textContent = "0件";
      container.innerHTML = '<div class="enh-empty-state">パルを選ぶと、関係する配合を画像付きで表示します。</div>';
      return;
    }

    const parentRecords = state.records.filter(record => normalize(record.parentA) === target || normalize(record.parentB) === target);
    const resultRecords = state.records.filter(record => normalize(record.resultPal) === target);
    const routes = [];
    const routeKeys = new Set();

    parentRecords.forEach(first => {
      if (!first.resultPal) return;
      const middle = normalize(first.resultPal);
      state.records.forEach(second => {
        if (second.id === first.id || !second.resultPal) return;
        if (normalize(second.parentA) !== middle && normalize(second.parentB) !== middle) return;
        const key = `${first.id}:${second.id}`;
        if (routeKeys.has(key)) return;
        routeKeys.add(key);
        routes.push({ first, second });
      });
    });

    count.textContent = `${parentRecords.length + resultRecords.length}件`;

    const listHtml = records => records.length
      ? records.map(record => `<button type="button" class="v56-relation-recipe" data-v56-open="${escapeHtml(record.id)}">
          ${recipeVisual(record, { compact: true })}${recipeMeta(record)}
        </button>`).join("")
      : '<div class="workflow-empty-mini">該当する記録はありません。</div>';

    const routeHtml = routes.length
      ? routes.map(({ first, second }) => `<button type="button" class="v56-route-card" data-v56-open="${escapeHtml(second.id)}">
          ${recipeVisual(first, { compact: true })}
          <span class="v56-route-down">↓</span>
          ${recipeVisual(second, { compact: true })}
        </button>`).join("")
      : '<div class="workflow-empty-mini">このパルから続く2段階ルートはありません。</div>';

    container.innerHTML = `<div class="workflow-relation-columns v56-relation-columns">
      <section><h4>このパルを親にした配合</h4>${listHtml(parentRecords)}</section>
      <section><h4>このパルを作れる配合</h4>${listHtml(resultRecords)}</section>
      <section><h4>その先に作れるパル</h4>${routeHtml}</section>
    </div>`;

    $$('[data-v56-open]', container).forEach(button => button.addEventListener("click", () => openRecord(button.dataset.v56Open)));
  }

  function renderParentSearch() {
    const input = $("#workflowParentPal");
    const container = $("#workflowParentResults");
    const count = $("#workflowParentCount");
    if (!input || !container || !count) return;

    const target = normalize(input.value);
    if (!target) {
      count.textContent = "0件";
      container.innerHTML = '<div class="enh-empty-state">親パルを選ぶと、登録済み配合を画像付きで表示します。</div>';
      return;
    }

    const matches = state.records
      .filter(record => normalize(record.parentA) === target || normalize(record.parentB) === target)
      .sort((a, b) => b.updatedAt - a.updatedAt);

    count.textContent = `${matches.length}件`;
    container.innerHTML = matches.length
      ? matches.map(record => `<button type="button" class="v56-recipe-card is-parent-search" data-v56-open="${escapeHtml(record.id)}">
          ${recipeVisual(record)}${recipeMeta(record)}
        </button>`).join("")
      : '<div class="enh-empty-state">このパルを親に含む配合記録はありません。</div>';

    $$('[data-v56-open]', container).forEach(button => button.addEventListener("click", () => openRecord(button.dataset.v56Open)));
  }

  function issueList(record, duplicateIds) {
    const issues = [];
    if (!record.resultPal) issues.push("結果未確認");
    if (!record.eggType) issues.push("卵未設定");
    if ([record.parentA, record.parentB, record.resultPal].filter(Boolean).some(name => !state.knownNames.has(normalize(name)))) issues.push("パル名不整合");
    if (!record.resultPal && ageDays(record.updatedAt) >= 7) issues.push("長期確認中");
    if (duplicateIds.has(record.id)) issues.push("重複候補");
    return issues;
  }

  function duplicateIds() {
    const groups = new Map();
    state.records.forEach(record => {
      const key = [normalize(record.parentA), normalize(record.parentB)].filter(Boolean).sort().join("::");
      if (!key) return;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(record.id);
    });
    return new Set(Array.from(groups.values()).filter(ids => ids.length > 1).flat());
  }

  function createReviewBoard() {
    const oldBoard = $("#workflowReviewBoard");
    const page = $("#workflowReviewPage");
    if (!page) return false;

    if (!$("#workflowReviewBoardV56")) {
      const board = document.createElement("section");
      board.id = "workflowReviewBoardV56";
      board.className = "breeding-toolkit workflow-review-board v56-review-board";
      board.innerHTML = `<div class="breeding-toolkit-head">
        <div>
          <p class="eyebrow">REVIEW WORKBOARD</p>
          <h2>確認作業ボード</h2>
          <p>結果やタマゴが未入力の記録を一覧で確認し、そのまま編集できます。</p>
        </div>
        <button type="button" class="enh-secondary-button" id="v56ReviewRefresh">↻ 更新</button>
      </div>
      <div class="v56-review-summary">
        <button type="button" data-v56-review-filter="結果未確認"><strong id="v56PendingCount">0</strong><span>結果未確認</span></button>
        <button type="button" data-v56-review-filter="卵未設定"><strong id="v56EggCount">0</strong><span>卵未設定</span></button>
        <button type="button" data-v56-review-filter="パル名不整合"><strong id="v56NameCount">0</strong><span>パル名不整合</span></button>
      </div>
      <div class="v56-review-controls">
        <label>表示対象
          <select id="v56ReviewFilter">
            <option value="">要確認をすべて表示</option>
            <option value="結果未確認">結果未確認</option>
            <option value="卵未設定">卵未設定</option>
            <option value="パル名不整合">パル名不整合</option>
            <option value="長期確認中">長期確認中</option>
            <option value="重複候補">重複候補</option>
          </select>
        </label>
        <span id="v56ReviewVisibleCount">0件</span>
      </div>
      <div id="v56ReviewList" class="v56-review-list"></div>`;

      if (oldBoard) oldBoard.replaceWith(board); else page.appendChild(board);

      $("#v56ReviewRefresh")?.addEventListener("click", () => refresh(true));
      $("#v56ReviewFilter")?.addEventListener("change", renderReview);
      $$('[data-v56-review-filter]', board).forEach(button => {
        button.addEventListener("click", () => {
          $("#v56ReviewFilter").value = button.dataset.v56ReviewFilter || "";
          renderReview();
        });
      });
    } else {
      oldBoard?.remove();
    }
    return true;
  }

  function renderReview() {
    const list = $("#v56ReviewList");
    if (!list) return;

    const duplicates = duplicateIds();
    const all = state.records
      .map(record => ({ record, issues: issueList(record, duplicates) }))
      .filter(item => item.issues.length)
      .sort((a, b) => {
        if (!a.record.resultPal && b.record.resultPal) return -1;
        if (a.record.resultPal && !b.record.resultPal) return 1;
        return a.record.updatedAt - b.record.updatedAt;
      });

    const count = issue => all.filter(item => item.issues.includes(issue)).length;
    $("#v56PendingCount").textContent = String(count("結果未確認"));
    $("#v56EggCount").textContent = String(count("卵未設定"));
    $("#v56NameCount").textContent = String(count("パル名不整合"));

    const filter = $("#v56ReviewFilter")?.value || "";
    const visible = filter ? all.filter(item => item.issues.includes(filter)) : all;
    $("#v56ReviewVisibleCount").textContent = `${visible.length}件`;

    list.innerHTML = visible.length
      ? visible.map(({ record, issues }) => `<article class="v56-review-item">
          <div class="v56-review-main">
            ${recipeVisual(record, { compact: true })}
            <div class="v56-review-info">
              <div class="v56-review-issues">${issues.map(issue => `<span>${escapeHtml(issue)}</span>`).join("")}</div>
              <p>${escapeHtml(record.recorder || "記録者不明")} / 更新 ${escapeHtml(formatDate(record.updatedAt))} / ${ageDays(record.updatedAt)}日経過</p>
              ${record.note ? `<small>${escapeHtml(record.note)}</small>` : ""}
            </div>
          </div>
          <div class="v56-review-actions">
            <button type="button" data-v56-detail="${escapeHtml(record.id)}">詳細</button>
            <button type="button" data-v56-edit="${escapeHtml(record.id)}">編集</button>
            ${!record.resultPal ? `<button type="button" data-v56-result="${escapeHtml(record.id)}">結果を入力</button>` : ""}
            ${!record.eggType ? `<button type="button" data-v56-egg="${escapeHtml(record.id)}">卵を入力</button>` : ""}
          </div>
        </article>`).join("")
      : '<div class="enh-empty-state">現在、この条件で確認が必要な記録はありません。</div>';

    $$('[data-v56-detail]', list).forEach(button => button.addEventListener("click", () => openRecord(button.dataset.v56Detail)));
    $$('[data-v56-edit]', list).forEach(button => button.addEventListener("click", () => openRecord(button.dataset.v56Edit, { edit: true })));
    $$('[data-v56-result]', list).forEach(button => button.addEventListener("click", () => openRecord(button.dataset.v56Result, { edit: true, focus: "#resultPal" })));
    $$('[data-v56-egg]', list).forEach(button => button.addEventListener("click", () => openRecord(button.dataset.v56Egg, { edit: true, focus: "#eggType" })));
  }

  function removeNewPalFilter() {
    const checkbox = $("#newPalOnly");
    if (checkbox?.checked) {
      checkbox.checked = false;
      dispatchInput(checkbox);
    }
    checkbox?.closest(".new-pal-toggle")?.remove();
  }

  function bindNaviControls() {
    const bind = (selector, eventName, renderer) => {
      const element = $(selector);
      if (!element || element.dataset.v56Bound) return;
      element.dataset.v56Bound = "1";
      element.addEventListener(eventName, () => setTimeout(renderer, 0));
    };

    bind("#enhFindRecipes", "click", renderReverse);
    bind("#workflowShowRelation", "click", renderRelation);
    bind("#workflowSearchParent", "click", renderParentSearch);

    [["#enhTargetPal", renderReverse], ["#workflowRelationPal", renderRelation], ["#workflowParentPal", renderParentSearch]].forEach(([selector, renderer]) => {
      const input = $(selector);
      if (!input || input.dataset.v56Bound) return;
      input.dataset.v56Bound = "1";
      input.addEventListener("keydown", event => {
        if (event.key === "Enter") setTimeout(renderer, 0);
      });
    });

    const naviButton = $("[data-v55-view='navi']");
    if (naviButton && !naviButton.dataset.v56Bound) {
      naviButton.dataset.v56Bound = "1";
      naviButton.addEventListener("click", () => setTimeout(() => {
        captureIcons();
        renderReverse();
        renderRelation();
        renderParentSearch();
      }, 50));
    }

    const reviewButton = $("[data-v55-view='review']");
    if (reviewButton && !reviewButton.dataset.v56Bound) {
      reviewButton.dataset.v56Bound = "1";
      reviewButton.addEventListener("click", () => setTimeout(() => refresh(false), 50));
    }
  }

  async function refresh(showMessage = false) {
    state.records = await loadRecords();
    captureKnownNames();
    captureIcons();
    setNaviNumbers();
    renderReverse();
    renderRelation();
    renderParentSearch();
    renderReview();

    if (showMessage) {
      const existing = $("#enhancementToast") || $("#workflowToast");
      if (existing) {
        existing.textContent = "確認作業を更新しました";
        existing.classList.add("is-visible");
        setTimeout(() => existing.classList.remove("is-visible"), 2200);
      }
    }
  }

  function observeRecords() {
    const rows = $("#recordRows");
    if (!rows) return;
    new MutationObserver(() => {
      clearTimeout(state.refreshTimer);
      state.refreshTimer = setTimeout(() => refresh(false), 350);
    }).observe(rows, { childList: true, subtree: true });
  }

  function init() {
    if (state.initialized) return;
    state.initialized = true;
    removeNewPalFilter();
    createReviewBoard();
    setNaviNumbers();
    bindNaviControls();
    observeRecords();
    refresh(false);
  }

  function wait(attempt = 0) {
    const ready = $("#breedingToolkit") && $("#workflowRelationCard") && $("#workflowParentCard") && $("#workflowReviewPage") && $("#recordRows");
    if (ready) {
      init();
      return;
    }
    if (attempt < 140) setTimeout(() => wait(attempt + 1), 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => wait(), { once: true });
  } else {
    wait();
  }
})();
