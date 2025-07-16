import { BaseClient } from "../baseClient";

// ReCORE API商品属性レスポンスの型定義
interface RecoreProductAttribute {
	name: string;
	values: string[];
}

interface RecoreProductAttributesResponse {
	product_attributes: RecoreProductAttribute[];
}

// 内部モデルの型定義
export interface ProductAttribute {
	name: string;
	values: string[];
}

/**
 * 商品属性APIクライアント
 */
export class ProductAttributesClient extends BaseClient {
	/**
	 * 商品属性一覧を取得
	 */
	async list(params: Record<string, unknown> = {}): Promise<ProductAttribute[]> {
		const response = await this.get<RecoreProductAttributesResponse>(
			"/product_attributes",
			params
		);
		
		// 内部形式に変換
		return response.product_attributes.map(attr => ({
			name: attr.name,
			values: attr.values,
		}));
	}
}