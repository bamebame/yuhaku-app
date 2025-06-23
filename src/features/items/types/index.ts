// 在庫ステータス
export type ItemStatus = "ACTIVE" | "INACTIVE" | "RESERVED";

// ロケーションタイプ
export type LocationType = "DEFAULT" | "WAREHOUSE" | "SHOP";

// ロケーション
export interface Location {
	id: number;
	type: LocationType;
	name: string;
}

// 在庫情報
export interface ItemStock {
	itemId?: string; // 在庫アイテムID
	location: Location;
	status: ItemStatus;
	quantity: number;
	price: number;
	costPrice?: number;
}

// 在庫
export interface Item {
	id: string;
	code: string;
	aliasCode: string | null;
	storeId: number;
	storeName: string;
	price: number;
	gradeId: number;
	gradeName: string;
	conditionNote: string | null;
	conditionTags: string[];
	note: string | null;
	stocks: ItemStock[];
	attribute: Record<string, unknown> | null;
	imageUrls: string[];
	racks: unknown[];
	createdAt: Date;
	updatedAt: Date;
	productId: string;
}

// 在庫検索パラメータ
export interface ItemSearchParams {
	ids?: string[];
	productIds?: string[];
	locationIds?: number[];
	status?: ItemStatus;
	limit?: number;
	page?: number;
	cursor?: string;
}
