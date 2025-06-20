"use server"

import { parseWithZod } from "@conform-to/zod"
import type { ActionResult } from "@/features/types"
import { checkoutSasCaseSchema } from "../schema"
import { checkout } from "./checkout"

export async function checkoutSasCaseFormAction(
	_prevState: unknown,
	formData: FormData,
): Promise<ActionResult<void>> {
	const submission = parseWithZod(formData, {
		schema: checkoutSasCaseSchema,
	})

	if (submission.status !== "success") {
		return { result: submission.reply() }
	}

	try {
		const { id, charges } = submission.value
		await checkout(id, { charges })
		return {
			result: submission.reply({ resetForm: false }),
		}
	} catch (error) {
		return {
			result: {
				status: "error" as const,
				error: {
					"": [error instanceof Error ? error.message : "エラーが発生しました"],
				},
			},
		}
	}
}