"use server";

import { parseWithZod } from "@conform-to/zod";
import type { ActionResult } from "@/features/types";
import { createSasCaseSchema } from "../schema";
import type { SasCase } from "../types";
import { create } from "./create";

export async function createSasCaseFormAction(
	_prevState: unknown,
	formData: FormData,
): Promise<ActionResult<SasCase>> {
	const submission = parseWithZod(formData, { schema: createSasCaseSchema });

	if (submission.status !== "success") {
		return { result: submission.reply() };
	}

	try {
		const result = await create(submission.value);
		return {
			result: submission.reply({ resetForm: false }),
			data: result,
		};
	} catch (error) {
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
