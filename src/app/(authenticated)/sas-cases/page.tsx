"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SasCasesList } from "@/features/sas_cases/components/list";
import { SasCasesListSkeleton } from "@/features/sas_cases/components/list-skeleton";
import { PosButton } from "@/components/pos/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function SasCasesPage() {
	const router = useRouter();

	// ショートカットキーの設定
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			// F1キーで新規販売開始
			if (e.key === "F1") {
				e.preventDefault();
				router.push("/sas-cases/new");
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [router]);
	return (
		<div className="p-4 max-w-7xl mx-auto">
			{/* 大きな新規販売開始ボタン */}
			<div className="mb-6">
				<Link href="/sas-cases/new">
					<PosButton 
						size="xl" 
						className="w-full h-24 text-2xl font-bold shadow-lg"
					>
						<Plus className="mr-3 h-8 w-8" />
						新規販売開始
					</PosButton>
				</Link>
			</div>

			{/* 進行中の販売ケース */}
			<div className="bg-pos-background border-2 border-pos-border rounded-lg p-4">
				<h2 className="text-xl font-bold mb-4 flex items-center">
					<span className="bg-pos-foreground text-white px-3 py-1 rounded-sm mr-2 text-sm">
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
