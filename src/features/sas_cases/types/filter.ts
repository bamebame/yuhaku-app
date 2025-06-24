/**
 * 商品フィルター関連の型定義
 */

/**
 * フィルタータイプ
 */
export type FilterType = 'category' | 'series' | 'color' | 'price' | 'size' | 'favorite';

/**
 * 価格帯の定義
 */
export interface PriceRange {
	min: number | null;
	max: number | null;
	label: string;
}

/**
 * 色の定義
 */
export interface ColorDefinition {
	code: string;
	name: string;
	hex: string;
	group?: string;
}

/**
 * フィルター状態
 */
export interface FilterState {
	/** 選択中のカテゴリID */
	categoryId: string | null;
	/** 選択中のシリーズ（複数選択可） */
	series: string[];
	/** 選択中の色（複数選択可） */
	colors: string[];
	/** 選択中のサイズ（複数選択可） */
	sizes: string[];
	/** 選択中の価格帯 */
	priceRange: PriceRange | null;
	/** 検索キーワード */
	searchKeyword: string;
	/** アクティブなフィルタータブ */
	activeTab: FilterType | null;
	/** 在庫ありのみ表示 */
	showInStockOnly: boolean;
}

/**
 * 商品統計情報
 */
export interface ProductStats {
	/** カテゴリ別商品数 */
	byCategory: Map<string, number>;
	/** シリーズ別商品数 */
	bySeries: Map<string, number>;
	/** 色別商品数 */
	byColor: Map<string, number>;
	/** サイズ別商品数 */
	bySize: Map<string, number>;
	/** 価格帯別商品数 */
	byPriceRange: Map<string, number>;
}

/**
 * 最近見た商品
 */
export interface RecentlyViewedProduct {
	productId: string;
	viewedAt: number;
}

/**
 * お気に入り商品
 */
export interface FavoriteProduct {
	productId: string;
	addedAt: number;
}