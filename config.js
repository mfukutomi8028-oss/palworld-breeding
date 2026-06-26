// Firebaseを未設定のままにすると、ブラウザ内だけのローカル保存で動作します。
// 友人とリアルタイム共同編集したい場合は、Firebaseの設定値を下に貼り付けてください。
// 設定例は config.example.js を見てください。

window.firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};