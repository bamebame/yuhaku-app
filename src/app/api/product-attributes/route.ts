import { NextRequest } from "next/server";
import { createServerContext } from "@/lib/context/server-context";
import { ProductsClient } from "@/lib/recore/products";
import { apiResponse } from "@/app/api/_utils/response";
import type { ProductAttribute } from "@/lib/recore/product-attributes";

/**
 * 商品属性一覧を取得
 * 注意: ReCORE APIにはproduct_attributesエンドポイントが存在しないため、
 * 商品データから属性値を抽出して返す
 */
export async function GET(request: NextRequest) {
	try {
		const context = await createServerContext();
		const productsClient = new ProductsClient(context);
		
		console.log("[ProductAttributes] Fetching products to extract attributes");
		
		// 商品を取得（少ない数から試す）
		let products;
		try {
			products = await productsClient.list({ limit: 100 });
		} catch (error) {
			console.error("[ProductAttributes] Failed to fetch products:", error);
			// エラーが発生した場合は空の配列を返す
			products = [];
		}
		
		// 属性値を収集
		const attributeMap = new Map<string, Set<string>>();
		
		// 属性名のリスト
		const attributeNames = [
			'color',
			'custom_size',
			'custom_series',
			'brand',
			'custom_spec',
			'custom_weight',
			'custom_country',
			'custom_material'
		];
		
		// 各商品から属性値を抽出
		products.forEach(product => {
			if (product.attribute) {
				attributeNames.forEach(attrName => {
					const value = product.attribute[attrName as keyof typeof product.attribute];
					if (value && typeof value === 'string') {
						if (!attributeMap.has(attrName)) {
							attributeMap.set(attrName, new Set());
						}
						attributeMap.get(attrName)!.add(value);
					}
				});
			}
		});
		
		// ProductAttribute形式に変換
		const attributes: ProductAttribute[] = Array.from(attributeMap.entries()).map(([name, valuesSet]) => ({
			name,
			values: Array.from(valuesSet).sort()
		}));
		
		console.log("[ProductAttributes] Extracted attributes:", attributes.map(a => `${a.name}: ${a.values.length} values`));
		
		// 属性が取得できない場合でも、エラーではなく空の配列を返す
		return apiResponse.success(attributes);
	} catch (error) {
		console.error("[ProductAttributes] Unexpected error:", error);
		// エラーが発生しても空の配列を返す
		return apiResponse.success([]);
	}
}