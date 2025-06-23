import { BaseClient } from "../baseClient";
import type { Product, ProductSearchParams } from "@/features/products/types";
import type { RecoreProduct } from "@/features/products/recore/types";
import {
	convertRecoreProductToProduct,
	convertProductSearchParamsToRecore,
} from "@/features/products/recore/convert";

/**
 * 商品APIクライアント
 */
export class ProductsClient extends BaseClient {
	/**
	 * 商品一覧を取得
	 */
	async list(params: ProductSearchParams = {}): Promise<Product[]> {
		const recoreParams = convertProductSearchParamsToRecore(params);
		const response = await this.get<RecoreProduct[]>(
			"/products",
			recoreParams as Record<string, unknown>,
		);
		return response.map(convertRecoreProductToProduct);
	}

	/**
	 * 商品を取得
	 */
	async getById(id: string): Promise<Product> {
		const response = await this.get<RecoreProduct>(`/products/${id}`);
		return convertRecoreProductToProduct(response);
	}
}
