"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { SasCasesList } from "@/features/sas_cases/components/list";
import { SasCasesListSkeleton } from "@/features/sas_cases/components/list-skeleton";
import { SasCasesFilter, type FilterValues } from "@/features/sas_cases/components/list-filter";
import { Pagination } from "@/components/ui/pagination";
import { PosButton, PosTabs, PosTabsList, PosTabsTrigger, PosTabsContent } from "@/components/pos";
import { Plus, ShoppingCart, CheckCircle, List, Lock } from "lucide-react";
import { createEmptySasCase } from "@/features/sas_cases/actions/create-empty";
import { format } from "date-fns";
import type { SasCase } from "@/features/sas_cases/types";
import { useStaff } from "@/app/auth/providers/StaffProvider";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SasCasesPage() {
	const router = useRouter();
	const { logout } = useStaff();
	const [isCreating, setIsCreating] = useState(false);
	const [activeTab, setActiveTab] = useState("in-progress");
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState<FilterValues>({});
	
	// タブに応じたAPIパラメータを構築
	const buildApiUrl = useCallback(() => {
		const params = new URLSearchParams();
		params.append("limit", "250");
		params.append("page", page.toString());
		
		if (activeTab === "in-progress") {
			params.append("status", "IN_PROGRESS");
		} else if (activeTab === "today-done") {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			params.append("status", "DONE");
			params.append("done_at_from", format(today, "yyyy-MM-dd HH:mm:ss"));
		} else if (activeTab === "all") {
			// フィルタ適用
			if (filters.doneAtFrom) {
				params.append("done_at_from", filters.doneAtFrom);
			}
			if (filters.doneAtTo) {
				params.append("done_at_to", filters.doneAtTo);
			}
			if (filters.memberIds && filters.memberIds.length > 0) {
				params.append("member_ids", filters.memberIds.join(","));
			}
		}
		
		return `/api/sas-cases?${params.toString()}`;
	}, [activeTab, page, filters]);
	
	const { data, error, isLoading } = useSWR<{ data: SasCase[] }>(
		buildApiUrl(),
		fetcher,
		{
			refreshInterval: activeTab === "in-progress" ? 10000 : 30000, // 進行中は10秒、それ以外は30秒
		}
	);
	
	// 新規販売ケース作成
	const handleCreateNewCase = async () => {
		try {
			setIsCreating(true);
			const newCase = await createEmptySasCase();
			router.push(`/sas-cases/${newCase.id}`);
		} catch (error) {
			console.error("販売ケースの作成に失敗しました:", error);
			const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました";
			alert(`販売ケースの作成に失敗しました。\n\nエラー: ${errorMessage}\n\nもう一度お試しください。`);
		} finally {
			setIsCreating(false);
		}
	};
	
	// タブ変更時はページをリセット
	const handleTabChange = (value: string) => {
		setActiveTab(value);
		setPage(1);
	};
	
	// フィルタ変更時
	const handleFilterChange = (newFilters: FilterValues) => {
		setFilters(newFilters);
		setPage(1);
	};
	
	// 画面ロック
	const handleLock = () => {
		logout();
	};
	
	const cases = data?.data || [];
	const totalPages = Math.ceil(cases.length / 250); // API側で250件制限があるため
	
	return (
		<div className="h-full flex flex-col">
			{/* ヘッダー */}
			<div className="border-b-3 border-pos-border px-4 py-3 flex items-center justify-between bg-pos-background">
				<h1 className="text-pos-lg font-semibold flex items-center gap-2">
					<List className="h-5 w-5" />
					販売ケース一覧
				</h1>
				<div className="flex items-center gap-2">
					<PosButton
						size="default"
						variant="outline"
						onClick={handleLock}
					>
						<Lock className="mr-2 h-4 w-4" />
						画面ロック
					</PosButton>
					<PosButton 
						size="default" 
						onClick={handleCreateNewCase}
						disabled={isCreating}
					>
						<Plus className="mr-2 h-4 w-4" />
						新規販売開始
					</PosButton>
				</div>
			</div>
			
			{/* タブ */}
			<PosTabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col p-6">
				<PosTabsList className="grid w-full grid-cols-3 mb-6">
					<PosTabsTrigger value="in-progress" className="flex items-center gap-2">
						<ShoppingCart className="h-4 w-4" />
						進行中
					</PosTabsTrigger>
					<PosTabsTrigger value="today-done" className="flex items-center gap-2">
						<CheckCircle className="h-4 w-4" />
						本日完了
					</PosTabsTrigger>
					<PosTabsTrigger value="all" className="flex items-center gap-2">
						<List className="h-4 w-4" />
						すべて
					</PosTabsTrigger>
				</PosTabsList>
				
				{/* 進行中タブ */}
				<PosTabsContent value="in-progress" className="flex-1 overflow-auto">
					{isLoading ? (
						<SasCasesListSkeleton />
					) : error ? (
						<div className="text-center py-8 text-destructive">
							エラーが発生しました
						</div>
					) : (
						<SasCasesList cases={cases} />
					)}
				</PosTabsContent>
				
				{/* 本日完了タブ */}
				<PosTabsContent value="today-done" className="flex-1 overflow-auto">
					{isLoading ? (
						<SasCasesListSkeleton />
					) : error ? (
						<div className="text-center py-8 text-destructive">
							エラーが発生しました
						</div>
					) : (
						<SasCasesList cases={cases} />
					)}
				</PosTabsContent>
				
				{/* すべてタブ */}
				<PosTabsContent value="all" className="flex-1 overflow-auto space-y-6">
					<SasCasesFilter onFilterChange={handleFilterChange} />
					
					{isLoading ? (
						<SasCasesListSkeleton />
					) : error ? (
						<div className="text-center py-8 text-destructive">
							エラーが発生しました
						</div>
					) : (
						<>
							<SasCasesList cases={cases} />
							{totalPages > 1 && (
								<Pagination
									currentPage={page}
									totalPages={totalPages}
									onPageChange={setPage}
									className="mt-6"
								/>
							)}
						</>
					)}
				</PosTabsContent>
			</PosTabs>
		</div>
	);
}
