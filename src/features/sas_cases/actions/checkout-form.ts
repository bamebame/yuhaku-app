"use server";

import type { ActionResult } from "@/features/types";
import { checkoutSasCaseSchema } from "../schema";
import { checkout } from "./checkout";

export async function checkoutSasCaseFormAction(
	id: string,
	_prevState: unknown,
	formData: FormData,
): Promise<ActionResult<void>> {
	console.log("checkoutSasCaseFormAction called with id:", id);
	
	// FormDataから手動でデータを抽出
	const data: { charges: Array<Record<string, unknown>> } = {
		charges: []
	};
	
	// charges配列のインデックスを追跡
	const chargeIndices = new Set<number>();
	
	for (const [key, value] of formData.entries()) {
		const chargeMatch = key.match(/^charges\[(\d+)\]\[(\w+)\]$/);
		
		if (chargeMatch) {
			const index = parseInt(chargeMatch[1]);
			const field = chargeMatch[2];
			
			chargeIndices.add(index);
			
			if (!data.charges[index]) {
				data.charges[index] = {};
			}
			
			// 型に応じて値を変換
			if (field === 'amount') {
				data.charges[index][field] = parseInt(value as string);
			} else {
				data.charges[index][field] = value;
			}
		}
	}
	
	// 配列の穴を削除
	data.charges = data.charges.filter(Boolean);
	
	console.log("Parsed checkout data:", data);
	
	// Zodで検証
	const result = checkoutSasCaseSchema.safeParse(data);
	
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
		await checkout(id, { charges: result.data.charges });
		return {
			result: {
				status: "success" as const,
			},
		};
	} catch (error) {
		console.error("Checkout error:", error);
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
