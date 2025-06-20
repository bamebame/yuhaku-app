import { z } from "zod"

export const loginSchema = z.object({
	email: z.string().email("有効なメールアドレスを入力してください"),
	password: z.string().min(6, "パスワードは6文字以上で入力してください"),
})

export const staffCodeSchema = z.object({
	code: z.string().min(1, "スタッフコードを入力してください"),
})