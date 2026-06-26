# パルワールド配合記録ボード

友人と配合結果・パッシブ候補・確認状況をリアルタイムで記録するための静的Webアプリです。
GitHub Pages + Firebase Realtime Databaseで動作します。

## 今回の修正内容

- 初期サンプルデータを自動投入しないように修正
- 以前のバージョンがFirebaseへ作成した `sample-` から始まる記録を自動削除
- 「条件に合う記録がありません」が一覧に重なる不具合を修正
- パル名を日本語表記へ変更
- 英語名で保存済みの古いデータは表示時に日本語名へ変換
- 左上の「羽」アイコンを削除し、配合記録らしい卵アイコンに変更
- PalDBのパルアイコン画像を表示するように変更
- インポート・アップロード機能なし

## ファイル構成

- `index.html`：画面本体
- `style.css`：デザイン
- `app.js`：記録・検索・編集・Firebase連携
- `config.js`：Firebase設定
- `config.example.js`：Firebase設定の見本
- `firebase-rules.json`：Realtime Databaseの簡易ルール例

## アップロード方法

GitHubのリポジトリで以下のファイルをすべてアップロードしてください。

```text
index.html
style.css
app.js
config.js
config.example.js
firebase-rules.json
README.md
```

アップロード後、GitHub Pagesの公開URLを `Ctrl + F5` で強制更新してください。

## 重要

今回の `config.js` にはFirebase設定値を入れています。
`import { initializeApp } from "firebase/app";` のようなコードは入れないでください。
このサイトでは `app.js` がブラウザ用CDNからFirebaseを読み込みます。

## Firebaseルール

動作確認中は下記で動きます。

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

この設定はURLを知っている人が読み書きできる状態です。
友人以外にURLを共有しない運用なら試しやすいですが、公開範囲を絞りたい場合は後で認証制にしてください。
