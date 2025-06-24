"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useSasCaseEditStore } from "@/features/sas_cases/stores/edit-store";
import { SasCaseEditHeader } from "./edit-header";
import { ProductSelectionPanel } from "./product-selection-panel";
import { CartPanel } from "./cart-panel";
import { CustomerInfoPanel } from "./customer-info-panel";
import { useToast } from "@/hooks/use-toast";
import { PosTabs, PosTabsContent, PosTabsList, PosTabsTrigger } from "@/components/pos";
import { PosTwoColumnLayout } from "@/components/pos/layout";
import { ShoppingCart, User } from "lucide-react";
import type { SasCase } from "@/features/sas_cases/types";

interface SasCaseEditContainerProps {
	caseId: string;
}

const fetcher = async (url: string) => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error("Failed to fetch");
	}
	return response.json();
};

export function SasCaseEditContainer({ caseId }: SasCaseEditContainerProps) {
	const {
		data: response,
		error,
		isLoading,
	} = useSWR<{ data: SasCase }>(`/api/sas-cases/${caseId}`, fetcher);
	const { toast } = useToast();
	const initialize = useSasCaseEditStore((state) => state.initialize);
	const reset = useSasCaseEditStore((state) => state.reset);
	const [activeTab, setActiveTab] = useState("cart");

	const sasCase = response?.data;

	// 初期化（初回のみ）
	const [isInitialized, setIsInitialized] = useState(false);
	
	useEffect(() => {
		if (sasCase && !isInitialized) {
			// 基本的な初期化を実行（商品情報の解決も含む）
			initialize(caseId, sasCase);
			setIsInitialized(true);
		}
	}, [sasCase, caseId, initialize, isInitialized]);
	
	// クリーンアップ
	useEffect(() => {
		return () => {
			reset();
			setIsInitialized(false);
		};
	}, [reset]);

	// エラー処理
	useEffect(() => {
		if (error) {
			toast({
				title: "エラー",
				description: "販売ケースの取得に失敗しました",
				variant: "destructive",
			});
		}
	}, [error, toast]);

	if (isLoading) {
		return null; // Skeletonはpage.tsxで表示
	}

	if (!sasCase) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-muted-foreground">販売ケースが見つかりません</p>
			</div>
		);
	}

	if (sasCase.status !== "IN_PROGRESS") {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-muted-foreground">
					完了済みの販売ケースは編集できません
				</p>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col overflow-hidden">
			<SasCaseEditHeader />
			<PosTwoColumnLayout
				className="flex-1"
				left={<ProductSelectionPanel />}
				right={
					<PosTabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
						<PosTabsList className="grid w-full grid-cols-2 flex-shrink-0">
							<PosTabsTrigger value="cart" className="flex items-center gap-2">
								<ShoppingCart className="h-4 w-4" />
								カート
							</PosTabsTrigger>
							<PosTabsTrigger value="customer" className="flex items-center gap-2">
								<User className="h-4 w-4" />
								顧客情報
							</PosTabsTrigger>
						</PosTabsList>
						<PosTabsContent value="cart" className="flex-1 overflow-hidden">
							<CartPanel />
						</PosTabsContent>
						<PosTabsContent value="customer" className="flex-1 overflow-hidden">
							<CustomerInfoPanel />
						</PosTabsContent>
					</PosTabs>
				}
			/>
		</div>
	);
}
