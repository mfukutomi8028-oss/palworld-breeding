# パルワールド配合記録ボード v6

GitHub Pages + Firebase Realtime Database で動く、パルワールド配合記録用の共同編集ボードです。

## v6 修正内容

- 左上・配合記録メニューのタマゴ画像を Common Egg / 平凡なタマゴ参照に修正し、ローカル代替SVGも見た目を調整
- ヒーロー背景画像を小さな中央表示ではなく、背景全体へ自然に広がる `cover` 表示へ変更
- 記録者欄を自由入力から `福冨 / 森井` のプルダウンへ変更
- 記録者は端末・ブラウザごとに前回選択を保存し、次回の新規登録時に自動選択
- パッシブ候補欄を廃止
- 確認状況が `確認中` の場合、結果パルは未入力のまま保存可能に変更
- `配合確認済み` にする場合だけ結果パルを必須化
- 作業適性フィルターを2列表示へ変更し、縦スクロール量を削減
- 配合記録一覧と配合記録詳細を同じ高さにし、一覧・詳細それぞれを独立スクロール化
- 左メニューは `配合記録` と `お気に入り` のみに整理
- `お気に入り` メニューを実際に機能させ、星を付けた記録だけを表示
- 左メニュー内の `お気に入りのみ` チェックボックスは削除
- 確認状況バッジの `...確認中` 表記を `確認中` に変更

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
