"use server"

import { parseWithZod } from "@conform-to/zod"
import type { ActionResult } from "@/features/types"
import { staffCodeSchema } from "../schema/auth"

// TODO: 実際のスタッフコード検証APIを実装
const MOCK_STAFF_CODES = [
	{ code: "TESTCODE01", id: "1", name: "テストスタッフ", storeId: "1" },
]

export async function unlockWithStaffCodeAction(
	_prevState: unknown,
	formData: FormData,
): Promise<ActionResult> {
	const submission = parseWithZod(formData, { schema: staffCodeSchema })

	if (submission.status !== "success") {
		return { result: submission.reply() }
	}

	// モックデータでスタッフコードを検証
	const staff = MOCK_STAFF_CODES.find(
		(s) => s.code === submission.value.code,
	)

	if (!staff) {
		return {
			result: {
				status: "error" as const,
				error: {
					code: ["スタッフコードが正しくありません"],
				},
			},
		}
	}

	// 実際の実装では、ここでセッションストレージやCookieに保存
	return {
		result: {
			status: "success" as const,
		},
		data: staff,
	}
}