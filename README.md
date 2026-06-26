# パルワールド配合記録ボード v5

GitHub Pages + Firebase Realtime Database で動く、パルワールド配合記録用の共同編集ボードです。

## v5 修正内容

- 登録フォームから「確認チェック」を削除
- パッシブ候補をテキスト1本ではなく、最大4つの入力＋候補選択UIへ変更
- パッシブ候補は Palworld Lab の `https://palworld-lab.com/passives/` から取得し、取得できない場合は内蔵リストで動作
- ヒーロー右上は共同編集ONのみの小さい表示へ変更
- ヒーロー背景画像の表示サイズを調整し、ロゴが大きくなりすぎないよう修正
- 確認状況は「確認中」「配合確認済み」の2つに整理
- 旧データの「実機確認済み」は配合確認済み、「育成候補」は確認中として扱う
- 属性・作業適性アイコンを黒背景の切り抜き風から、透明背景のクリーンなSVGへ差し替え
- Palworld Labから属性・作業適性アイコンURLを取得できた場合は外部画像を優先表示
- 左メニュー下部のパル3体表示を削除
- 配合記録一覧を詳細欄と同じ高さにし、一覧部分だけ独立スクロールできるよう修正

## アップロード方法

1. この zip を解凍
2. 中身のファイル・フォルダをすべて選択
3. GitHub の `Add file` → `Upload files` からアップロード
4. `Commit changes` を押す
5. 公開ページで `Ctrl + F5` を押して強制更新

## アップロード対象

- `index.html`
- `style.css`
- `app.js`
- `config.js`
- `config.example.js`
- `firebase-rules.json`
- `README.md`
- `assets/` フォルダ

## Firebase設定

`config.js` には Firebase の設定値だけを記載してください。
`import` / `initializeApp` / `getAnalytics` は書かないでください。

```js
window.firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## 注意

外部情報は Palworld Lab / PalDB の画像URLを参照しています。外部サイト側の仕様変更や通信制限がある場合、内蔵データとローカル画像で動作します。
