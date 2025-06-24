import { NextRequest } from "next/server";
import { createServerContext } from "@/lib/context/server-context";
import { ProductAttributesClient } from "@/lib/recore/product-attributes";
import { apiResponse } from "@/app/api/_utils/response";

/**
 * 商品属性一覧を取得
 * ReCORE API: GET /product_attributes
 */
export async function GET(request: NextRequest) {
	try {
		const context = await createServerContext();
		const client = new ProductAttributesClient(context);
		
		// クエリパラメータを取得（必要に応じて）
		const searchParams = request.nextUrl.searchParams;
		const params: Record<string, unknown> = {};
		
		// 属性名でフィルタする場合
		const name = searchParams.get("name");
		if (name) {
			params.name = name;
		}
		
		console.log("[ProductAttributes] Fetching attributes with params:", params);
		
		// ReCORE APIを呼び出し
		const attributes = await client.list(params);
		
		console.log("[ProductAttributes] Response:", attributes);
		
		return apiResponse.success(attributes);
	} catch (error) {
		console.error("[ProductAttributes] Error:", error);
		return apiResponse.error(error);
	}
}