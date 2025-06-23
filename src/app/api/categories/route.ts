import type { NextRequest } from "next/server";
import { apiResponse } from "@/app/api/_utils/response";
import { createServerContext } from "@/lib/context/server-context";
import { CategoriesClient } from "@/lib/recore/categories";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/categories
 * カテゴリ一覧取得
 */
export async function GET(request: NextRequest) {
	try {
		// 認証チェック
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return apiResponse.unauthorized();
		}

		// クエリパラメータ取得
		const searchParams = request.nextUrl.searchParams;
		const params = {
			limit: searchParams.get("limit")
				? Number.parseInt(searchParams.get("limit") || "")
				: undefined,
			page: searchParams.get("page")
				? Number.parseInt(searchParams.get("page") || "")
				: undefined,
		};

		// APIクライアント作成
		const context = await createServerContext();
		const client = new CategoriesClient(context);

		// データ取得
		const result = await client.list(params);

		return apiResponse.success(result);
	} catch (error) {
		return apiResponse.error(error);
	}
}
