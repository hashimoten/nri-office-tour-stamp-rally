# NRIオフィス探検スタンプラリー

NRIの会社見学イベントで使う、親子向けQRコード式スタンプラリーPWAです。HTML・CSS・Vanilla JavaScript・Viteで構成し、バックエンドやアクセス解析はありません。保存するのはグループID、チェックポイントID、取得日時だけで、個人情報や写真を収集・外部送信しません。

## 親子が編集するもの

HTMLは画面の文章と骨組み、CSSは色・形・配置、JavaScriptはQR読み取り・スタンプ保存・進捗などの動きを担当します。親子が編集するのは、自分のグループの次の2ファイルだけです。

- `groups/team-a/index.html`：タイトル、説明文、見出し、装飾など
- `groups/team-a/style.css`：背景、色、カード、ボタン、スタンプの見た目など

team-b〜team-dも同じ構成です。`shared/`、`service-worker.js`、`manifest.webmanifest`、`vite.config.js`、`tests/`は共通機能なので編集しません。詳しい制約は [CLAUDE.md](./CLAUDE.md) を参照してください。

## ローカル起動

```bash
npm install
npm run dev
```

入口は `http://localhost:5173/`、各グループは次のURLです。

- `http://localhost:5173/groups/team-a/`
- `http://localhost:5173/groups/team-b/`
- `http://localhost:5173/groups/team-c/`
- `http://localhost:5173/groups/team-d/`

スタッフが開発サーバーを起動した後は、親子はHTML/CSSを保存してブラウザーで更新するだけです。

### index.htmlを直接開く場合

各グループの`index.html`には、実際のアプリと同じ初期画面が書かれています。ファイルをダブルクリックして直接開くと、進捗は0 / 5、5枚のカードはすべて未取得、台紙はすべて空欄で表示されます。架空の取得日時や取得済みスタンプは表示しません。

ViteやGitHub Pagesからアプリを起動した場合も、同じHTMLとCSSを使用します。共通JavaScriptはカードを作り直さず、この5枚のカードへlocalStorageの実際の取得状況だけを反映します。

## プレビューモード

QRコードなしで台紙を確認できます。プレビュー中はlocalStorageを一切変更しません。

- 空：`http://localhost:5173/groups/team-a/?preview=empty`
- 2個取得：`http://localhost:5173/groups/team-a/?preview=partial`
- 全取得：`http://localhost:5173/groups/team-a/?preview=complete`

URLの`team-a`を変更すれば他グループも確認できます。`preview`を外すと、端末に実際に保存された状態へ戻ります。

## 共通QRコードとグループ復元

掲示するQRコードは全グループ共通です。

```text
https://hashimoten.github.io/nri-office-tour-stamp-rally/?point=entrance
https://hashimoten.github.io/nri-office-tour-stamp-rally/?point=meeting-room
https://hashimoten.github.io/nri-office-tour-stamp-rally/?point=office
https://hashimoten.github.io/nri-office-tour-stamp-rally/?point=cafeteria
https://hashimoten.github.io/nri-office-tour-stamp-rally/?point=training-room
```

グループページを通常表示すると、`nri-office-tour-active-group-v1`へteam-a〜team-dを保存します。ルートでQRを開くと、現在のサブパスと`point`を保ったまま保存済みグループへ移動します。未選択または不正な値ならグループ選択画面を表示します。

スタンプは `nri-office-tour-stamps-v1:${groupId}` に保存するため、team-aとteam-bのデータは混ざりません。リセットも現在のグループだけが対象です。壊れた保存データは空として安全に扱います。

## ビルド・テスト

```bash
npm run check
```

lint、Vitest、本番ビルドを順に実行します。GitHub Pages相当のサブパスは次のように確認できます。

```powershell
$env:VITE_BASE_PATH='/nri-office-tour-stamp-rally/'
npm run build
```

GitLab Pagesへ移す場合も、`VITE_BASE_PATH`をプロジェクトの公開パス（例：`/project-name/`）へ設定します。ルート配信なら`/`です。

## GitHub Pagesへのデプロイ

`main`へpushすると `.github/workflows/deploy-pages.yml` が`VITE_BASE_PATH`をリポジトリ名から設定し、check後の`dist`を公開します。

- 公開入口：`https://hashimoten.github.io/nri-office-tour-stamp-rally/`
- team-a：`https://hashimoten.github.io/nri-office-tour-stamp-rally/groups/team-a/`
- team-b：`https://hashimoten.github.io/nri-office-tour-stamp-rally/groups/team-b/`

## PWAのインストールと更新

iPhoneではSafariで公開URLを開き、共有ボタンから「ホーム画面に追加」を選びます。AndroidではChromeの「アプリをインストール」または「ホーム画面に追加」を使います。PWA起動時は入口ページが保存済みグループへ移動します。

Service Workerは全グループのHTML/CSSと共通ファイルをキャッシュします。HTMLはネットワークを優先し、オフライン時だけキャッシュへフォールバックします。更新が見えない場合は、一度オンラインでページを再読み込みしてください。それでも残る場合は、ホーム画面のPWAを削除して再追加するか、ブラウザーのサイトデータを削除します。

React版で使用していた旧`sw.js`が端末に残っている場合は、公開中の移行用`sw.js`が旧キャッシュと登録を解除し、現行の`service-worker.js`へ自動的に切り替えます。移行後の通常画面は、各グループの`index.html`を直接開いたときと同じカードデザインを使用します。

## 新しいグループの追加

1. `groups/team-a/`を新しいグループ名で複製する。
2. HTMLの`data-group`と表示用グループ名を変更する。
3. `shared/group-router.js`の許可リストと入口ボタンを追加する。
4. `vite.config.js`のビルド対象へ追加する。
5. HTML構造・ルーティングテストへ追加し、`npm run check`を実行する。

追加作業は共通機能へ触れるため、イベント参加者ではなく運営・開発担当者が行ってください。

## 公開終了

イベント終了後は、チェックポイントQRを無効にするためGitHub Pagesの公開を停止してください。端末内データが必要なら、ブラウザーまたはPWAのサイトデータを削除します。
