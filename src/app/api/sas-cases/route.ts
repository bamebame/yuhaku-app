import { type NextRequest } from "next/server"
import { apiResponse } from "@/app/api/_utils/response"
import { createServerContext } from "@/lib/context/server-context"
import { SasCasesClient } from "@/lib/recore/sas_cases"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/sas-cases
 * 店頭販売ケース一覧取得
 */
export async function GET(request: NextRequest) {
	try {
		// 認証チェック
		const supabase = await createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			return apiResponse.unauthorized()
		}

		// クエリパラメータ取得
		const searchParams = request.nextUrl.searchParams
		const params = {
			ids: searchParams.get("ids")?.split(","),
			codes: searchParams.get("codes")?.split(","),
			statuses: searchParams.get("statuses")?.split(",") as
				| ("IN_PROGRESS" | "DONE")[]
				| undefined,
			createdAtFrom: searchParams.get("created_at_from")
				? new Date(searchParams.get("created_at_from")!)
				: undefined,
			createdAtTo: searchParams.get("created_at_to")
				? new Date(searchParams.get("created_at_to")!)
				: undefined,
			updatedAtFrom: searchParams.get("updated_at_from")
				? new Date(searchParams.get("updated_at_from")!)
				: undefined,
			updatedAtTo: searchParams.get("updated_at_to")
				? new Date(searchParams.get("updated_at_to")!)
				: undefined,
			doneAtFrom: searchParams.get("done_at_from")
				? new Date(searchParams.get("done_at_from")!)
				: undefined,
			doneAtTo: searchParams.get("done_at_to")
				? new Date(searchParams.get("done_at_to")!)
				: undefined,
			page: searchParams.get("page")
				? Number.parseInt(searchParams.get("page")!)
				: undefined,
			limit: searchParams.get("limit")
				? Number.parseInt(searchParams.get("limit")!)
				: undefined,
			cursor: searchParams.get("cursor") || undefined,
		}

		// APIクライアント作成
		const context = await createServerContext()
		const client = new SasCasesClient(context)

		// データ取得
		const result = await client.list(params)

		return apiResponse.success(result)
	} catch (error) {
		return apiResponse.error(error)
	}
}