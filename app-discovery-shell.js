(() => {
  "use strict";

  const paldexNav = document.querySelector('.nav__item[data-view="paldex"]');
  if (paldexNav && !document.querySelector('.nav__item[data-view="hints"]')) {
    paldexNav.insertAdjacentHTML("beforebegin", `
      <button class="nav__item" type="button" data-view="hints">
        <span class="nav__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6m-5 3h4M8.5 14.5C7.6 13.7 7 12.5 7 11a5 5 0 0 1 10 0c0 1.5-.6 2.7-1.5 3.5-.8.8-1.2 1.4-1.3 2.5h-4.4c-.1-1.1-.5-1.7-1.3-2.5Z"/></svg></span>
        <span>配合ヒント</span>
      </button>
    `);
  }

  const paldexView = document.getElementById("view-paldex");
  if (paldexView && !document.getElementById("view-hints")) {
    paldexView.insertAdjacentHTML("beforebegin", `
      <section class="view" id="view-hints" data-view-panel="hints">
        <section class="panel hint-builder-card">
          <div class="section-heading">
            <div>
              <span class="section-kicker">PARENTS → HINTS</span>
              <h2>答えを見ずに配合結果を推理</h2>
              <p>発見済みの親パルを選び、属性・図鑑番号・英語名・日本語名を少しずつめくります。</p>
            </div>
            <button class="button button--ghost" id="hintReset" type="button">選択をリセット</button>
          </div>
          <div class="hint-parent-builder">
            <div class="pal-select-shell" data-picker-shell="hintParentA">
              <label>親A</label>
              <button class="pal-select-button" type="button" data-open-picker="hintParentA"><span class="pal-select-button__placeholder">発見済みパルを選択</span></button>
            </div>
            <button class="swap-button" id="hintSwapParents" type="button" aria-label="親Aと親Bを入れ替える"><svg viewBox="0 0 24 24"><path d="m7 7 3-3 3 3M10 4v13m7 0-3 3-3-3m3 3V7"/></svg></button>
            <div class="pal-select-shell" data-picker-shell="hintParentB">
              <label>親B</label>
              <button class="pal-select-button" type="button" data-open-picker="hintParentB"><span class="pal-select-button__placeholder">発見済みパルを選択</span></button>
            </div>
          </div>
        </section>
        <section class="panel hint-board" id="hintBoard"></section>
      </section>
    `);
  }

  const dataSettingsCard = document.querySelector(".settings-card--wide");
  if (dataSettingsCard && !document.getElementById("guideModeToggle")) {
    dataSettingsCard.insertAdjacentHTML("beforeend", `
      <button class="guide-secret-button" id="guideModeToggle" type="button" aria-label="全パル表示モードを切り替える" aria-pressed="false">
        <span class="visually-hidden">全パル表示モード</span>
      </button>
    `);
  }
})();
