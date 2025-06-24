"use client";

import { useRouter } from "next/navigation";
import { PosCard, PosCardHeader, PosCardContent, PosButton, PosBadge } from "@/components/pos";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ShoppingCart, User, Calendar, ArrowRight } from "lucide-react";
import type { SasCase } from "@/features/sas_cases/types";

interface SasCasesListProps {
	cases: SasCase[];
}

export function SasCasesList({ cases }: SasCasesListProps) {
	const router = useRouter();

	if (!cases || cases.length === 0) {
		return (
			<div className="text-center py-8 text-pos-muted">
				販売ケースがありません
			</div>
		);
	}

	const handleContinue = (caseId: string) => {
		router.push(`/sas-cases/${caseId}`);
	};

	return (
		<div className="grid gap-4 grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
			{cases.map((sasCase) => (
				<PosCard
					key={sasCase.id}
					className="hover:shadow-lg transition-shadow cursor-pointer min-w-[200px]"
					onClick={() => handleContinue(sasCase.id)}
				>
					<PosCardHeader className="pb-3">
						<div className="flex justify-between items-start">
							<div>
								<h3 className="font-semibold text-pos-base">{sasCase.code}</h3>
								<PosBadge
									variant={
										sasCase.status === "IN_PROGRESS" ? "default" : "secondary"
									}
									className="mt-1"
								>
									{sasCase.status === "IN_PROGRESS" ? "進行中" : "完了"}
								</PosBadge>
							</div>
							<ShoppingCart className="h-5 w-5 text-pos-muted" />
						</div>
					</PosCardHeader>
					<PosCardContent>
						<div className="space-y-2 text-pos-sm">
							<div className="flex items-center gap-2 text-pos-muted">
								<User className="h-4 w-4" />
								<span>{sasCase.staff?.name || "未設定"}</span>
							</div>
							<div className="flex items-center gap-2 text-pos-muted">
								<Calendar className="h-4 w-4" />
								<span>
									{format(sasCase.createdAt, "MM/dd HH:mm", { locale: ja })}
								</span>
							</div>
							{sasCase.memberId && (
								<div className="flex items-center gap-2 text-pos-muted">
									<User className="h-4 w-4" />
									<span>会員ID: {sasCase.memberId}</span>
								</div>
							)}
							<div className="flex justify-between items-center pt-2">
								<div>
									<p className="text-pos-xs text-pos-muted">商品数</p>
									<p className="font-semibold">{sasCase.summary.quantity}点</p>
								</div>
								<div className="text-right">
									<p className="text-pos-xs text-pos-muted">合計金額</p>
									<p className="font-semibold">
										¥{sasCase.summary.total.toLocaleString()}
									</p>
								</div>
							</div>
						</div>
						<div className="mt-4 flex justify-end">
							<PosButton
								size="sm"
								variant={sasCase.status === "IN_PROGRESS" ? "default" : "outline"}
								onClick={(e) => {
									e.stopPropagation();
									handleContinue(sasCase.id);
								}}
							>
								{sasCase.status === "IN_PROGRESS" ? "販売を続ける" : "詳細を見る"}
								<ArrowRight className="ml-2 h-4 w-4" />
							</PosButton>
						</div>
					</PosCardContent>
				</PosCard>
			))}
		</div>
	);
}