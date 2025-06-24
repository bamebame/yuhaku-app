"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { SasCase } from "@/features/sas_cases/types";
import type { Product } from "@/features/products/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { PosCard, PosCardHeader, PosCardTitle, PosCardContent, PosButton } from "@/components/pos";
import { CheckCircle, Printer, FileText, User, ShoppingCart, ArrowLeft, Plus } from "lucide-react";
import { useReceiptPrinter } from "@/features/receipt/hooks/use-receipt-printer";
import { PrinterSettingsDialog } from "@/features/receipt/components";
import { useToast } from "@/hooks/use-toast";
import { createEmptySasCase } from "@/features/sas_cases/actions/create-empty";
import type { 
  ReceiptData, 
  ReceiptCartItem, 
  PaymentInfo,
  StoreInfo,
  TransactionInfo,
  ReceiptSummary 
} from "@/lib/receipt-printer";

interface CompletedSummaryProps {
	sasCase: SasCase;
	charges?: Array<{
		payment: {
			id: number;
			name: string;
			type: string;
		};
		amount: number;
		change: number;
	}>;
}

export function CompletedSummary({ sasCase, charges }: CompletedSummaryProps) {
	const router = useRouter();
	const { toast } = useToast();
	const [isPrinting, setIsPrinting] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [productMap, setProductMap] = useState<Map<string, Product>>(new Map());

	// レシートプリンター
	const receiptPrinter = useReceiptPrinter({
		autoConnect: false,
		onError: (error) => {
			console.error("プリンターエラー:", error);
			toast({
				title: "プリンターエラー",
				description: error.message,
				variant: "destructive",
			});
		}
	});
	
	// 商品情報を取得（productNameがない場合のみ）
	useEffect(() => {
		const fetchProducts = async () => {
			// productNameがないgoodsのみ取得
			const goodsNeedingInfo = sasCase.goods.filter(g => !g.productName);
			if (goodsNeedingInfo.length === 0) return;
			
			// itemIdを収集
			const itemIds = [...new Set(goodsNeedingInfo.map(g => g.itemId))];
			
			try {
				// まず/api/itemsでitemIdからproductIdを取得
				const itemsResponse = await fetch(`/api/items?ids=${itemIds.join(',')}`);
				if (!itemsResponse.ok) return;
				
				const itemsData = await itemsResponse.json();
				if (!itemsData.data) return;
				
				// itemId -> productIdのマッピングを作成
				const itemToProductMap = new Map<string, string>();
				itemsData.data.forEach((item: any) => {
					if (item.productId) {
						itemToProductMap.set(item.id, item.productId);
					}
				});
				
				// productIdを収集
				const productIds = [...new Set(itemToProductMap.values())];
				if (productIds.length === 0) return;
				
				// 商品情報を取得
				const productsResponse = await fetch(`/api/products?ids=${productIds.join(',')}`);
				if (!productsResponse.ok) return;
				
				const productsData = await productsResponse.json();
				if (!productsData.data) return;
				
				// productId -> Productのマッピングを作成
				const productIdToProductMap = new Map<string, Product>();
				productsData.data.forEach((product: Product) => {
					productIdToProductMap.set(product.id, product);
				});
				
				// 最終的なitemId -> Productのマッピングを作成
				const newProductMap = new Map<string, Product>();
				itemToProductMap.forEach((productId, itemId) => {
					const product = productIdToProductMap.get(productId);
					if (product) {
						newProductMap.set(itemId, product);
					}
				});
				
				setProductMap(newProductMap);
			} catch (error) {
				console.error("商品情報の取得に失敗:", error);
			}
		};
		
		fetchProducts();
	}, [sasCase.goods]);

	// 新規販売ケース作成
	const handleCreateNewCase = async () => {
		try {
			setIsCreating(true);
			const newCase = await createEmptySasCase();
			// 作成されたケースの編集ページへ遷移
			router.push(`/sas-cases/${newCase.id}`);
		} catch (error) {
			console.error("販売ケースの作成に失敗しました:", error);
			toast({
				title: "エラー",
				description: "新規販売ケースの作成に失敗しました",
				variant: "destructive",
			});
		} finally {
			setIsCreating(false);
		}
	};

	// レシート再印刷
	const handlePrintReceipt = async () => {
		if (!receiptPrinter.isConnected) {
			toast({
				title: "エラー",
				description: "プリンターが接続されていません",
				variant: "destructive",
			});
			return;
		}

		setIsPrinting(true);
		try {
			const receiptData = createReceiptData();
			const result = await receiptPrinter.printReceipt(receiptData);
			
			if (!result.success) {
				throw new Error("レシート印刷に失敗しました");
			}
			
			toast({
				title: "成功",
				description: "レシートを印刷しました",
			});
		} catch (error) {
			toast({
				title: "印刷エラー",
				description: error instanceof Error ? error.message : "レシート印刷に失敗しました",
				variant: "destructive",
			});
		} finally {
			setIsPrinting(false);
		}
	};

	// レシートデータの作成
	const createReceiptData = (): ReceiptData => {
		const now = sasCase.doneAt || new Date();
		
		// 店舗情報
		const storeInfo: StoreInfo = {
			name: sasCase.store.name,
			address: "東京都渋谷区渋谷1-1-1",
			phone: "03-1234-5678",
			registerId: "01",
		};

		// 取引情報
		const transactionInfo: TransactionInfo = {
			id: sasCase.id,
			date: now,
			staffName: sasCase.staff?.name || "スタッフ",
			staffId: sasCase.staff?.id || "00001",
		};

		// カート商品をレシート商品に変換
		const receiptItems: ReceiptCartItem[] = sasCase.goods.map(item => {
			const product = productMap.get(item.itemId);
			return {
				id: item.id,
				code: item.productCode || item.itemId,
				name: item.productName || product?.title || item.itemId,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
				unitAdjustment: item.unitAdjustment,
				total: (item.unitPrice + item.unitAdjustment) * item.quantity,
			};
		});

		// サマリー情報
		const summary: ReceiptSummary = {
			subtotal: sasCase.summary.subTotal,
			caseAdjustment: sasCase.summary.caseAdjustment,
			couponDiscount: sasCase.summary.couponAdjustment,
			total: sasCase.summary.total,
			tax: sasCase.summary.taxes.reduce((sum, tax) => sum + tax.tax, 0),
			taxRate: 10, // メインの税率
		};

		// 支払い情報（chargesがある場合はそれを使用）
		const paymentInfo: PaymentInfo[] = charges ? charges.map(charge => ({
			method: charge.payment.type.toLowerCase() as 'cash' | 'credit' | 'electronic' | 'gift',
			methodName: charge.payment.name,
			amount: charge.amount,
		})) : [{
			method: 'cash',
			methodName: '現金',
			amount: sasCase.summary.total,
		}];

		// 預かり金額とお釣り
		const deposit = charges ? charges.reduce((sum, c) => sum + c.amount, 0) : sasCase.summary.total;
		const change = charges ? charges.reduce((sum, c) => sum + c.change, 0) : 0;

		return {
			store: storeInfo,
			transaction: transactionInfo,
			items: receiptItems,
			summary,
			payments: paymentInfo,
			deposit,
			change,
			memberId: sasCase.memberId || undefined,
			customerNote: sasCase.customerNote || undefined,
		};
	};

	return (
		<div className="min-h-screen bg-pos-light p-6">
			<div className="max-w-4xl mx-auto space-y-6">
				{/* ヘッダー */}
				<div className="flex items-center justify-between">
					<h1 className="text-pos-xl font-bold flex items-center gap-3">
						<CheckCircle className="h-8 w-8 text-green-600" />
						販売完了
					</h1>
					<PrinterSettingsDialog printer={receiptPrinter} />
				</div>

				{/* サマリーカード */}
				<PosCard>
					<PosCardHeader>
						<PosCardTitle className="text-pos-lg">販売サマリー</PosCardTitle>
					</PosCardHeader>
					<PosCardContent className="space-y-4">
						{/* 基本情報 */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-pos-muted">
									<FileText className="h-4 w-4" />
									<span className="text-pos-sm">ケース番号</span>
								</div>
								<p className="text-pos-base font-semibold">{sasCase.code}</p>
							</div>
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-pos-muted">
									<User className="h-4 w-4" />
									<span className="text-pos-sm">販売スタッフ</span>
								</div>
								<p className="text-pos-base font-semibold">{sasCase.cashier?.name || sasCase.staff?.name || "不明"}</p>
							</div>
						</div>

						{/* 顧客情報（会員の場合） */}
						{sasCase.memberId && (
							<div className="border-t border-pos-border pt-4">
								<div className="flex items-center gap-2 text-pos-muted mb-2">
									<User className="h-4 w-4" />
									<span className="text-pos-sm">会員情報</span>
								</div>
								<p className="text-pos-base font-semibold">会員ID: {sasCase.memberId}</p>
							</div>
						)}

						{/* 商品情報 */}
						<div className="border-t border-pos-border pt-4">
							<div className="flex items-center gap-2 text-pos-muted mb-2">
								<ShoppingCart className="h-4 w-4" />
								<span className="text-pos-sm">販売商品</span>
							</div>
							<div className="space-y-2">
								{sasCase.goods.map((item, index) => {
									const product = productMap.get(item.itemId);
									const productName = item.productName || product?.title || `商品 ${item.itemId}`;
									return (
										<div key={index} className="flex justify-between text-pos-base">
											<span className="flex-1 truncate pr-2">{productName} × {item.quantity}</span>
											<span className="flex-shrink-0">¥{((item.unitPrice + item.unitAdjustment) * item.quantity).toLocaleString()}</span>
										</div>
									);
								})}
							</div>
						</div>

						{/* 金額サマリー */}
						<div className="border-t border-pos-border pt-4">
							<div className="space-y-2">
								<div className="flex justify-between text-pos-base">
									<span>小計</span>
									<span>¥{sasCase.summary.subTotal.toLocaleString()}</span>
								</div>
								{sasCase.summary.caseAdjustment !== 0 && (
									<div className="flex justify-between text-pos-base">
										<span>ケース調整</span>
										<span>{sasCase.summary.caseAdjustment > 0 ? '+' : ''}¥{sasCase.summary.caseAdjustment.toLocaleString()}</span>
									</div>
								)}
								{sasCase.summary.couponAdjustment !== 0 && (
									<div className="flex justify-between text-pos-base">
										<span>クーポン割引</span>
										<span>¥{sasCase.summary.couponAdjustment.toLocaleString()}</span>
									</div>
								)}
							</div>
							<div className="flex justify-between text-pos-xl font-bold mt-4 pt-4 border-t border-pos-border">
								<span>合計金額</span>
								<span>¥{sasCase.summary.total.toLocaleString()}</span>
							</div>
						</div>

						{/* 決済情報 */}
						{charges && charges.length > 0 && (
							<div className="border-t border-pos-border pt-4">
								<div className="flex justify-between items-center mb-2">
									<p className="text-pos-sm text-pos-muted">決済情報</p>
									<PosButton
										variant="outline"
										size="sm"
										onClick={handlePrintReceipt}
										disabled={isPrinting}
									>
										<Printer className="mr-2 h-4 w-4" />
										レシート再発行
									</PosButton>
								</div>
								<div className="space-y-3">
									{charges.map((charge, index) => {
										const totalReceived = charge.amount;
										const change = charge.change;
										const actualPayment = totalReceived - change;
										
										return (
											<div key={index} className="space-y-1">
												<div className="flex justify-between text-pos-base">
													<span>{charge.payment.name}</span>
													<span>¥{actualPayment.toLocaleString()}</span>
												</div>
												<div className="flex justify-between text-pos-sm text-pos-muted pl-4">
													<span>お預かり</span>
													<span>¥{totalReceived.toLocaleString()}</span>
												</div>
												<div className="flex justify-between text-pos-sm text-pos-muted pl-4">
													<span>お釣り</span>
													<span>¥{change.toLocaleString()}</span>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						)}

						{/* 完了日時 */}
						<div className="border-t border-pos-border pt-4">
							<p className="text-pos-sm text-pos-muted">
								完了日時: {sasCase.doneAt ? format(sasCase.doneAt, "yyyy年MM月dd日 HH:mm", { locale: ja }) : "不明"}
							</p>
						</div>

						{/* アクションボタン */}
						<div className="border-t border-pos-border pt-4 flex gap-2">
							<PosButton
								variant="outline"
								onClick={() => router.push("/sas-cases")}
								className="flex-1"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								一覧に戻る
							</PosButton>
							<PosButton
								variant="default"
								onClick={handleCreateNewCase}
								disabled={isCreating}
								className="flex-1"
							>
								{isCreating ? (
									<>
										<div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
										作成中...
									</>
								) : (
									<>
										<Plus className="mr-2 h-4 w-4" />
										新しい販売を開始
									</>
								)}
							</PosButton>
						</div>
					</PosCardContent>
				</PosCard>
			</div>
		</div>
	);
}