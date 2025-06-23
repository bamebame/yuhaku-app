import type { Product, ProductSearchParams } from "../types";
import type { RecoreProduct, GetRecoreProductRequest } from "./types";

/**
 * ReCORE API商品型から内部商品型への変換
 */
export function convertRecoreProductToProduct(
	recoreProduct: RecoreProduct,
): Product {
	// カテゴリパスの生成
	const categoryPath = [
		...recoreProduct.category.ancestors.map((a) => a.name),
		recoreProduct.category.name,
	].join(" > ");

	return {
		id: recoreProduct.id.toString(),
		code: recoreProduct.code,
		aliasCode: recoreProduct.alias_code,
		status: recoreProduct.status,
		title: recoreProduct.title,
		attribute: recoreProduct.attribute,
		imageUrls: recoreProduct.image_urls,
		categoryId: recoreProduct.category.id.toString(),
		categoryName: recoreProduct.category.name,
		categoryPath,
		createdAt: new Date(recoreProduct.created_at * 1000),
		updatedAt: new Date(recoreProduct.updated_at * 1000),
	};
}

/**
 * 商品検索パラメータをReCORE API用に変換
 */
export function convertProductSearchParamsToRecore(
	params: ProductSearchParams,
): GetRecoreProductRequest {
	return {
		ids: params.ids?.join(","),
		codes: params.codes?.join(","),
		category_ids: params.categoryIds?.join(","),
		status: params.status,
		limit: params.limit,
		page: params.page,
		cursor: params.cursor,
	};
}
