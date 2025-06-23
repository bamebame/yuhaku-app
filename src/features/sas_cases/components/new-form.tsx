"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PosButton } from "@/components/pos";
import { useToast } from "@/hooks/use-toast";
import { createSasCaseFormAction } from "@/features/sas_cases/actions";
import { Save } from "lucide-react";

export function SasCaseNewForm() {
	const router = useRouter();
	const { toast } = useToast();
	const [isCreating, setIsCreating] = useState(false);

	const handleCreate = async () => {
		setIsCreating(true);
		try {
			// 空のフォームデータで作成（サーバー側でデフォルト値を設定）
			const formData = new FormData();
			const result = await createSasCaseFormAction(null, formData);

			if (result.data) {
				toast({
					title: "作成しました",
					description: "新しい販売ケースを作成しました",
				});
				// 編集画面に遷移
				router.push(`/sas-cases/${result.data.id}`);
			} else {
				throw new Error("作成に失敗しました");
			}
		} catch (error) {
			toast({
				title: "エラー",
				description: "販売ケースの作成に失敗しました",
				variant: "destructive",
			});
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<div className="space-y-6">
			<p className="text-pos-muted">
				新しい販売ケースを作成します。作成後、商品の追加や顧客情報の入力ができます。
			</p>
			<div className="flex justify-end">
				<PosButton onClick={handleCreate} disabled={isCreating}>
					<Save className="mr-2 h-4 w-4" />
					{isCreating ? "作成中..." : "販売ケースを作成"}
				</PosButton>
			</div>
		</div>
	);
}