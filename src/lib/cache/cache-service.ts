/**
 * キャッシュサービス
 * APIとIndexedDBの橋渡しを行う
 */

import type { Product } from "@/features/products/types";
import type { Category } from "@/features/categories/types";
import type { CachedData, CacheConfig, DataVersion } from "./types";
import { DEFAULT_CACHE_CONFIG } from "./types";
import { IndexedDBCache } from "./indexed-db";

export class CacheService {
	private cache: IndexedDBCache;
	private config: CacheConfig;
	private versionCheckTimer: NodeJS.Timeout | null = null;

	constructor(config: Partial<CacheConfig> = {}) {
		this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
		this.cache = new IndexedDBCache(this.config);
	}

	/**
	 * 初期化
	 */
	async init(): Promise<void> {
		await this.cache.init();
	}

	/**
	 * 商品データを取得
	 */
	async getProducts(): Promise<Product[] | null> {
		try {
			const cached = await this.cache.get<Product>("products");
			return cached?.data || null;
		} catch (error) {
			console.error("Failed to get products from cache:", error);
			return null;
		}
	}

	/**
	 * カテゴリデータを取得
	 */
	async getCategories(): Promise<Category[] | null> {
		try {
			const cached = await this.cache.get<Category>("categories");
			return cached?.data || null;
		} catch (error) {
			console.error("Failed to get categories from cache:", error);
			return null;
		}
	}

	/**
	 * 商品データを保存
	 */
	async saveProducts(products: Product[], version: string): Promise<void> {
		const cachedData: CachedData<Product> = {
			data: products,
			version,
			fetchedAt: Date.now(),
			expiresAt: Date.now() + this.config.productsExpiry,
		};
		await this.cache.set("products", cachedData);
	}

	/**
	 * カテゴリデータを保存
	 */
	async saveCategories(categories: Category[], version: string): Promise<void> {
		const cachedData: CachedData<Category> = {
			data: categories,
			version,
			fetchedAt: Date.now(),
			expiresAt: Date.now() + this.config.categoriesExpiry,
		};
		await this.cache.set("categories", cachedData);
	}

	/**
	 * 商品データをAPIから取得して保存
	 */
	async fetchAndSaveProducts(): Promise<Product[]> {
		try {
			// APIから全件取得
			const response = await fetch("/api/products/all?status=ACTIVE");
			if (!response.ok) {
				throw new Error("Failed to fetch products");
			}

			const { data } = await response.json();
			
			// バージョン情報を取得（ヘッダーまたはレスポンスから）
			const version = response.headers.get("X-Data-Version") || new Date().toISOString();
			
			// キャッシュに保存
			await this.saveProducts(data, version);
			
			return data;
		} catch (error) {
			console.error("Failed to fetch and save products:", error);
			throw error;
		}
	}

	/**
	 * カテゴリデータをAPIから取得して保存
	 */
	async fetchAndSaveCategories(): Promise<Category[]> {
		try {
			// APIから取得
			const response = await fetch("/api/categories");
			if (!response.ok) {
				throw new Error("Failed to fetch categories");
			}

			const { data } = await response.json();
			
			// バージョン情報を取得
			const version = response.headers.get("X-Data-Version") || new Date().toISOString();
			
			// キャッシュに保存
			await this.saveCategories(data, version);
			
			return data;
		} catch (error) {
			console.error("Failed to fetch and save categories:", error);
			throw error;
		}
	}

	/**
	 * データのバージョンをチェック
	 */
	async checkDataVersion(): Promise<DataVersion | null> {
		try {
			const response = await fetch("/api/cache/version");
			if (!response.ok) {
				throw new Error("Failed to check data version");
			}

			const version: DataVersion = await response.json();
			return version;
		} catch (error) {
			console.error("Failed to check data version:", error);
			return null;
		}
	}

	/**
	 * キャッシュをクリア
	 */
	async clearCache(): Promise<void> {
		await this.cache.clear();
	}

	/**
	 * キャッシュサイズを取得
	 */
	async getCacheSize(): Promise<number> {
		return this.cache.getSize();
	}

	/**
	 * バージョンチェックを開始
	 */
	startVersionCheck(callback: (hasUpdate: boolean) => void): void {
		// 既存のタイマーをクリア
		this.stopVersionCheck();

		// 定期的にバージョンをチェック
		this.versionCheckTimer = setInterval(async () => {
			try {
				const remoteVersion = await this.checkDataVersion();
				if (!remoteVersion) return;

				// 現在のキャッシュバージョンを取得
				const productsCache = await this.cache.get<Product>("products");
				const categoriesCache = await this.cache.get<Category>("categories");

				// バージョンが異なる場合は更新が必要
				const hasUpdate = 
					(productsCache && productsCache.version !== remoteVersion.products) ||
					(categoriesCache && categoriesCache.version !== remoteVersion.categories);

				if (hasUpdate !== null) {
					callback(hasUpdate);
				}
			} catch (error) {
				console.error("Version check failed:", error);
			}
		}, this.config.versionCheckInterval);
	}

	/**
	 * バージョンチェックを停止
	 */
	stopVersionCheck(): void {
		if (this.versionCheckTimer) {
			clearInterval(this.versionCheckTimer);
			this.versionCheckTimer = null;
		}
	}

	/**
	 * クリーンアップ
	 */
	destroy(): void {
		this.stopVersionCheck();
		this.cache.close();
	}
}