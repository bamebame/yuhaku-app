/**
 * ReCORE API型と内部型の変換関数
 */

import type {
	Cashier,
	ChargeInput,
	CheckoutInput,
	Coupon,
	ExemptedTax,
	Goods,
	GoodsInput,
	GoodsUpdateInput,
	SasCase,
	SasCaseCreateInput,
	SasCaseSearchParams,
	SasCaseUpdateInput,
	Staff,
	Store,
	Summary,
	Tax,
} from "../types";
import type {
	RecoreCashier,
	RecoreChargeInput,
	RecoreCheckoutInput,
	RecoreCoupon,
	RecoreExemptedTax,
	RecoreGoods,
	RecoreGoodsInput,
	RecoreGoodsUpdateInput,
	RecoreSasCase,
	RecoreSasCaseCreateInput,
	RecoreSasCaseSearchParams,
	RecoreSasCaseUpdateInput,
	RecoreStaff,
	RecoreStore,
	RecoreSummary,
	RecoreTax,
} from "./types";

// 店舗情報の変換
export function convertRecoreStoreToStore(recore: RecoreStore): Store {
	return {
		id: recore.id.toString(),
		name: recore.name,
	};
}

// スタッフ情報の変換
export function convertRecoreStaffToStaff(
	recore: RecoreStaff | null,
): Staff | null {
	if (!recore) return null;
	return {
		id: recore.id.toString(),
		name: recore.name,
	};
}

// レジ情報の変換
export function convertRecoreCashierToCashier(
	recore: RecoreCashier | null,
): Cashier | null {
	if (!recore) return null;
	return {
		id: recore.id.toString(),
		name: recore.name,
	};
}

// クーポン情報の変換
export function convertRecoreCouponToCoupon(recore: RecoreCoupon): Coupon {
	return {
		couponId: recore.coupon_id.toString(),
		amount: recore.amount,
	};
}

// 販売明細の変換
export function convertRecoreGoodsToGoods(recore: RecoreGoods): Goods {
	return {
		id: recore.id.toString(),
		serial: recore.serial,
		itemId: recore.item_id.toString(),
		locationId: recore.location_id.toString(),
		unitPrice: recore.unit_price,
		unitAdjustment: recore.unit_adjustment,
		caseAdjustment: recore.case_adjustment,
		couponAdjustment: recore.coupon_adjustment,
		tax: recore.tax,
		includedTax: recore.included_tax,
		exemptedTax: recore.exempted_tax,
		taxRate: recore.tax_rate,
		taxRateType: recore.tax_rate_type,
		taxFreeType: recore.tax_free_type,
		quantity: recore.quantity,
		reservedQuantity: recore.reserved_quantity,
	};
}

// 税情報の変換
export function convertRecoreTaxToTax(recore: RecoreTax): Tax {
	return {
		taxRateType: recore.tax_rate_type,
		taxRate: recore.tax_rate,
		tax: recore.tax,
		includedTax: recore.included_tax,
		taxableAmount: recore.taxable_amount,
	};
}

// 免税情報の変換
export function convertRecoreExemptedTaxToExemptedTax(
	recore: RecoreExemptedTax,
): ExemptedTax {
	return {
		taxRateType: recore.tax_rate_type,
		exemptedTax: recore.exempted_tax,
		exemptibleAmount: recore.exemptible_amount,
	};
}

// サマリーの変換
export function convertRecoreSummaryToSummary(recore: RecoreSummary): Summary {
	return {
		quantity: recore.quantity,
		reservedQuantity: recore.reserved_quantity,
		subTotal: recore.sub_total,
		caseAdjustment: recore.case_adjustment,
		couponAdjustment: recore.coupon_adjustment,
		total: recore.total,
		taxes: recore.taxes.map(convertRecoreTaxToTax),
		exemptedTaxes: recore.exempted_taxes.map(
			convertRecoreExemptedTaxToExemptedTax,
		),
	};
}

// 店頭販売ケースの変換
export function convertRecoreSasCaseToSasCase(recore: RecoreSasCase): SasCase {
	return {
		id: recore.id.toString(),
		code: recore.code,
		store: convertRecoreStoreToStore(recore.store),
		staff: convertRecoreStaffToStaff(recore.staff),
		cashier: convertRecoreCashierToCashier(recore.cashier),
		status: recore.status,
		memberId: recore.member_id?.toString() || null,
		note: recore.note || "",
		customerNote: recore.customer_note || "",
		doneAt: recore.done_at ? new Date(recore.done_at * 1000) : null,
		createdAt: new Date(recore.created_at * 1000),
		updatedAt: new Date(recore.updated_at * 1000),
		coupons: recore.coupons.map(convertRecoreCouponToCoupon),
		goods: recore.goods.map(convertRecoreGoodsToGoods),
		summary: convertRecoreSummaryToSummary(recore.summary),
	};
}

