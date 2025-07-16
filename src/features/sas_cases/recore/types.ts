/**
 * ReCORE API sas_cases 型定義
 * snake_caseプロパティを使用
 */

// 店舗情報
export interface RecoreStore {
	id: number;
	name: string;
}

// スタッフ情報
export interface RecoreStaff {
	id: number;
	name: string;
}

// レジ情報
export interface RecoreCashier {
	id: number;
	name: string;
}

// クーポン適用情報
export interface RecoreCoupon {
	coupon_id: number;
	amount: number;
}

// 販売明細
export interface RecoreGoods {
	id: number;
	serial: number;
	item_id: number;
	location_id: number;
	unit_price: number;
	unit_adjustment: number;
	case_adjustment: number;
	coupon_adjustment: number;
	tax: number;
	included_tax: number;
	exempted_tax: number;
	tax_rate: number;
	tax_rate_type: "GENERAL" | "RELIEF" | "NO_TAX";
	tax_free_type: "GENERAL" | "CONSUMPTION" | "INELIGIBLE";
	quantity: number;
	reserved_quantity: number;
	// 商品情報（APIレスポンスに含まれる場合）
	product?: {
		id: number;
		name: string;
		code: string;
	};
}

// 税情報
export interface RecoreTax {
	tax_rate_type: "GENERAL" | "RELIEF" | "NO_TAX";
	tax_rate: number;
	tax: number;
	included_tax: number;
	taxable_amount: number;
}

// 免税情報
export interface RecoreExemptedTax {
	tax_rate_type: "GENERAL" | "CONSUMPTION" | "INELIGIBLE";
	exempted_tax: number;
	exemptible_amount: number;
}

// ケースサマリー
export interface RecoreSummary {
	quantity: number;
	reserved_quantity: number;
	sub_total: number;
	case_adjustment: number;
	coupon_adjustment: number;
	total: number;
	taxes: RecoreTax[];
	exempted_taxes: RecoreExemptedTax[];
}

// 店頭販売ケース
export interface RecoreSasCase {
	id: number;
	code: string;
	store: RecoreStore;
	staff: RecoreStaff | null;
	cashier: RecoreCashier | null;
	status: "IN_PROGRESS" | "DONE";
	member_id: number | null;
	note: string | null;
	customer_note: string | null;
	done_at: number | null;
	created_at: number;
	updated_at: number;
	coupons: RecoreCoupon[];
	goods: RecoreGoods[];
	summary: RecoreSummary;
}

// 店頭販売ケース作成リクエスト
export interface RecoreSasCaseCreateInput {
	staff_id?: number | null;
	reserve_mode?: "RESERVE" | "RELEASE";
	cashier_id?: number | null;
	member_id?: number | null;
	customer_note?: string | null;
	note?: string | null;
	case_adjustment?: number;
	coupon_ids?: number[];
	goods?: RecoreGoodsInput[];
}

// 店頭販売ケース更新リクエスト
export interface RecoreSasCaseUpdateInput extends RecoreSasCaseCreateInput {
	goods?: RecoreGoodsUpdateInput[];
}

// 商品入力
export interface RecoreGoodsInput {
	item_id: number;
	location_id: number;
	quantity: number;
	unit_price?: number;
	unit_adjustment?: number;
}

// 商品更新入力
export interface RecoreGoodsUpdateInput extends RecoreGoodsInput {
	action: "CREATE" | "UPDATE" | "DELETE";
	id?: number;
}

// チェックアウトリクエスト
export interface RecoreCheckoutInput {
	charges: RecoreChargeInput[];
}

// 金種入力
export interface RecoreChargeInput {
	payment_id: number;
	amount: number;
}

// チェックアウト情報
export interface RecoreCheckoutInfo {
	charges: Array<{
		payment: {
			id: number;
			name: string;
			type: string;
		};
		amount: number;
		change: number;
	}>;
}

// 検索パラメータ
export interface RecoreSasCaseSearchParams {
	ids?: number[];
	codes?: string[];
	statuses?: string[];
	member_ids?: number[];
	created_at_from?: string;
	created_at_to?: string;
	updated_at_from?: string;
	updated_at_to?: string;
	done_at_from?: string;
	done_at_to?: string;
	page?: number;
	limit?: number;
	cursor?: string;
}
