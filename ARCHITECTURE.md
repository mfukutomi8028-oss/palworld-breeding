# パル配合ノート v102 アーキテクチャ

## 目的

ルーム内で実際に確認した配合記録を主機能とし、Palworld 1.0の配合検索・パル図鑑を同じUIとデータマスターで提供する静的Webアプリです。

## 公開構成

- GitHub Pages
- HTML / CSS / Vanilla JavaScript
- Firebase Realtime Database
- URLハッシュ `#room=...` によるルーム分離

## 主要ファイル

- `index.html` — 最小エントリーポイント
- `ui-shell.js` — 画面構造
- `app-core.js` — データ取得、Firebase、正規化、配合エンジン
- `app-records.js` — 配合記録一覧・詳細
- `pal-images.js` — 1.0画像マニフェスト照合、画像URL生成、即時代替表示
- `app-explore.js` — 配合検索・パル図鑑
- `app-review.js` — 確認作業・設定
- `app-actions.js` — UI操作、登録、初期化
- `style-foundation.css` — デザイントークンと基本レイアウト
- `style-components.css` — 各画面コンポーネント
- `style-responsive.css` — ダイアログとレスポンシブ対応

## Firebase互換性

既存データを維持するため、以下のパスを継続使用します。

- `rooms/{roomId}/records/{recordId}`
- `rooms/{roomId}/meta`

旧レコードの `isMutation` / `mutated`、旧お気に入り形式も読込時に正規化します。

## 配合データ

- パルの図鑑・属性・作業適性はPalDB 1.0スナップショットから取得
- 日本語名は固定コミットのローカライズデータと明示的な名称補正を使用
- 配合結果はPalCalc固定コミットの299フォーム・164特殊配合エンジンを使用
- 通常配合はCombiRank、特殊配合は固定テーブルを優先
- 性別依存のCatMage × FoxMageだけは、性別機能を保留しているため注意表示
- 外部データはブラウザキャッシュへ保存し、取得失敗時は保存済みデータを利用
- 突然変異タマゴは通常タマゴと排他的に扱い、最初の描画から専用画像を表示

## パル画像

- 図鑑番号から旧Paldex画像番号を推測する方式は使用しない
- PalDB 1.0の実パル299件と、同じ固定コミットの画像マニフェスト300行を照合
- マニフェストのみの1行は外見差分の `Gumoss (Special)` で、通常Gumoss画像を意図的に再利用
- 図鑑番号が文字列 `NULL` の未採番パルには一意な内部IDを割り当て、英語名で画像を照合
- マニフェストの `displayIconFile` から、該当パル専用のゲームUI画像URLを生成
- GitHub固定コミットを主画像、専用CDNを第2候補として使用
- どちらも取得できない場合だけ、ローカルの `assets/unknown-pal-v8.svg` を表示
- 画像エラー処理は初期HTMLに設定し、404後に壊れたalt文字が残らないようにする
- 一覧、詳細、登録、配合検索、図鑑、確認作業で同じ `palImageAttrs` を使用

## 品質保証

`.github/workflows/validate.yml` で以下を検証します。

- 全JavaScriptの構文
- `index.html` が参照するCSS/JSの存在
- 旧補正スクリプトへの依存がないこと
- HTML IDの重複がないこと
- CSS波括弧の整合性
- 固定PalCalcデータが299フォーム・164特殊配合・性別依存2行であること
- PalDB 1.0の299件が画像マニフェストの別々の299行へ番号または英語名で一致すること
- 余剰1行が `Gumoss (Special)` だけであること
- マッピングされた全画像ファイルが固定ソースツリーに存在すること
- 報告画像に写っていたNo.007、041、058、085、097、108、129、132、135、137、186を個別再検査すること
