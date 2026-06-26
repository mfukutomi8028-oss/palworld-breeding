# パルワールド配合記録ボード

友人とリアルタイムでパルワールドの配合結果・パッシブ候補・確認状況を記録するための静的Webサイトです。

## 今回の修正版で変えたこと

- サンプル記録の自動投入を完全停止
- 既存の `sample-` データは読み込み時に自動削除
- パル名は日本語表記を優先
- 英語名で保存済みの古いデータも表示時に日本語へ変換
- パル画像は Palworld Lab のパル図鑑から最新データを起動時に取得
- Palworld Lab の取得に失敗した場合でも、内蔵リストで起動
- パル選択欄を画像付きの検索候補UIへ変更
- ササゾーなど、PalDB側で画像が出ないパルもPalworld Lab画像で表示
- 「条件に合う記録がありません」が一覧に重なる問題を修正
- ヒーロー見出しが不自然に改行されにくいよう調整
- 左上の羽アイコンを卵アイコンに変更

## ファイル構成

- `index.html` サイト本体
- `style.css` デザイン
- `app.js` アプリ処理・Firebase連携・Palworld Lab図鑑同期
- `config.js` Firebase設定
- `config.example.js` Firebase設定例
- `firebase-rules.json` Realtime Databaseルール例

## GitHub Pagesへのアップロード

1. zipを解凍します。
2. GitHubのリポジトリを開きます。
3. `Add file` → `Upload files` を選びます。
4. 解凍した中のファイルをすべてアップロードします。
5. `Commit changes` を押します。
6. 公開ページを `Ctrl + F5` で強制更新します。

## Firebase設定

`config.js` には設定値だけを書いてください。
`import` や `initializeApp()` は不要です。

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

Palworld Labのパル図鑑は外部サイトのため、通信制限や仕様変更により取得できない場合があります。
その場合もサイト自体は動きますが、全パル候補や一部画像は内蔵リストの範囲になります。
