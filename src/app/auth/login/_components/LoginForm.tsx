"use client"

import { useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { useFormState } from "react-dom"
import { loginAction } from "@/features/auth/actions"
import { loginSchema } from "@/features/auth/schema/auth"

export function LoginForm() {
	const [lastResult, action] = useFormState(loginAction, undefined)

	const [form, fields] = useForm({
		lastResult: lastResult?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: loginSchema })
		},
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
	})

	return (
		<form
			id={form.id}
			onSubmit={form.onSubmit}
			action={action}
			className="space-y-4"
			noValidate
		>
			<div className="space-y-2">
				<label
					htmlFor={fields.email.id}
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					メールアドレス
				</label>
				<input
					id={fields.email.id}
					name={fields.email.name}
					type="email"
					defaultValue={fields.email.defaultValue}
					aria-invalid={!fields.email.valid}
					aria-describedby={fields.email.errorId}
					className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
					placeholder="user@example.com"
				/>
				{fields.email.errors && (
					<p
						id={fields.email.errorId}
						className="text-sm text-destructive"
					>
						{fields.email.errors}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<label
					htmlFor={fields.password.id}
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					パスワード
				</label>
				<input
					id={fields.password.id}
					name={fields.password.name}
					type="password"
					defaultValue={fields.password.defaultValue}
					aria-invalid={!fields.password.valid}
					aria-describedby={fields.password.errorId}
					className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
					placeholder="••••••••"
				/>
				{fields.password.errors && (
					<p
						id={fields.password.errorId}
						className="text-sm text-destructive"
					>
						{fields.password.errors}
					</p>
				)}
			</div>

			{form.errors && (
				<div className="rounded-md bg-destructive/15 p-3">
					<p className="text-sm text-destructive">{form.errors}</p>
				</div>
			)}

			<button
				type="submit"
				className="inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
			>
				ログイン
			</button>
		</form>
	)
}