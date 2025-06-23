import type { Item, ItemStock, ItemSearchParams } from "../types";
import type { RecoreItem, RecoreStock, GetRecoreItemRequest } from "./types";

/**
 * ReCORE API在庫型から内部在庫型への変換
 */
export function convertRecoreItemToItem(recoreItem: RecoreItem): Item {
	return {
		id: recoreItem.id.toString(),
		code: recoreItem.code,
		aliasCode: recoreItem.alias_code,
		storeId: recoreItem.store.id,
		storeName: recoreItem.store.name,
		price: recoreItem.price,
		gradeId: recoreItem.grade.id,
		gradeName: recoreItem.grade.name,
		conditionNote: recoreItem.condition_note,
		conditionTags: recoreItem.condition_tags,
		note: recoreItem.note,
		stocks: recoreItem.stocks.map(convertRecoreStockToItemStock),
		attribute: recoreItem.attribute,
		imageUrls: recoreItem.image_urls,
		racks: recoreItem.racks,
		createdAt: new Date(recoreItem.created_at * 1000),
		updatedAt: new Date(recoreItem.updated_at * 1000),
		productId: recoreItem.product_id.toString(),
	};
}

/**
 * ReCORE API在庫情報型から内部在庫情報型への変換
 */
export function convertRecoreStockToItemStock(
	recoreStock: RecoreStock,
): ItemStock {
	return {
		location: {
			id: recoreStock.location.id,
			type: recoreStock.location.type,
			name: recoreStock.location.name,
		},
		status: recoreStock.status,
		quantity: recoreStock.quantity,
		price: 0, // RecoreStockには価格情報がないため、Itemのpriceを使用
		costPrice: recoreStock.cost_price,
	};
}

/**
 * 在庫検索パラメータをReCORE API用に変換
 */
export function convertItemSearchParamsToRecore(
	params: ItemSearchParams,
): GetRecoreItemRequest {
	return {
		ids: params.ids?.join(","),
		product_ids: params.productIds?.join(","),
		location_ids: params.locationIds?.join(","),
		status: params.status,
		limit: params.limit,
		page: params.page,
		cursor: params.cursor,
	};
}
