// 商品ステータス
export type ProductStatus = "ACTIVE" | "INACTIVE";

// 商品属性
export interface ProductAttribute {
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

// 商品
export interface Product {
	id: string;
	code: string;
	aliasCode: string | null;
	status: ProductStatus;
	title: string;
	attribute: ProductAttribute;
	imageUrls: string[];
	categoryId: string;
	categoryName?: string;
	categoryPath?: string;
	createdAt: Date;
	updatedAt: Date;
}

// 商品検索パラメータ
export interface ProductSearchParams {
	ids?: string[];
	codes?: string[];
	categoryIds?: string[];
	status?: ProductStatus;
	limit?: number;
	page?: number;
	cursor?: string;
}
