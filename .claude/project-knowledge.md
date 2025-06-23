# プロジェクト技術知見

## sas-case編集ページの実装

### 実装済み機能
1. **保存機能**
   - Server ActionとZustandストアの連携
   - goods配列の差分計算（CREATE/UPDATE/DELETE）
   - parseWithZodのネスト配列問題を手動パースで解決

2. **価格調整機能**
   - 単品価格調整（unitAdjustment）
   - ケース全体価格調整（caseAdjustment）
   - インライン編集UI

3. **在庫選択機能**
   - 複数在庫ロケーションからの選択ダイアログ
   - ItemStock型との統合

4. **顧客情報管理**
   - 会員ID入力
   - スタッフメモ・お客様メモ
   - タブUIでのカート・顧客情報切り替え

### Zustand Storeの構成
```typescript
// edit-store.ts
export interface CartItem {
  id: string; // 一時ID
  productId: string;
  product: Product;
  itemId: string; // ReCORE APIのitemId
  quantity: number;
  unitPrice: number;
  locationId: number;
  unitAdjustment: number;
  action?: "CREATE" | "UPDATE" | "DELETE";
  originalGoodsId?: string; // 既存goods更新時のID
}

// 顧客情報もストアで管理
memberId: string | null;
note: string | null;
customerNote: string | null;
```

### Server ActionのFormData問題と解決策
```typescript
// update-form.ts
// parseWithZodがネスト配列を正しくパースできないため、手動で抽出
const data: any = {
  goods: []
};

for (const [key, value] of formData.entries()) {
  const goodsMatch = key.match(/^goods\[(\d+)\]\[(\w+)\]$/);
  if (goodsMatch) {
    const index = parseInt(goodsMatch[1]);
    const field = goodsMatch[2];
    if (!data.goods[index]) {
      data.goods[index] = {};
    }
    // 型に応じて値を変換
    if (field === 'quantity' || field === 'unitPrice' || field === 'unitAdjustment') {
      data.goods[index][field] = parseInt(value as string);
    } else {
      data.goods[index][field] = value;
    }
  }
}
```

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

### 5. ReCORE API 422エラー
**症状**: "Invalid or malformed JSON was provided"
**原因**: GETリクエストでContent-Typeヘッダーを送信
**解決策**: 
- GETリクエストではContent-Typeヘッダーを送信しない
- POST/PUT/PATCHリクエストの場合のみContent-Typeを追加
```typescript
// baseClient.ts
if (config.method === "POST" || config.method === "PUT" || config.method === "PATCH") {
  headers["Content-Type"] = "application/json";
}
```

### 6. ReCORE API 403エラー
**症状**: "アクセスが拒否されました"
**原因**: 認証ヘッダーの誤り
**解決策**: 
- X-Identificationヘッダーを使用
- Bearerプレフィックスは不要
```typescript
const headers: Record<string, string> = {
  "X-Identification": JWT_KEY,
  ...
};
```

### 7. 無限ループエラー
**症状**: useEffectが無限に実行される
**原因**: 依存配列の不適切な設定
**解決策**: 
- useRefで前回値を追跡
- ストアの値を直接参照
- 不要な依存を削除
```typescript
const prevCategoriesRef = useRef<string>("");
// 前回値と比較して変更時のみ更新
if (categoriesJson !== prevCategoriesRef.current) {
  prevCategoriesRef.current = categoriesJson;
  setCategories(categoriesResponse.data);
}
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
Email: test@novasto.co.jp
Password: testtest
StaffCode: TESTCODE01
```

### ローカル開発
```bash
# Supabaseローカル環境
npm run db:local

# データベースリセット
npm run db:reset
```

## 2025-01-31 POSデザインシステム実装

### YUHAKU POS デザインシステム
- **基本概念**: モノクローム・黒枠・シャープなデザイン
- **実装内容**:
  1. カスタムTailwindテーマ（pos-*カラー、borderWidth: 3px）
  2. POSコンポーネントライブラリ作成
     - PosButton, PosCard, PosInput, PosDialog, PosTabs, PosBadge
     - PosLayout, PosHeader, PosTwoColumnLayout, PosMain
  3. 既存コンポーネントのPOS対応
     - sas-case編集ページの全面改修
     - shadcn/uiからPOSコンポーネントへの移行

### 技術的決定事項
- **カラーパレット**: HSL値を使用（0 0% 0%形式）
- **境界線**: 3px幅の黒枠をデフォルト
- **角丸**: rounded-pos（0px）でシャープな外観
- **フォントサイズ**: pos-xs〜pos-xlの専用サイズ
- **レイアウト**: 2カラム構成（商品選択｜カート・顧客情報）

## 2025-01-30 実装改善

### ReCORE API接続の改善
- **問題**: 環境変数設定後もAPI接続エラーが発生
- **解決策**:
  1. baseClient.tsにデバッグログ機能追加
  2. JSONパースエラーの詳細ハンドリング
  3. JWT設定の検証処理追加

### 認証フローの修正
- **問題**: ルーティングの不整合（/auth/signin vs /auth/login）
- **解決策**:
  1. すべてのリダイレクトを/auth/loginに統一
  2. /auth/unlock/page.tsxを新規作成
  3. middleware.tsでpublicRoutesを定義

### UIコンポーネントの改善
- **実装内容**:
  1. shadcn/uiコンポーネントへの統一
  2. 最小限のクラス指定でシンプルな実装
  3. 再利用可能なコンポーネント作成

### 新規作成コンポーネント
- `components/error-boundary.tsx` - エラー境界（shadcn/ui Alert使用）
- `components/loading-spinner.tsx` - ローディング表示（Lucide icons使用）
- `components/api-error-fallback.tsx` - API エラー表示
- `components/loading-card.tsx` - カードスケルトン

### カスタムフック
- `hooks/useSWRWithRetry.ts` - 指数バックオフリトライ機能付きSWR