"use server";

import type { SasCase } from "../types";
import { create } from "./create";

/**
 * 空の販売ケースを作成する
 * フォームデータなしで直接作成可能
 */
export async function createEmptySasCase(): Promise<SasCase> {
	console.log("[createEmptySasCase] Starting case creation...");
	
	try {
		// 空のケースデータで作成（デフォルト値はサーバー側で設定される）
		const result = await create({
			reserveMode: "RESERVE" as const,
		});
		
		console.log("[createEmptySasCase] Case created successfully:", result);
		return result;
	} catch (error) {
		console.error("[createEmptySasCase] Failed to create case:", error);
		throw error;
	}
}