"use client";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useState } from "react";
import { staffCodeSchema } from "@/features/auth/schema/auth";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function StaffCodeLock() {
	const { unlockWithStaffCode } = useAuth();
	const [error, setError] = useState<string | null>(null);

	const [form, fields] = useForm({
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: staffCodeSchema });
		},
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
	});

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const submission = parseWithZod(formData, { schema: staffCodeSchema });

		if (submission.status !== "success") {
			return;
		}

		try {
			await unlockWithStaffCode(submission.value.code);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "エラーが発生しました");
		}
	};

	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle>スタッフコード入力</CardTitle>
				<CardDescription>
					操作を続けるにはスタッフコードを入力してください
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					id={form.id}
					onSubmit={handleSubmit}
					className="space-y-4"
					noValidate
				>
					<div className="space-y-2">
						<Label htmlFor={fields.code.id}>
							スタッフコード
						</Label>
						<Input
							id={fields.code.id}
							name={fields.code.name}
							type="text"
							defaultValue={fields.code.defaultValue}
							aria-invalid={!fields.code.valid}
							aria-describedby={fields.code.errorId}
							placeholder="スタッフコードを入力"
						/>
						{fields.code.errors && (
							<p id={fields.code.errorId} className="text-sm text-destructive">
								{fields.code.errors}
							</p>
						)}
					</div>

					{error && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<Button type="submit" className="w-full">
						ロック解除
					</Button>
				</form>

				<p className="mt-4 text-center text-sm text-muted-foreground">
					テストコード: TESTCODE01
				</p>
			</CardContent>
		</Card>
	);
}
