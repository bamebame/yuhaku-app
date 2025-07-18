"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useSasCaseEditStore } from "@/features/sas_cases/stores/edit-store";
import { useFilterStore } from "@/features/sas_cases/stores/filter-store";
import { SearchBar } from "./filter/search-bar";
import { FilterTabs } from "./filter/filter-tabs";
import { FilterContent } from "./filter/filter-content";
import { ProductGrid } from "./product-grid";
import { ProductCard } from "./product-card";
import { useCachedProducts, useCachedCategories } from "@/lib/cache";
import { useBatchItems } from "@/features/sas_cases/hooks/use-batch-items";
import type { Category } from "@/features/categories/types";
import type { Product } from "@/features/products/types";
import type { Item, ItemStock } from "@/features/items/types";


export function ProductSelectionPanel() {
	const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
	const prevCategoriesRef = useRef<string>("");
	const prevProductsRef = useRef<string>("");
	const prevItemsRef = useRef<string>("");

	const { setCategories, setProducts, setProductStocks, products: storeProducts, productStocks } =
		useSasCaseEditStore();
	const { 
		categoryId: selectedCategoryId,
		series: selectedSeries,
		colors: selectedColors,
		sizes: selectedSizes,
		priceRange: selectedPriceRange,
		searchKeyword,
		activeTab,
		showInStockOnly,
		favorites,
	} = useFilterStore();

	// キャッシュからカテゴリと商品を取得
	const { categories: cachedCategories, isLoading: categoriesLoading } = useCachedCategories();
	const { products: cachedProducts, isLoading: productsLoading } = useCachedProducts();

	// すべての商品の在庫を取得（250件ずつのバッチ処理）
	const allProductIds = storeProducts?.map((p) => p.id) || [];
	const { data: items, isLoading: isLoadingItems, error: itemsError } = useBatchItems(
		allProductIds,
		{
			refreshInterval: 30000, // 30秒
			enabled: allProductIds.length > 0,
		}
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
		const itemsJson = JSON.stringify(items || []);
		if (itemsJson !== prevItemsRef.current && items?.length) {
			prevItemsRef.current = itemsJson;
			
			// productIdごとに在庫をグループ化
			const stocksByProductId = new Map<string, Item[]>();
			items.forEach((item) => {
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
	}, [items, setProductStocks]);

	// フィルタリング処理
	const filteredProducts = useMemo(() => {
		if (!storeProducts || storeProducts.length === 0) {
			return [];
		}

		let filtered = [...storeProducts];

		// お気に入りタブが選択されている場合は、お気に入り商品のみを表示
		if (activeTab === 'favorite') {
			filtered = filtered.filter(product => 
				favorites.some(fav => fav.productId === product.id)
			);
			// お気に入りタブの場合は他のフィルタは適用しない
			return filtered;
		}

		// カテゴリフィルタ（子カテゴリも含む）
		if (selectedCategoryId) {
			filtered = filtered.filter((product) => {
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
		}

		// シリーズフィルタ
		if (selectedSeries.length > 0) {
			filtered = filtered.filter((product) => {
				const series = product.attribute?.custom_series;
				return series && selectedSeries.includes(series);
			});
		}

		// 色フィルタ
		if (selectedColors.length > 0) {
			filtered = filtered.filter((product) => {
				const color = product.attribute?.color;
				return color && selectedColors.includes(color);
			});
		}

		// サイズフィルタ
		if (selectedSizes.length > 0) {
			filtered = filtered.filter((product) => {
				const size = product.attribute?.custom_size;
				return size && selectedSizes.includes(size);
			});
		}

		// 価格フィルタ（TODO: 実際の価格データ構造に合わせて修正が必要）
		if (selectedPriceRange) {
			filtered = filtered.filter((product) => {
				// 仮実装：商品IDから仮の価格を生成
				const price = parseInt(product.id) * 100;
				const { min, max } = selectedPriceRange;
				return (
					(min === null || price >= min) &&
					(max === null || price <= max)
				);
			});
		}

		// キーワード検索
		if (searchKeyword) {
			const keyword = searchKeyword.toLowerCase();
			filtered = filtered.filter((product) => {
				// 基本フィールドの検索
				if (
					product.title.toLowerCase().includes(keyword) ||
					product.code.toLowerCase().includes(keyword) ||
					product.aliasCode?.toLowerCase().includes(keyword)
				) {
					return true;
				}
				
				// attribute配下の全ての値を検索
				if (product.attribute) {
					for (const value of Object.values(product.attribute)) {
						if (value && typeof value === 'string' && value.toLowerCase().includes(keyword)) {
							return true;
						}
					}
				}
				
				return false;
			});
		}

		// 在庫ありのみフィルタ（在庫データが読み込まれている場合のみ適用）
		if (showInStockOnly && productStocks.size > 0) {
			filtered = filtered.filter((product) => {
				const stocks = productStocks.get(product.id) || [];
				const totalStock = stocks.reduce((sum, stock) => sum + stock.quantity, 0);
				return totalStock > 0;
			});
		}

		return filtered;
	}, [storeProducts, selectedCategoryId, selectedSeries, selectedColors, selectedSizes, selectedPriceRange, searchKeyword, cachedCategories, showInStockOnly, productStocks, activeTab, favorites]);



	// 表示する商品を決定
	useEffect(() => {
		setDisplayedProducts(filteredProducts);
	}, [filteredProducts]);

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
			{/* 検索バー */}
			<SearchBar />
			
			{/* フィルタータブ */}
			<FilterTabs />
			
			{/* フィルターコンテンツ */}
			{activeTab && <FilterContent />}
			
			{/* 在庫データ取得エラーの表示 */}
			{itemsError && (
				<div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-600">
					在庫情報の取得に失敗しました: {itemsError.message}
				</div>
			)}
			
			{/* 商品表示エリア */}
			<div className="flex-1 overflow-y-auto">
				{/* お気に入りタブで商品がない場合のメッセージ */}
				{activeTab === 'favorite' && displayedProducts.length === 0 ? (
					<div className="p-8 text-center text-pos-muted">
						<div className="h-12 w-12 mx-auto mb-4 flex items-center justify-center">
							<span className="text-4xl">♡</span>
						</div>
						<p className="text-lg font-medium mb-2">お気に入りがありません</p>
						<p className="text-sm">商品カードの♡ボタンでお気に入りに追加できます</p>
					</div>
				) : (
					/* 通常の商品グリッド */
					<ProductGrid 
						products={displayedProducts} 
						isLoadingInventory={isLoadingItems && allProductIds.length > 0}
						loadingItemsCount={allProductIds.length}
					/>
				)}
			</div>
		</div>
	);
}
