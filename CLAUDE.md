# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🔍 Quick Reference

### Project Context Files
- @.claude/context.md - プロジェクト背景と制約事項
- @.claude/project-knowledge.md - 技術的な知見とトラブルシューティング
- @.claude/project-improvements.md - 改善履歴とバージョン管理
- @.claude/common-patterns.md - よく使うコードパターンとテンプレート

### Custom Commands
- `/init` - プロジェクトコンテキストの再読み込み
- `/knowledge add [topic]` - 新しい知見の追加
- `/pattern add [name]` - コードパターンの追加
- `/improvement log [description]` - 改善履歴の記録

## Build and Development Commands

- `npm run dev` - 開発サーバー起動
- `npm run build` - ビルド
- `npm run lint` - リント実行
- `npm run format` - フォーマット実行
- `npm run typecheck` - 型チェック実行
- `npm run test` - テスト実行

### Debug Commands
- `DEBUG_FORM=true npm run dev` - フォームデバッグモード
- `DEBUG_API=true npm run dev` - API通信デバッグモード

## Development Rules

### プロジェクト構造

```md
src/                               # ルート
├── app/                           # Next.js App Router
│   ├── api/                       # API Routes (取得系のみ)
│   │   ├── auth/                 # 認証API
│   │   └── sas-cases/            # 店頭販売ケースAPI
│   ├── auth/                     # 認証ページ
│   │   ├── login/
│   │   └── _components/
│   ├── sas-cases/                # 店頭販売ケース管理
│   │   ├── list/                 # 一覧画面
│   │   ├── [id]/                 # 詳細・編集画面
│   │   └── _components/          # ドメイン固有コンポーネント
│   └── layout.tsx
├── features/                      # 機能別モジュール
│   ├── auth/                     # 認証機能
│   │   ├── actions/              # Server Actions
│   │   ├── schema/               # Zodスキーマ
│   │   └── types/                # 型定義
│   └── sas_cases/                # 店頭販売ケース機能
│       ├── actions/              # Server Actions (更新系)
│       ├── schema/               # Zodスキーマ
│       ├── types/                # 型定義
│       ├── recore/               # ReCORE API連携
│       ├── services/             # ビジネスロジック
│       ├── hooks/                # カスタムフック
│       └── utils/                # ユーティリティ
├── lib/                          # 共通ライブラリ
│   ├── supabase/                 # Supabase設定
│   ├── recore/                   # ReCORE APIクライアント
│   └── context/                  # コンテキスト管理
└── components/                   # 共通UIコンポーネント
    └── ui/                       # shadcn/ui
```

### API設計原則

#### 取得系（READ）: API Routes を使用
- `GET /api/sas-cases` - 一覧取得
- `GET /api/sas-cases/[id]` - 詳細取得
- クライアントからは`fetch`または`SWR`でアクセス

#### 更新系（CREATE/UPDATE/DELETE）: Server Actions を使用
- `createSasCaseFormAction` - 新規作成
- `updateSasCaseFormAction` - 更新
- `deleteSasCaseFormAction` - 削除
- `checkoutSasCaseFormAction` - チェックアウト
- フォーム送信と連携、Conformでバリデーション

### 実装パターン

#### Server Action実装例
```typescript
"use server"

import { parseWithZod } from "@conform-to/zod"
import type { ActionResult } from "@/features/types"
import { createSasCaseSchema } from "../schema"
import { createSasCase } from "./create"

export async function createSasCaseFormAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult<SasCase>> {
  const submission = parseWithZod(formData, { schema: createSasCaseSchema })
  
  if (submission.status !== "success") {
    return { result: submission.reply() }
  }
  
  try {
    const result = await createSasCase(submission.value)
    return {
      result: submission.reply({ resetForm: false }),
      data: result,
    }
  } catch (error) {
    return {
      result: {
        status: "error" as const,
        error: {
          "": [error instanceof Error ? error.message : "エラーが発生しました"],
        },
      },
    }
  }
}
```

#### API Route実装例
```typescript
import { NextRequest } from "next/server"
import { createServerContext } from "@/lib/context/server-context"
import { SasCasesClient } from "@/lib/recore/sas_cases"
import { apiResponse } from "@/app/api/_utils/response"

export async function GET(request: NextRequest) {
  try {
    const context = await createServerContext()
    const client = new SasCasesClient(context)
    
    const searchParams = request.nextUrl.searchParams
    const params = Object.fromEntries(searchParams)
    
    const result = await client.list(params)
    return apiResponse.success(result)
  } catch (error) {
    return apiResponse.error(error)
  }
}
```

