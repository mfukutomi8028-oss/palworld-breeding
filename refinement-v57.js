(() => {
  "use strict";

  const VERSION = "57";
  const MUTATION_EGG_ICON = "https://cdn.paldb.cc/image/Others/InventoryItemIcon/Texture/T_itemicon_Material_PalEgg_MutationPal.webp";
  const UNKNOWN_ICON = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="24" fill="#e8f1f7"/>
      <circle cx="48" cy="48" r="31" fill="#fff" stroke="#b8cada" stroke-width="4"/>
      <text x="48" y="61" text-anchor="middle" font-family="Arial,sans-serif" font-size="40" font-weight="700" fill="#7891a6">?</text>
    </svg>`);

  const ICON_OVERRIDES = new Map([
    ["イシス", "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Horus_Water_icon_normal.webp"],
    ["ドスコイヌ", "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_SumoDog_icon_normal.webp"],
  ].map(([name, url]) => [normalize(name), url]));

  const state = {
    records: [],
    iconMap: new Map(),
    initialized: false,
    refreshTimer: null,
    relationBound: false,
    reviewCleaning: false,
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
      mutation: Boolean(value.mutation ?? value.isMutation ?? value.mutated ?? value.mutationEgg),
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
        console.warn("配合画面v57: Firebase記録の取得に失敗しました。", error);
      }
    }

    try {
      return recordsFromPayload(JSON.parse(localStorage.getItem(`pal-breeding-records:${roomId()}`) || "[]"));
    } catch (error) {
      console.warn("配合画面v57: ローカル記録の取得に失敗しました。", error);
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

  function firstString(object, keys) {
    for (const key of keys) {
      const value = object?.[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
    return "";
  }

  function collectRosterItems(value, output = [], visited = new Set()) {
    if (!value || typeof value !== "object" || visited.has(value)) return output;
    visited.add(value);

    if (Array.isArray(value)) {
      value.forEach(item => collectRosterItems(item, output, visited));
      return output;
    }

    const name = firstString(value, ["name", "displayName", "jpName", "jaName", "nameJa", "localizedName", "palName"]);
    const icon = firstString(value, ["paldbIcon", "icon", "iconUrl", "image", "imageUrl", "thumbnail"]);
    const code = firstString(value, ["code", "internalName", "tribe", "bpClass", "BPClass", "characterId"]);
    if (name && (icon || code)) output.push({ name, icon, code });

    Object.values(value).forEach(child => collectRosterItems(child, output, visited));
    return output;
  }

  function buildCanonicalIconMap() {
    const map = new Map();

    try {
      const cached = JSON.parse(localStorage.getItem("pal-breeding-board:current-roster:v51") || "null");
      collectRosterItems(cached).forEach(item => {
        let url = item.icon;
        if (!url && item.code) {
          url = `https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_${item.code}_icon_normal.webp`;
        }
        if (url) map.set(normalize(item.name), url);
      });
    } catch (error) {
      console.warn("配合画面v57: パル画像マスターの読込に失敗しました。", error);
    }

    $$(".v56-pal-chip").forEach(chip => {
      const name = chip.querySelector("strong")?.textContent?.trim();
      const image = chip.querySelector("img");
      const src = image?.currentSrc || image?.src || "";
      if (name && name !== "未確認" && src && src !== UNKNOWN_ICON && !map.has(normalize(name))) {
        map.set(normalize(name), src);
      }
    });

    ICON_OVERRIDES.forEach((url, key) => map.set(key, url));
    state.iconMap = map;
  }

  function iconUrl(name) {
    return state.iconMap.get(normalize(name)) || UNKNOWN_ICON;
  }

  function palChip(name, fallback = "未確認") {
    const label = String(name || fallback).trim() || fallback;
    const pending = !name;
    return `<span class="v57-pal-chip ${pending ? "is-pending" : ""}">
      <span class="v57-pal-image"><img src="${escapeHtml(pending ? UNKNOWN_ICON : iconUrl(label))}" alt="${escapeHtml(label)}" loading="lazy"></span>
      <strong>${escapeHtml(label)}</strong>
    </span>`;
  }

  function mutationEggChip(compact = false) {
    return `<span class="v57-mutation-egg ${compact ? "is-compact" : ""}">
      <img src="${MUTATION_EGG_ICON}" alt="突然変異タマゴ" loading="lazy">
      <strong>突然変異タマゴ</strong>
    </span>`;
  }

  function eggChip(record) {
    if (record.mutation) return mutationEggChip(true);
    if (record.eggType) return `<span class="v57-egg-label">${escapeHtml(record.eggType)}</span>`;
    return `<span class="v57-egg-label is-empty">タマゴ未設定</span>`;
  }

  function recipeVisual(record, compact = false) {
    return `<div class="v57-recipe-visual ${compact ? "is-compact" : ""}">
      ${palChip(record.parentA, "親A未入力")}
      <span class="v57-recipe-symbol">＋</span>
      ${palChip(record.parentB, "親B未入力")}
      <span class="v57-recipe-symbol arrow">→</span>
      ${palChip(record.resultPal, "未確認")}
    </div>`;
  }

  function recipeMeta(record) {
    return `<div class="v57-recipe-meta">
      ${eggChip(record)}
      <span class="v57-status ${record.resultPal ? "is-verified" : "is-pending"}">${record.resultPal ? "配合確認済み" : "確認中"}</span>
    </div>`;
  }

  function syncRecordTabImages(root = document) {
    $$(".pal-record-card", root).forEach(card => {
      const name = card.querySelector(".pal-record-name")?.textContent?.trim();
      const image = card.querySelector("img");
      const url = name ? state.iconMap.get(normalize(name)) : "";
      if (!name || !image || !url) return;
      if ((image.currentSrc || image.src) === url) return;
      image.removeAttribute("onerror");
      image.src = url;
      image.dataset.v57Canonical = VERSION;
    });

    $$("#detailBody .recipe-pal", root).forEach(card => {
      const name = $$(':scope > span', card).at(-1)?.textContent?.trim();
      const image = card.querySelector("img");
      const url = name ? state.iconMap.get(normalize(name)) : "";
      if (!name || !image || !url) return;
      image.removeAttribute("onerror");
      image.src = url;
      image.dataset.v57Canonical = VERSION;
    });

    $$("img[alt=\"イシス\"]", root).forEach(image => {
      image.removeAttribute("onerror");
      image.src = ICON_OVERRIDES.get(normalize("イシス"));
      image.dataset.v57Canonical = VERSION;
    });
  }

  function recordById(id) {
    return state.records.find(record => record.id === String(id || "")) || null;
  }

  function selectedRecord() {
    const id = $("#recordRows tr.selected")?.dataset.id;
    return recordById(id);
  }

  function applyMutationEggsToRecordTab() {
    $$("#recordRows tr[data-id]").forEach(row => {
      const record = recordById(row.dataset.id);
      const eggCell = row.children?.[4];
      if (!record || !eggCell) return;

      eggCell.querySelector(".v57-mutation-egg")?.remove();
      if (!record.mutation) return;

      eggCell.innerHTML = mutationEggChip(false);
      eggCell.classList.add("v57-mutation-cell");
    });

    const detail = $("#detailBody");
    const record = selectedRecord();
    detail?.querySelector(".v57-detail-mutation")?.remove();
    if (detail && record?.mutation) {
      const panel = document.createElement("section");
      panel.className = "detail-section v57-detail-mutation";
      panel.innerHTML = `<h3>タマゴ</h3>${mutationEggChip(false)}`;
      const anchor = detail.querySelector(".detail-toolbar") || detail.firstElementChild;
      if (anchor) anchor.insertAdjacentElement("afterend", panel); else detail.appendChild(panel);
    }
  }

  function simplifyNavi() {
    const toolkit = $("#breedingToolkit");
    const relation = $("#workflowRelationCard");
    if (!toolkit || !relation) return;

    toolkit.querySelector(".reverse-card")?.remove();
    toolkit.querySelector(".progress-card")?.remove();
    $("#workflowParentCard")?.remove();

    const grid = toolkit.querySelector(".breeding-toolkit-grid");
    grid?.classList.add("v57-relation-only");

    relation.querySelector(".tool-number")?.remove();
    const title = relation.querySelector("h3");
    if (title) title.textContent = "パル単位の配合関係図";
    const description = relation.querySelector(".tool-description");
    if (description) description.textContent = "選んだパルが親・結果として関係する配合と、その先につながる配合を画像付きで確認できます。";

    const headDescription = toolkit.querySelector(".breeding-toolkit-head > div > p:last-child");
    if (headDescription) headDescription.textContent = "登録済みの記録を、パルを中心に整理して表示します。";
  }

  function relationRecords(target) {
    const parentRecords = state.records.filter(record => normalize(record.parentA) === target || normalize(record.parentB) === target);
    const resultRecords = state.records.filter(record => normalize(record.resultPal) === target);
    const routes = [];
    const seen = new Set();

    parentRecords.forEach(first => {
      if (!first.resultPal) return;
      const middle = normalize(first.resultPal);
      state.records.forEach(second => {
        if (second.id === first.id || !second.resultPal) return;
        if (normalize(second.parentA) !== middle && normalize(second.parentB) !== middle) return;
        const key = `${first.id}:${second.id}`;
        if (seen.has(key)) return;
        seen.add(key);
        routes.push({ first, second });
      });
    });

    return { parentRecords, resultRecords, routes };
  }

  function openRecord(recordId) {
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
      row.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
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

    const { parentRecords, resultRecords, routes } = relationRecords(target);
    const total = parentRecords.length + resultRecords.length;
    count.textContent = `${total}件`;

    const recordCards = records => records.length
      ? records.map(record => `<button type="button" class="v57-relation-card" data-v57-open="${escapeHtml(record.id)}">
          ${recipeVisual(record)}${recipeMeta(record)}
        </button>`).join("")
      : '<div class="v57-empty">該当する配合記録はありません。</div>';

    const routeCards = routes.length
      ? routes.map(({ first, second }) => `<button type="button" class="v57-route-card" data-v57-open="${escapeHtml(second.id)}">
          <div class="v57-route-stage"><span>1段階目</span>${recipeVisual(first, true)}</div>
          <span class="v57-route-down">↓</span>
          <div class="v57-route-stage"><span>2段階目</span>${recipeVisual(second, true)}</div>
        </button>`).join("")
      : '<div class="v57-empty">このパルから続く2段階ルートはありません。</div>';

    container.innerHTML = `
      <div class="v57-focus-pal">
        <span class="v57-focus-image"><img src="${escapeHtml(iconUrl(targetName))}" alt="${escapeHtml(targetName)}"></span>
        <div><small>選択中のパル</small><strong>${escapeHtml(targetName)}</strong>
          <p>親として ${parentRecords.length}件 ／ 結果として ${resultRecords.length}件 ／ 2段階ルート ${routes.length}件</p>
        </div>
      </div>
      <div class="v57-relation-grid">
        <section class="v57-relation-section is-parent">
          <header><div><span>親として使う</span><h4>このパルを親にした配合</h4></div><b>${parentRecords.length}件</b></header>
          <div class="v57-card-list">${recordCards(parentRecords)}</div>
        </section>
        <section class="v57-relation-section is-result">
          <header><div><span>このパルを作る</span><h4>このパルを作れる配合</h4></div><b>${resultRecords.length}件</b></header>
          <div class="v57-card-list">${recordCards(resultRecords)}</div>
        </section>
        <section class="v57-relation-section is-route">
          <header><div><span>次の配合へつなぐ</span><h4>その先に作れるパル</h4></div><b>${routes.length}件</b></header>
          <div class="v57-route-list">${routeCards}</div>
        </section>
      </div>`;

    $$("[data-v57-open]", container).forEach(button => {
      button.addEventListener("click", () => openRecord(button.dataset.v57Open));
    });
  }

  function cleanMutationReview() {
    if (state.reviewCleaning) return;
    const list = $("#v56ReviewList");
    if (!list) return;
    state.reviewCleaning = true;

    try {
      $$(".v56-review-item", list).forEach(item => {
        const id = item.querySelector("[data-v56-detail]")?.dataset.v56Detail
          || item.querySelector("[data-v56-edit]")?.dataset.v56Edit;
        const record = recordById(id);
        if (!record?.mutation || record.eggType) return;

        $$(".v56-review-issues span", item).forEach(chip => {
          if (chip.textContent.trim() === "卵未設定") chip.remove();
        });
        item.querySelector("[data-v56-egg]")?.remove();
        if (!item.querySelector(".v56-review-issues span")) item.remove();
      });

      const eggCount = state.records.filter(record => !record.eggType && !record.mutation).length;
      if ($("#v56EggCount")) $("#v56EggCount").textContent = String(eggCount);
      if ($("#v56ReviewVisibleCount")) {
        $("#v56ReviewVisibleCount").textContent = `${$$(".v56-review-item", list).length}件`;
      }
    } finally {
      state.reviewCleaning = false;
    }
  }

  function applyMutationEggsToV56Cards() {
    $$("[data-v56-open]").forEach(card => {
      const record = recordById(card.dataset.v56Open);
      if (!record?.mutation) return;
      const meta = card.querySelector(".v56-recipe-meta");
      if (!meta) return;
      const first = meta.firstElementChild;
      if (first && !first.classList.contains("v56-status") && !first.classList.contains("v56-mutation")) first.remove();
      if (!meta.querySelector(".v57-mutation-egg")) meta.insertAdjacentHTML("afterbegin", mutationEggChip(true));
    });

    $$(".v56-review-item").forEach(item => {
      const id = item.querySelector("[data-v56-detail]")?.dataset.v56Detail;
      const record = recordById(id);
      if (!record?.mutation) return;
      const visual = item.querySelector(".v56-recipe-visual");
      if (visual && !item.querySelector(".v57-review-mutation-egg")) {
        visual.insertAdjacentHTML("afterend", `<div class="v57-review-mutation-egg">${mutationEggChip(true)}</div>`);
      }
    });
  }

  function enhanceAll() {
    buildCanonicalIconMap();
    simplifyNavi();
    syncRecordTabImages();
    applyMutationEggsToRecordTab();
    applyMutationEggsToV56Cards();
    cleanMutationReview();
  }

  async function refresh() {
    state.records = await loadRecords();
    enhanceAll();
    renderRelation();
  }

  function bindRelation() {
    if (state.relationBound) return;
    const button = $("#workflowShowRelation");
    const input = $("#workflowRelationPal");
    if (!button || !input) return;
    state.relationBound = true;

    button.addEventListener("click", event => {
      event.stopImmediatePropagation();
      renderRelation();
    }, true);

    input.addEventListener("keydown", event => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      renderRelation();
    }, true);

    $("[data-v55-view='navi']")?.addEventListener("click", () => {
      setTimeout(() => {
        simplifyNavi();
        buildCanonicalIconMap();
        renderRelation();
      }, 80);
    });
  }

  function observe() {
    const rows = $("#recordRows");
    if (rows) {
      new MutationObserver(() => {
        clearTimeout(state.refreshTimer);
        state.refreshTimer = setTimeout(() => {
          buildCanonicalIconMap();
          syncRecordTabImages();
          applyMutationEggsToRecordTab();
        }, 120);
      }).observe(rows, { childList: true, subtree: true });
    }

    const detail = $("#detailBody");
    if (detail) {
      new MutationObserver(() => requestAnimationFrame(() => {
        syncRecordTabImages(detail);
        applyMutationEggsToRecordTab();
      })).observe(detail, { childList: true, subtree: true });
    }

    const review = $("#workflowReviewPage");
    if (review) {
      new MutationObserver(() => requestAnimationFrame(() => {
        cleanMutationReview();
        applyMutationEggsToV56Cards();
      })).observe(review, { childList: true, subtree: true });
    }
  }

  function init() {
    if (state.initialized) return;
    state.initialized = true;
    bindRelation();
    observe();
    refresh();
  }

  function wait(attempt = 0) {
    const ready = $("#recordRows") && $("#workflowRelationCard") && $("#workflowReviewPage");
    if (ready) {
      init();
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
