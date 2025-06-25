/**
 * 商品フィルター状態管理ストア
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FilterState, FilterType, RecentlyViewedProduct, FavoriteProduct } from "../types/filter";
import { MAX_SEARCH_HISTORY, MAX_FAVORITES } from "../constants/filter";

interface FilterStore extends FilterState {
	// フィルター更新アクション
	setCategoryId: (categoryId: string | null) => void;
	toggleSeries: (series: string) => void;
	toggleColor: (color: string) => void;
	toggleSize: (size: string) => void;
	setPriceRange: (range: { min: number | null; max: number | null; label: string } | null) => void;
	setSearchKeyword: (keyword: string) => void;
	setActiveTab: (tab: FilterState['activeTab']) => void;
	toggleActiveTab: (tab: FilterType) => void;
	setShowInStockOnly: (show: boolean) => void;
	clearFilters: () => void;
	
	// 検索履歴
	searchHistory: string[];
	addSearchHistory: (keyword: string) => void;
	clearSearchHistory: () => void;
	
	
	// お気に入り
	favorites: FavoriteProduct[];
	toggleFavorite: (productId: string) => void;
	isFavorite: (productId: string) => boolean;
}

const initialState: FilterState = {
	categoryId: null,
	series: [],
	colors: [],
	sizes: [],
	priceRange: null,
	searchKeyword: '',
	activeTab: null,
	showInStockOnly: true,
};

export const useFilterStore = create<FilterStore>()(
	persist(
		(set, get) => ({
			// 初期状態
			...initialState,
			searchHistory: [],
			favorites: [],
			
			// カテゴリ設定
			setCategoryId: (categoryId) => set({ categoryId }),
			
			// シリーズ切り替え
			toggleSeries: (series) => set((state) => ({
				series: state.series.includes(series)
					? state.series.filter((s) => s !== series)
					: [...state.series, series],
			})),
			
			// 色切り替え
			toggleColor: (color) => set((state) => ({
				colors: state.colors.includes(color)
					? state.colors.filter((c) => c !== color)
					: [...state.colors, color],
			})),
			
			// サイズ切り替え
			toggleSize: (size) => set((state) => ({
				sizes: state.sizes.includes(size)
					? state.sizes.filter((s) => s !== size)
					: [...state.sizes, size],
			})),
			
			// 価格帯設定
			setPriceRange: (priceRange) => set({ priceRange }),
			
			// 検索キーワード設定
			setSearchKeyword: (searchKeyword) => set({ searchKeyword }),
			
			// アクティブタブ設定
			setActiveTab: (activeTab) => set({ activeTab }),
			
			// アクティブタブトグル（同じタブをクリックしたら閉じる）
			toggleActiveTab: (tab) => set((state) => ({
				activeTab: state.activeTab === tab ? null : tab
			})),
			
			// 在庫ありのみ表示設定
			setShowInStockOnly: (showInStockOnly) => set({ showInStockOnly }),
			
			// フィルタークリア
			clearFilters: () => set({
				categoryId: null,
				series: [],
				colors: [],
				sizes: [],
				priceRange: null,
				searchKeyword: '',
			}),
			
			// 検索履歴追加
			addSearchHistory: (keyword) => {
				if (!keyword.trim()) return;
				
				set((state) => {
					const filtered = state.searchHistory.filter((k) => k !== keyword);
					const newHistory = [keyword, ...filtered].slice(0, MAX_SEARCH_HISTORY);
					return { searchHistory: newHistory };
				});
			},
			
			// 検索履歴クリア
			clearSearchHistory: () => set({ searchHistory: [] }),
			
			
			// お気に入り切り替え
			toggleFavorite: (productId) => set((state) => {
				const isFav = state.favorites.some((f) => f.productId === productId);
				if (isFav) {
					return {
						favorites: state.favorites.filter((f) => f.productId !== productId),
					};
				} else {
					if (state.favorites.length >= MAX_FAVORITES) {
						// 最大数に達している場合は最も古いものを削除
						return {
							favorites: [
								{ productId, addedAt: Date.now() },
								...state.favorites.slice(0, -1),
							],
						};
					}
					return {
						favorites: [
							{ productId, addedAt: Date.now() },
							...state.favorites,
						],
					};
				}
			}),
			
			// お気に入り判定
			isFavorite: (productId) => {
				return get().favorites.some((f) => f.productId === productId);
			},
		}),
		{
			name: 'product-filter-storage',
			partialize: (state) => ({
				searchHistory: state.searchHistory,
				favorites: state.favorites,
			}),
		}
	)
);