"use server";

import { parseWithZod } from "@conform-to/zod";
import type { ActionResult } from "@/features/types";
import { staffCodeSchema } from "../schema/auth";
import type { Staff } from "@/features/staffs/types";
import { createServerContext } from "@/lib/context/server-context";
import { StaffsClient } from "@/lib/recore/staffs";
import { convertRecoreStaffToStaff } from "@/features/staffs/recore/convert";

export async function unlockWithStaffCodeAction(
	_prevState: unknown,
	formData: FormData,
): Promise<ActionResult<Staff>> {
	const submission = parseWithZod(formData, { schema: staffCodeSchema });

	if (submission.status !== "success") {
		return { result: submission.reply() };
	}

	const staffCode = submission.value.code.toUpperCase();

	try {
		// ReCORE APIからスタッフ情報を取得
		const context = await createServerContext();
		const client = new StaffsClient(context);
		const recoreStaff = await client.getByCode(staffCode);

		if (!recoreStaff) {
			return {
				result: {
					status: "error" as const,
					error: {
						code: ["スタッフコードが正しくありません"],
					},
				},
			};
		}

		const staff = convertRecoreStaffToStaff(recoreStaff);
		return {
			result: {
				status: "success" as const,
			},
			data: staff,
		};
	} catch (error) {
		console.error("Staff code verification error:", error);

		return {
			result: {
				status: "error" as const,
				error: {
					code: ["スタッフコードの確認中にエラーが発生しました"],
				},
			},
		};
	}
}
