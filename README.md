# パルワールド配合記録ボード v4

GitHub Pages + Firebase Realtime Database で動く、パルワールド配合記録用の共同編集ボードです。

## v4 修正内容

- 左上のアイコンを、PalDB の平凡なタマゴ画像を優先表示する形に変更
- 属性フィルターをプルダウンから画像付きボタン式に変更
- 作業適性フィルターをプルダウンから画像付きボタン式に変更
- 属性は OR 検索、作業適性は AND 検索として動作
- 「実機確認済み」を「配合確認済み」に変更
- 既存データに `実機確認済み` が残っていても表示上は `配合確認済み` に変換
- ヒーロー背景にパルワールド風のパル集合画像を配置
- ヒーロー右下のパルカードを削除し、共同編集UIとの重なりを解消
- ヒーロー説明文から「友人と」を削除
- 左メニュー下部のパル画像を小さめのカード表示にし、ぼやけや見切れを軽減
- 検索欄・テーブル・詳細欄などv3の改善は維持

## アップロード方法

GitHub リポジトリで以下を実施してください。

1. この zip を解凍
2. 中身のファイル・フォルダをすべて選択
3. GitHub の `Add file` → `Upload files` からアップロード
4. `Commit changes` を押す
5. 公開ページで `Ctrl + F5` を押して強制更新

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

外部画像は Palworld Lab / PalDB の画像URLを参照しています。外部サイト側の仕様変更や通信制限がある場合、代替表示になることがあります。
