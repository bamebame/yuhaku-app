# プロジェクトコンテキスト

## プロジェクト概要
yuhakuは、店頭販売（POS）システムを構築するNext.js 15ベースのWebアプリケーションです。ReCORE APIと連携し、店頭での販売ケース管理、在庫管理、決済処理を行います。

## 技術スタック
- **フレームワーク**: Next.js 15.3.1 (App Router)
- **言語**: TypeScript 5.8.3
- **認証**: Supabase Auth
- **外部API**: ReCORE API（再利用業界向けPOSシステム）
- **スタイリング**: Tailwind CSS + Radix UI + shadcn/ui
- **フォーム管理**: React Hook Form + Conform + Zod
- **データフェッチング**: SWR
- **コード品質**: Biome (Linter/Formatter)

## 主要機能
1. **認証システム**
   - Supabaseによるユーザー認証
   - スタッフコードによる画面ロック機能
   - セッション管理

2. **店頭販売ケース管理（sas_cases）**
   - 販売ケースの作成・編集・削除
   - 商品の追加・数量変更・価格調整
   - クーポン適用
   - チェックアウト（決済処理）

3. **在庫管理**
   - リアルタイム在庫確認
   - 在庫確保モード（RESERVE/RELEASE）
   - 商品検索機能

## 制約事項
1. **API設計**
   - 取得系（READ）はAPI Routesで実装
   - 更新系（CREATE/UPDATE/DELETE）はServer Actionsで実装

2. **コーディング規約**
   - 1ファイル1関数の原則
   - `any`型の使用禁止
   - インポートは`@/`プレフィックスの絶対パス

3. **セキュリティ**
   - ReCORE APIキーは環境変数で管理
   - 入力値はZodで検証
   - エラーメッセージに機密情報を含めない

## 環境設定
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ReCORE API
RECORE_API_URL=
RECORE_API_JWT=
```

## 開発環境
- Node.js 20+
- npm/pnpm
- VS Code推奨

## デプロイ環境
- Vercel（推奨）
- Docker対応

## 参考リソース
- mono.appプロジェクト（同様の技術スタックの先行実装）
- ReCORE API仕様書（`/docs/05-external/ReCORE_API/`）