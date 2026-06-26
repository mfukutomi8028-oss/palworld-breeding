# パルワールド配合記録ボード

友人と配合結果・パッシブ候補・確認状況を記録するための静的Webアプリです。

## ファイル構成

- `index.html`：画面本体
- `style.css`：デザイン
- `app.js`：記録・検索・編集・Firebase連携
- `config.example.js`：Firebase設定の見本
- `firebase-rules.json`：Realtime Databaseの簡易ルール例

## 動作モード

### 1. Firebase未設定

ブラウザのlocalStorageに保存されます。自分のPCでは使えますが、友人とは共有されません。

### 2. Firebase設定済み

Firebase Realtime Databaseに保存され、同じURLの `#room=xxxx` を開いた友人とリアルタイムで共同編集できます。

## Firebase設定

1. Firebaseでプロジェクトを作成
2. Realtime Databaseを作成
3. Webアプリを追加してFirebase設定を取得
4. `config.example.js` を `config.js` にコピー
5. `config.js` に設定値を貼り付け
6. GitHubへアップロード

## 注意

`firebase-rules.json` のルールは簡易公開用です。友人だけで使う小規模用途なら試しやすいですが、URLを知っている人が読み書きできる状態です。必要なら認証付きルールへ変更してください。
