"use server"

import { parseWithZod } from "@conform-to/zod"
import type { ActionResult } from "@/features/types"
import { updateSasCaseSchema } from "../schema"
import type { SasCase } from "../types"
import { update } from "./update"

export async function updateSasCaseFormAction(
	_prevState: unknown,
	formData: FormData,
): Promise<ActionResult<SasCase>> {
	const submission = parseWithZod(formData, { schema: updateSasCaseSchema })

	if (submission.status !== "success") {
		return { result: submission.reply() }
	}

	try {
		const { id, ...input } = submission.value
		const result = await update(id, input)
		return {
			result: submission.reply({ resetForm: false }),
			data: result,
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