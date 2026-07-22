(() => {
  "use strict";

  const VERSION = "58";
  const MUTATION_EGG_ICON = "https://cdn.paldb.cc/image/Others/InventoryItemIcon/Texture/T_itemicon_Material_PalEgg_MutationPal.webp";
  const ICON_OVERRIDES = new Map([
    ["イシス", "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Horus_Water_icon_normal.webp"],
    ["ドスコイヌ", "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_SumoDog_icon_normal.webp"],
  ].map(([name, url]) => [normalize(name), url]));

  const state = { records: [], icons: new Map(), timer: null, cleaning: false, initialized: false };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function normalize(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/[ぁ-ゖ]/g, char => String.fromCharCode(char.charCodeAt(0) + 0x60))
      .toLowerCase()
      .replace(/[\s\u3000・_\-ーｰ'’.]/g, "");
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
      mutation: Boolean(value.mutation ?? value.isMutation ?? value.mutated ?? value.mutationEgg),
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
        console.warn("配合画面v58: Firebase記録の取得に失敗しました。", error);
      }
    }
    try {
      return recordsFromPayload(JSON.parse(localStorage.getItem(`pal-breeding-records:${roomId()}`) || "[]"));
    } catch {
      return [];
    }
  }

  function firstString(object, keys) {
    for (const key of keys) {
      const value = object?.[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
    return "";
  }

  function collectRoster(value, output = [], visited = new Set()) {
    if (!value || typeof value !== "object" || visited.has(value)) return output;
    visited.add(value);
    if (Array.isArray(value)) {
      value.forEach(item => collectRoster(item, output, visited));
      return output;
    }
    const name = firstString(value, ["name", "displayName", "jpName", "jaName", "nameJa", "localizedName", "palName"]);
    const icon = firstString(value, ["paldbIcon", "icon", "iconUrl", "image", "imageUrl", "thumbnail"]);
    const code = firstString(value, ["code", "internalName", "tribe", "bpClass", "BPClass", "characterId"]);
    if (name && (icon || code)) output.push({ name, icon, code });
    Object.values(value).forEach(child => collectRoster(child, output, visited));
    return output;
  }

  function buildIconMap() {
    const map = new Map();
    try {
      const cached = JSON.parse(localStorage.getItem("pal-breeding-board:current-roster:v51") || "null");
      collectRoster(cached).forEach(item => {
        const url = item.icon || (item.code
          ? `https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_${item.code}_icon_normal.webp`
          : "");
        if (url) map.set(normalize(item.name), url);
      });
    } catch (error) {
      console.warn("配合画面v58: パル画像マスターの読込に失敗しました。", error);
    }

    $$(".v56-pal-chip").forEach(chip => {
      const name = chip.querySelector("strong")?.textContent?.trim();
      const image = chip.querySelector("img");
      const src = image?.currentSrc || image?.src || "";
      if (name && src && name !== "未確認" && !map.has(normalize(name))) map.set(normalize(name), src);
    });

    ICON_OVERRIDES.forEach((url, key) => map.set(key, url));
    state.icons = map;
  }

  function syncPalImages(root = document) {
    $$(".pal-record-card", root).forEach(card => {
      const name = card.querySelector(".pal-record-name")?.textContent?.trim();
      const image = card.querySelector("img");
      const url = name ? state.icons.get(normalize(name)) : "";
      if (!image || !url || (image.currentSrc || image.src) === url) return;
      image.removeAttribute("onerror");
      image.src = url;
      image.dataset.v58Canonical = VERSION;
    });

    $$("#detailBody .recipe-pal").forEach(card => {
      const name = $$(':scope > span', card).at(-1)?.textContent?.trim();
      const image = card.querySelector("img");
      const url = name ? state.icons.get(normalize(name)) : "";
      if (!image || !url || (image.currentSrc || image.src) === url) return;
      image.removeAttribute("onerror");
      image.src = url;
      image.dataset.v58Canonical = VERSION;
    });

    $$("img[alt=\"イシス\"]", root).forEach(image => {
      const url = ICON_OVERRIDES.get(normalize("イシス"));
      if ((image.currentSrc || image.src) === url) return;
      image.removeAttribute("onerror");
      image.src = url;
      image.dataset.v58Canonical = VERSION;
    });
  }

  function mutationEggHtml(compact = false) {
    return `<span class="v58-mutation-egg ${compact ? "is-compact" : ""}">
      <img src="${MUTATION_EGG_ICON}" alt="突然変異タマゴ" loading="lazy">
      <strong>突然変異タマゴ</strong>
    </span>`;
  }

  function recordById(id) {
    return state.records.find(record => record.id === String(id || "")) || null;
  }

  function applyMutationEggs() {
    $$("#recordRows tr[data-id]").forEach(row => {
      const record = recordById(row.dataset.id);
      const cell = row.children?.[4];
      if (!record?.mutation || !cell) return;
      if (cell.dataset.v58Mutation === record.id && cell.querySelector(".v58-mutation-egg")) return;
      cell.innerHTML = mutationEggHtml(false);
      cell.dataset.v58Mutation = record.id;
      cell.classList.add("v58-mutation-cell");
    });

    $$("[data-v56-open]").forEach(card => {
      const record = recordById(card.dataset.v56Open);
      const meta = card.querySelector(".v56-recipe-meta");
      if (!record?.mutation || !meta || meta.querySelector(".v58-mutation-egg")) return;
      const eggText = Array.from(meta.children).find(child =>
        !child.classList.contains("v56-status") && !child.classList.contains("v56-mutation")
      );
      eggText?.remove();
      meta.insertAdjacentHTML("afterbegin", mutationEggHtml(true));
    });
  }

  function cleanReviewBoard() {
    if (state.cleaning) return;
    const list = $("#v56ReviewList");
    if (!list) return;
    state.cleaning = true;
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
      const countElement = $("#v56EggCount");
      if (countElement && countElement.textContent !== String(eggCount)) countElement.textContent = String(eggCount);
      const visibleElement = $("#v56ReviewVisibleCount");
      const visible = `${$$(".v56-review-item", list).length}件`;
      if (visibleElement && visibleElement.textContent !== visible) visibleElement.textContent = visible;
    } finally {
      state.cleaning = false;
    }
  }

  function simplifyNavi() {
    const toolkit = $("#breedingToolkit");
    const relation = $("#workflowRelationCard");
    if (!toolkit || !relation) return;
    toolkit.querySelector(".reverse-card")?.remove();
    toolkit.querySelector(".progress-card")?.remove();
    $("#workflowParentCard")?.remove();
    relation.querySelector(".tool-number")?.remove();
    const title = relation.querySelector("h3");
    if (title) title.textContent = "パル単位の配合関係図";
    const description = relation.querySelector(".tool-description");
    if (description) description.textContent = "選んだパルが親・結果として関係する配合と、その先につながる配合を画像付きで確認できます。";
    toolkit.querySelector(".breeding-toolkit-grid")?.classList.add("v58-relation-only");
  }

  function enhance() {
    buildIconMap();
    simplifyNavi();
    syncPalImages();
    applyMutationEggs();
    cleanReviewBoard();
  }

  async function refresh() {
    state.records = await loadRecords();
    enhance();
  }

  function observe() {
    const rows = $("#recordRows");
    if (rows) {
      new MutationObserver(() => {
        clearTimeout(state.timer);
        state.timer = setTimeout(() => {
          buildIconMap();
          syncPalImages();
          applyMutationEggs();
        }, 140);
      }).observe(rows, { childList: true, subtree: true });
    }

    const detail = $("#detailBody");
    if (detail) {
      new MutationObserver(() => requestAnimationFrame(() => syncPalImages()))
        .observe(detail, { childList: true, subtree: true });
    }

    const review = $("#workflowReviewPage");
    if (review) {
      new MutationObserver(() => requestAnimationFrame(() => {
        cleanReviewBoard();
        applyMutationEggs();
      })).observe(review, { childList: true, subtree: true });
    }

    $("[data-v55-view=\"navi\"]")?.addEventListener("click", () => setTimeout(() => {
      simplifyNavi();
      buildIconMap();
      syncPalImages();
    }, 80));
    $("[data-v55-view=\"review\"]")?.addEventListener("click", () => setTimeout(refresh, 80));
  }

  function init() {
    if (state.initialized) return;
    state.initialized = true;
    observe();
    refresh();
  }

  function wait(attempt = 0) {
    if ($("#recordRows") && $("#workflowRelationCard") && $("#workflowReviewPage")) {
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
