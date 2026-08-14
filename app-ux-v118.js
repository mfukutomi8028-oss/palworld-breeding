(() => {
  "use strict";

  const originalPalStatsMarkup = window.palStatsMarkup;

  function numeric(value) {
    if (value === null || value === undefined || value === "") return null;
    const result = Number(value);
    return Number.isFinite(result) ? result : null;
  }

  function ranking(pal, key) {
    const value = numeric(key === "total" ? pal?.statTotal : pal?.[key]);
    if (value === null) return null;
    const values = state.pals
      .map(item => numeric(key === "total" ? item?.statTotal : item?.[key]))
      .filter(item => item !== null);
    return values.length ? { rank: 1 + values.filter(item => item > value).length, count: values.length } : null;
  }

  function rankClass(rank) {
    if (!rank) return "";
    if (rank <= 10) return " is-rank-top10-v118";
    if (rank <= 30) return " is-rank-top30-v118";
    return "";
  }

  window.palStatsMarkup = function palStatsMarkupV118(pal, variant = "card") {
    if (variant !== "detail" || typeof originalPalStatsMarkup !== "function") return originalPalStatsMarkup(pal, variant);
    const stats = [
      ["HP", "hp", palStatValue(pal, "hp")],
      ["攻撃", "attack", palStatValue(pal, "attack")],
      ["防御", "defense", palStatValue(pal, "defense")],
      ["合計", "total", palStatValue(pal, "statTotal")],
    ];
    return `<div class="pal-stats pal-stats--${variant} pal-stats-rank-v118">${stats.map(([label, key, value]) => {
      const result = ranking(pal, key);
      const text = result ? `${result.rank}位 / ${result.count}` : "順位 —";
      return `<span class="${rankClass(result?.rank)}"><small>${label}</small><strong>${value ?? "—"}</strong><em>${escapeHtml(text)}</em></span>`;
    }).join("")}</div><p class="stat-rank-note-v118">同値は同順位。現在の図鑑データ内で比較しています。</p>`;
  };

  document.addEventListener("click", event => {
    const dialog = event.target;
    if (!(dialog instanceof HTMLDialogElement) || !dialog.open) return;
    const closeButton = [...dialog.querySelectorAll("[data-close-dialog]")]
      .find(button => button.dataset.closeDialog === dialog.id);
    if (closeButton) closeButton.click();
    else dialog.close();
  });
})();
