// ReCORE API カテゴリ型定義

export interface RecoreCategoryAncestor {
	id: number;
	name: string;
}

export interface RecoreCategory {
	id: number;
	name: string;
	is_leaf: boolean;
	ancestors: RecoreCategoryAncestor[];
}

export interface GetRecoreCategoryRequest {
	limit?: number;
	page?: number;
}
