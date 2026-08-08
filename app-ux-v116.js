(() => {
  "use strict";

  const originalSwitchViewV116 = window.switchView;

  function renderJapanesePositionPanel(type, title, value, revealed, scope, candidateId = "") {
    const selected = new Set(Array.isArray(revealed) ? revealed : []);
    const characters = hintCharacters(value);
    const sequential = characters.length <= HINT_POSITION_DEFINITIONS.length;
    const buttons = HINT_POSITION_DEFINITIONS.map((position, slot) => {
      const unavailable = hintPositionIndex(characters.length, position.key) < 0;
      const isRevealed = selected.has(position.key);
      const missing = isRevealed && unavailable;
      const attribute = scope === "reverse"
        ? `data-reverse-position="${escapeHtml(candidateId)}|${type}|${position.key}"`
        : `data-forward-position="${type}|${position.key}"`;
      const label = sequential ? `${slot + 1}文字目` : position.label;
      const valueText = isRevealed ? (missing ? "×" : hintCharacterAt(value, position.key)) : "?";
      return `<button class="hint-position${isRevealed && !missing ? " is-revealed" : ""}${missing ? " is-missing" : ""}" type="button" ${attribute} ${isRevealed ? "disabled" : ""} aria-label="日本語名の${escapeHtml(label)}を開く"><span>${escapeHtml(label)}</span><strong>${escapeHtml(valueText)}</strong></button>`;
    }).join("");
    return `<section class="hint-letter-panel"><div class="hint-letter-panel__heading"><strong>${escapeHtml(title)}</strong><span>${sequential ? "開きたい文字を選択・名前のない位置もクリックで×を確認" : "開きたい場所を選択・文字数は非表示"}</span></div><div class="hint-position-grid">${buttons}</div></section>`;
  }

  const originalPositionHintPanelV116 = window.positionHintPanel;
  window.positionHintPanel = function positionHintPanelV116(type, title, value, revealed, scope, candidateId = "") {
    if (type === "japanese") return renderJapanesePositionPanel(type, title, value, revealed, scope, candidateId);
    return originalPositionHintPanelV116(type, title, value, revealed, scope, candidateId);
  };

  function syncCompareTrayForView(view) {
    document.body.dataset.currentView = view || state.currentView || "records";
    const tray = byId("palCompareTray");
    if (!tray) return;
    if (view !== "paldex") {
      tray.hidden = true;
      return;
    }
    tray.hidden = tray.querySelectorAll("[data-compare-remove]").length === 0;
  }

  window.switchView = function switchViewV116(view) {
    const result = originalSwitchViewV116(view);
    syncCompareTrayForView(view);
    return result;
  };

  const compareObserver = new MutationObserver(() => {
    const view = state?.currentView || document.body.dataset.currentView || "records";
    document.body.dataset.currentView = view;
    const tray = byId("palCompareTray");
    if (tray && view !== "paldex" && !tray.hidden) tray.hidden = true;
  });
  compareObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });

  document.body.dataset.currentView = state?.currentView || "records";
  syncCompareTrayForView(state?.currentView || "records");
})();
