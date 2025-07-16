// ReCORE API 商品型定義

export interface RecoreProductAttribute {
	color?: string;
	custom_size?: string;
	custom_spec?: string;
	custom_series?: string;
	custom_weight?: string;
	custom_country?: string;
	custom_material?: string;
	custom_care_html?: string;
	custom_hinbancode?: string;
	custom_hinbanname?: string;
	custom_description?: string;
	custom_maintenance?: string;
	custom_description_html?: string;
	custom_interior_leather?: string;
	custom_introduction_video_url?: string;
	custom_replenishment_priority?: string;
	[key: string]: string | undefined;
}

export interface RecoreCategory {
	id: number;
	name: string;
	is_leaf: boolean;
	ancestors: Array<{
		id: number;
		name: string;
	}>;
}

export interface RecoreProduct {
	id: number;
	code: string;
	alias_code: string | null;
	status: "ACTIVE" | "INACTIVE";
	title: string;
	attribute: RecoreProductAttribute;
	image_urls: string[];
	category: RecoreCategory;
	created_at: number;
	updated_at: number;
}

export interface GetRecoreProductRequest {
	ids?: string;
	codes?: string;
	category_ids?: string;
	status?: "ACTIVE" | "INACTIVE";
	limit?: number;
	page?: number;
	cursor?: string;
}
