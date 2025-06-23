"use client";

import { useEffect, useState, useRef } from "react";
import useSWR from "swr";
import { useSasCaseEditStore } from "@/features/sas_cases/stores/edit-store";
import { CategoryTabs } from "./category-tabs";
import { ProductGrid } from "./product-grid";
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

	// カテゴリ取得
	const { data: categoriesResponse } = useSWR<{ data: Category[] }>("/api/categories", fetcher, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
		refreshInterval: 3600000, // 1時間
	});

	// 商品取得
	const { data: productsResponse } = useSWR<{ data: Product[] }>(
		"/api/products?limit=100&status=ACTIVE",
		fetcher,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			refreshInterval: 900000, // 15分
		},
	);

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
		const categoriesJson = JSON.stringify(categoriesResponse?.data || []);
		if (categoriesJson !== prevCategoriesRef.current && categoriesResponse?.data?.length) {
			prevCategoriesRef.current = categoriesJson;
			setCategories(categoriesResponse.data);
		}
	}, [categoriesResponse, setCategories]);

	// 商品データをストアに保存
	useEffect(() => {
		const productsJson = JSON.stringify(productsResponse?.data || []);
		if (productsJson !== prevProductsRef.current && productsResponse?.data?.length) {
			prevProductsRef.current = productsJson;
			setProducts(productsResponse.data);
		}
	}, [productsResponse, setProducts]);

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

	// カテゴリフィルタリング
	useEffect(() => {
		if (!storeProducts || storeProducts.length === 0) {
			setDisplayedProducts([]);
			return;
		}

		if (!selectedCategoryId) {
			// 全商品を表示
			setDisplayedProducts(storeProducts);
		} else {
			// カテゴリでフィルタ
			const filtered = storeProducts.filter(
				(product) => product.categoryId === selectedCategoryId,
			);
			setDisplayedProducts(filtered);
		}
	}, [storeProducts, selectedCategoryId]);

	return (
		<div className="h-full flex flex-col overflow-hidden">
			<CategoryTabs />
			<div className="flex-1 overflow-y-auto">
				<ProductGrid products={displayedProducts} />
			</div>
		</div>
	);
}
