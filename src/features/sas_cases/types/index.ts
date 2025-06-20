/**
 * 内部モデル型定義
 * camelCaseプロパティを使用
 */

// 店舗情報
export interface Store {
	id: string
	name: string
}

// スタッフ情報
export interface Staff {
	id: string
	name: string
}

// レジ情報
export interface Cashier {
	id: string
	name: string
}

// クーポン適用情報
export interface Coupon {
	couponId: string
	amount: number
}

// 販売明細
export interface Goods {
	id: string
	serial: number
	itemId: string
	locationId: string
	unitPrice: number
	unitAdjustment: number
	caseAdjustment: number
	couponAdjustment: number
	tax: number
	includedTax: number
	exemptedTax: number
	taxRate: number
	taxRateType: "GENERAL" | "RELIEF" | "NO_TAX"
	taxFreeType: "GENERAL" | "CONSUMPTION" | "INELIGIBLE"
	quantity: number
	reservedQuantity: number
}

// 税情報
export interface Tax {
	taxRateType: "GENERAL" | "RELIEF" | "NO_TAX"
	taxRate: number
	tax: number
	includedTax: number
	taxableAmount: number
}

// 免税情報
export interface ExemptedTax {
	taxRateType: "GENERAL" | "CONSUMPTION" | "INELIGIBLE"
	exemptedTax: number
	exemptibleAmount: number
}

// ケースサマリー
export interface Summary {
	quantity: number
	reservedQuantity: number
	subTotal: number
	caseAdjustment: number
	couponAdjustment: number
	total: number
	taxes: Tax[]
	exemptedTaxes: ExemptedTax[]
}

// 店頭販売ケース
export interface SasCase {
	id: string
	code: string
	store: Store
	staff: Staff | null
	cashier: Cashier | null
	status: SasCaseStatus
	memberId: string | null
	note: string
	customerNote: string
	doneAt: Date | null
	createdAt: Date
	updatedAt: Date
	coupons: Coupon[]
	goods: Goods[]
	summary: Summary
}

// ステータス
export type SasCaseStatus = "IN_PROGRESS" | "DONE"

// 在庫確保モード
export type ReserveMode = "RESERVE" | "RELEASE"

// 商品アクション
export type GoodsAction = "CREATE" | "UPDATE" | "DELETE"

// 店頭販売ケース作成入力
export interface SasCaseCreateInput {
	staffId?: string | null
	reserveMode?: ReserveMode
	cashierId?: string | null
	memberId?: string | null
	customerNote?: string | null
	note?: string | null
	caseAdjustment?: number
	couponIds?: string[]
	goods?: GoodsInput[]
}

// 店頭販売ケース更新入力
export interface SasCaseUpdateInput extends SasCaseCreateInput {
	goods?: GoodsUpdateInput[]
}

// 商品入力
export interface GoodsInput {
	itemId: string
	locationId: string
	quantity: number
	unitPrice?: number
	unitAdjustment?: number
}

// 商品更新入力
export interface GoodsUpdateInput extends GoodsInput {
	action: GoodsAction
	id?: string
}

// チェックアウト入力
export interface CheckoutInput {
	charges: ChargeInput[]
}

// 金種入力
export interface ChargeInput {
	paymentId: string
	amount: number
}

// 検索パラメータ
export interface SasCaseSearchParams {
	ids?: string[]
	codes?: string[]
	statuses?: SasCaseStatus[]
	createdAtFrom?: Date
	createdAtTo?: Date
	updatedAtFrom?: Date
	updatedAtTo?: Date
	doneAtFrom?: Date
	doneAtTo?: Date
	page?: number
	limit?: number
	cursor?: string
}