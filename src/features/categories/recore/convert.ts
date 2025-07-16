import type { Category, CategorySearchParams } from "../types";
import type { RecoreCategory, GetRecoreCategoryRequest } from "./types";

/**
 * ReCORE APIカテゴリ型から内部カテゴリ型への変換
 */
export function convertRecoreCategoryToCategory(
	recoreCategory: RecoreCategory,
): Category {
	return {
		id: recoreCategory.id.toString(),
		name: recoreCategory.name,
		isLeaf: recoreCategory.is_leaf,
		ancestors: recoreCategory.ancestors.map((ancestor) => ({
			id: ancestor.id.toString(),
			name: ancestor.name,
		})),
	};
}

/**
 * カテゴリ検索パラメータをReCORE API用に変換
 */
export function convertCategorySearchParamsToRecore(
	params: CategorySearchParams,
): GetRecoreCategoryRequest {
	return {
		limit: params.limit,
		page: params.page,
	};
}
