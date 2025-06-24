"use client";

import { useSasCaseEditStore } from "@/features/sas_cases/stores/edit-store";
import { CartItem } from "./cart-item";
import { CheckoutDialog, type PaymentData } from "./checkout-dialog";
import { ShoppingCart, Edit2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PosButton, PosInput } from "@/components/pos";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkoutSasCaseFormAction } from "@/features/sas_cases/actions";
import { useToast } from "@/hooks/use-toast";
import { useReceiptPrinter } from "@/features/receipt/hooks/use-receipt-printer";
import type { 
  ReceiptData, 
  ReceiptCartItem, 
  PaymentInfo,
  StoreInfo,
  TransactionInfo,
  ReceiptSummary 
} from "@/lib/receipt-printer";
import { PrinterSettingsDialog } from "@/features/receipt/components";

export function CartPanel() {
	const router = useRouter();
	const { toast } = useToast();
	const { caseId, cartItems, originalCase, updateCaseAdjustment } = useSasCaseEditStore();
	const [isEditingCaseAdjustment, setIsEditingCaseAdjustment] = useState(false);
	const [caseAdjustmentInput, setCaseAdjustmentInput] = useState("0");
	const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);

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

	// 表示用のアイテム（削除済みを除く）
	const visibleItems = cartItems.filter((item) => item.action !== "DELETE");

	// summaryからの値を使用（存在しない場合は手動計算）
	const summary = originalCase?.summary;
	const subtotal = summary?.subTotal || visibleItems.reduce(
		(sum, item) => sum + item.unitPrice * item.quantity,
		0,
	);
	const adjustmentTotal = visibleItems.reduce(
		(sum, item) => sum + item.unitAdjustment * item.quantity,
		0,
	);
	const caseAdjustment = summary?.caseAdjustment || 0;
	const couponAdjustment = summary?.couponAdjustment || 0;
	const total = summary?.total || (subtotal + adjustmentTotal + caseAdjustment + couponAdjustment);

	const handleCaseAdjustmentSave = () => {
		const adjustment = parseInt(caseAdjustmentInput) || 0;
		updateCaseAdjustment(adjustment);
		setIsEditingCaseAdjustment(false);
	};

	const handleCaseAdjustmentCancel = () => {
		setCaseAdjustmentInput(caseAdjustment.toString());
		setIsEditingCaseAdjustment(false);
	};

	const handleCheckout = async (payments: PaymentData[]) => {
		if (!caseId || !originalCase) return;

		try {
			// 支払い情報をcharges形式に変換
			const formData = new FormData();
			
			// charges配列をFormDataに追加
			payments.forEach((payment, index) => {
				formData.append(`charges[${index}][paymentId]`, payment.paymentId);
				formData.append(`charges[${index}][amount]`, payment.amount.toString());
			});

			// Server Actionを呼び出し
			const result = await checkoutSasCaseFormAction(caseId, null, formData);

			if (result.result?.status === "error") {
				toast({
					title: "エラー",
					description: result.result.error?.[""] || "チェックアウトに失敗しました",
					variant: "destructive",
				});
			} else if (result.data) {
				toast({
					title: "成功",
					description: "販売が完了しました",
				});
				
				// レシート印刷処理
				if (receiptPrinter.isConnected) {
					const receiptData = createReceiptData(payments);
					const printResult = await receiptPrinter.printReceipt(receiptData);
					
					if (!printResult.success) {
						toast({
							title: "印刷エラー",
							description: "レシート印刷に失敗しました。手動で印刷してください。",
							variant: "destructive",
						});
					}
				}
				
				// 一覧画面に戻る
				router.push("/sas-cases");
			}
		} catch (error) {
			toast({
				title: "エラー",
				description: "チェックアウト処理中にエラーが発生しました",
				variant: "destructive",
			});
		}
	};

	// レシートデータの作成
	const createReceiptData = (payments: PaymentData[]): ReceiptData => {
		const now = new Date();
		
		// 店舗情報（仮データ）
		const storeInfo: StoreInfo = {
			name: originalCase?.store.name || "YUHAKU 店舗",
			address: "東京都渋谷区渋谷1-1-1",
			phone: "03-1234-5678",
			registerId: "01",
		};

		// 取引情報
		const transactionInfo: TransactionInfo = {
			id: caseId || "",
			date: now,
			staffName: originalCase?.staff?.name || "スタッフ",
			staffId: originalCase?.staff?.id || "00001",
		};

		// カート商品をレシート商品に変換
		const receiptItems: ReceiptCartItem[] = visibleItems.map(item => ({
			id: item.id,
			code: item.product.code || "",
			name: item.product.title,
			quantity: item.quantity,
			unitPrice: item.unitPrice,
			unitAdjustment: item.unitAdjustment,
			total: (item.unitPrice + item.unitAdjustment) * item.quantity,
		}));

		// サマリー情報
		const apiSummary = originalCase?.summary;
		const subtotal = apiSummary?.subTotal || visibleItems.reduce(
			(sum, item) => sum + item.unitPrice * item.quantity,
			0,
		);
		const adjustmentTotal = visibleItems.reduce(
			(sum, item) => sum + item.unitAdjustment * item.quantity,
			0,
		);
		const caseAdjustment = apiSummary?.caseAdjustment || 0;
		const couponDiscount = apiSummary?.couponAdjustment || 0;
		const total = apiSummary?.total || (subtotal + adjustmentTotal + caseAdjustment + couponDiscount);

		// APIからの税額情報を使用（ない場合はデフォルト計算）
		let totalTax = 0;
		let mainTaxRate = 10;
		if (apiSummary?.taxes && apiSummary.taxes.length > 0) {
			totalTax = apiSummary.taxes.reduce((sum, tax) => sum + tax.tax, 0);
			// 最も多い税率をメインとして表示
			const generalTax = apiSummary.taxes.find(t => t.taxRateType === 'GENERAL');
			if (generalTax) mainTaxRate = 10;
			else {
				const reliefTax = apiSummary.taxes.find(t => t.taxRateType === 'RELIEF');
				if (reliefTax) mainTaxRate = 8;
			}
		} else {
			// デフォルトでは10%で計算
			totalTax = Math.floor(total * 0.1 / 1.1);
		}

		const summary: ReceiptSummary = {
			subtotal,
			caseAdjustment,
			couponDiscount,
			total,
			tax: totalTax,
			taxRate: mainTaxRate,
		};

		// 支払い情報
		const paymentInfo: PaymentInfo[] = payments.map(payment => ({
			method: payment.method as 'cash' | 'credit' | 'electronic' | 'gift',
			methodName: getPaymentMethodName(payment.method),
			amount: payment.amount,
		}));

		// 預かり金額とお釣り
		const deposit = payments.reduce((sum, p) => sum + p.amount, 0);
		const change = deposit - total;

		return {
			store: storeInfo,
			transaction: transactionInfo,
			items: receiptItems,
			summary,
			payments: paymentInfo,
			deposit,
			change,
			memberId: originalCase?.memberId || undefined,
			customerNote: originalCase?.customerNote || undefined,
		};
	};

	// 支払い方法の日本語名を取得
	const getPaymentMethodName = (method: string): string => {
		const methodNames: Record<string, string> = {
			cash: "現金",
			credit: "クレジットカード",
			electronic: "電子マネー",
			gift: "ギフトカード",
		};
		return methodNames[method] || method;
	};

	return (
		<div className="h-full flex flex-col bg-pos-light">
			{/* ヘッダー */}
			<div className="p-4 border-b-2 border-pos-border bg-pos-background">
				<div className="flex items-center justify-between">
					<h2 className="text-pos-lg font-semibold flex items-center gap-2">
						<ShoppingCart className="h-5 w-5" />
						カート ({visibleItems.length}点)
					</h2>
					<PrinterSettingsDialog printer={receiptPrinter} />
				</div>
			</div>

			{/* カートアイテム */}
			<div className="flex-1 overflow-y-auto flex flex-col">
				{visibleItems.length === 0 ? (
					<div className="flex-1 flex items-center justify-center p-8">
						<div className="text-center text-pos-muted">
							<ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
							<p className="text-pos-base">カートは空です</p>
							<p className="text-pos-sm mt-1">商品を選択してください</p>
						</div>
					</div>
				) : (
					<div className="divide-y divide-pos-border">
						{visibleItems.map((item) => (
							<CartItem key={item.id} item={item} />
						))}
					</div>
				)}
			</div>

			{/* サマリー（常に最下部に表示） */}
			<div className="mt-auto border-t-2 border-pos-border bg-pos-background">
				<div className="p-4 space-y-2">
					<div className="flex justify-between text-sm">
						<span>小計</span>
						<span>¥{subtotal.toLocaleString()}</span>
					</div>

					<div className="flex justify-between items-center text-sm">
						<span>ケース調整</span>
						{isEditingCaseAdjustment ? (
							<div className="flex items-center gap-1">
								<PosInput
									type="number"
									value={caseAdjustmentInput}
									onChange={(e) => setCaseAdjustmentInput(e.target.value)}
									className="h-7 w-24 text-xs text-right"
									placeholder="調整額"
									onKeyDown={(e) => {
										if (e.key === "Enter") handleCaseAdjustmentSave();
										if (e.key === "Escape") handleCaseAdjustmentCancel();
									}}
								/>
								<PosButton
									size="icon"
									variant="ghost"
									className="h-6 w-6"
									onClick={handleCaseAdjustmentSave}
								>
									<span className="text-xs">✓</span>
								</PosButton>
								<PosButton
									size="icon"
									variant="ghost"
									className="h-6 w-6"
									onClick={handleCaseAdjustmentCancel}
								>
									<span className="text-xs">✕</span>
								</PosButton>
							</div>
						) : (
							<div className="flex items-center gap-1">
								<span className={caseAdjustment < 0 ? "text-red-600" : ""}>
									¥{caseAdjustment.toLocaleString()}
								</span>
								<PosButton
									size="icon"
									variant="ghost"
									className="h-6 w-6"
									onClick={() => {
										setCaseAdjustmentInput(caseAdjustment.toString());
										setIsEditingCaseAdjustment(true);
									}}
								>
									<Edit2 className="h-3 w-3" />
								</PosButton>
							</div>
						)}
					</div>

					{couponAdjustment !== 0 && (
						<div className="flex justify-between text-sm">
							<span>クーポン割引</span>
							<span className="text-red-600">¥{couponAdjustment.toLocaleString()}</span>
						</div>
					)}

					{/* 税額表示 */}
					{summary?.taxes && summary.taxes.length > 0 && (
						<>
							<Separator className="border-pos-border" />
							<div className="space-y-1">
								{summary.taxes.map((tax, index) => {
									const taxLabel = tax.taxRateType === 'GENERAL' ? '10%' : tax.taxRateType === 'RELIEF' ? '8%' : '非課税';
									return (
										<div key={index} className="flex justify-between text-xs text-pos-muted">
											<span>（内消費税{taxLabel}）</span>
											<span>¥{tax.tax.toLocaleString()}</span>
										</div>
									);
								})}
							</div>
						</>
					)}

					<Separator className="border-pos-border" />

					<div className="flex justify-between font-bold text-pos-lg">
						<span>合計</span>
						<span>¥{total.toLocaleString()}</span>
					</div>
				</div>

				{/* チェックアウトボタン */}
				<div className="p-4 pt-0">
					<PosButton
						className="w-full h-14 text-pos-lg font-bold"
						disabled={visibleItems.length === 0 || total === 0}
						onClick={() => setShowCheckoutDialog(true)}
					>
						決済へ進む
					</PosButton>
				</div>
			</div>

			{/* チェックアウトダイアログ */}
			{summary && (
				<CheckoutDialog
					open={showCheckoutDialog}
					onOpenChange={setShowCheckoutDialog}
					summary={summary}
					onConfirm={handleCheckout}
				/>
			)}
		</div>
	);
}
