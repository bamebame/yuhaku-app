import type { NextRequest } from "next/server";
import { apiResponse } from "@/app/api/_utils/response";
import { createServerContext } from "@/lib/context/server-context";
import { SasCasesClient } from "@/lib/recore/sas_cases";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/sas-cases/[id]/checkout
 * チェックアウト情報取得
 */
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		// 認証チェック
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return apiResponse.unauthorized();
		}

		// パラメータを await で取得
		const { id } = await params;

		// APIクライアント作成
		const context = await createServerContext();
		const client = new SasCasesClient(context);

		// チェックアウト情報取得
		const result = await client.getCheckoutInfo(id);

		return apiResponse.success(result);
	} catch (error) {
		return apiResponse.error(error);
	}
}