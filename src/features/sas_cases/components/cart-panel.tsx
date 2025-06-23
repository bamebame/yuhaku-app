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

export function CartPanel() {
	const router = useRouter();
	const { toast } = useToast();
	const { caseId, cartItems, originalCase, updateCaseAdjustment } = useSasCaseEditStore();
	const [isEditingCaseAdjustment, setIsEditingCaseAdjustment] = useState(false);
	const [caseAdjustmentInput, setCaseAdjustmentInput] = useState("0");
	const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);

	// 表示用のアイテム（削除済みを除く）
	const visibleItems = cartItems.filter((item) => item.action !== "DELETE");

	// 合計計算
	const subtotal = visibleItems.reduce(
		(sum, item) => sum + item.unitPrice * item.quantity,
		0,
	);
	const adjustmentTotal = visibleItems.reduce(
		(sum, item) => sum + item.unitAdjustment * item.quantity,
		0,
	);
	const caseAdjustment = originalCase?.summary?.caseAdjustment || 0;
	const couponAdjustment = originalCase?.summary?.couponAdjustment || 0;
	const total = subtotal + adjustmentTotal + caseAdjustment + couponAdjustment;

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
		if (!caseId) return;

		try {
			// フォームデータを作成
			const formData = new FormData();
			formData.append("id", caseId);
			
			// 支払い情報をJSON文字列として送信
			formData.append("payments", JSON.stringify(payments));

			// Server Actionを呼び出し
			const result = await checkoutSasCaseFormAction(null, formData);

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
				
				// TODO: レシート印刷処理
				console.log("レシート印刷:", result.data);
				
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

	return (
		<div className="h-full flex flex-col bg-pos-light">
			{/* ヘッダー */}
			<div className="p-4 border-b-2 border-pos-border bg-pos-background">
				<h2 className="text-pos-lg font-semibold flex items-center gap-2">
					<ShoppingCart className="h-5 w-5" />
					カート ({visibleItems.length}点)
				</h2>
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
			<CheckoutDialog
				open={showCheckoutDialog}
				onOpenChange={setShowCheckoutDialog}
				total={total}
				onConfirm={handleCheckout}
			/>
		</div>
	);
}
