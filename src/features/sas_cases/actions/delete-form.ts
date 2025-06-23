"use server";

import { parseWithZod } from "@conform-to/zod";
import type { ActionResult } from "@/features/types";
import { deleteSasCaseSchema } from "../schema";
import { deleteSasCaseAction } from "./delete";

export async function deleteSasCaseFormAction(
	_prevState: unknown,
	formData: FormData,
): Promise<ActionResult<void>> {
	const submission = parseWithZod(formData, { schema: deleteSasCaseSchema });

	if (submission.status !== "success") {
		return { result: submission.reply() };
	}

	try {
		await deleteSasCaseAction(submission.value.id);
		return {
			result: submission.reply({ resetForm: false }),
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
