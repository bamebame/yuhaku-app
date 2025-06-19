# よく使うコードパターン

## Server Actionパターン

### 基本的なServer Action
```typescript
"use server"

import { parseWithZod } from "@conform-to/zod"
import type { ActionResult } from "@/features/types"
import { sasCaseSchema } from "../schema"
import { updateSasCase } from "./update"

export async function updateSasCaseFormAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult<SasCase>> {
  const submission = parseWithZod(formData, { schema: sasCaseSchema })
  
  if (submission.status !== "success") {
    return { result: submission.reply() }
  }
  
  try {
    const result = await updateSasCase(submission.value)
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

## API Routeパターン

### GET リクエスト
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

### 動的ルート
```typescript
// app/api/sas-cases/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await createServerContext()
    const client = new SasCasesClient(context)
    
    const result = await client.get(params.id)
    return apiResponse.success(result)
  } catch (error) {
    return apiResponse.error(error)
  }
}
```

## フォームコンポーネントパターン

### Conformを使用したフォーム
```tsx
"use client"

import { useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { useFormState } from "react-dom"
import { sasCaseSchema } from "@/features/sas_cases/schema"
import { updateSasCaseFormAction } from "@/features/sas_cases/actions"

export function SasCaseForm({ sasCase }: { sasCase: SasCase }) {
  const [lastResult, action] = useFormState(updateSasCaseFormAction, undefined)
  
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: sasCaseSchema })
    },
    defaultValue: sasCase,
  })
  
  return (
    <form id={form.id} action={action} noValidate>
      <input type="hidden" name="id" value={sasCase.id} />
      
      <div>
        <label htmlFor={fields.code.id}>ケースコード</label>
        <input
          id={fields.code.id}
          name={fields.code.name}
          defaultValue={fields.code.defaultValue}
          aria-invalid={!fields.code.valid}
          aria-describedby={fields.code.errorId}
        />
        {fields.code.errors && (
          <div id={fields.code.errorId}>{fields.code.errors}</div>
        )}
      </div>
      
      <button type="submit">保存</button>
    </form>
  )
}
```

## SWRデータフェッチングパターン

### 基本的なデータ取得
```typescript
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useSasCases() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/sas-cases",
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000, // 5分ごとに更新
      revalidateOnFocus: false,
    }
  )
  
  return {
    cases: data?.data,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}
```

### 条件付きフェッチング
```typescript
export function useSasCase(id: string | null) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/sas-cases/${id}` : null,
    fetcher
  )
  
  return {
    sasCase: data?.data,
    isLoading,
    isError: error,
  }
}
```

## 型変換パターン

### API型から内部型への変換
```typescript
export function convertRecoreSasCaseToSasCase(
  recore: RecoreSasCase
): SasCase {
  return {
    id: recore.id.toString(),
    code: recore.code,
    status: recore.status as SasCaseStatus,
    storeId: recore.store.id.toString(),
    storeName: recore.store.name,
    staffId: recore.staff?.id.toString() || null,
    staffName: recore.staff?.name || null,
    memberId: recore.member_id?.toString() || null,
    note: recore.note || "",
    customerNote: recore.customer_note || "",
    goods: recore.goods.map(convertRecoreGoodsToGoods),
    summary: convertRecoreSummaryToSummary(recore.summary),
    createdAt: new Date(recore.created_at * 1000),
    updatedAt: new Date(recore.updated_at * 1000),
    doneAt: recore.done_at ? new Date(recore.done_at * 1000) : null,
  }
}
```

### 内部型からAPI型への変換
```typescript
export function convertSasCaseToRecoreInput(
  sasCase: Partial<SasCase>
): RecoreSasCaseInput {
  return {
    staff_id: sasCase.staffId ? parseInt(sasCase.staffId) : null,
    cashier_id: sasCase.cashierId ? parseInt(sasCase.cashierId) : null,
    member_id: sasCase.memberId ? parseInt(sasCase.memberId) : null,
    note: sasCase.note || null,
    customer_note: sasCase.customerNote || null,
    case_adjustment: sasCase.caseAdjustment || 0,
    coupon_ids: sasCase.couponIds || [],
    goods: sasCase.goods?.map(convertGoodsToRecoreInput) || [],
  }
}
```

## エラーハンドリングパターン

### API Response Helper
```typescript
// app/api/_utils/response.ts
import { NextResponse } from "next/server"

export const apiResponse = {
  success: <T>(data: T) => {
    return NextResponse.json({ data })
  },
  
  error: (error: unknown) => {
    console.error("API Error:", error)
    
    if (error instanceof RecoreError) {
      return NextResponse.json(
        { error: { message: error.message, code: error.code } },
        { status: error.status || 500 }
      )
    }
    
    return NextResponse.json(
      { error: { message: "Internal Server Error" } },
      { status: 500 }
    )
  },
}
```

## Zodスキーマパターン

### 基本的なスキーマ定義
```typescript
import { z } from "zod"

export const sasCaseSchema = z.object({
  id: z.string(),
  code: z.string().min(1, "ケースコードは必須です"),
  status: z.enum(["IN_PROGRESS", "DONE"]),
  staffId: z.string().nullable(),
  memberId: z.string().nullable(),
  note: z.string().max(500, "メモは500文字以内で入力してください"),
  goods: z.array(goodsSchema),
})

export const createSasCaseSchema = sasCaseSchema.omit({
  id: true,
  status: true,
})

export const updateSasCaseSchema = sasCaseSchema.partial()
```