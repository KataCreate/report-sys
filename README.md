# YouTube Analytics Dashboard

YouTubeチャンネルの月次レポートを自動生成するWebアプリケーションです。Next.js、Supabase、YouTube Data API v3を使用して構築されています。

## 主な機能

### 📊 分析機能
- **月次レポート生成**: YouTube Data API v3を使用した自動データ収集
- **複数チャンネル対応**: 複数のYouTubeチャンネルを管理・分析
- **リアルタイム統計**: 再生回数、登録者数、平均視聴時間などの詳細分析
- **チャート表示**: 時系列でのパフォーマンス推移を可視化

### 🤖 AI要約機能
- **OpenAI API連携**: GPT-4を使用した自動レポート要約
- **洞察生成**: データから重要な発見を自動抽出
- **推奨事項提案**: 改善のための具体的な提案を自動生成

### 📄 PDF出力機能
- **美しいレポート**: プロフェッショナルなPDFレポート生成
- **カスタマイズ可能**: チャンネル名、日付、統計データを含む
- **AI要約付き**: 生成された要約・洞察・推奨事項も含む

### 🔧 管理機能
- **チャンネル管理**: 複数チャンネルの追加・編集・削除
- **レポート管理**: 生成されたレポートの一覧・削除
- **ユーザー認証**: Supabase認証によるセキュアなアクセス

## 技術スタック

- **フロントエンド**: Next.js 15, React, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **外部API**: YouTube Data API v3, OpenAI API
- **PDF生成**: jsPDF, html2canvas
- **チャート**: Chart.js, react-chartjs-2

## セットアップ

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd report-sys
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# YouTube API Configuration
YOUTUBE_API_KEY=your_youtube_api_key

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key
```

### 4. Supabaseプロジェクトの設定

#### 4.1 Supabaseプロジェクトの作成
1. [Supabase](https://supabase.com)でアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトのURLとAPIキーを取得

#### 4.2 データベーススキーマの適用
SupabaseのSQLエディタで`supabase/schema.sql`の内容を実行してください。

#### 4.3 管理者ユーザーの作成
Supabaseのダッシュボードで管理者ユーザーを手動で追加するか、アプリケーション内で初回ログイン時に作成してください。

### 5. YouTube Data API v3の設定
1. [Google Cloud Console](https://console.cloud.google.com)でプロジェクトを作成
2. YouTube Data API v3を有効化
3. APIキーを作成し、環境変数に設定

### 6. OpenAI APIの設定
1. [OpenAI](https://platform.openai.com)でアカウントを作成
2. APIキーを取得し、環境変数に設定

### 7. 開発サーバーの起動
```bash
npm run dev
```

## 使用方法

### 1. ログイン
- アプリケーションにアクセスしてログイン
- 初回ログイン時は管理者アカウントが自動作成されます

### 2. チャンネル管理
- 「チャンネル管理」ページでYouTubeチャンネルを追加
- チャンネルIDを入力すると自動的にチャンネル情報が取得されます
- 複数のチャンネルを管理できます

### 3. レポート生成
- ダッシュボードでチャンネル、年、月を選択
- 「レポート生成」ボタンで月次レポートを作成
- AI要約が自動生成されます

### 4. レポート確認
- 生成されたレポートはダッシュボードで確認
- チャートでパフォーマンス推移を視覚化
- PDF出力でレポートをダウンロード

### 5. レポート管理
- 「レポート一覧」ページで過去のレポートを管理
- チャンネル別にフィルタリング可能
- 不要なレポートは削除可能

## デプロイ

### Vercelへのデプロイ
1. GitHubリポジトリをVercelに接続
2. 環境変数をVercelのダッシュボードで設定
3. デプロイを実行

### 環境変数の設定
本番環境でも以下の環境変数を設定してください：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `YOUTUBE_API_KEY`
- `OPENAI_API_KEY`

## ファイル構造

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── channels/          # チャンネル管理ページ
│   ├── dashboard/         # ダッシュボード
│   ├── login/             # ログインページ
│   ├── reports/           # レポート一覧
│   └── layout.tsx         # ルートレイアウト
├── components/            # Reactコンポーネント
│   ├── charts/           # チャートコンポーネント
│   └── PDFReport.tsx     # PDF出力コンポーネント
├── contexts/             # React Context
├── lib/                  # ユーティリティライブラリ
│   ├── database.ts       # データベースサービス
│   ├── openai-api.ts     # OpenAI APIサービス
│   ├── supabase.ts       # Supabaseクライアント
│   └── youtube-api.ts    # YouTube APIサービス
└── types/                # TypeScript型定義
```

## 注意事項

- YouTube Data API v3にはクォータ制限があります
- OpenAI APIの使用には料金が発生します
- 大量のレポート生成時はAPI制限に注意してください

## ライセンス

MIT License

## サポート

問題や質問がある場合は、GitHubのIssuesページでお知らせください。
