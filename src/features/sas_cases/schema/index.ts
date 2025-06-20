import { z } from "zod"

// 商品入力スキーマ
export const goodsInputSchema = z.object({
	itemId: z.string().min(1, "商品IDは必須です"),
	locationId: z.string().min(1, "ロケーションIDは必須です"),
	quantity: z.number().int().min(1, "数量は1以上で入力してください"),
	unitPrice: z.number().int().min(0).optional(),
	unitAdjustment: z.number().int().optional(),
})

// 商品更新入力スキーマ
export const goodsUpdateInputSchema = goodsInputSchema.extend({
	action: z.enum(["CREATE", "UPDATE", "DELETE"]),
	id: z.string().optional(),
})

// 店頭販売ケース作成スキーマ
export const createSasCaseSchema = z.object({
	staffId: z.string().nullable().optional(),
	reserveMode: z.enum(["RESERVE", "RELEASE"]).optional(),
	cashierId: z.string().nullable().optional(),
	memberId: z.string().nullable().optional(),
	customerNote: z.string().max(500).nullable().optional(),
	note: z.string().max(500).nullable().optional(),
	caseAdjustment: z.number().int().optional(),
	couponIds: z.array(z.string()).optional(),
	goods: z.array(goodsInputSchema).optional(),
})

// 店頭販売ケース更新スキーマ
export const updateSasCaseSchema = z.object({
	id: z.string().min(1, "IDは必須です"),
	staffId: z.string().nullable().optional(),
	reserveMode: z.enum(["RESERVE", "RELEASE"]).optional(),
	cashierId: z.string().nullable().optional(),
	memberId: z.string().nullable().optional(),
	customerNote: z.string().max(500).nullable().optional(),
	note: z.string().max(500).nullable().optional(),
	caseAdjustment: z.number().int().optional(),
	couponIds: z.array(z.string()).optional(),
	goods: z.array(goodsUpdateInputSchema).optional(),
})

// 削除スキーマ
export const deleteSasCaseSchema = z.object({
	id: z.string().min(1, "IDは必須です"),
})

// 金種入力スキーマ
export const chargeInputSchema = z.object({
	paymentId: z.string().min(1, "支払方法IDは必須です"),
	amount: z.number().int().min(1, "金額は1以上で入力してください"),
})

// チェックアウトスキーマ
export const checkoutSasCaseSchema = z.object({
	id: z.string().min(1, "IDは必須です"),
	charges: z
		.array(chargeInputSchema)
		.min(1, "少なくとも1つの支払方法を選択してください"),
})