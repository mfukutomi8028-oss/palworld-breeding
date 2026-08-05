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
        <div class="hint-mode-header">
          <div class="search-mode hint-mode-tabs" role="tablist" aria-label="配合ヒントの検索方法">
            <button class="search-mode__tab is-active" type="button" data-hint-mode="forward" role="tab" aria-selected="true">親2体から結果を推理</button>
            <button class="search-mode__tab" type="button" data-hint-mode="reverse" role="tab" aria-selected="false">目標パルから片親を探す</button>
          </div>
          <button class="button button--ghost" id="hintReset" type="button">選択をリセット</button>
        </div>

        <section class="panel hint-builder-card" id="hintForwardPanel">
          <div class="section-heading">
            <div>
              <span class="section-kicker">PARENTS → CHILD HINTS</span>
              <h2>親2体から結果パルを推理</h2>
              <p>発見済みの親パルを2体選び、結果パルの手がかりを少しずつめくります。</p>
            </div>
          </div>
          <div class="hint-parent-builder">
            <div class="pal-select-shell" data-picker-shell="hintParentA">
              <label>親A <em>必須</em></label>
              <button class="pal-select-button" type="button" data-open-picker="hintParentA"><span class="pal-select-button__placeholder">発見済みパルを選択</span></button>
            </div>
            <button class="swap-button" id="hintSwapParents" type="button" aria-label="親Aと親Bを入れ替える"><svg viewBox="0 0 24 24"><path d="m7 7 3-3 3 3M10 4v13m7 0-3 3-3-3m3 3V7"/></svg></button>
            <div class="pal-select-shell" data-picker-shell="hintParentB">
              <label>親B <em>必須</em></label>
              <button class="pal-select-button" type="button" data-open-picker="hintParentB"><span class="pal-select-button__placeholder">発見済みパルを選択</span></button>
            </div>
          </div>
        </section>

        <section class="panel hint-builder-card is-hidden" id="hintReversePanel">
          <div class="section-heading">
            <div>
              <span class="section-kicker">TARGET + ONE PARENT → OTHER PARENT</span>
              <h2>目標パルと片親から、もう片方を推理</h2>
              <p>目標パルと分かっている片親を必ず選択してください。成立するもう片方の親候補を、候補ごとにヒント表示します。</p>
            </div>
          </div>
          <div class="hint-reverse-builder">
            <div class="pal-select-shell" data-picker-shell="hintReverseTarget">
              <label>目標パル <em>必須</em></label>
              <button class="pal-select-button" type="button" data-open-picker="hintReverseTarget"><span class="pal-select-button__placeholder">作りたいパルを選択</span></button>
            </div>
            <span class="hint-reverse-operator" aria-hidden="true">＋</span>
            <div class="pal-select-shell" data-picker-shell="hintReverseParentA">
              <label>分かっている片親 <em>必須</em></label>
              <button class="pal-select-button" type="button" data-open-picker="hintReverseParentA"><span class="pal-select-button__placeholder">片親を選択</span></button>
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
