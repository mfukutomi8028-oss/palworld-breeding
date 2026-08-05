// Unified status presentation for core data, optional images, Firebase and settings.
(() => {
  "use strict";

  function renderConnectionStatesV103() {
    const connection = byId("connectionState");
    connection.className = "connection" + (state.firebaseState === "online" ? " is-online" : state.firebaseState === "error" ? " is-error" : "");
    connection.innerHTML = `<i></i><span>${state.firebaseState === "online" ? "共同編集ON" : state.firebaseState === "error" ? "接続エラー" : state.firebaseState === "local" ? "ローカル保存" : "接続中"}</span>`;

    const badge = byId("dataBadge");
    const coreReady = ["ready", "cache"].includes(state.dataState);
    const imageIssue = ["partial", "error"].includes(state.imageDataState);
    const coreError = state.dataState === "error";

    let label = "データ読込中";
    if (coreError) label = "配合データ取得失敗";
    else if (imageIssue) label = "画像データ一部取得失敗";
    else if (coreReady && (state.dataState === "cache" || state.imageDataState === "cache")) label = "保存済み1.0データ";
    else if (coreReady) label = "1.0データ準備完了";

    badge.className = "data-badge" + (coreError ? " is-error" : coreReady && !imageIssue ? " is-ready" : "");
    badge.innerHTML = `<i></i><span>${label}</span>`;
    badge.title = state.dataError || label;
  }

  function renderSystemStatusV103() {
    const target = byId("systemStatus");
    if (!target) return;

    let imageStatus = "準備中";
    if (state.imageDataState === "ready") imageStatus = `${state.iconVerifiedCount || 0}体 / ローカル画像`;
    else if (state.imageDataState === "cache") imageStatus = `${state.iconVerifiedCount || 0}体 / 保存済み画像`;
    else if (state.imageDataState === "partial") imageStatus = `一部未照合（${state.iconVerifiedCount || 0}体）`;
    else if (state.imageDataState === "error") imageStatus = "画像取得失敗・代替画像を使用";
    else if (state.imageDataState === "unavailable") imageStatus = "パルデータ取得失敗";

    const items = [
      ["共同編集", state.firebaseState === "online" ? "Firebase接続中" : state.firebaseState === "local" ? "ローカル保存" : state.firebaseState === "error" ? "接続失敗" : "接続確認中"],
      ["パルデータ", state.pals.length ? `${state.pals.length}体 / ${state.dataState}` : "取得失敗"],
      ["画像データ", imageStatus],
      ["配合マトリクス", state.matrixReady ? `${state.matrix.size.toLocaleString()}組を準備済み` : "準備中"],
      ["ルームID", state.roomId],
      ["サイト版", `v${window.palSiteVersion || VERSION}`],
      ["データ版", DATA_VERSION],
    ];

    target.innerHTML = items.map(([label, value]) => `<div class="system-status__item"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
  }

  window.renderConnectionStates = renderConnectionStatesV103;
  window.renderSystemStatus = renderSystemStatusV103;
})();