// 商品入力の変換（内部→ReCORE）
export function convertGoodsInputToRecore(input: GoodsInput): RecoreGoodsInput {
	return {
		item_id: Number.parseInt(input.itemId),
		location_id: Number.parseInt(input.locationId),
		quantity: input.quantity,
		unit_price: input.unitPrice,
		unit_adjustment: input.unitAdjustment,
	};
}

// 商品更新入力の変換（内部→ReCORE）
export function convertGoodsUpdateInputToRecore(
	input: GoodsUpdateInput,
): RecoreGoodsUpdateInput {
	return {
		action: input.action,
		id: input.id ? Number.parseInt(input.id) : undefined,
		item_id: Number.parseInt(input.itemId),
		location_id: Number.parseInt(input.locationId),
		quantity: input.quantity,
		unit_price: input.unitPrice,
		unit_adjustment: input.unitAdjustment,
	};
}

// 作成入力の変換（内部→ReCORE）
export function convertSasCaseCreateInputToRecore(
	input: SasCaseCreateInput,
): RecoreSasCaseCreateInput {
	return {
		staff_id: input.staffId ? Number.parseInt(input.staffId) : null,
		reserve_mode: input.reserveMode,
		cashier_id: input.cashierId ? Number.parseInt(input.cashierId) : null,
		member_id: input.memberId ? Number.parseInt(input.memberId) : null,
		customer_note: input.customerNote,
		note: input.note,
		case_adjustment: input.caseAdjustment,
		coupon_ids: input.couponIds?.map((id) => Number.parseInt(id)),
		goods: input.goods?.map(convertGoodsInputToRecore),
	};
}

// 更新入力の変換（内部→ReCORE）
export function convertSasCaseUpdateInputToRecore(
	input: SasCaseUpdateInput,
): RecoreSasCaseUpdateInput {
	return {
		staff_id: input.staffId ? Number.parseInt(input.staffId) : null,
		reserve_mode: input.reserveMode,
		cashier_id: input.cashierId ? Number.parseInt(input.cashierId) : null,
		member_id: input.memberId ? Number.parseInt(input.memberId) : null,
		customer_note: input.customerNote,
		note: input.note,
		case_adjustment: input.caseAdjustment,
		coupon_ids: input.couponIds?.map((id) => Number.parseInt(id)),
		goods: input.goods?.map(convertGoodsUpdateInputToRecore),
	};
}

// 金種入力の変換（内部→ReCORE）
export function convertChargeInputToRecore(
	input: ChargeInput,
): RecoreChargeInput {
	return {
		payment_id: Number.parseInt(input.paymentId),
		amount: input.amount,
	};
}

// チェックアウト入力の変換（内部→ReCORE）
export function convertCheckoutInputToRecore(
	input: CheckoutInput,
): RecoreCheckoutInput {
	return {
		charges: input.charges.map(convertChargeInputToRecore),
	};
}

// 検索パラメータの変換（内部→ReCORE）
export function convertSasCaseSearchParamsToRecore(
	params: SasCaseSearchParams,
): RecoreSasCaseSearchParams {
	const formatDate = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		const seconds = String(date.getSeconds()).padStart(2, "0");
		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	};

	return {
		ids: params.ids?.map((id) => Number.parseInt(id)),
		codes: params.codes,
		statuses: params.statuses,
		created_at_from: params.createdAtFrom
			? formatDate(params.createdAtFrom)
			: undefined,
		created_at_to: params.createdAtTo
			? formatDate(params.createdAtTo)
			: undefined,
		updated_at_from: params.updatedAtFrom
			? formatDate(params.updatedAtFrom)
			: undefined,
		updated_at_to: params.updatedAtTo
			? formatDate(params.updatedAtTo)
			: undefined,
		done_at_from: params.doneAtFrom ? formatDate(params.doneAtFrom) : undefined,
		done_at_to: params.doneAtTo ? formatDate(params.doneAtTo) : undefined,
		page: params.page,
		limit: params.limit,
		cursor: params.cursor,
	};
}
