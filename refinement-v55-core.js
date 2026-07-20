(() => {
  "use strict";

  const VERSION = "55";
  const DOSUKOINU_PRIMARY_ICON = "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_SumoDog_icon_normal.webp";
  const DOSUKOINU_FALLBACK_ICON = "https://s-stats-platform-cdn.op.gg/palworld/1.0.0.100427/images/pals/SumoDog.webp?image=q_auto%3Agood%2Cf_png%2Cw_280&v=1783948171";
  const state = { records: [], activeView: "records", refreshTimer: null, initialized: false };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

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
      mutation: Boolean(value.mutation ?? value.isMutation ?? value.mutated),
    };
  }

  function recordsFromPayload(payload) {
    if (Array.isArray(payload)) return payload.map((item, index) => normalizeRecord(item?.id || index, item)).filter(Boolean);
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
        console.warn("v55: 記録の取得に失敗しました。", error);
      }
    }
    try {
      return recordsFromPayload(JSON.parse(localStorage.getItem(`pal-breeding-records:${roomId()}`) || "[]"));
    } catch {
      return [];
    }
  }

  function showToast(message) {
    const toast = $("#enhancementToast") || $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add(toast.id === "toast" ? "show" : "is-visible");
    clearTimeout(toast._v55Timer);
    toast._v55Timer = setTimeout(() => {
      toast.classList.remove("show", "is-visible");
    }, 2400);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("配合レシピをコピーしました");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      showToast("配合レシピをコピーしました");
    }
  }

  function formatRecipe(record) {
    const extras = [record.eggType, record.mutation ? "突然変異" : ""].filter(Boolean);
    return `${record.parentA || "未入力"} ＋ ${record.parentB || "未入力"} → ${record.resultPal || "未確認"}${extras.length ? `（${extras.join(" / ")}）` : ""}`;
  }

  function fixDosukoinuImages(root = document) {
    $$("img[alt=\"ドスコイヌ\"]", root).forEach(image => {
      if (image.dataset.dosukoinuFix === VERSION) return;
      image.dataset.dosukoinuFix = VERSION;
      image.removeAttribute("onerror");
      image.onerror = () => {
        if (!image.dataset.dosukoinuFallback) {
          image.dataset.dosukoinuFallback = "1";
          image.src = DOSUKOINU_FALLBACK_ICON;
        } else {
          image.onerror = null;
        }
      };
      image.src = DOSUKOINU_PRIMARY_ICON;
    });
  }

  function createPagesAndNavigation() {
    const nav = $(".main-nav");
    const kpis = $(".kpi-grid");
    if (!nav || !kpis) return;

    if (!$("#workflowNaviPage")) {
      const naviPage = document.createElement("section");
      naviPage.id = "workflowNaviPage";
      naviPage.className = "workflow-page-v55";
      naviPage.hidden = true;
      kpis.insertAdjacentElement("afterend", naviPage);

      const reviewPage = document.createElement("section");
      reviewPage.id = "workflowReviewPage";
      reviewPage.className = "workflow-page-v55";
      reviewPage.hidden = true;
      naviPage.insertAdjacentElement("afterend", reviewPage);
    }

    if (!$("[data-v55-view='navi']")) {
      nav.insertAdjacentHTML("beforeend", `
        <button class="nav-item" data-v55-view="navi" type="button"><span class="v55-nav-icon">↔</span>配合ナビ</button>
        <button class="nav-item" data-v55-view="review" type="button"><span class="v55-nav-icon">✓</span>確認作業</button>`);

      $$("[data-v55-view]").forEach(button => {
        button.addEventListener("click", () => showCustomView(button.dataset.v55View));
      });
      $$(".main-nav .nav-item[data-view]").forEach(button => {
        button.addEventListener("click", () => showBaseView());
      });
    }
  }

  function arrangeWorkflowPanels() {
    const toolkit = $("#breedingToolkit");
    const review = $("#workflowReviewBoard");
    const naviPage = $("#workflowNaviPage");
    const reviewPage = $("#workflowReviewPage");
    if (!toolkit || !review || !naviPage || !reviewPage) return false;

    toolkit.querySelector(".progress-card")?.remove();
    toolkit.querySelector(".enh-version-badge")?.remove();
    toolkit.querySelector(".breeding-toolkit-grid")?.classList.add("v55-navi-grid");
    const description = toolkit.querySelector(".breeding-toolkit-head > div > p:last-child");
    if (description) description.textContent = "登録済み記録から、逆引き・関係図・片親検索を行えます。";

    if (toolkit.parentElement !== naviPage) naviPage.appendChild(toolkit);
    if (review.parentElement !== reviewPage) reviewPage.appendChild(review);
    cleanupReviewBoard();
    return true;
  }

  function showBaseView() {
    state.activeView = "records";
    document.body.classList.remove("v55-custom-view");
    $("#workflowNaviPage").hidden = true;
    $("#workflowReviewPage").hidden = true;
    $(".kpi-grid").hidden = false;
    $(".board-layout").hidden = false;
    $$("[data-v55-view]").forEach(button => button.classList.remove("active"));
  }

  function showCustomView(view) {
    state.activeView = view;
    document.body.classList.add("v55-custom-view");
    $(".kpi-grid").hidden = true;
    $(".board-layout").hidden = true;
    $("#workflowNaviPage").hidden = view !== "navi";
    $("#workflowReviewPage").hidden = view !== "review";
    $$(".main-nav .nav-item").forEach(button => button.classList.remove("active"));
    $(`[data-v55-view=\"${selectorEscape(view)}\"]`)?.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cleanupReviewBoard() {
    const board = $("#workflowReviewBoard");
    if (!board) return;

    board.querySelector("[data-review-filter=\"1.0再確認候補\"]")?.remove();
    const filter = board.querySelector("#workflowReviewFilter");
    filter?.querySelector("option[value=\"1.0再確認候補\"]")?.remove();
    if (filter?.value === "1.0再確認候補") {
      filter.value = "";
      dispatchInput(filter);
    }

    $$(".workflow-review-item", board).forEach(item => {
      item.querySelector(".workflow-version-line")?.remove();
      item.querySelector("[data-verify-record]")?.remove();
      $$(".workflow-issue-list span", item).forEach(chip => {
        if (chip.textContent.trim() === "1.0再確認候補") chip.remove();
      });
      if (!item.querySelector(".workflow-issue-list span")) item.remove();
    });

    const visible = $$(".workflow-review-item", board).length;
    if ($("#workflowReviewVisibleCount", board)) $("#workflowReviewVisibleCount", board).textContent = `${visible}件`;
  }

  function selectedRecord() {
    const id = $("#recordRows tr.selected")?.dataset.id;
    return state.records.find(record => record.id === id) || null;
  }

  function openNewRecord(prefill, focus) {
    $(".nav-item[data-view='records']")?.click();
    showBaseView();
    $("#addRecord")?.click();
    setTimeout(() => {
      Object.entries(prefill).forEach(([id, value]) => {
        const input = $(`#${id}`);
        if (!input) return;
        input.value = value || "";
        dispatchInput(input);
      });
      $(focus)?.focus();
    }, 100);
  }

  function enhanceDetail() {
    const body = $("#detailBody");
    const toolbar = body?.querySelector(".detail-toolbar");
    const record = selectedRecord();
    if (!body || !toolbar || !record) return;

    fixDosukoinuImages(body);
    const old = body.querySelector(".v55-detail-actions");
    if (old?.dataset.recordId === record.id) return;
    old?.remove();

    const panel = document.createElement("div");
    panel.className = "v55-detail-actions";
    panel.dataset.recordId = record.id;
    panel.innerHTML = `
      <section>
        <h3>次の配合を登録</h3>
        <div class="v55-detail-button-grid">
          ${record.resultPal ? `<button type="button" data-v55-result-a>結果を親Aにして追加</button>` : ""}
          <button type="button" data-v55-parent-a>親Aを引き継いで追加</button>
          <button type="button" data-v55-parent-b>親Bを引き継いで追加</button>
        </div>
      </section>
      <section class="is-sub">
        <h3>関連操作</h3>
        <div class="v55-detail-button-grid is-sub">
          ${record.resultPal ? `<button type="button" data-v55-reverse>この結果を逆引き</button>` : ""}
          <button type="button" data-v55-copy>レシピをコピー</button>
        </div>
      </section>`;
    toolbar.insertAdjacentElement("afterend", panel);

    panel.querySelector("[data-v55-result-a]")?.addEventListener("click", () => openNewRecord({ parentA: record.resultPal }, "#parentB"));
    panel.querySelector("[data-v55-parent-a]")?.addEventListener("click", () => openNewRecord({ parentA: record.parentA }, "#parentB"));
    panel.querySelector("[data-v55-parent-b]")?.addEventListener("click", () => openNewRecord({ parentB: record.parentB }, "#parentA"));
    panel.querySelector("[data-v55-reverse]")?.addEventListener("click", () => {
      showCustomView("navi");
      const input = $("#enhTargetPal");
      if (input) {
        input.value = record.resultPal;
        $("#enhFindRecipes")?.click();
      }
    });
    panel.querySelector("[data-v55-copy]")?.addEventListener("click", () => copyText(formatRecipe(record)));
  }

  function observe() {
    const rows = $("#recordRows");
    if (rows) new MutationObserver(scheduleRefresh).observe(rows, { childList: true, subtree: true });

    const detail = $("#detailBody");
    if (detail) new MutationObserver(() => requestAnimationFrame(enhanceDetail)).observe(detail, { childList: true, subtree: true });

    const review = $("#workflowReviewBoard");
    if (review) new MutationObserver(() => requestAnimationFrame(cleanupReviewBoard)).observe(review, { childList: true, subtree: true });

    new MutationObserver(mutations => {
      mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
        if (node instanceof Element) fixDosukoinuImages(node);
      }));
    }).observe(document.body, { childList: true, subtree: true });
  }

  function scheduleRefresh() {
    clearTimeout(state.refreshTimer);
    state.refreshTimer = setTimeout(refresh, 300);
  }

  async function refresh() {
    state.records = await loadRecords();
    fixDosukoinuImages();
    cleanupReviewBoard();
    enhanceDetail();
  }

  function wait(attempt = 0) {
    const ready = $("#recordRows") && $("#detailBody") && $("#breedingToolkit") && $("#workflowReviewBoard") && $(".main-nav");
    if (!ready) {
      if (attempt < 120) setTimeout(() => wait(attempt + 1), 100);
      return;
    }
    init();
  }

  function init() {
    if (state.initialized) return;
    state.initialized = true;
    createPagesAndNavigation();
    arrangeWorkflowPanels();
    showBaseView();
    observe();
    refresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => wait(), { once: true });
  } else {
    wait();
  }
})();
