// カテゴリ祖先
export interface CategoryAncestor {
	id: string;
	name: string;
}

// カテゴリ
export interface Category {
	id: string;
	name: string;
	isLeaf: boolean;
	ancestors: CategoryAncestor[];
}

// カテゴリ検索パラメータ
export interface CategorySearchParams {
	limit?: number;
	page?: number;
}
