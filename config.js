// Firebaseを未設定のままにすると、ブラウザ内だけのローカル保存で動作します。
// 友人とリアルタイム共同編集したい場合は、Firebaseの設定値を下に貼り付けてください。
// 設定例は config.example.js を見てください。

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);