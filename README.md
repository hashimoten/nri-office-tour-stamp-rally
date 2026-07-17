# NRIオフィス探検スタンプラリー

社員のお子さま向け会社見学イベントで使用する、QRコード式スタンプラリーPWAです。ブラウザー内の `localStorage` だけを使用し、外部APIやバックエンドへデータを送信しません。

## 公開ページ

GitHub Pages版：<https://hashimoten.github.io/nri-office-tour-stamp-rally/>

QRコードのURLは、公開ページの末尾に `?point=entrance` などを付けて使用します。

## アプリ内のQRコード読取

トップ画面の「QRコードを読み取る」ボタンからカメラを開けます。カメラの使用許可を求められた場合は許可し、枠の中にチェックポイントのQRコードを映してください。

アプリ内読取はHTTPS環境で動作し、iPhoneのSafari／ホーム画面へ追加したPWAとAndroidのChromeに対応します。機種によるブラウザー標準機能の差を避けるため、`qr-scanner`の端末内WorkerでQRコードを解析します。映像や読み取った内容を外部APIへ送信することはありません。

読み取りにくい場合は、QRコード全体と周囲の白い余白を枠内に入れ、端末を少し前後に動かしてください。画面に表示したQRコードを読む場合は、表示側の画面を明るくすると認識しやすくなります。

カメラを利用できない端末では、端末の標準カメラでQRコードを読み取る案内を表示します。従来どおり、標準カメラからQRのURLを開いてもスタンプを取得できます。

## セットアップ

```bash
npm install
npm run dev
```

開発サーバーのURLへスマートフォンまたはPCのブラウザーでアクセスします。

## QRコード用URL

初期チェックポイントは次の5つです。

- `/?point=entrance`：エントランス
- `/?point=meeting-room`：会議室
- `/?point=office`：執務エリア
- `/?point=cafeteria`：カフェテリア
- `/?point=training-room`：研修室

実際の配信先URLの末尾へ `?point=...` を付けたURLからQRコードを作成してください。チェックポイント名・説明・絵文字は `src/config/checkpoints.ts` で変更できますが、IDは変更しないでください。

## 主なコマンド

```bash
npm run dev        # 開発サーバー
npm run build      # 本番ビルド
npm run preview    # 本番ビルドの確認
npm run test       # テストを監視実行
npm run test:run   # テストを1回実行
npm run typecheck  # TypeScript型チェック
npm run lint       # lint
npm run check      # 型・lint・テスト・本番ビルドを一括確認
```

## GitLab Pagesのサブパス設定

ローカルでは `VITE_BASE_PATH=/` を使用します。GitLab Pagesへ `/project-name/` で公開する場合は、ビルド時の環境変数を次のように設定します。

```text
VITE_BASE_PATH=/project-name/
```

Viteの `base`、Manifest、Service Worker、画像パスはこのサブパスに追従します。設定例は `.env.example` にもあります。

## PWAとオフライン表示

- Web App Manifest名：`NRIオフィス探検`
- 短縮名：`NRI探検`
- Service Workerでビルド済み画面と静的ファイルをキャッシュ
- 192px / 512pxの仮アイコンをビルド前に生成
- スマートフォンのホーム画面追加と基本的なオフライン再表示に対応

仮アイコンは一般的な「ルートとチェックポイント」の図形で、NRIの正式ロゴを模倣したものではありません。

## 正式ロゴ画像

会社から正式な画像が提供された場合だけ、次の場所へ配置してください。

```text
public/brand/nri-logo.svg
```

画像がなければ `NRI COMPANY TOUR` のテキストが表示され、404になってもアプリの機能には影響しません。独自に正式ロゴを作成、模倣、加工しないでください。

## 保存データとプライバシー

`localStorage` に保存するのは次の2項目だけです。

- チェックポイントID
- ISO形式の取得日時

氏名、年齢、メールアドレス、写真などの個人情報は保存しません。保存データが壊れている場合は空の取得状態として安全に復旧します。

## 構成

```text
src/
├── components/        # 表示専用コンポーネント
├── config/
│   ├── checkpoints.ts # 地点名・アイコン・説明（IDは固定）
│   └── content.ts     # 画面内の文章
├── core/              # URL解析・保存・重複判定・完了判定
├── theme/             # 仮テーマ色・CSS・アニメーション
├── types/             # 共通の型
└── tests/             # Vitest / React Testing Library
```

デザイン変更の詳しいルールは `CLAUDE.md` を参照してください。

## 運営スタッフ向けリセット

画面下部の「スタンプをすべてリセット」を押し、確認ダイアログで承認すると、この端末のスタンプ取得状況だけを削除します。
