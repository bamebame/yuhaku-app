"use client";

import { useState } from "react";
import { useSasCaseEditStore } from "@/features/sas_cases/stores/edit-store";
import { PosButton } from "@/components/pos";
import { Save, CheckCircle, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateSasCaseFormAction } from "@/features/sas_cases/actions";
import { checkoutSasCaseFormAction } from "@/features/sas_cases/actions";
import { mutate } from "swr";
import { CheckoutDialog, type PaymentData } from "./checkout-dialog";

export function SasCaseEditHeader() {
	const { toast } = useToast();
	const [isSaving, setIsSaving] = useState(false);
	const [isCheckingOut, setIsCheckingOut] = useState(false);
	const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);

	const { caseId, originalCase, cartItems, getUpdateData } = useSasCaseEditStore();

	const handleSave = async () => {
		if (!caseId) return;

		setIsSaving(true);
		try {
			const updateData = getUpdateData();
			const formData = new FormData();

			// goodsを個別にFormDataに追加
			updateData.goods.forEach((goods, index) => {
				formData.append(`goods[${index}][action]`, goods.action);
				
				if (goods.id) {
					formData.append(`goods[${index}][id]`, goods.id);
				}
				
				formData.append(`goods[${index}][itemId]`, goods.itemId);
				formData.append(`goods[${index}][locationId]`, goods.locationId);
				formData.append(`goods[${index}][quantity]`, goods.quantity.toString());
				
				if (goods.unitPrice !== undefined) {
					formData.append(`goods[${index}][unitPrice]`, goods.unitPrice.toString());
				}
				if (goods.unitAdjustment !== undefined) {
					formData.append(`goods[${index}][unitAdjustment]`, goods.unitAdjustment.toString());
				}
			});

			// その他のフィールドも追加
			if (updateData.memberId !== undefined) {
				formData.append("memberId", updateData.memberId || "");
			}
			if (updateData.note !== undefined) {
				formData.append("note", updateData.note || "");
			}
			if (updateData.customerNote !== undefined) {
				formData.append("customerNote", updateData.customerNote || "");
			}
			if (updateData.caseAdjustment !== undefined) {
				formData.append("caseAdjustment", updateData.caseAdjustment.toString());
			}

			const result = await updateSasCaseFormAction(caseId, null, formData);

			if (result.data) {
				toast({
					title: "保存しました",
					description: "販売ケースを更新しました",
				});
				// SWRキャッシュを更新
				await mutate(`/api/sas-cases/${caseId}`);
			} else {
				throw new Error("更新に失敗しました");
			}
		} catch (_error) {
			toast({
				title: "エラー",
				description: "保存に失敗しました",
				variant: "destructive",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleCheckout = async () => {
		if (!caseId) return;

		// まず保存
		await handleSave();

		// 決済ダイアログを表示
		setShowCheckoutDialog(true);
	};

	const handleCheckoutConfirm = async (payments: PaymentData[]) => {
		if (!caseId) return;

		setIsCheckingOut(true);
		try {
			const formData = new FormData();
			
			// 決済情報をFormDataに追加
			payments.forEach((payment, index) => {
				formData.append(`charges[${index}][paymentId]`, payment.paymentId);
				formData.append(`charges[${index}][amount]`, payment.amount.toString());
			});

			const result = await checkoutSasCaseFormAction(caseId, null, formData);

			if (result.result.status === "success") {
				toast({
					title: "完了しました",
					description: "販売を完了しました",
				});
				// 一覧画面に戻る
				window.location.href = "/sas-cases";
			} else {
				throw new Error("チェックアウトに失敗しました");
			}
		} catch (_error) {
			toast({
				title: "エラー",
				description: "チェックアウトに失敗しました",
				variant: "destructive",
			});
		} finally {
			setIsCheckingOut(false);
			setShowCheckoutDialog(false);
		}
	};

	// 合計金額を計算
	const calculateTotal = () => {
		return cartItems
			.filter((item) => item.action !== "DELETE")
			.reduce((sum, item) => {
				return sum + (item.unitPrice + item.unitAdjustment) * item.quantity;
			}, 0);
	};

	return (
		<div className="border-b-3 border-pos-border px-4 py-3 flex items-center justify-between bg-pos-background">
			<div className="flex items-center gap-4">
				<h1 className="text-pos-lg font-semibold flex items-center gap-2">
					<ShoppingCart className="h-5 w-5" />
					販売ケース編集
				</h1>
				<span className="text-pos-sm text-pos-muted">
					#{originalCase?.code}
				</span>
			</div>

			<div className="flex items-center gap-4">
				<div className="text-right mr-4">
					<p className="text-pos-sm text-pos-muted">合計金額</p>
					<p className="text-pos-xl font-bold">
						¥{calculateTotal().toLocaleString()}
					</p>
				</div>

				<PosButton
					variant="outline"
					onClick={handleSave}
					disabled={isSaving || isCheckingOut}
				>
					<Save className="mr-2 h-4 w-4" />
					保存して続ける
				</PosButton>
			</div>

			{/* 決済ダイアログ */}
			<CheckoutDialog
				open={showCheckoutDialog}
				onOpenChange={setShowCheckoutDialog}
				total={calculateTotal()}
				onConfirm={handleCheckoutConfirm}
			/>
		</div>
	);
}
