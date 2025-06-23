/**
 * キャッシュシステムの型定義
 */

import type { Product } from "@/features/products/types";
import type { Category } from "@/features/categories/types";

/**
 * キャッシュデータの基本構造
 */
export interface CachedData<T> {
	/** キャッシュされたデータ */
	data: T[];
	/** データバージョン（サーバー側で管理） */
	version: string;
	/** データ取得時刻（Unix timestamp） */
	fetchedAt: number;
	/** キャッシュ有効期限（Unix timestamp） */
	expiresAt: number;
	/** ETag（将来の拡張用） */
	etag?: string;
}

/**
 * キャッシュストレージの構造
 */
export interface CacheStorage {
	/** 商品データのキャッシュ */
	products: CachedData<Product> | null;
	/** カテゴリデータのキャッシュ */
	categories: CachedData<Category> | null;
}

/**
 * キャッシュ設定
 */
export interface CacheConfig {
	/** 商品データの有効期限（ミリ秒） */
	productsExpiry: number;
	/** カテゴリデータの有効期限（ミリ秒） */
	categoriesExpiry: number;
	/** バージョンチェック間隔（ミリ秒） */
	versionCheckInterval: number;
	/** IndexedDBのデータベース名 */
	dbName: string;
	/** IndexedDBのバージョン */
	dbVersion: number;
}

/**
 * デフォルトのキャッシュ設定
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
	productsExpiry: 24 * 60 * 60 * 1000,      // 24時間
	categoriesExpiry: 7 * 24 * 60 * 60 * 1000, // 7日間
	versionCheckInterval: 5 * 60 * 1000,       // 5分
	dbName: "yuhaku-cache",
	dbVersion: 1,
};

/**
 * キャッシュ状態
 */
export interface CacheState {
	/** 読み込み中かどうか */
	isLoading: boolean;
	/** エラー */
	error: Error | null;
	/** 最終更新時刻 */
	lastUpdated: number | null;
	/** 更新が利用可能かどうか */
	updateAvailable: boolean;
}

/**
 * データバージョン情報
 */
export interface DataVersion {
	/** 商品データのバージョン */
	products: string;
	/** カテゴリデータのバージョン */
	categories: string;
	/** バージョン確認時刻 */
	checkedAt: number;
}