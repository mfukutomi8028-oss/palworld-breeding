(() => {
  "use strict";

  const originalSortPaldexPals = window.sortPaldexPals;
  const originalFilteredPals = window.filteredPals;
  const originalRenderPaldex = window.renderPaldex;

  function number(value) {
    const result = Number(value);
    return Number.isFinite(result) ? result : 0;
  }

  function workLevel(pal, name = "") {
    const works = Array.isArray(pal?.works) ? pal.works : [];
    if (name) return number(works.find(item => item.name === name)?.level);
    return works.reduce((best, item) => Math.max(best, number(item.level)), 0);
  }

  window.sortPaldexPals = function sortPaldexPalsV118(pals) {
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

  window.filteredPals = function filteredPalsV118() {
    const result = originalFilteredPals();
    const minimum = number(byId("paldexWorkMin")?.value);
    if (!minimum) return result;
    const selectedWork = byId("paldexWork")?.value || "";
    return result.filter(pal => workLevel(pal, selectedWork) >= minimum);
  };

  function updateSortLabels() {
    const sort = byId("paldexSort");
    if (!sort) return;
    const subject = byId("paldexWork")?.value || "最高作業Lv";
    const desc = sort.querySelector('[value="workDesc"]');
    const asc = sort.querySelector('[value="workAsc"]');
    if (desc) desc.textContent = `${subject}：強い順`;
    if (asc) asc.textContent = `${subject}：弱い順`;
  }

  function highlight() {
    const grid = byId("paldexGrid");
    if (!grid) return;
    const selected = byId("paldexWork")?.value || "";
    grid.querySelectorAll(".pal-card-work-icons-v113 > span").forEach(item => item.classList.remove("is-work-focus-v118"));
    grid.querySelectorAll(".work-focus-label-v118").forEach(item => item.remove());
    if (!selected) return;
    grid.querySelectorAll("[data-pal-detail]").forEach(card => {
      const pal = getPal(card.dataset.palDetail);
      const level = workLevel(pal, selected);
      const icon = [...card.querySelectorAll(".pal-card-work-icons-v113 > span")]
        .find(item => String(item.title || "").startsWith(`${selected} Lv.`));
      icon?.classList.add("is-work-focus-v118");
      if (level) card.insertAdjacentHTML("afterbegin", `<span class="work-focus-label-v118">${escapeHtml(selected)} Lv.${level}</span>`);
    });
  }

  function ensureControls() {
    const sort = byId("paldexSort");
    if (sort && !sort.querySelector('[value="workDesc"]')) {
      sort.insertAdjacentHTML("beforeend", '<option value="workDesc">最高作業Lv：強い順</option><option value="workAsc">最高作業Lv：弱い順</option>');
    }
    if (!byId("paldexWorkMin")) {
      const field = byId("paldexWork")?.closest(".select-field");
      field?.insertAdjacentHTML("afterend", '<label class="select-field paldex-work-min-v118"><span>最低Lv</span><select id="paldexWorkMin"><option value="0">指定なし</option><option value="2">Lv.2以上</option><option value="4">Lv.4以上</option><option value="6">Lv.6以上</option><option value="8">Lv.8以上</option></select></label>');
      byId("paldexWorkMin")?.addEventListener("change", renderPaldex);
    }
    const work = byId("paldexWork");
    if (work && work.dataset.v118Bound !== "1") {
      work.dataset.v118Bound = "1";
      work.addEventListener("change", () => { updateSortLabels(); requestAnimationFrame(highlight); });
    }
    updateSortLabels();
  }

  window.renderPaldex = function renderPaldexV118() {
    ensureControls();
    originalRenderPaldex();
    ensureControls();
    requestAnimationFrame(highlight);
  };

  document.addEventListener("click", event => {
    if (!event.target.closest("#paldexResetFilters")) return;
    if (byId("paldexWorkMin")) byId("paldexWorkMin").value = "0";
    updateSortLabels();
  }, true);

  ensureControls();
})();
