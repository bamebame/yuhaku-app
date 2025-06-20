"use server"

import { parseWithZod } from "@conform-to/zod"
import { redirect } from "next/navigation"
import type { ActionResult } from "@/features/types"
import { createClient } from "@/lib/supabase/server"
import { loginSchema } from "../schema/auth"

export async function loginAction(
	_prevState: unknown,
	formData: FormData,
): Promise<ActionResult> {
	const submission = parseWithZod(formData, { schema: loginSchema })

	if (submission.status !== "success") {
		return { result: submission.reply() }
	}

	const supabase = await createClient()

	const { error } = await supabase.auth.signInWithPassword({
		email: submission.value.email,
		password: submission.value.password,
	})

	if (error) {
		return {
			result: {
				status: "error" as const,
				error: {
					"": ["メールアドレスまたはパスワードが正しくありません"],
				},
			},
		}
	}

	redirect("/")
}