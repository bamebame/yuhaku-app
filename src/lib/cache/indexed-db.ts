/**
 * IndexedDBを使用したキャッシュストレージの実装
 */

import type { CachedData, CacheConfig } from "./types";
import { DEFAULT_CACHE_CONFIG } from "./types";

export class IndexedDBCache {
	private db: IDBDatabase | null = null;
	private readonly config: CacheConfig;

	constructor(config: Partial<CacheConfig> = {}) {
		this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
	}

	/**
	 * データベースを初期化
	 */
	async init(): Promise<void> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.config.dbName, this.config.dbVersion);

			request.onerror = () => {
				reject(new Error("Failed to open IndexedDB"));
			};

			request.onsuccess = () => {
				this.db = request.result;
				resolve();
			};

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;
				
				// オブジェクトストアが存在しない場合は作成
				if (!db.objectStoreNames.contains("cache")) {
					db.createObjectStore("cache");
				}
			};
		});
	}

	/**
	 * データを保存
	 */
	async set<T>(key: string, data: CachedData<T>): Promise<void> {
		if (!this.db) {
			throw new Error("Database not initialized");
		}

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(["cache"], "readwrite");
			const store = transaction.objectStore("cache");
			const request = store.put(data, key);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(new Error(`Failed to save ${key}`));
		});
	}

	/**
	 * データを取得
	 */
	async get<T>(key: string): Promise<CachedData<T> | null> {
		if (!this.db) {
			throw new Error("Database not initialized");
		}

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(["cache"], "readonly");
			const store = transaction.objectStore("cache");
			const request = store.get(key);

			request.onsuccess = () => {
				const data = request.result as CachedData<T> | undefined;
				if (!data) {
					resolve(null);
					return;
				}

				// 有効期限チェック
				if (Date.now() > data.expiresAt) {
					// 期限切れの場合は削除
					this.delete(key).catch(console.error);
					resolve(null);
					return;
				}

				resolve(data);
			};

			request.onerror = () => reject(new Error(`Failed to get ${key}`));
		});
	}

	/**
	 * データを削除
	 */
	async delete(key: string): Promise<void> {
		if (!this.db) {
			throw new Error("Database not initialized");
		}

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(["cache"], "readwrite");
			const store = transaction.objectStore("cache");
			const request = store.delete(key);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(new Error(`Failed to delete ${key}`));
		});
	}

	/**
	 * すべてのデータをクリア
	 */
	async clear(): Promise<void> {
		if (!this.db) {
			throw new Error("Database not initialized");
		}

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(["cache"], "readwrite");
			const store = transaction.objectStore("cache");
			const request = store.clear();

			request.onsuccess = () => resolve();
			request.onerror = () => reject(new Error("Failed to clear cache"));
		});
	}

	/**
	 * データベースを閉じる
	 */
	close(): void {
		if (this.db) {
			this.db.close();
			this.db = null;
		}
	}

	/**
	 * キャッシュサイズを取得（概算）
	 */
	async getSize(): Promise<number> {
		if (!this.db) {
			throw new Error("Database not initialized");
		}

		return new Promise((resolve, reject) => {
			let totalSize = 0;
			const transaction = this.db!.transaction(["cache"], "readonly");
			const store = transaction.objectStore("cache");
			const request = store.openCursor();

			request.onsuccess = (event) => {
				const cursor = (event.target as IDBRequest).result;
				if (cursor) {
					// オブジェクトのサイズを概算
					const size = JSON.stringify(cursor.value).length;
					totalSize += size;
					cursor.continue();
				} else {
					resolve(totalSize);
				}
			};

			request.onerror = () => reject(new Error("Failed to calculate cache size"));
		});
	}
}