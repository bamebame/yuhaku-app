// ReCORE API 在庫型定義

export interface RecoreLocation {
	id: number;
	type: "DEFAULT" | "WAREHOUSE" | "SHOP";
	name: string;
}

export interface RecoreStock {
	location: RecoreLocation;
	status: "ACTIVE" | "INACTIVE" | "RESERVED";
	quantity: number;
	cost_price?: number;
}

export interface RecoreGrade {
	id: number;
	name: string;
}

export interface RecoreStore {
	id: number;
	name: string;
}

export interface RecoreItem {
	id: number;
	code: string;
	alias_code: string | null;
	store: RecoreStore;
	price: number;
	grade: RecoreGrade;
	condition_note: string | null;
	condition_tags: string[];
	note: string | null;
	stocks: RecoreStock[];
	attribute: Record<string, unknown> | null;
	image_urls: string[];
	racks: unknown[];
	created_at: number;
	updated_at: number;
	product_id: number;
}

export interface GetRecoreItemRequest {
	ids?: string;
	product_ids?: string;
	location_ids?: string;
	status?: "ACTIVE" | "INACTIVE" | "RESERVED";
	limit?: number;
	page?: number;
	cursor?: string;
}
