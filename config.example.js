// Firebase Realtime Databaseを使って友人とリアルタイム共同編集する場合だけ設定します。
// 1. このファイルを config.js にコピー
// 2. Firebaseコンソールで取得したWebアプリ設定を貼り付け
// 3. GitHubへ index.html / style.css / app.js / config.js をアップロード

window.firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
