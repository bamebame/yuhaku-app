"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { Product } from "@/features/products/types";
import type { Category } from "@/features/categories/types";
import type { CacheState, CacheConfig } from "./types";
import { CacheService } from "./cache-service";
import { useToast } from "@/hooks/use-toast";

interface CacheContextValue {
	/** 商品データ */
	products: Product[] | null;
	/** カテゴリデータ */
	categories: Category[] | null;
	/** キャッシュ状態 */
	cacheState: CacheState;
	/** データを再取得 */
	refresh: () => Promise<void>;
	/** キャッシュをクリア */
	clearCache: () => Promise<void>;
}

const CacheContext = createContext<CacheContextValue | undefined>(undefined);

interface CacheProviderProps {
	children: React.ReactNode;
	config?: Partial<CacheConfig>;
}

export function CacheProvider({ children, config }: CacheProviderProps) {
	const [products, setProducts] = useState<Product[] | null>(null);
	const [categories, setCategories] = useState<Category[] | null>(null);
	const [cacheState, setCacheState] = useState<CacheState>({
		isLoading: true,
		error: null,
		lastUpdated: null,
		updateAvailable: false,
	});

	const cacheServiceRef = useRef<CacheService | null>(null);
	const { toast } = useToast();

	// 初期化とデータ読み込み
	useEffect(() => {
		const initCache = async () => {
			try {
				// キャッシュサービスを初期化
				const service = new CacheService(config);
				await service.init();
				cacheServiceRef.current = service;

				// キャッシュからデータを読み込み
				const [cachedProducts, cachedCategories] = await Promise.all([
					service.getProducts(),
					service.getCategories(),
				]);

				let needsFetch = false;

				// 商品データ
				if (cachedProducts) {
					setProducts(cachedProducts);
				} else {
					needsFetch = true;
				}

				// カテゴリデータ
				if (cachedCategories) {
					setCategories(cachedCategories);
				} else {
					needsFetch = true;
				}

				// キャッシュがない場合はAPIから取得
				if (needsFetch) {
					await fetchAndUpdateData(service);
				}

				// バージョンチェックを開始
				service.startVersionCheck((hasUpdate) => {
					setCacheState(prev => ({ ...prev, updateAvailable: hasUpdate }));
					if (hasUpdate) {
						toast({
							title: "データ更新があります",
							description: "最新データを取得するには更新ボタンを押してください",
						});
					}
				});

				setCacheState({
					isLoading: false,
					error: null,
					lastUpdated: Date.now(),
					updateAvailable: false,
				});
			} catch (error) {
				console.error("Cache initialization failed:", error);
				setCacheState({
					isLoading: false,
					error: error as Error,
					lastUpdated: null,
					updateAvailable: false,
				});
			}
		};

		initCache();

		// クリーンアップ
		return () => {
			if (cacheServiceRef.current) {
				cacheServiceRef.current.destroy();
			}
		};
	}, [config, toast]);

	// データ取得と更新
	const fetchAndUpdateData = async (service?: CacheService) => {
		const cacheService = service || cacheServiceRef.current;
		if (!cacheService) return;

		try {
			const [newProducts, newCategories] = await Promise.all([
				cacheService.fetchAndSaveProducts(),
				cacheService.fetchAndSaveCategories(),
			]);

			setProducts(newProducts);
			setCategories(newCategories);
		} catch (error) {
			throw error;
		}
	};

	// データを再取得
	const refresh = useCallback(async () => {
		if (!cacheServiceRef.current) return;

		setCacheState(prev => ({ ...prev, isLoading: true }));

		try {
			await fetchAndUpdateData();
			setCacheState({
				isLoading: false,
				error: null,
				lastUpdated: Date.now(),
				updateAvailable: false,
			});
			toast({
				title: "データを更新しました",
				description: "最新のデータを取得しました",
			});
		} catch (error) {
			setCacheState(prev => ({
				...prev,
				isLoading: false,
				error: error as Error,
			}));
			toast({
				title: "更新エラー",
				description: "データの更新に失敗しました",
				variant: "destructive",
			});
		}
	}, [toast]);

	// キャッシュをクリア
	const clearCache = useCallback(async () => {
		if (!cacheServiceRef.current) return;

		try {
			await cacheServiceRef.current.clearCache();
			setProducts(null);
			setCategories(null);
			
			// データを再取得
			await refresh();
			
			toast({
				title: "キャッシュをクリアしました",
				description: "データを再取得しました",
			});
		} catch (error) {
			toast({
				title: "エラー",
				description: "キャッシュのクリアに失敗しました",
				variant: "destructive",
			});
		}
	}, [refresh, toast]);

	const value: CacheContextValue = {
		products,
		categories,
		cacheState,
		refresh,
		clearCache,
	};

	return <CacheContext.Provider value={value}>{children}</CacheContext.Provider>;
}

/**
 * キャッシュコンテキストを使用するフック
 */
export function useCache() {
	const context = useContext(CacheContext);
	if (!context) {
		throw new Error("useCache must be used within CacheProvider");
	}
	return context;
}

/**
 * 商品データを使用するフック
 */
export function useCachedProducts() {
	const { products, cacheState } = useCache();
	return {
		products,
		isLoading: cacheState.isLoading && !products,
		error: cacheState.error,
	};
}

/**
 * カテゴリデータを使用するフック
 */
export function useCachedCategories() {
	const { categories, cacheState } = useCache();
	return {
		categories,
		isLoading: cacheState.isLoading && !categories,
		error: cacheState.error,
	};
}