## Code Style Guidelines

### 命名規則
- **コンポーネント**: PascalCase (例: `SasCaseList`)
- **Server Actions**: camelCase + FormAction (例: `updateSasCaseFormAction`)
- **API Routes**: kebab-case (例: `/api/sas-cases`)
- **型定義**:
  - ReCORE API型: `Recore`プレフィックス (例: `RecoreSasCase`)
  - 内部モデル型: シンプルな名前 (例: `SasCase`)
- **変換関数**: `convertXXXToYYY` (例: `convertRecoreSasCaseToSasCase`)

### ファイル構造（1ファイル1関数）
```
src/features/sas_cases/actions/
├── create-form.ts          # 作成フォームアクション
├── update-form.ts          # 更新フォームアクション
├── delete-form.ts          # 削除フォームアクション
├── checkout-form.ts        # チェックアウトフォームアクション
├── create.ts               # ビジネスロジック
├── update.ts               # ビジネスロジック
├── delete.ts               # ビジネスロジック
├── checkout.ts             # ビジネスロジック
└── index.ts                # エクスポート用
```

### 重要な実装ルール

1. **サービスレイヤーの直接呼び出し禁止**
   - コンポーネントから`services`を直接呼ばない
   - 必ずAPI RouteまたはServer Action経由

2. **フォーム管理**
   - React Hook Form + Conform + Zod
   - Server Actionsでバリデーションとデータ変換
   - `createFormAction`は使用禁止（シリアライゼーションエラー）

3. **型安全性**
   - `any`型は使用禁止
   - ReCORE API型と内部型の明確な分離
   - 変換関数での型変換を徹底

4. **エラーハンドリング**
   - Server Actionsではエラーを文字列で返す
   - Errorオブジェクトは使用しない

## Testing Guidelines

### テスト実行
- 開発サーバーを起動してPlaywrightで動作確認
- テストアカウント:
  - Email: test@example.com
  - Password: TestTest123
  - StaffCode: TESTCODE01

### コミット前チェックリスト
1. [ ] `npm run lint` - エラーなし
2. [ ] `npm run typecheck` - エラーなし
3. [ ] `npm run build` - ビルド成功
4. [ ] Playwrightでの動作確認

## Documentation Standards

### ADR (Architecture Decision Record)
- 場所: `docs/decision-record/`
- ファイル名: `ステータス_内容_YYYYMMDD.md`
- ステータス:
  - `DRAFT` - 作成中
  - `REVIEW` - レビュー中
  - `APPROVED` - 承認済み
  - `INPROGRESS` - 実装中
  - `DONE` - 完了
  - `SUPERSEDED` - 置き換え済み
  - `REJECTED` - 却下

### ドキュメント更新
- 実装変更時は関連ドキュメントも更新
- ドキュメントの内容を正とする
- 不整合がある場合はユーザーに確認

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ReCORE API
RECORE_API_URL=
RECORE_API_JWT=

# Optional
DEBUG_FORM=true
DEBUG_API=true
```

## Common Patterns

### SWRでのデータ取得
```typescript
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useSasCases() {
  const { data, error, isLoading } = useSWR("/api/sas-cases", fetcher)
  
  return {
    cases: data?.data,
    isLoading,
    isError: error,
  }
}
```

### フォーム送信
```typescript
import { useFormState } from "react-dom"
import { updateSasCaseFormAction } from "@/features/sas_cases/actions"

export function SasCaseForm({ caseId }: { caseId: string }) {
  const [state, formAction] = useFormState(updateSasCaseFormAction, null)
  
  return (
    <form action={formAction}>
      {/* フォームフィールド */}
    </form>
  )
}
```

## Troubleshooting

### よくある問題
1. **型エラー**: ReCORE APIとの型変換を確認
2. **フォームエラー**: Server Actionのシリアライゼーションを確認
3. **認証エラー**: Supabaseセッションの有効性を確認
4. **API通信エラー**: ReCORE API JWTトークンを確認

詳細は @.claude/project-knowledge.md を参照してください。