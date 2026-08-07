document.body.innerHTML = String.raw`
  <div id="app" class="app-shell" data-ready="false">
    <aside class="sidebar" aria-label="メインメニュー">
      <div class="brand">
        <img src="assets/brand-pal-icon.png" alt="" class="brand__image">
        <div><span class="brand__eyebrow">PAL BREEDING NOTE</span><strong>パル配合ノート</strong></div>
      </div>

      <nav class="nav" id="mainNav">
        <button class="nav__item is-active" type="button" data-view="records" aria-current="page">
          <span class="nav__icon"><img src="assets/plain-egg.png" alt=""></span><span>配合記録</span><span class="nav__count" id="navRecordCount">0</span>
        </button>
        <button class="nav__item" type="button" data-view="breeding">
          <span class="nav__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10M7 20h10M9 4c0 4 6 4 6 8s-6 4-6 8m6-16c0 4-6 4-6 8s6 4 6 8"/></svg></span><span>配合検索</span>
        </button>
        <button class="nav__item" type="button" data-view="paldex">
          <span class="nav__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Zm2 0v16m3-12h6m-6 4h6"/></svg></span><span>パル図鑑</span>
        </button>
        <button class="nav__item" type="button" data-view="review">
          <span class="nav__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 13 4 4L19 7M4 4h16v16H4z"/></svg></span><span>確認作業</span><span class="nav__count nav__count--warn" id="navReviewCount">0</span>
        </button>
        <button class="nav__item" type="button" data-view="favorites">
          <span class="nav__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/></svg></span><span>お気に入り</span>
        </button>
        <button class="nav__item" type="button" data-view="settings">
          <span class="nav__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8 4 2-1-2-3-2 .5-1.5-1L16 5h-4l-.5 2.5-1.5 1L8 8 6 11l2 1v2l-2 1 2 3 2-.5 1.5 1L12 21h4l.5-2.5 1.5-1 2 .5 2-3-2-1v-2Z"/></svg></span><span>設定</span>
        </button>
      </nav>

      <div class="sidebar__footer">
        <div class="world-card">
          <span class="world-card__label">WORLD</span>
          <strong id="sidebarWorldName">名称未設定</strong>
          <span class="connection" id="connectionState"><i></i><span>接続準備中</span></span>
        </div>
        <button class="user-switch" id="openUserMenu" type="button">
          <span class="user-avatar" id="currentUserAvatar">?</span>
          <span><small>現在のユーザー</small><strong id="currentUserName">選択中…</strong></span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4"/></svg>
        </button>
      </div>
    </aside>

    <header class="mobile-header">
      <button class="icon-button" id="openMobileNav" type="button" aria-label="メニューを開く"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
      <div class="mobile-header__brand"><img src="assets/brand-pal-icon.png" alt=""><strong>パル配合ノート</strong></div>
      <button class="mobile-avatar" id="mobileUserButton" type="button" aria-label="ユーザー設定"><span id="mobileUserAvatar">?</span></button>
    </header>

    <main class="main">
      <header class="page-header">
        <div>
          <p class="page-header__eyebrow" id="pageEyebrow">BREEDING RECORDS</p>
          <h1 id="pageTitle">配合記録</h1>
          <p id="pageDescription">このワールドで試した配合を、みんなで記録・共有します。</p>
        </div>
        <div class="page-header__actions">
          <span class="data-badge" id="dataBadge" title="配合データの状態"><i></i><span>データ読込中</span></span>
          <button class="button button--ghost" id="copyRoomLink" type="button"><svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1"/></svg>ルームを共有</button>
        </div>
      </header>

      <section class="view is-active" id="view-records" data-view-panel="records">
        <div class="stats-grid" id="recordStats"></div>
        <div class="workspace records-workspace">
          <section class="panel records-panel">
            <div class="toolbar toolbar--records">
              <button class="button button--primary" id="addRecord" type="button"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>新しい配合記録</button>
              <label class="search-field"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input id="recordSearch" type="search" placeholder="パル名・タマゴ・メモで検索" autocomplete="off"></label>
              <label class="select-field"><span>状態</span><select id="recordStatusFilter"><option value="">すべて</option><option value="pending">確認中</option><option value="verified">配合確認済み</option></select></label>
              <label class="select-field"><span>並び順</span><select id="recordSort"><option value="updatedDesc">更新が新しい順</option><option value="updatedAsc">更新が古い順</option><option value="resultAsc">結果パル順</option><option value="status">確認状態順</option></select></label>
            </div>
            <div id="recordList" class="record-list" aria-live="polite"></div>
          </section>
          <aside class="panel detail-panel" id="recordDetail" aria-label="配合記録の詳細"></aside>
        </div>
      </section>

      <section class="view" id="view-breeding" data-view-panel="breeding">
        <div class="search-mode" role="tablist" aria-label="配合検索モード">
          <button class="search-mode__tab is-active" type="button" data-breeding-mode="parents" role="tab" aria-selected="true">親2体から結果を調べる</button>
          <button class="search-mode__tab" type="button" data-breeding-mode="target" role="tab" aria-selected="false">目標パルから親を探す</button>
        </div>
        <section class="panel breeding-search-card" id="parentsSearchPanel">
          <div class="section-heading"><div><span class="section-kicker">PARENTS → CHILD</span><h2>親2体から結果パルを検索</h2><p>Palworld 1.0の配合データから、その組み合わせで生まれるパルを表示します。</p></div></div>
          <div class="breeding-builder">
            <div class="pal-select-shell" data-picker-shell="breedParentA"><label>親A</label><button class="pal-select-button" type="button" data-open-picker="breedParentA"><span class="pal-select-button__placeholder">パルを選択</span></button></div>
            <button class="swap-button" id="swapBreedingParents" type="button" aria-label="親Aと親Bを入れ替える"><svg viewBox="0 0 24 24"><path d="m7 7 3-3 3 3M10 4v13m7 0-3 3-3-3m3 3V7"/></svg></button>
            <div class="pal-select-shell" data-picker-shell="breedParentB"><label>親B</label><button class="pal-select-button" type="button" data-open-picker="breedParentB"><span class="pal-select-button__placeholder">パルを選択</span></button></div>
            <div class="equals-mark" aria-hidden="true">=</div>
            <div class="breed-result-placeholder" id="pairChildResult"><span>親を2体選択すると、結果を表示します。</span></div>
          </div>
        </section>
        <section class="panel breeding-search-card is-hidden" id="targetSearchPanel">
          <div class="section-heading"><div><span class="section-kicker">TARGET → PARENTS</span><h2>目標パルを作れる親ペアを検索</h2><p>候補が多い場合も画像付きカードで比較し、記録へそのまま追加できます。</p></div></div>
          <div class="target-search-row"><div class="pal-select-shell" data-picker-shell="breedTarget"><label>目標パル</label><button class="pal-select-button" type="button" data-open-picker="breedTarget"><span class="pal-select-button__placeholder">作りたいパルを選択</span></button></div><label class="search-field"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input id="parentPairSearch" type="search" placeholder="親パル名で候補を絞り込み"></label></div>
          <div id="targetParentResults" class="combo-grid"></div>
        </section>
        <div class="data-note" id="breedingDataNote"></div>
      </section>

      <section class="view" id="view-paldex" data-view-panel="paldex">
        <section class="panel paldex-toolbar">
          <label class="search-field search-field--large"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input id="paldexSearch" type="search" placeholder="パル名・英語名・図鑑番号で検索"></label>
          <label class="select-field"><span>属性</span><select id="paldexElement"><option value="">すべて</option></select></label>
          <label class="select-field"><span>作業適性</span><select id="paldexWork"><option value="">すべて</option></select></label>
          <label class="select-field"><span>並び順</span><select id="paldexSort"><option value="numberAsc">図鑑番号順</option><option value="nameAsc">名前順</option><option value="hpDesc">HPが高い順</option><option value="hpAsc">HPが低い順</option><option value="attackDesc">攻撃が高い順</option><option value="attackAsc">攻撃が低い順</option><option value="defenseDesc">防御が高い順</option><option value="defenseAsc">防御が低い順</option><option value="totalDesc">合計が高い順</option><option value="totalAsc">合計が低い順</option></select></label>
          <span class="result-count" id="paldexCount">0体</span>
        </section>
        <div class="paldex-layout">
          <div><div id="paldexGrid" class="paldex-grid"></div><button class="button button--ghost load-more" id="paldexLoadMore" type="button">さらに表示</button></div>
          <aside class="panel pal-detail-panel" id="palDetail"></aside>
        </div>
      </section>

      <section class="view" id="view-review" data-view-panel="review">
        <div class="review-summary" id="reviewSummary"></div>
        <section class="panel review-panel"><div class="section-heading"><div><span class="section-kicker">REVIEW WORKBOARD</span><h2>確認が必要な記録</h2><p>実際に入力や修正が必要な記録だけを抽出します。</p></div><label class="select-field"><span>表示対象</span><select id="reviewFilter"><option value="">すべて</option><option value="missing-result">結果未入力</option><option value="missing-egg">タマゴ未入力</option><option value="unknown-pal">パル名不整合</option><option value="duplicate">重複候補</option><option value="invalid">データ不正</option></select></label></div><div id="reviewList" class="review-list"></div></section>
      </section>

      <section class="view" id="view-favorites" data-view-panel="favorites">
        <section class="panel"><div class="section-heading"><div><span class="section-kicker">MY FAVORITES</span><h2 id="favoriteHeading">お気に入り</h2><p>現在のユーザーがお気に入りにした配合記録です。</p></div></div><div id="favoriteList" class="record-list"></div></section>
      </section>

      <section class="view" id="view-settings" data-view-panel="settings">
        <div class="settings-grid">
          <section class="panel settings-card"><div class="section-heading"><div><span class="section-kicker">WORLD</span><h2>ワールド設定</h2></div></div><label class="form-field"><span>ワールド名</span><input id="worldNameInput" type="text" maxlength="32" placeholder="例：桜島ワールド"></label><label class="form-field"><span>ルームID</span><div class="copy-field"><input id="roomIdDisplay" type="text" readonly><button id="copyRoomId" type="button">コピー</button></div></label><p class="form-help">同じルームURLを開いた人と、配合記録・ユーザー設定を共有します。</p><button class="button button--primary" id="saveWorldSettings" type="button">ワールド設定を保存</button></section>
          <section class="panel settings-card"><div class="section-heading"><div><span class="section-kicker">USERS</span><h2>ユーザー管理</h2><p>全ユーザーを同じ条件で追加・削除できます。最後の1人だけは削除できません。</p></div></div><form id="addUserForm" class="add-user-row"><input id="newUserName" type="text" maxlength="12" placeholder="ユーザー名" required><input id="newUserColor" type="color" value="#47c9a2" aria-label="ユーザーカラー"><button class="button button--primary" type="submit">追加</button></form><div id="userList" class="user-list"></div></section>
          <section class="panel settings-card settings-card--wide"><div class="section-heading"><div><span class="section-kicker">DATA</span><h2>データと接続状態</h2></div></div><div id="systemStatus" class="system-status"></div><div class="settings-actions"><button class="button button--ghost" id="exportRecords" type="button">記録をJSON出力</button><label class="button button--ghost file-button">JSONから復元<input id="importRecords" type="file" accept="application/json"></label><button class="button button--danger" id="clearLocalCache" type="button">データキャッシュを再取得</button></div></section>
        </div>
      </section>
    </main>
  </div>

  <div class="mobile-nav-backdrop" id="mobileNavBackdrop" hidden></div>

  <dialog class="dialog record-dialog" id="recordDialog">
    <form method="dialog" id="recordForm">
      <header class="dialog__header"><div><span class="section-kicker">BREEDING RECORD</span><h2 id="recordDialogTitle">新しい配合記録</h2></div><button class="icon-button" type="button" data-close-dialog="recordDialog" aria-label="閉じる"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header>
      <div class="dialog__body">
        <div class="record-form-grid">
          <div class="pal-select-shell" data-picker-shell="recordParentA"><label>親A <em>必須</em></label><button class="pal-select-button" type="button" data-open-picker="recordParentA"><span class="pal-select-button__placeholder">親Aを選択</span></button></div>
          <button class="swap-button swap-button--form" id="swapRecordParents" type="button" aria-label="親Aと親Bを入れ替える"><svg viewBox="0 0 24 24"><path d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3"/></svg></button>
          <div class="pal-select-shell" data-picker-shell="recordParentB"><label>親B <em>必須</em></label><button class="pal-select-button" type="button" data-open-picker="recordParentB"><span class="pal-select-button__placeholder">親Bを選択</span></button></div>
        </div>
        <div class="duplicate-notice" id="duplicateNotice" hidden></div>
        <div class="record-form-grid record-form-grid--result">
          <div class="pal-select-shell" data-picker-shell="recordResult"><label>結果パル</label><button class="pal-select-button" type="button" data-open-picker="recordResult"><span class="pal-select-button__placeholder">未確認のままでも保存可能</span></button></div>
          <div class="egg-field"><label>タマゴ</label><button class="egg-select-button" id="openEggPicker" type="button"><span id="eggSelection">タマゴを選択</span></button></div>
        </div>
        <label class="mutation-toggle"><input id="recordMutation" type="checkbox"><span class="mutation-toggle__control"></span><span><strong>突然変異タマゴ</strong><small>オンにすると通常のタマゴ入力は無効になります。</small></span></label>
        <label class="form-field"><span>メモ</span><textarea id="recordNote" rows="4" maxlength="500" placeholder="確認した条件や補足を記録"></textarea></label>
        <input type="hidden" id="recordId">
      </div>
      <footer class="dialog__footer"><button class="button button--danger button--quiet" id="deleteRecord" type="button" hidden>この記録を削除</button><span class="dialog__spacer"></span><button class="button button--ghost" type="button" data-close-dialog="recordDialog">キャンセル</button><button class="button button--primary" id="saveRecord" type="submit">保存する</button></footer>
    </form>
  </dialog>

  <dialog class="dialog picker-dialog" id="palPickerDialog">
    <div class="picker-dialog__header"><label class="search-field search-field--large"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input id="palPickerSearch" type="search" placeholder="パル名・図鑑番号で検索" autocomplete="off"></label><button class="icon-button" type="button" data-close-dialog="palPickerDialog" aria-label="閉じる"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
    <div class="picker-dialog__meta"><span id="palPickerLabel">パルを選択</span><button class="text-button" id="clearPalPicker" type="button">選択を解除</button></div>
    <div class="picker-grid" id="palPickerGrid"></div>
  </dialog>

  <dialog class="dialog picker-dialog picker-dialog--egg" id="eggPickerDialog">
    <div class="picker-dialog__header"><div><span class="section-kicker">EGG TYPE</span><h2>タマゴを選択</h2></div><button class="icon-button" type="button" data-close-dialog="eggPickerDialog" aria-label="閉じる"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
    <div class="egg-picker-grid" id="eggPickerGrid"></div>
  </dialog>

  <dialog class="dialog user-dialog" id="userDialog">
    <div class="dialog__header"><div><span class="section-kicker">PLAYER SELECT</span><h2>現在のユーザーを選択</h2></div><button class="icon-button" type="button" data-close-dialog="userDialog" aria-label="閉じる"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
    <div class="dialog__body"><div id="userSelectList" class="user-select-list"></div><button class="button button--ghost button--block" type="button" data-view-link="settings">ユーザー管理を開く</button></div>
  </dialog>

  <dialog class="dialog pal-modal" id="palModal"><div id="palModalBody"></div></dialog>
  <div class="toast-region" id="toastRegion" aria-live="polite" aria-atomic="true"></div>
  <div class="boot-screen" id="bootScreen"><img src="assets/plain-egg.png" alt=""><strong>パル配合ノートを準備しています</strong><span>記録と1.0配合データを読み込み中…</span></div>
`;
