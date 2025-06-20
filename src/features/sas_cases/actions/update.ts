import type { SasCaseUpdateInput } from "../types"
import { updateSasCase } from "../services/update"

/**
 * 店頭販売ケース更新ビジネスロジック
 */
export async function update(id: string, input: SasCaseUpdateInput) {
	// ビジネスロジックをここに実装
	// 例：変更権限チェック、ステータス遷移の妥当性確認など

	// サービス層を呼び出し
	return updateSasCase(id, input)
}