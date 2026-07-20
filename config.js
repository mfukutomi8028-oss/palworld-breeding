// Firebase設定と追加機能ローダー
// Firebaseの初期化は app.js 側で行います。ここでは接続設定と追加機能の読み込みだけを管理します。
// import / initializeApp / getAnalytics は記載しないでください。

window.firebaseConfig = {
  apiKey: "AIzaSyDNyaOvTa9TdiY9-8q00MD0JcRpJY4LX08",
  authDomain: "palworld-breeding-board.firebaseapp.com",
  databaseURL: "https://palworld-breeding-board-default-rtdb.firebaseio.com",
  projectId: "palworld-breeding-board",
  storageBucket: "palworld-breeding-board.firebasestorage.app",
  messagingSenderId: "657534681097",
  appId: "1:657534681097:web:b031035357baa6df2a38d8",
  measurementId: "G-3SKBN4JL7B"
};

window.palSiteVersion = "52";

(() => {
  const loadEnhancements = () => {
    if (!document.querySelector('link[data-pal-enhancements]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "enhancements.css?v=52";
      link.dataset.palEnhancements = "52";
      document.head.appendChild(link);
    }

    if (!document.querySelector('script[data-pal-enhancements]')) {
      const script = document.createElement("script");
      script.src = "enhancements.js?v=52";
      script.dataset.palEnhancements = "52";
      script.async = false;
      document.body.appendChild(script);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadEnhancements, { once: true });
  } else {
    loadEnhancements();
  }
})();
