# デプロイ設定ガイド

## GitHub Actions CI/CD設定

### 必要なGitHub Secrets

以下のSecretsをGitHubリポジトリのSettings > Secrets and variables > Actionsで設定してください：

#### Vercel設定
- `VERCEL_TOKEN`: Vercel APIトークン
- `VERCEL_ORG_ID`: Vercel組織ID
- `VERCEL_PROJECT_ID`: VercelプロジェクトID

#### 環境変数
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseサービスロールキー
- `YOUTUBE_API_KEY`: YouTube Data APIキー
- `YOUTUBE_CHANNEL_ID`: YouTubeチャンネルID
- `OPENAI_API_KEY`: OpenAI APIキー

### Vercelトークンの取得方法

1. [Vercel Dashboard](https://vercel.com/account/tokens)にアクセス
2. "Create Token"をクリック
3. トークン名を入力（例：`github-actions`）
4. スコープを選択（Full Account）
5. トークンをコピーしてGitHub Secretsに設定

### Vercel組織IDとプロジェクトIDの取得方法

#### 組織ID
```bash
vercel teams ls
```

#### プロジェクトID
```bash
vercel project inspect report-sys
```

### 現在の設定値

- **組織ID**: `shigatosekais-projects`
- **プロジェクトID**: `prj_IsreOIvWWGJ54AhsU4yTBdf1FrNw`
- **プロジェクト名**: `report-sys`

### 環境変数の値

```
NEXT_PUBLIC_SUPABASE_URL=https://sfvndktfbrxnadxsupbd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmdm5ka3RmYnJ4bmFkeHN1cGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNTgwMjMsImV4cCI6MjA2NTYzNDAyM30.8AQ8s6J6yZa9ooDvsILuf4__LGl8dwkgnd-rsB65XPg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmdm5ka3RmYnJ4bmFkeHN1cGJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA1ODAyMywiZXhwIjoyMDY1NjM0MDIzfQ.DayaoI8R0IPTJQ0yxYWACjdxTU9toRJvbgom8Nj5GLA
YOUTUBE_API_KEY=AIzaSyDvZJzRZY2E-svI742RguYDsHFILpFcv1k
YOUTUBE_CHANNEL_ID=UCD67TzFG7rChjFR792hhlNA
OPENAI_API_KEY=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%
```

## デプロイフロー

1. **mainブランチにプッシュ** → 自動的にテスト実行
2. **テスト成功** → 自動的にVercelにデプロイ
3. **デプロイ完了** → 本番環境で利用可能

## 本番環境URL

- **メインURL**: https://report-sys-shigatosekais-projects.vercel.app
- **GitHub連携URL**: https://report-sys-git-main-shigatosekais-projects.vercel.app
- **カスタムURL**: https://report-sys-gules.vercel.app

## トラブルシューティング

### ビルドエラーが発生する場合
1. 環境変数が正しく設定されているか確認
2. Vercelトークンが有効か確認
3. プロジェクトIDが正しいか確認

### デプロイが失敗する場合
1. GitHub Actionsのログを確認
2. Vercelダッシュボードでデプロイログを確認
3. 環境変数の設定を再確認