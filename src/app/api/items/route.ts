import type { NextRequest } from "next/server";
import { apiResponse } from "@/app/api/_utils/response";
import { createServerContext } from "@/lib/context/server-context";
import { ItemsClient } from "@/lib/recore/items";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/items
 * 在庫一覧取得
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
			ids: searchParams.get("ids")?.split(","),
			productIds: searchParams.get("product_ids")?.split(","),
			locationIds: searchParams
				.get("location_ids")
				?.split(",")
				.map((id) => Number.parseInt(id)),
			status: searchParams.get("status") as
				| "ACTIVE"
				| "INACTIVE"
				| "RESERVED"
				| undefined,
			limit: searchParams.get("limit")
				? Number.parseInt(searchParams.get("limit") || "")
				: undefined,
			page: searchParams.get("page")
				? Number.parseInt(searchParams.get("page") || "")
				: undefined,
			cursor: searchParams.get("cursor") || undefined,
		};

		// APIクライアント作成
		const context = await createServerContext();
		const client = new ItemsClient(context);

		// データ取得
		const result = await client.list(params);

		return apiResponse.success(result);
	} catch (error) {
		return apiResponse.error(error);
	}
}
