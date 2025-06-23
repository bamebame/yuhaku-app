import { BaseClient } from "../baseClient";
import type {
	Category,
	CategorySearchParams,
} from "@/features/categories/types";
import type { RecoreCategory } from "@/features/categories/recore/types";
import {
	convertRecoreCategoryToCategory,
	convertCategorySearchParamsToRecore,
} from "@/features/categories/recore/convert";

/**
 * カテゴリAPIクライアント
 */
export class CategoriesClient extends BaseClient {
	/**
	 * カテゴリ一覧を取得
	 */
	async list(params: CategorySearchParams = {}): Promise<Category[]> {
		const recoreParams = convertCategorySearchParamsToRecore(params);
		const response = await this.get<RecoreCategory[]>(
			"/products/categories",
			recoreParams as Record<string, unknown>,
		);
		return response.map(convertRecoreCategoryToCategory);
	}
}
