import { type NextRequest } from "next/server"
import { apiResponse } from "@/app/api/_utils/response"
import { createServerContext } from "@/lib/context/server-context"
import { SasCasesClient } from "@/lib/recore/sas_cases"
import { createClient } from "@/lib/supabase/server"

interface RouteParams {
	params: {
		id: string
	}
}

/**
 * GET /api/sas-cases/[id]
 * 店頭販売ケース詳細取得
 */
export async function GET(
	_request: NextRequest,
	{ params }: RouteParams,
) {
	try {
		// 認証チェック
		const supabase = await createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			return apiResponse.unauthorized()
		}

		// APIクライアント作成
		const context = await createServerContext()
		const client = new SasCasesClient(context)

		// データ取得
		const result = await client.getById(params.id)

		return apiResponse.success(result)
	} catch (error) {
		return apiResponse.error(error)
	}
}