import type { SasCaseCreateInput } from "../types";
import { createSasCase } from "../services/create";

/**
 * 店頭販売ケース作成ビジネスロジック
 */
export async function create(input: SasCaseCreateInput) {
	// ビジネスロジックをここに実装
	// 例：在庫確認、権限チェックなど

	// サービス層を呼び出し
	return createSasCase(input);
}
