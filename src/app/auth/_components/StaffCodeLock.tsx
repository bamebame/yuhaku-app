"use client"

import { useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { useState } from "react"
import { staffCodeSchema } from "@/features/auth/schema/auth"
import { useAuth } from "../hooks/useAuth"

export function StaffCodeLock() {
	const { unlockWithStaffCode } = useAuth()
	const [error, setError] = useState<string | null>(null)

	const [form, fields] = useForm({
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: staffCodeSchema })
		},
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
	})

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		const submission = parseWithZod(formData, { schema: staffCodeSchema })

		if (submission.status !== "success") {
			return
		}

		try {
			await unlockWithStaffCode(submission.value.code)
			setError(null)
		} catch (err) {
			setError(err instanceof Error ? err.message : "エラーが発生しました")
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<div className="w-full max-w-sm space-y-6">
				<div className="text-center">
					<h1 className="text-2xl font-bold">スタッフコード入力</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						操作を続けるにはスタッフコードを入力してください
					</p>
				</div>

				<form
					id={form.id}
					onSubmit={handleSubmit}
					className="space-y-4"
					noValidate
				>
					<div className="space-y-2">
						<label
							htmlFor={fields.code.id}
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							スタッフコード
						</label>
						<input
							id={fields.code.id}
							name={fields.code.name}
							type="text"
							defaultValue={fields.code.defaultValue}
							aria-invalid={!fields.code.valid}
							aria-describedby={fields.code.errorId}
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
							placeholder="スタッフコードを入力"
						/>
						{fields.code.errors && (
							<p
								id={fields.code.errorId}
								className="text-sm text-destructive"
							>
								{fields.code.errors}
							</p>
						)}
					</div>

					{error && (
						<div className="rounded-md bg-destructive/15 p-3">
							<p className="text-sm text-destructive">{error}</p>
						</div>
					)}

					<button
						type="submit"
						className="inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
					>
						ロック解除
					</button>
				</form>

				<p className="text-center text-sm text-muted-foreground">
					テストコード: TESTCODE01
				</p>
			</div>
		</div>
	)
}