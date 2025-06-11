# Report System

Next.js + Supabase + Vercel で構築された Web アプリケーション

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase
- **デプロイ**: Vercel
- **CI/CD**: GitHub Actions

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <your-repository-url>
cd report-sys
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Supabase プロジェクトの作成

1. [Supabase](https://supabase.com)でアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトの URL と API Key を上記の環境変数に設定

### 5. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションにアクセスできます。

## Vercel へのデプロイ

### 1. Vercel アカウントの作成とプロジェクト接続

1. [Vercel](https://vercel.com)でアカウントを作成
2. GitHub リポジトリを接続
3. 環境変数を設定

### 2. GitHub Secrets の設定

リポジトリの設定 > Secrets and variables > Actions で以下のシークレットを追加：

- `VERCEL_TOKEN`: Vercel のアクセストークン
- `VERCEL_ORG_ID`: Vercel の Organization ID
- `VERCEL_PROJECT_ID`: Vercel の Project ID

## 利用可能なスクリプト

- `npm run dev`: 開発サーバーの起動
- `npm run build`: プロダクション用ビルド
- `npm run start`: プロダクションサーバーの起動
- `npm run lint`: ESLint の実行

## プロジェクト構造

```
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions ワークフロー
├── src/
│   ├── app/                   # Next.js App Router
│   └── lib/
│       └── supabase.ts        # Supabase クライアント設定
├── .env.local                 # 環境変数（ローカル開発用）
└── README.md
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
