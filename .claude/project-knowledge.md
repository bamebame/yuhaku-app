# プロジェクト技術知見

## アーキテクチャパターン

### Server Actions vs API Routes
- **API Routes**: 取得系の処理（GET）
  - `/api/sas-cases` - 一覧取得
  - `/api/sas-cases/[id]` - 詳細取得
  - SWRと組み合わせてキャッシング

- **Server Actions**: 更新系の処理（POST/PUT/DELETE）
  - フォーム送信と密結合
  - Conformによるバリデーション
  - `createFormAction`は使用禁止（シリアライゼーションエラー）

### 型変換パターン
```typescript
// ReCORE API型 → 内部型
export function convertRecoreSasCaseToSasCase(recore: RecoreSasCase): SasCase {
  return {
    id: recore.id,
    code: recore.code,
    status: recore.status,
    // snake_case → camelCase変換
    createdAt: new Date(recore.created_at * 1000),
    updatedAt: new Date(recore.updated_at * 1000),
  }
}
```

## デバッグ手順

### フォームデバッグ
```bash
# フォーム全体のデバッグ
DEBUG_FORM=true npm run dev

# 特定フォームのデバッグ
DEBUG_FORM_ID=sas-case-form npm run dev
```

### API通信デバッグ
```bash
DEBUG_API=true npm run dev
```

### ReCORE APIエラー
1. JWT有効期限確認
2. スコープ権限確認
3. Rate Limit確認（5 rps）

## よくある問題と解決策

### 1. Supabase認証エラー
**症状**: ログイン後すぐにログアウトされる
**原因**: Cookie設定の問題
**解決策**: 
```typescript
// server.tsでcookies()を正しく使用
import { cookies } from "next/headers"
const cookieStore = await cookies()
```

### 2. Server Actionシリアライゼーションエラー
**症状**: "Cannot serialize function"エラー
**原因**: Server Actionの戻り値に関数が含まれている
**解決策**: 
- エラーは文字列で返す
- Dateオブジェクトは文字列に変換

### 3. 型エラー
**症状**: ReCORE APIレスポンスの型が合わない
**原因**: APIの仕様変更
**解決策**: 
1. 実際のレスポンスを確認
2. 型定義を更新
3. 変換関数を修正

### 4. SWRキャッシュ問題
**症状**: データが更新されない
**原因**: キャッシュの無効化忘れ
**解決策**: 
```typescript
import { mutate } from "swr"
// 更新後にキャッシュを無効化
await mutate("/api/sas-cases")
```

## パフォーマンス最適化

### 1. 画像最適化
- Next.js Imageコンポーネント使用
- 適切なサイズ指定
- loading="lazy"

### 2. コンポーネント分割
- Server ComponentsとClient Componentsの適切な分離
- 重い処理はServer Componentで実行

### 3. バンドルサイズ削減
- dynamic importの活用
- tree shakingの確認

## セキュリティ考慮事項

### 1. 入力検証
- すべての入力はZodでバリデーション
- SQLインジェクション対策（パラメータ化クエリ）

### 2. 認証・認可
- Supabase RLSの活用
- JWTスコープの適切な設定

### 3. エラーハンドリング
- 本番環境では詳細なエラーを隠蔽
- ログには記録するが、ユーザーには一般的なメッセージ

## テスト環境

### E2Eテスト（Playwright）
```bash
# テストアカウント
Email: test@example.com
Password: TestTest123
StaffCode: TESTCODE01
```

### ローカル開発
```bash
# Supabaseローカル環境
npm run db:local

# データベースリセット
npm run db:reset
```