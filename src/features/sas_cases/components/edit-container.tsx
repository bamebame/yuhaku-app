"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useSasCaseEditStore } from "@/features/sas_cases/stores/edit-store";
import { SasCaseEditHeader } from "./edit-header";
import { ProductSelectionPanel } from "./product-selection-panel";
import { CartPanel } from "./cart-panel";
import { CustomerInfoPanel } from "./customer-info-panel";
import { CompletedSummary } from "./completed-summary";
import { useToast } from "@/hooks/use-toast";
import { PosTabs, PosTabsContent, PosTabsList, PosTabsTrigger } from "@/components/pos";
import { PosTwoColumnLayout } from "@/components/pos/layout";
import { ShoppingCart, User } from "lucide-react";
import type { SasCase } from "@/features/sas_cases/types";
import type { CheckoutInfo } from "@/lib/recore/sas_cases/checkout";

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
	} = useSWR<{ data: SasCase }>(`/api/sas-cases/${caseId}`, fetcher, {
		refreshInterval: 5000, // 5秒ごとに更新
	});
	const { toast } = useToast();
	const initialize = useSasCaseEditStore((state) => state.initialize);
	const reset = useSasCaseEditStore((state) => state.reset);
	const updateOriginalCase = useSasCaseEditStore((state) => state.updateOriginalCase);
	const [activeTab, setActiveTab] = useState("cart");
	const [checkoutInfo, setCheckoutInfo] = useState<CheckoutInfo | null>(null);

	const sasCase = response?.data;

	// 初期化（初回のみ）
	const [isInitialized, setIsInitialized] = useState(false);
	
	useEffect(() => {
		if (sasCase && !isInitialized) {
			// 基本的な初期化を実行（商品情報の解決も含む）
			initialize(caseId, sasCase);
			setIsInitialized(true);
		} else if (sasCase && isInitialized) {
			// 既に初期化済みの場合は、originalCaseのみ更新
			updateOriginalCase(sasCase);
		}
	}, [sasCase, caseId, initialize, updateOriginalCase, isInitialized]);
	
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
	
	// 販売完了時のチェックアウト情報を取得
	useEffect(() => {
		if (sasCase && sasCase.status !== "IN_PROGRESS") {
			const fetchCheckoutInfo = async () => {
				try {
					const response = await fetch(`/api/sas-cases/${caseId}/checkout`);
					if (response.ok) {
						const data = await response.json();
						setCheckoutInfo(data.data);
					}
				} catch (error) {
					console.error("Failed to fetch checkout info:", error);
				}
			};
			fetchCheckoutInfo();
		}
	}, [sasCase, caseId]);

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
		return <CompletedSummary sasCase={sasCase} charges={checkoutInfo?.charges} />;
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
