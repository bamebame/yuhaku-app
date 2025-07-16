import { deleteSasCase } from "../services/delete";

/**
 * 店頭販売ケース削除ビジネスロジック
 */
export async function deleteSasCaseAction(id: string) {
	// ビジネスロジックをここに実装
	// 例：削除権限チェック、関連データの確認など

	// サービス層を呼び出し
	return deleteSasCase(id);
}
