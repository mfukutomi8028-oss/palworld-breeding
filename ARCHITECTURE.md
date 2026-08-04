# パル配合ノート v101 アーキテクチャ

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
- パル画像・名称・図鑑番号は単一マスターから全画面へ供給
- 突然変異タマゴは通常タマゴと排他的に扱い、最初の描画から専用画像を表示

## 品質保証

`.github/workflows/validate.yml` で以下を検証します。

- 全JavaScriptの構文
- `index.html` が参照するCSS/JSの存在
- 旧補正スクリプトへの依存がないこと
- HTML IDの重複がないこと
- CSS波括弧の整合性
- 固定PalCalcデータが299フォーム・164特殊配合・性別依存2行であること
