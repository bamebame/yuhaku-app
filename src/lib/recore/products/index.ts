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

	/**
	 * カーソルページネーションで全商品を取得
	 */
	async listAll(params: Omit<ProductSearchParams, 'page' | 'cursor'> = {}): Promise<Product[]> {
		const allProducts: Product[] = [];
		let cursor = '';
		const limit = params.limit || 100;

		while (true) {
			const recoreParams = convertProductSearchParamsToRecore({
				...params,
				limit,
				cursor,
			});

			// カーソルページネーション対応のリクエスト
			const response = await this.getWithHeaders<RecoreProduct[]>(
				"/products",
				recoreParams as Record<string, unknown>,
			);

			// レスポンスデータを変換
			const products = response.data.map(convertRecoreProductToProduct);
			allProducts.push(...products);

			// X-Next-Cursorヘッダーを取得
			const nextCursor = response.headers['x-next-cursor'];
			if (!nextCursor) {
				break;
			}

			cursor = nextCursor;
		}

		return allProducts;
	}
}
