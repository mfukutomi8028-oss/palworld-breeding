(() => {
  "use strict";

  const originalRenderPaldex = window.renderPaldex;
  const originalRenderPalDetail = window.renderPalDetail;
  const originalOpenPalModal = window.openPalModal;

  function isProfileOpen() {
    return Boolean(byId("view-paldex")?.classList.contains("is-pal-profile-open"));
  }

  function compareSelection() {
    const key = `pal-breeding-note:compare:v111:${state.roomId}`;
    const value = safeJsonParse(localStorage.getItem(key), []);
    return new Set(Array.isArray(value) ? value : []);
  }

  function removeLowValueWorkFilters() {
    state.paldexWorkStarV119 = 0;
    for (const id of ["paldexWorkMin", "paldexWorkStar"]) {
      const field = byId(id);
      const label = field?.closest("label");
      (label || field)?.remove();
    }
  }

  function simplifyWorkSortLabels() {
    const sort = byId("paldexSort");
    if (!sort) return;
    const work = byId("paldexWork")?.value || "最高作業Lv";
    const desc = sort.querySelector('[value="workDesc"]');
    const asc = sort.querySelector('[value="workAsc"]');
    if (desc) desc.textContent = `${work}：強い順`;
    if (asc) asc.textContent = `${work}：弱い順`;
  }

  function cardActionsMarkup(pal, selected) {
    return `<div class="paldex-card-actions-v120" aria-label="${escapeHtml(pal.name)}の操作">
      <button class="button button--primary" type="button" data-pal-profile-open="${escapeHtml(pal.id)}">詳細を見る</button>
      <button class="button button--ghost" type="button" data-compare-pal="${escapeHtml(pal.id)}" aria-pressed="${selected}">${selected ? "比較から外す" : "比較に追加"}</button>
    </div>`;
  }

  function decoratePaldexCards() {
    const grid = byId("paldexGrid");
    if (!grid) return;
    const selected = compareSelection();
    [...grid.querySelectorAll("[data-pal-detail]")].forEach(card => {
      const pal = getPal(card.dataset.palDetail);
      if (!pal) return;
      card.title = "ダブルクリックで詳細ページを開きます";
      let shell = card.closest(".paldex-card-shell-v120");
      if (!shell) {
        shell = document.createElement("article");
        shell.className = "paldex-card-shell-v120";
        card.before(shell);
        shell.append(card);
      }
      let actions = shell.querySelector(".paldex-card-actions-v120");
      if (!actions) {
        shell.insertAdjacentHTML("beforeend", cardActionsMarkup(pal, selected.has(pal.id)));
        actions = shell.querySelector(".paldex-card-actions-v120");
      }
      const compare = actions?.querySelector("[data-compare-pal]");
      if (compare) {
        const active = selected.has(pal.id);
        compare.textContent = active ? "比較から外す" : "比較に追加";
        compare.setAttribute("aria-pressed", String(active));
      }
    });
  }

  function findDirectDetailSection(root, heading) {
    return [...root.querySelectorAll(".pal-detail-body > .detail-section")]
      .find(section => section.querySelector(":scope > h3")?.textContent?.trim() === heading) || null;
  }

  function rehomeWorkGrowth(root) {
    if (!root || root.id !== "palDetail" || !isProfileOpen()) return;
    const workSection = findDirectDetailSection(root, "作業適性");
    const workCard = [...root.querySelectorAll(".progression-card-v119")]
      .find(card => card.querySelector(".progression-card-title-v119 h4")?.textContent?.includes("作業適性の★強化"));
    if (!workSection || !workCard) return;

    const workList = workSection.querySelector(".work-list");
    if (workList && !workSection.querySelector(".work-base-label-v120")) {
      workList.insertAdjacentHTML("beforebegin", '<span class="work-base-label-v120">基礎作業適性</span>');
    }

    workCard.classList.add("work-growth-inline-v120");
    const title = workCard.querySelector(".progression-card-title-v119 h4");
    if (title) title.textContent = "凝縮後の作業Lv";
    const badge = workCard.querySelector(".progression-card-title-v119 > span");
    if (badge) badge.textContent = "★0〜★4";
    if (workCard.parentElement !== workSection) workSection.append(workCard);
  }

  function clearListPreview() {
    if (isProfileOpen()) return;
    const root = byId("palDetail");
    if (root) root.replaceChildren();
  }

  window.openPalModal = function openPalModalV120(...args) {
    if (state.currentView === "paldex" && !isProfileOpen()) return;
    return typeof originalOpenPalModal === "function" ? originalOpenPalModal(...args) : undefined;
  };

  window.renderPalDetail = function renderPalDetailV120(root = byId("palDetail")) {
    if (root?.id === "palDetail" && !isProfileOpen()) {
      root.replaceChildren();
      return;
    }
    originalRenderPalDetail(root);
    rehomeWorkGrowth(root);
  };

  window.renderPaldex = function renderPaldexV120() {
    removeLowValueWorkFilters();
    originalRenderPaldex();
    removeLowValueWorkFilters();
    simplifyWorkSortLabels();

    const root = byId("palDetail");
    if (isProfileOpen()) {
      if (root && !root.querySelector(".pal-detail-hero")) originalRenderPalDetail(root);
      rehomeWorkGrowth(root);
      return;
    }

    clearListPreview();
    decoratePaldexCards();
  };

  document.addEventListener("click", event => {
    if (!event.target.closest("[data-compare-pal]")) return;
    requestAnimationFrame(() => requestAnimationFrame(decoratePaldexCards));
  });

  document.addEventListener("click", event => {
    if (!event.target.closest("#paldexResetFilters")) return;
    state.paldexWorkStarV119 = 0;
    requestAnimationFrame(() => {
      removeLowValueWorkFilters();
      simplifyWorkSortLabels();
    });
  }, true);

  removeLowValueWorkFilters();
})();
