import type { NextRequest } from "next/server";
import { apiResponse } from "@/app/api/_utils/response";
import { createServerContext } from "@/lib/context/server-context";
import { ProductsClient } from "@/lib/recore/products";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/products/all
 * 全商品取得（カーソルページネーション対応）
 * キャッシュ時間を長めに設定して、頻繁な全件取得を防ぐ
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
		const status = searchParams.get("status") as "ACTIVE" | "INACTIVE" | undefined;
		const categoryIds = searchParams.get("category_ids")?.split(",");

		// APIクライアント作成
		const context = await createServerContext();
		const client = new ProductsClient(context);

		// カーソルページネーションで全商品を取得
		const allProducts = await client.listAll({
			status,
			categoryIds,
			limit: 250, // 1ページあたりの取得数
		});

		// レスポンスにキャッシュヘッダーとバージョン情報を設定
		return new Response(JSON.stringify({ data: allProducts }), {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'private, max-age=1800, stale-while-revalidate=900',
				'X-Data-Version': `products-${new Date().toISOString().split('T')[0]}`,
			},
		});
	} catch (error) {
		return apiResponse.error(error);
	}
}