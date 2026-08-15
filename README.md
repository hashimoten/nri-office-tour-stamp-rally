# NRIオフィス探検スタンプラリー

NRIの会社見学イベントで3〜10歳程度の子どもと保護者が使う、23グループ対応のQRコード式スタンプラリーPWAです。HTML・CSS・Vanilla JavaScript・Viteで構成し、バックエンドやアクセス解析はありません。保存するのはグループID、チェックポイントID、取得日時だけで、個人情報や写真を収集・外部送信しません。

## 家族名を変更する方法

家族名が確定したら、ルート直下の`team-names.js`だけを編集します。たとえば、`"team-a": "TEAM A"`の右側を`"team-a": "山田ファミリー"`へ変更すると、グループ選択画面とteam-aページの上部・下部へ同じ名前が表示されます。保存後にページを再読み込みしてください。開発サーバーを使わず、HTMLをブラウザーで直接開いた場合にも反映されます。

左側の`team-a`から`team-w`はスタンプ保存に使う固定IDなので変更しないでください。公開ページへ家族名を掲載する場合は、参加者の了承を得た表示名を使用してください。

## 親子が体験すること

親子はAIを使って3枚の画像を作り、ダウンロードした画像を自分のグループ画面へ埋め込みます。HTMLの文章、CSS、JavaScript、QRコード処理は変更しません。

team-aの場合、生成画像を`groups/team-a/`へ直接保存し、`groups/team-a/index.html`にある3つの`<img>`の`src`へファイル名を指定します。team-b〜team-wも同じ構成です。

### 画像を埋め込む手順

1. AIで画像を生成する。
2. `.png`、`.jpg`、`.jpeg`、`.webp`のいずれかでダウンロードする。
3. 担当グループの`index.html`と同じフォルダへ画像を保存する。
4. `index.html`の`data-image-slot="1"`〜`"3"`にある`<img>`の空の`src`へ、`./ファイル名.png`のように指定する。
5. `index.html`をブラウザーで直接開くか更新して確認する。

3つの画像枠は、探検キャラクター、探検アイテム、チームフラッグです。初期状態では「ここに画像を入れてね！」と、そのテーマに合ったAIへのお願い方の例を表示します。

### チームへの配布方法

Gitは通常、リポジトリ内の1フォルダだけを単独でcloneできません。担当チームのフォルダだけを配布する場合は、GitHubから取得したリポジトリから`groups/team-x/`をコピーするか、ZIPにして配布してください。

画像埋め込み体験では、スタッフが開発サーバーを起動する必要はありません。親子は担当フォルダの`index.html`をブラウザーで直接開きます。QR読取、スタンプ保存、プレビューモード、PWAまで動作確認するときだけ、リポジトリ全体を用意して開発サーバーを起動してください。

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

`team-e`〜`team-w`も、URL末尾のグループIDを変更して確認できます。例：`http://localhost:5173/groups/team-w/`

この開発サーバーは共通機能を含めた動作確認用です。画像を埋め込むだけなら起動不要です。

### index.htmlを直接開く場合

各グループの`index.html`には、実際のアプリと同じ初期画面と3つの空の画像枠が書かれています。チームフォルダだけを配布した場合も、ファイルをダブルクリックして直接開くと、画像の入れ方、進捗0 / 5、未取得の5枚のカードが表示されます。生成画像を同じフォルダへ保存して`src`へファイル名を指定すると、ページ更新だけで反映を確認できます。

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

グループページを通常表示すると、`nri-office-tour-active-group-v1`へteam-a〜team-wのいずれかを保存します。ルートでQRを開くと、現在のサブパスと`point`を保ったまま保存済みグループへ移動します。未選択または不正な値ならグループ選択画面を表示します。

スタンプは `nri-office-tour-stamps-v1:${groupId}` に保存するため、team-aとteam-bのデータは混ざりません。リセットも現在のグループだけが対象です。壊れた保存データは空として安全に扱います。

### チェックポイントを追加・削除する方法

チェックポイントはルート直下の`checkpoints-config.js`だけで管理します。この配列へ項目を追加したり削除したりすると、全23グループのスタンプカード、合計数、進捗率、QRコード判定へ自動的に反映されます。各グループのHTMLを編集する必要はありません。

各項目には次の4項目を設定します。

- `id`：QRコードの`?point=`へ指定する、重複しない半角英数字とハイフンの値
- `name`：画面に表示する場所の名前
- `icon`：カードに表示する絵文字
- `description`：場所の短い説明

たとえば`id`が`studio`なら、QRコードのURLは`?point=studio`です。HTMLを直接開く画像埋め込み専用表示でも、保存してページを再読み込みするだけでカードの増減が反映されます。QR読取とスタンプ保存まで確認するときは開発サーバーまたは公開URLを使ってください。公開前には`npm run check`を実行し、新しいURLでスタンプを取得できることを確認してください。

グループを間違えた場合は、各グループ画面の下部にある「グループを変更する」を選びます。保存済みグループだけを解除して選択画面へ戻るため、それまで集めた各グループのスタンプは削除されません。直接URLを使う場合は、入口へ`?change-group=1`を付けても選択画面を表示できます。

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
- team-w：`https://hashimoten.github.io/nri-office-tour-stamp-rally/groups/team-w/`

team-c〜team-vも同じURL形式です。

## PWAのインストールと更新

iPhoneではSafariで公開URLを開き、共有ボタンから「ホーム画面に追加」を選びます。AndroidではChromeの「アプリをインストール」または「ホーム画面に追加」を使います。PWA起動時は入口ページが保存済みグループへ移動します。

Service Workerは全23グループのHTML、CSS、画像と共通ファイルをキャッシュします。HTMLはネットワークを優先し、オフライン時だけキャッシュへフォールバックします。更新が見えない場合は、一度オンラインでページを再読み込みしてください。それでも残る場合は、ホーム画面のPWAを削除して再追加するか、ブラウザーのサイトデータを削除します。

React版で使用していた旧`sw.js`が端末に残っている場合は、公開中の移行用`sw.js`が旧キャッシュと登録を解除し、現行の`service-worker.js`へ自動的に切り替えます。移行後の通常画面は、各グループの`index.html`を直接開いたときと同じカードデザインを使用します。

## 24グループ目以降の追加

1. `groups/team-a/`を新しいグループ名で複製する。
2. HTMLの`data-group`と表示用グループ名を変更する。
3. `shared/group-router.js`の許可リストと入口ボタンを追加する。
4. `vite.config.js`のビルド対象へ追加する。
5. HTML構造・ルーティングテストへ追加し、`npm run check`を実行する。

追加作業は共通機能へ触れるため、イベント参加者ではなく運営・開発担当者が行ってください。

## 公開終了

イベント終了後は、チェックポイントQRを無効にするためGitHub Pagesの公開を停止してください。端末内データが必要なら、ブラウザーまたはPWAのサイトデータを削除します。
