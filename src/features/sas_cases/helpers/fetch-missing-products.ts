/**
 * 商品情報が不足しているgoodsに対して、商品情報を取得する
 */

import type { Goods, SasCase } from "../types";
import type { Product } from "@/features/products/types";

/**
 * 商品情報が不足しているかチェック
 */
function needsProductInfo(goods: Goods): boolean {
	return !goods.productName || !goods.productCode;
}

/**
 * 商品情報を取得してgoodsに追加
 */
export async function fetchMissingProductsForCase(sasCase: SasCase): Promise<SasCase> {
	// 商品情報が不足しているgoodsを特定
	const goodsNeedingInfo = sasCase.goods.filter(needsProductInfo);
	
	if (goodsNeedingInfo.length === 0) {
		// すべての商品情報が揃っている
		return sasCase;
	}
	
	// 商品IDのリストを作成（itemIdをproductIdとして使用）
	const productIds = [...new Set(goodsNeedingInfo.map(g => g.itemId))];
	
	try {
		// 商品情報を一括取得
		const response = await fetch(`/api/products?ids=${productIds.join(',')}`);
		if (!response.ok) {
			console.error('Failed to fetch products:', response.statusText);
			return sasCase;
		}
		
		const { data: products } = await response.json() as { data: Product[] };
		
		// 商品情報をマップに変換
		const productMap = new Map<string, Product>();
		products.forEach(product => {
			productMap.set(product.id, product);
		});
		
		// goodsに商品情報を補完
		const updatedGoods = sasCase.goods.map(goods => {
			if (needsProductInfo(goods)) {
				const product = productMap.get(goods.itemId);
				if (product) {
					return {
						...goods,
						productName: product.title,
						productCode: product.code,
					};
				}
			}
			return goods;
		});
		
		return {
			...sasCase,
			goods: updatedGoods,
		};
	} catch (error) {
		console.error('Error fetching missing products:', error);
		return sasCase;
	}
}