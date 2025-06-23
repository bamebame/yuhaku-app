import { BaseClient } from "../baseClient";
import type { Item, ItemSearchParams } from "@/features/items/types";
import type { RecoreItem } from "@/features/items/recore/types";
import {
	convertRecoreItemToItem,
	convertItemSearchParamsToRecore,
} from "@/features/items/recore/convert";

/**
 * 在庫APIクライアント
 */
export class ItemsClient extends BaseClient {
	/**
	 * 在庫一覧を取得
	 */
	async list(params: ItemSearchParams = {}): Promise<Item[]> {
		const recoreParams = convertItemSearchParamsToRecore(params);
		const response = await this.get<RecoreItem[]>(
			"/items",
			recoreParams as Record<string, unknown>,
		);
		return response.map(convertRecoreItemToItem);
	}

	/**
	 * 在庫を取得
	 */
	async getById(id: string): Promise<Item> {
		const response = await this.get<RecoreItem>(`/items/${id}`);
		return convertRecoreItemToItem(response);
	}
}
