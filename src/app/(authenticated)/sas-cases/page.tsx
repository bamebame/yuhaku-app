"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SasCasesList } from "@/features/sas_cases/components/list";
import { SasCasesListSkeleton } from "@/features/sas_cases/components/list-skeleton";
import { PosButton } from "@/components/pos/button";
import { Plus } from "lucide-react";
import { createEmptySasCase } from "@/features/sas_cases/actions/create-empty";

export default function SasCasesPage() {
	const router = useRouter();
	const [isCreating, setIsCreating] = useState(false);

	// 新規販売ケース作成
	const handleCreateNewCase = async () => {
		try {
			setIsCreating(true);
			const newCase = await createEmptySasCase();
			// 作成されたケースの編集ページへ遷移
			router.push(`/sas-cases/${newCase.id}`);
		} catch (error) {
			console.error("販売ケースの作成に失敗しました:", error);
			// より詳細なエラー情報を表示
			const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました";
			alert(`販売ケースの作成に失敗しました。\n\nエラー: ${errorMessage}\n\nもう一度お試しください。`);
		} finally {
			setIsCreating(false);
		}
	};

	// ショートカットキーの設定
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			// F1キーで新規販売開始
			if (e.key === "F1" && !isCreating) {
				e.preventDefault();
				handleCreateNewCase();
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [isCreating]);
	return (
		<div className="p-4 max-w-7xl mx-auto">
			{/* 大きな新規販売開始ボタン */}
			<div className="mb-6">
				<PosButton 
					size="xl" 
					className="w-full h-24 text-2xl font-bold shadow-lg"
					onClick={handleCreateNewCase}
					disabled={isCreating}
				>
					<Plus className="mr-3 h-8 w-8" />
					{isCreating ? "作成中..." : "新規販売開始"}
				</PosButton>
			</div>

			{/* 進行中の販売ケース */}
			<div className="bg-pos-background border-2 border-pos-border rounded-lg p-4">
				<h2 className="text-xl font-bold mb-4 flex items-center">
					<span className="bg-pos-primary text-white px-3 py-1 rounded-sm mr-2 text-sm">
						進行中
					</span>
					販売ケース一覧
				</h2>
				<Suspense fallback={<SasCasesListSkeleton />}>
					<SasCasesList />
				</Suspense>
			</div>

			{/* ショートカットキーのヒント */}
			<div className="mt-4 text-sm text-pos-muted text-center">
				ヒント: F1キーで新規販売を開始できます
			</div>
		</div>
	);
}
