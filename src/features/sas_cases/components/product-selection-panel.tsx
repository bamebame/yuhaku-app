"use client";

import { useEffect, useState, useRef } from "react";
import useSWR from "swr";
import { useSasCaseEditStore } from "@/features/sas_cases/stores/edit-store";
import { CategoryTabs } from "./category-tabs";
import { ProductGrid } from "./product-grid";
import { useCachedProducts, useCachedCategories } from "@/lib/cache";
import type { Category } from "@/features/categories/types";
import type { Product } from "@/features/products/types";
import type { Item, ItemStock } from "@/features/items/types";

const fetcher = async (url: string) => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error("Failed to fetch");
	}
	return response.json();
};

export function ProductSelectionPanel() {
	const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
	const prevCategoriesRef = useRef<string>("");
	const prevProductsRef = useRef<string>("");
	const prevItemsRef = useRef<string>("");

	const { selectedCategoryId, setCategories, setProducts, setProductStocks, products: storeProducts } =
		useSasCaseEditStore();

	// キャッシュからカテゴリと商品を取得
	const { categories: cachedCategories, isLoading: categoriesLoading } = useCachedCategories();
	const { products: cachedProducts, isLoading: productsLoading } = useCachedProducts();

	// 表示中の商品の在庫を取得
	const productIds = displayedProducts.map((p) => p.id).join(",");
	const { data: itemsResponse } = useSWR<{ data: Item[] }>(
		productIds ? `/api/items?product_ids=${productIds}` : null,
		fetcher,
		{
			refreshInterval: 30000, // 30秒
		},
	);

	// カテゴリデータをストアに保存
	useEffect(() => {
		if (!cachedCategories) return;
		const categoriesJson = JSON.stringify(cachedCategories);
		if (categoriesJson !== prevCategoriesRef.current && cachedCategories.length > 0) {
			prevCategoriesRef.current = categoriesJson;
			setCategories(cachedCategories);
		}
	}, [cachedCategories, setCategories]);

	// 商品データをストアに保存
	useEffect(() => {
		if (!cachedProducts) return;
		const productsJson = JSON.stringify(cachedProducts);
		if (productsJson !== prevProductsRef.current && cachedProducts.length > 0) {
			prevProductsRef.current = productsJson;
			setProducts(cachedProducts);
		}
	}, [cachedProducts, setProducts]);

	// 在庫データをストアに保存
	useEffect(() => {
		const itemsJson = JSON.stringify(itemsResponse?.data || []);
		if (itemsJson !== prevItemsRef.current && itemsResponse?.data?.length) {
			prevItemsRef.current = itemsJson;
			
			// productIdごとに在庫をグループ化
			const stocksByProductId = new Map<string, Item[]>();
			itemsResponse.data.forEach((item) => {
				const existing = stocksByProductId.get(item.productId) || [];
				stocksByProductId.set(item.productId, [...existing, item]);
			});

			// 各商品の在庫情報を更新
			stocksByProductId.forEach((productItems, productId) => {
				// 在庫情報を統合
				const allStocks: ItemStock[] = [];
				productItems.forEach((item) => {
					item.stocks.forEach((stock) => {
						allStocks.push({
							...stock,
							itemId: item.id, // アイテムIDを追加
							price: item.price,
						});
					});
				});
				setProductStocks(productId, allStocks);
			});
		}
	}, [itemsResponse, setProductStocks]);

	// カテゴリフィルタリング（子カテゴリも含む）
	useEffect(() => {
		if (!storeProducts || storeProducts.length === 0) {
			setDisplayedProducts([]);
			return;
		}

		if (!selectedCategoryId) {
			// 全商品を表示
			setDisplayedProducts(storeProducts);
		} else {
			// カテゴリでフィルタ（選択したカテゴリおよびその子カテゴリの商品を表示）
			const filtered = storeProducts.filter((product) => {
				// 商品のカテゴリが選択されたカテゴリと一致
				if (product.categoryId === selectedCategoryId) {
					return true;
				}
				
				// 商品が所属するカテゴリの情報を取得
				const productCategory = cachedCategories?.find(
					(cat) => cat.id === product.categoryId
				);
				
				// 商品のカテゴリの祖先に選択されたカテゴリが含まれているかチェック
				if (productCategory?.ancestors) {
					return productCategory.ancestors.some(
						(ancestor) => ancestor.id === selectedCategoryId
					);
				}
				
				return false;
			});
			setDisplayedProducts(filtered);
		}
	}, [storeProducts, selectedCategoryId, cachedCategories]);

	// 初期ローディング中の表示
	if (categoriesLoading || productsLoading) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-center">
					<div className="text-lg font-semibold mb-2">データを読み込み中...</div>
					<div className="text-sm text-pos-muted">初回は時間がかかる場合があります</div>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col overflow-hidden">
			<CategoryTabs />
			<div className="flex-1 overflow-y-auto">
				<ProductGrid products={displayedProducts} />
			</div>
		</div>
	);
}
