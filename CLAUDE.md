# NRIオフィス探検スタンプラリー：親子開発ルール

## このプロジェクトの目的

- NRI社員と子どもが参加する会社見学イベントで使う、QRコード式スタンプラリーPWAです。
- 親子は自分のグループのスタンプ台紙のHTMLとCSSを変更します。
- スタンプラリーのJavaScript、QRコード処理、保存処理、PWA機能は変更しません。
- 氏名、年齢、メールアドレス、写真などの個人情報は収集しません。

## 親子が編集してよいファイル

編集対象は、自分のグループの次の2ファイルだけです。

| グループ | HTML（文章と構造） | CSS（見た目） |
|---|---|---|
| team-a | `groups/team-a/index.html` | `groups/team-a/style.css` |
| team-b | `groups/team-b/index.html` | `groups/team-b/style.css` |
| team-c | `groups/team-c/index.html` | `groups/team-c/style.css` |
| team-d | `groups/team-d/index.html` | `groups/team-d/style.css` |

自分のグループ以外のファイルは編集しないでください。

## HTMLで編集してよい内容

- アプリのタイトル、サブタイトル、説明文、見出し
- コンプリート時の文章
- 装飾用のHTML要素や画像
- 画面のまとまりを表す要素
- レイアウト用のラッパー要素

## HTMLで変更してはいけない内容

- `<body>`の`data-group`
- `data-role`、`data-action`
- 固定されたクラス名
- 共通JavaScript `../../shared/app.js` の読み込み
- 共通CSS `../../shared/base.css` の読み込み
- Manifest `../../manifest.webmanifest` の読み込み
- チェックポイントID
- JavaScriptが使用する固定属性

## CSSで編集してよい内容

- 色、背景、背景模様、文字サイズ
- 枠線、角丸、影、余白
- カード配置、ボタンの外観
- スタンプ台紙、コンプリート画面の外観
- 取得済み・未取得カードの外観

次の固定クラス名は変更せず、中のCSSだけを変更できます。

`stamp-grid`、`stamp-card`、`stamp-card--collected`、`stamp-card--uncollected`、`stamp-icon`、`stamp-name`、`stamp-date`、`complete-panel`

## 編集してはいけないファイル

- `shared/app.js`
- `shared/storage.js`
- `shared/point-parser.js`
- `shared/group-router.js`
- `shared/checkpoints.js`
- `shared/qr-scanner.js`
- `shared/pwa.js`
- `shared/base.css`
- `manifest.webmanifest`
- `service-worker.js`
- `vite.config.js`
- `tests/`以下のテストファイル
- 他グループのHTMLとCSS

## 作業ルール

- 新しい外部ライブラリを追加しない。
- JavaScript、PWA設定、QRコード処理、localStorage処理を変更しない。
- チェックポイントID、固定クラス名、固定された`data-*`属性を変更しない。
- ファイルを削除または移動しない。
- 正式なNRIロゴを生成、模倣、加工しない。
- 仮の色を正式なNRIブランドカラーだと断定しない。
- 作業後に`npm run check`を実行する。
- テストが失敗した状態で完了しない。
- 判断に迷ったら、HTMLの文章とCSSの見た目だけを変更する。

## 親子向けの変更説明

デザイン変更後は、次を初心者にも分かる短い日本語で説明してください。

- HTMLのどの部分を変更したか。
- CSSのどの部分を変更したか。
- タイトルがどのHTMLに書かれているか。
- 背景色がどのCSSで決まっているか。
- カードの形がどのCSSで決まっているか。
- HTMLは文章と骨組み、CSSは見た目、JavaScriptは動きと保存を担当すること。
- JavaScriptは変更していないこと。
