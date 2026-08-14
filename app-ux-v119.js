(() => {
  "use strict";

  const originalSortPaldexPals = window.sortPaldexPals;
  const originalFilteredPals = window.filteredPals;
  const originalRenderPaldex = window.renderPaldex;
  const originalRenderPalDetail = window.renderPalDetail;

  state.paldexWorkStarV119 = Number.isFinite(Number(state.paldexWorkStarV119)) ? Number(state.paldexWorkStarV119) : 0;
  const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;

  function workLevels(pal) {
    const star = Math.max(0, Math.min(4, number(byId("paldexWorkStar")?.value ?? state.paldexWorkStarV119)));
    if (typeof window.PalGrowthWorkLevelsV119 === "function") return window.PalGrowthWorkLevelsV119(pal, star);
    return Array.isArray(pal?.works) ? pal.works.map((work, index) => ({ ...work, level: number(work.level), index })) : [];
  }

  function workLevel(pal, name = "") {
    const works = workLevels(pal);
    if (name) return number(works.find(item => item.name === name)?.level);
    return works.reduce((best, item) => Math.max(best, number(item.level)), 0);
  }

  window.sortPaldexPals = function sortPaldexPalsV119(pals) {
    const mode = state.paldexSort || "numberAsc";
    if (!(["workDesc", "workAsc"].includes(mode))) return originalSortPaldexPals(pals);
    const selectedWork = byId("paldexWork")?.value || "";
    const descending = mode === "workDesc";
    const fallback = (a, b) => paldexNumberCompare(a, b) || a.name.localeCompare(b.name, "ja");
    return [...pals].sort((a, b) => {
      const left = workLevel(a, selectedWork);
      const right = workLevel(b, selectedWork);
      if (!left && !right) return fallback(a, b);
      if (!left) return 1;
      if (!right) return -1;
      return (descending ? right - left : left - right) || fallback(a, b);
    });
  };

  window.filteredPals = function filteredPalsV119() {
    const minimumField = byId("paldexWorkMin");
    const savedMinimum = minimumField?.value ?? "0";
    if (minimumField) minimumField.value = "0";
    let result;
    try {
      result = originalFilteredPals();
    } finally {
      if (minimumField) minimumField.value = savedMinimum;
    }
    const minimum = number(savedMinimum);
    if (!minimum) return result;
    const selectedWork = byId("paldexWork")?.value || "";
    return result.filter(pal => workLevel(pal, selectedWork) >= minimum);
  };

  function updateMinOptions() {
    const min = byId("paldexWorkMin");
    if (!min || min.dataset.v119Options === "1") return;
    const selected = min.value || "0";
    min.innerHTML = `<option value="0">指定なし</option>${Array.from({ length: 10 }, (_, index) => index + 1).map(level => `<option value="${level}">Lv.${level}以上</option>`).join("")}`;
    min.value = [...min.options].some(option => option.value === selected) ? selected : "0";
    min.dataset.v119Options = "1";
  }

  function ensureWorkStarControl() {
    if (byId("paldexWorkStar")) return;
    const min = byId("paldexWorkMin");
    const anchor = min?.closest("label") || byId("paldexWork")?.closest("label");
    if (!anchor) return;
    anchor.insertAdjacentHTML("afterend", `<label class="field field--compact select-field paldex-work-star-v119"><span>想定★</span><select id="paldexWorkStar" aria-label="作業適性の想定凝縮ランク">${[0,1,2,3,4].map(star => `<option value="${star}"${star === state.paldexWorkStarV119 ? " selected" : ""}>★${star}</option>`).join("")}</select></label>`);
    byId("paldexWorkStar")?.addEventListener("change", event => {
      state.paldexWorkStarV119 = number(event.target.value);
      renderPaldex();
    });
  }

  function ensureToolbarActions() {
    const toolbar = document.querySelector("#view-paldex .paldex-toolbar");
    if (!toolbar) return;
    let actions = toolbar.querySelector(".paldex-toolbar-actions-v119");
    if (!actions) {
      actions = document.createElement("div");
      actions.className = "paldex-toolbar-actions-v119";
      toolbar.append(actions);
    }
    const reset = byId("paldexResetFilters");
    const count = byId("paldexCount");
    if (reset && reset.parentElement !== actions) actions.append(reset);
    if (count && count.parentElement !== actions) actions.append(count);
  }

  function updateSortLabels() {
    const sort = byId("paldexSort");
    if (!sort) return;
    const work = byId("paldexWork")?.value || "最高作業Lv";
    const star = number(byId("paldexWorkStar")?.value);
    const context = star ? `★${star}時` : "基礎値";
    const desc = sort.querySelector('[value="workDesc"]');
    const asc = sort.querySelector('[value="workAsc"]');
    if (desc) desc.textContent = `${work}（${context}）：強い順`;
    if (asc) asc.textContent = `${work}（${context}）：弱い順`;
  }

  function decorateCards() {
    const grid = byId("paldexGrid");
    if (!grid) return;
    const selected = byId("paldexWork")?.value || "";
    const star = number(byId("paldexWorkStar")?.value);
    grid.querySelectorAll(".work-rank-context-v119,.work-focus-label-v118").forEach(node => node.remove());
    grid.querySelectorAll("[data-pal-detail]").forEach(card => {
      const pal = getPal(card.dataset.palDetail);
      if (!pal) return;
      const adjusted = workLevels(pal);
      const icons = [...card.querySelectorAll(".pal-card-work-icons-v113 > span")];
      icons.forEach((icon, index) => {
        const work = adjusted[index];
        if (!work) return;
        const badge = icon.querySelector("b");
        if (badge) badge.textContent = String(work.level);
        icon.title = `${work.name} Lv.${work.level}${star ? `（★${star}）` : ""}`;
        icon.classList.toggle("is-work-focus-v118", Boolean(selected && work.name === selected));
      });
      const level = workLevel(pal, selected);
      if (selected && level) card.insertAdjacentHTML("afterbegin", `<span class="work-focus-label-v118">${escapeHtml(selected)} Lv.${level}${star ? `・★${star}` : ""}</span>`);
      if (star) card.insertAdjacentHTML("beforeend", `<span class="work-rank-context-v119">凝縮 ★${star} の作業Lv</span>`);
    });
  }

  function cleanSourceLabels(root = document) {
    root.querySelectorAll(".pal-extra-source,.progression-source-v118").forEach(node => node.remove());
    root.querySelectorAll(".pal-extra-heading .section-kicker").forEach(node => {
      if (/PalDB/i.test(node.textContent || "")) node.textContent = "PAL PROFILE";
    });
    root.querySelectorAll(".form-help,.progression-note-v118").forEach(node => {
      const text = node.textContent || "";
      if (/PalDB|参照:|出典ページ|固定データ取得日|ゲーム抽出データ|palworld-kb/i.test(text)) node.remove();
    });
  }

  function ensureControls() {
    updateMinOptions();
    ensureWorkStarControl();
    ensureToolbarActions();
    updateSortLabels();
  }

  window.renderPaldex = function renderPaldexV119() {
    ensureControls();
    originalRenderPaldex();
    ensureControls();
    cleanSourceLabels(byId("view-paldex") || document);
    requestAnimationFrame(() => requestAnimationFrame(decorateCards));
  };

  window.renderPalDetail = function renderPalDetailUxV119(root = byId("palDetail")) {
    originalRenderPalDetail(root);
    cleanSourceLabels(root);
  };

  document.addEventListener("change", event => {
    if (event.target.matches("#paldexWork,#paldexWorkMin,#paldexWorkStar,#paldexSort")) {
      if (event.target.id === "paldexWorkStar") state.paldexWorkStarV119 = number(event.target.value);
      updateSortLabels();
      requestAnimationFrame(() => requestAnimationFrame(decorateCards));
    }
  });

  document.addEventListener("click", event => {
    if (!event.target.closest("#paldexResetFilters")) return;
    state.paldexWorkStarV119 = 0;
    if (byId("paldexWorkStar")) byId("paldexWorkStar").value = "0";
    if (byId("paldexWorkMin")) byId("paldexWorkMin").value = "0";
    updateSortLabels();
  }, true);

  ensureControls();
  cleanSourceLabels();
})();
