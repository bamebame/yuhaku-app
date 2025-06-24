"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSasCaseEditStore } from "@/features/sas_cases/stores/edit-store";
import { PosButton } from "@/components/pos";
import { Save, CheckCircle, ShoppingCart, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateSasCaseFormAction } from "@/features/sas_cases/actions";
import { checkoutSasCaseFormAction } from "@/features/sas_cases/actions";
import { mutate } from "swr";
import { CheckoutDialog, type PaymentData } from "./checkout-dialog";
import { fetchMissingProductsForCase } from "@/features/sas_cases/helpers/fetch-missing-products";

export function SasCaseEditHeader() {
	const router = useRouter();
	const { toast } = useToast();
	const [isSaving, setIsSaving] = useState(false);
	const [isCheckingOut, setIsCheckingOut] = useState(false);
	const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);

	const { caseId, originalCase, cartItems, getUpdateData, isSaving: isAutoSaving, lastSaved, error } = useSasCaseEditStore();

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
				
				// 商品情報が不足している場合は補完
				const updatedCase = await fetchMissingProductsForCase(result.data);
				
				// SWRキャッシュを更新（データを直接更新して再初期化を防ぐ）
				await mutate(`/api/sas-cases/${caseId}`, async () => {
					return { data: updatedCase };
				}, false);
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

			if (result.result.status === "success" && result.data) {
				// ページをリロードしてサマリーを表示
				await mutate(`/api/sas-cases/${caseId}`);
				router.refresh();
			} else {
				throw new Error("チェックアウトに失敗しました");
			}
		} catch (_error) {
			toast({
				title: "エラー",
				description: "チェックアウトに失敗しました",
				variant: "destructive",
			});
			setIsCheckingOut(false);
			setShowCheckoutDialog(false);
		}
	};

	// 合計金額を計算（summaryがあればそれを使用）
	const calculateTotal = () => {
		if (originalCase?.summary?.total) {
			return originalCase.summary.total;
		}
		return cartItems
			.filter((item) => item.action !== "DELETE")
			.reduce((sum, item) => {
				return sum + (item.unitPrice + item.unitAdjustment) * item.quantity;
			}, 0);
	};

	// summaryを作成（チェックアウトダイアログ用）
	const createSummary = () => {
		if (originalCase?.summary) {
			return originalCase.summary;
		}
		// summaryがない場合は簡易的なsummaryを作成
		const visibleItems = cartItems.filter((item) => item.action !== "DELETE");
		const subtotal = visibleItems.reduce(
			(sum, item) => sum + item.unitPrice * item.quantity,
			0,
		);
		const adjustmentTotal = visibleItems.reduce(
			(sum, item) => sum + item.unitAdjustment * item.quantity,
			0,
		);
		const total = subtotal + adjustmentTotal;

		return {
			quantity: visibleItems.reduce((sum, item) => sum + item.quantity, 0),
			reservedQuantity: 0,
			subTotal: subtotal,
			caseAdjustment: 0,
			couponAdjustment: 0,
			total,
			taxes: [
				{
					taxRateType: "GENERAL" as const,
					taxRate: 10,
					tax: Math.floor(total * 0.1 / 1.1),
					includedTax: Math.floor(total * 0.1 / 1.1),
					taxableAmount: total,
				},
			],
			exemptedTaxes: [],
		};
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
				{/* 自動保存インジケーター */}
				<div className="flex items-center gap-2 text-pos-sm">
					{isAutoSaving ? (
						<>
							<div className="animate-spin h-4 w-4 border-2 border-pos-border border-t-transparent rounded-full" />
							<span className="text-pos-muted">保存中...</span>
						</>
					) : error ? (
						<>
							<AlertCircle className="h-4 w-4 text-red-600" />
							<span className="text-red-600">保存エラー</span>
						</>
					) : lastSaved ? (
						<>
							<Check className="h-4 w-4 text-green-600" />
							<span className="text-pos-muted">
								保存済み ({new Date(lastSaved).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })})
							</span>
						</>
					) : null}
				</div>

				<div className="text-right mr-4">
					<p className="text-pos-sm text-pos-muted">合計金額</p>
					<p className="text-pos-xl font-bold">
						¥{calculateTotal().toLocaleString()}
					</p>
				</div>
			</div>

			{/* 決済ダイアログ */}
			<CheckoutDialog
				open={showCheckoutDialog}
				onOpenChange={setShowCheckoutDialog}
				summary={createSummary()}
				onConfirm={handleCheckoutConfirm}
			/>
		</div>
	);
}
