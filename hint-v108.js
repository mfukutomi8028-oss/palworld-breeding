(() => {
  "use strict";

  const originalRenderForwardHints = renderForwardHints;

  hintPositionIndex = function hintPositionIndexV108(length, key) {
    const slot = HINT_POSITION_DEFINITIONS.findIndex(position => position.key === key);
    if (slot < 0) return -1;

    if (length <= HINT_POSITION_DEFINITIONS.length) {
      return slot < length ? slot : -1;
    }

    const last = length - 1;
    if (key === "first") return 0;
    if (key === "front2") return 1;
    if (key === "front3") return 2;
    if (key === "middle") return Math.floor(last / 2);
    if (key === "back3") return last - 2;
    if (key === "back2") return last - 1;
    return last;
  };

  hintCharacterAt = function hintCharacterAtV108(value, key) {
    const characters = hintCharacters(value);
    const index = hintPositionIndex(characters.length, key);
    return index >= 0 && index < characters.length ? characters[index] : "×";
  };

  positionHintPanel = function positionHintPanelV108(type, title, value, revealed, scope, candidateId = "") {
    const selected = new Set(Array.isArray(revealed) ? revealed : []);
    const characters = hintCharacters(value);
    const sequential = characters.length <= HINT_POSITION_DEFINITIONS.length;

    const buttons = HINT_POSITION_DEFINITIONS.map((position, slot) => {
      const unavailable = hintPositionIndex(characters.length, position.key) < 0;
      const isRevealed = selected.has(position.key);
      const visible = isRevealed || unavailable;
      const attribute = scope === "reverse"
        ? `data-reverse-position="${escapeHtml(candidateId)}|${type}|${position.key}"`
        : `data-forward-position="${type}|${position.key}"`;
      const label = sequential ? `${slot + 1}文字目` : position.label;
      const character = unavailable ? "×" : hintCharacterAt(value, position.key);

      return `<button class="hint-position${isRevealed ? " is-revealed" : ""}${unavailable ? " is-unavailable" : ""}" type="button" ${attribute} ${visible ? "disabled" : ""}><span>${label}</span><strong>${visible ? escapeHtml(character) : "?"}</strong></button>`;
    }).join("");

    const guidance = sequential
      ? "開きたい文字を選択・名前のない位置は×"
      : "開きたい場所を選択・文字数は非表示";

    return `<section class="hint-letter-panel"><div class="hint-letter-panel__heading"><strong>${title}</strong><span>${guidance}</span></div><div class="hint-position-grid">${buttons}</div></section>`;
  };

  renderForwardHints = function renderForwardHintsV108(board) {
    originalRenderForwardHints(board);
    const note = board.querySelector(".hint-final > p");
    if (note) {
      note.textContent = "7文字以下の名前は先頭から順に表示し、存在しない位置は×になります。8文字以上は先頭・中央・末尾付近から表示します。";
    }
  };
})();
