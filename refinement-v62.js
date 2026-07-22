(() => {
  "use strict";

  const VERSION = "62";
  const MUTATION_EGG_ICON = "assets/mutation-egg-v59.svg?v=59";
  let pendingSelection = null;
  let replacing = false;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function mutationEggHtml() {
    return `<span class="v58-mutation-egg v60-mutation-egg v62-mutation-egg">
      <img src="${MUTATION_EGG_ICON}" alt="突然変異タマゴ" loading="eager">
      <strong>突然変異タマゴ</strong>
    </span>`;
  }

  function rowIsMutation(row) {
    if (!row) return false;
    const eggCell = row.children?.[4];
    if (!eggCell) return false;
    return Boolean(
      eggCell.querySelector(".v58-mutation-egg, img[alt='突然変異タマゴ']") ||
      eggCell.textContent.includes("突然変異")
    );
  }

  function selectedRow() {
    return $("#recordRows tr.selected");
  }

  function selectedIsMutation() {
    if (pendingSelection?.id) return pendingSelection.mutation;
    return rowIsMutation(selectedRow());
  }

  function findEggSection(detail) {
    return $$(":scope > .detail-section", detail).find(section =>
      section.querySelector(":scope > h3")?.textContent.trim() === "タマゴの種類"
    ) || null;
  }

  function replaceDetailEgg() {
    if (replacing) return;
    const detail = $("#detailBody");
    if (!detail) return;

    if (!selectedIsMutation()) {
      detail.classList.remove("v60-detail-preparing");
      return;
    }

    const eggSection = findEggSection(detail);
    if (!eggSection) return;

    const alreadyCorrect = eggSection.querySelector(".v62-mutation-egg") &&
      !eggSection.textContent.includes("未設定");

    if (!alreadyCorrect) {
      replacing = true;
      eggSection.dataset.v62Mutation = pendingSelection?.id || selectedRow()?.dataset.id || "selected";
      eggSection.innerHTML = `<h3>タマゴの種類</h3>${mutationEggHtml()}`;
      replacing = false;
    }

    detail.classList.remove("v60-detail-preparing");
  }

  function prepareMutationSelection(row) {
    if (!row) return;
    pendingSelection = {
      id: String(row.dataset.id || ""),
      mutation: rowIsMutation(row),
    };

    const detail = $("#detailBody");
    if (detail && pendingSelection.mutation) {
      detail.classList.add("v60-detail-preparing");
    }
  }

  function syncCurrentSelection() {
    const row = selectedRow();
    if (row) prepareMutationSelection(row);
    replaceDetailEgg();
  }

  function bindEvents() {
    const rows = $("#recordRows");
    if (rows) {
      rows.addEventListener("click", event => {
        const row = event.target.closest("tr[data-id]");
        if (row) prepareMutationSelection(row);
      }, true);

      rows.addEventListener("click", event => {
        const row = event.target.closest("tr[data-id]");
        if (!row) return;
        // 元の行クリック処理が詳細HTMLを描画し終えた後、同じイベント内で即時置換します。
        replaceDetailEgg();
      });
    }

    const detail = $("#detailBody");
    if (detail) {
      new MutationObserver(() => {
        if (replacing) return;
        queueMicrotask(replaceDetailEgg);
      }).observe(detail, { childList: true, subtree: true });
    }

    new MutationObserver(() => {
      const row = selectedRow();
      if (!row) return;
      pendingSelection = {
        id: String(row.dataset.id || ""),
        mutation: rowIsMutation(row),
      };
      queueMicrotask(replaceDetailEgg);
    }).observe($("#recordRows") || document.body, { childList: true, subtree: true });
  }

  function wait(attempt = 0) {
    if ($("#recordRows") && $("#detailBody")) {
      bindEvents();
      syncCurrentSelection();
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
