"use client";

import { useState } from "react";
import {
	PosDialog,
	PosDialogContent,
	PosDialogHeader,
	PosDialogTitle,
	PosDialogFooter,
	PosButton,
	PosInput
} from "@/components/pos";
import { CreditCard, Banknote, Smartphone, Gift } from "lucide-react";
import type { Summary } from "@/features/sas_cases/types";

interface CheckoutDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	summary: Summary;
	onConfirm: (payments: PaymentData[]) => void;
}

export interface PaymentData {
	paymentId: string;
	paymentName: string;
	amount: number;
	method: string; // 支払い方法タイプ
}

// 決済方法の定義（実際はAPIから取得）
const paymentMethods = [
	{ id: "1", name: "現金", icon: Banknote, method: "cash" },
	{ id: "2", name: "クレジットカード", icon: CreditCard, method: "credit" },
	{ id: "3", name: "電子マネー", icon: Smartphone, method: "electronic" },
	{ id: "4", name: "ギフト券", icon: Gift, method: "gift" },
];

export function CheckoutDialog({
	open,
	onOpenChange,
	summary,
	onConfirm,
}: CheckoutDialogProps) {
	const total = summary.total;
	const [payments, setPayments] = useState<PaymentData[]>([
		{ paymentId: "1", paymentName: "現金", amount: total, method: "cash" },
	]);
	const [change, setChange] = useState(0);

	const handlePaymentMethodSelect = (methodId: string, methodName: string, method: string) => {
		// すでに選択されている場合は何もしない
		if (payments.some((p) => p.paymentId === methodId)) return;

		// 新しい決済方法を追加
		const remainingAmount = total - payments.reduce((sum, p) => sum + p.amount, 0);
		if (remainingAmount > 0) {
			setPayments([
				...payments,
				{ paymentId: methodId, paymentName: methodName, amount: remainingAmount, method },
			]);
		}
	};

	const handleAmountChange = (index: number, amount: number) => {
		const newPayments = [...payments];
		newPayments[index].amount = amount;
		setPayments(newPayments);

		// お釣りを計算（現金の場合のみ）
		const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
		const cashPayment = newPayments.find((p) => p.paymentId === "1");
		if (cashPayment && totalPaid > total) {
			setChange(totalPaid - total);
		} else {
			setChange(0);
		}
	};

	const handleRemovePayment = (index: number) => {
		if (payments.length > 1) {
			const newPayments = payments.filter((_, i) => i !== index);
			setPayments(newPayments);
		}
	};

	const handleConfirm = () => {
		// 合計金額が足りているかチェック
		const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
		if (totalPaid >= total) {
			onConfirm(payments);
			onOpenChange(false);
		}
	};

	const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
	const remaining = Math.max(0, total - totalPaid);

	return (
		<PosDialog open={open} onOpenChange={onOpenChange}>
			<PosDialogContent className="max-w-2xl">
				<PosDialogHeader>
					<PosDialogTitle>決済</PosDialogTitle>
				</PosDialogHeader>

				<div className="space-y-4">
					{/* 金額内訳 */}
					<div className="bg-pos-light p-4 border-2 border-pos-border space-y-2">
						<div className="flex justify-between text-pos-base">
							<span>小計</span>
							<span>¥{summary.subTotal.toLocaleString()}</span>
						</div>
						{summary.caseAdjustment !== 0 && (
							<div className="flex justify-between text-pos-base">
								<span>ケース調整</span>
								<span>{summary.caseAdjustment > 0 ? '+' : ''}¥{summary.caseAdjustment.toLocaleString()}</span>
							</div>
						)}
						{summary.couponAdjustment !== 0 && (
							<div className="flex justify-between text-pos-base">
								<span>クーポン割引</span>
								<span>¥{summary.couponAdjustment.toLocaleString()}</span>
							</div>
						)}
						<div className="border-t border-pos-border pt-2 space-y-1">
							{summary.taxes.map((tax, index) => {
								const taxLabel = tax.taxRateType === 'GENERAL' ? '10%' : tax.taxRateType === 'RELIEF' ? '8%' : '非課税';
								return (
									<div key={index} className="flex justify-between text-pos-sm text-pos-muted">
										<span>消費税({taxLabel})</span>
										<span>¥{tax.tax.toLocaleString()}</span>
									</div>
								);
							})}
						</div>
						<div className="border-t border-pos-border pt-2 flex justify-between items-center text-pos-xl font-bold">
							<span>合計金額</span>
							<span>¥{total.toLocaleString()}</span>
						</div>
					</div>

					{/* 決済方法選択 */}
					<div className="space-y-2">
						<h3 className="font-medium text-pos-base">決済方法</h3>
						<div className="grid grid-cols-4 gap-2">
							{paymentMethods.map((method) => {
								const Icon = method.icon;
								const isSelected = payments.some(
									(p) => p.paymentId === method.id,
								);
								return (
									<PosButton
										key={method.id}
										variant={isSelected ? "default" : "outline"}
										className="h-20 flex-col"
										onClick={() =>
											handlePaymentMethodSelect(method.id, method.name, method.method)
										}
										disabled={isSelected}
									>
										<Icon className="h-6 w-6 mb-2" />
										<span className="text-pos-sm">{method.name}</span>
									</PosButton>
								);
							})}
						</div>
					</div>

					{/* 決済金額入力 */}
					<div className="space-y-2">
						<h3 className="font-medium text-pos-base">決済金額</h3>
						<div className="space-y-2">
							{payments.map((payment, index) => (
								<div
									key={`${payment.paymentId}-${index}`}
									className="flex items-center gap-2"
								>
									<span className="w-32 text-pos-sm">{payment.paymentName}</span>
									<PosInput
										type="number"
										value={payment.amount}
										onChange={(e) =>
											handleAmountChange(index, parseInt(e.target.value) || 0)
										}
										className="flex-1"
									/>
									{payments.length > 1 && (
										<PosButton
											variant="ghost"
											size="sm"
											onClick={() => handleRemovePayment(index)}
										>
											削除
										</PosButton>
									)}
								</div>
							))}
						</div>
					</div>

					{/* 残金・お釣り */}
					<div className="bg-pos-light p-4 border-2 border-pos-border space-y-2">
						{remaining > 0 && (
							<div className="flex justify-between text-pos-base">
								<span>残金</span>
								<span className="text-destructive font-bold">
									¥{remaining.toLocaleString()}
								</span>
							</div>
						)}
						{change > 0 && (
							<div className="flex justify-between text-pos-base">
								<span>お釣り</span>
								<span className="font-bold">¥{change.toLocaleString()}</span>
							</div>
						)}
						<div className="flex justify-between text-pos-lg font-bold">
							<span>受取金額</span>
							<span>¥{totalPaid.toLocaleString()}</span>
						</div>
					</div>
				</div>

				<PosDialogFooter>
					<PosButton variant="secondary" onClick={() => onOpenChange(false)}>
						キャンセル
					</PosButton>
					<PosButton onClick={handleConfirm} disabled={remaining > 0}>
						決済確定
					</PosButton>
				</PosDialogFooter>
			</PosDialogContent>
		</PosDialog>
	);
}