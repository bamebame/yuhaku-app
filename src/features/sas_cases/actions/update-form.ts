"use server";

import type { ActionResult } from "@/features/types";
import type { SasCase, SasCaseUpdateInput, GoodsUpdateInput } from "../types";
import { update } from "./update";
import { z } from "zod";
import { updateSasCaseSchema } from "../schema";

export async function updateSasCaseFormAction(
	id: string,
	_prevState: unknown,
	formData: FormData,
): Promise<ActionResult<SasCase>> {
	console.log("updateSasCaseFormAction called with id:", id);
	
	// FormDataから手動でデータを抽出
	const data: any = {
		goods: []
	};
	
	// goods配列のインデックスを追跡
	const goodsIndices = new Set<number>();
	
	for (const [key, value] of formData.entries()) {
		const goodsMatch = key.match(/^goods\[(\d+)\]\[(\w+)\]$/);
		
		if (goodsMatch) {
			const index = parseInt(goodsMatch[1]);
			const field = goodsMatch[2];
			
			goodsIndices.add(index);
			
			if (!data.goods[index]) {
				data.goods[index] = {};
			}
			
			// 型に応じて値を変換
			if (field === 'quantity' || field === 'unitPrice' || field === 'unitAdjustment') {
				data.goods[index][field] = parseInt(value as string);
			} else {
				data.goods[index][field] = value;
			}
		} else {
			// goods以外のフィールド
			if (key === 'caseAdjustment') {
				data[key] = parseInt(value as string);
			} else if (value === '') {
				data[key] = null;
			} else {
				data[key] = value;
			}
		}
	}
	
	// 配列の穴を削除
	data.goods = data.goods.filter(Boolean);
	
	// 空の場合はundefinedに
	if (data.goods.length === 0) {
		data.goods = undefined;
	}
	
	console.log("Parsed data:", data);
	
	// Zodで検証
	const result = updateSasCaseSchema.safeParse(data);
	
	if (!result.success) {
		console.log("Validation error:", result.error.flatten());
		return {
			result: {
				status: "error" as const,
				error: result.error.flatten().fieldErrors,
			}
		};
	}

	try {
		const updateResult = await update(id, result.data);
		console.log("Update successful:", updateResult);
		return {
			result: {
				status: "success" as const,
			},
			data: updateResult,
		};
	} catch (error) {
		console.error("Update error:", error);
		return {
			result: {
				status: "error" as const,
				error: {
					"": [error instanceof Error ? error.message : "エラーが発生しました"],
				},
			},
		};
	}
}
