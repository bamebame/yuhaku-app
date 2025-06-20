import type { CheckoutInput } from "../types"
import { checkoutSasCase } from "../services/checkout"

/**
 * 店頭販売ケースチェックアウトビジネスロジック
 */
export async function checkout(id: string, input: CheckoutInput) {
	// ビジネスロジックをここに実装
	// 例：合計金額の検証、在庫の最終確認など

	// サービス層を呼び出し
	return checkoutSasCase(id, input)
}