"use client";

import { useState, useEffect } from "react";
import {
	PosDialog,
	PosDialogContent,
	PosDialogHeader,
	PosDialogTitle,
	PosDialogFooter,
	PosButton,
	PosInput
} from "@/components/pos";
import { CreditCard, Banknote, Smartphone, Gift, Coins, Building, HelpCircle, Check, X, Wallet, TicketIcon } from "lucide-react";
import type { Summary } from "@/features/sas_cases/types";
import type { Payment } from "@/features/config/types";
import useSWR from "swr";

interface CheckoutDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	summary: Summary;
	onConfirm: (payments: PaymentData[]) => Promise<void>;
}

export interface PaymentData {
	paymentId: string;
	paymentName: string;
	amount: number;
	method: string; // 支払い方法タイプ
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

// 決済タイプに応じたアイコンを返す
const getPaymentIcon = (type: string) => {
	switch (type) {
		case "CASH":
			return Banknote;
		case "POINT":
			return Coins;
		case "CASHABLE":
			return TicketIcon;  // 金券
		case "CAT":
			return Wallet;      // 電子マネー
		case "BANK":
			return Building;
		case "OTHER":
			return CreditCard;  // その他をクレジットカードアイコンに
		default:
			return HelpCircle;
	}
};

// 環境変数から許可する決済方法IDを取得
const getAllowedPaymentIds = (): string[] | null => {
	const envValue = process.env.NEXT_PUBLIC_ALLOWED_PAYMENT_IDS;
	if (envValue) {
		return envValue.split(',').map(id => id.trim());
	}
	// nullを返すことで全ての決済方法を表示
	return null;
};

export function CheckoutDialog({
	open,
	onOpenChange,
	summary,
	onConfirm,
}: CheckoutDialogProps) {
	const [isProcessing, setIsProcessing] = useState(false);
	// API から決済方法を取得
	const { data: configData } = useSWR(
		open ? "/api/config" : null,
		fetcher
	);
	const total = summary.total;
	const [payments, setPayments] = useState<PaymentData[]>([]);
	const [change, setChange] = useState(0);
	const allowedPaymentIds = getAllowedPaymentIds();

	const handlePaymentMethodSelect = (methodId: string, methodName: string, method: string) => {
		console.log("handlePaymentMethodSelect called:", { methodId, methodName, method });
		
		// すでに選択されている場合は削除
		const existingPaymentIndex = payments.findIndex((p) => p.paymentId === methodId);
		if (existingPaymentIndex !== -1) {
			console.log("Removing payment method:", methodId);
			const newPayments = payments.filter((_, index) => index !== existingPaymentIndex);
			setPayments(newPayments);
			return;
		}

		// 新しい決済方法を追加
		const remainingAmount = total - payments.reduce((sum, p) => sum + p.amount, 0);
		console.log("Remaining amount:", remainingAmount);
		
		if (remainingAmount > 0) {
			const newPayment = { paymentId: methodId, paymentName: methodName, amount: remainingAmount, method };
			console.log("Adding new payment:", newPayment);
			setPayments([...payments, newPayment]);
		}
	};

	const handleAmountChange = (index: number, amount: number) => {
		const newPayments = [...payments];
		newPayments[index].amount = amount;
		setPayments(newPayments);

		// お釣りを計算（現金タイプの場合のみ）
		const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
		const cashPayment = newPayments.find((p) => p.method === "cash");
		if (cashPayment && totalPaid > total) {
			setChange(totalPaid - total);
		} else {
			setChange(0);
		}
	};

	const handleRemovePayment = (index: number) => {
		const newPayments = payments.filter((_, i) => i !== index);
		setPayments(newPayments);
		
		// お釣りをリセット
		if (newPayments.length === 0) {
			setChange(0);
		}
	};

	const handleConfirm = async () => {
		// 合計金額が足りているかチェック
		const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
		if (totalPaid >= total) {
			setIsProcessing(true);
			// ダイアログを開いたままにして、親コンポーネントで処理を続行
			await onConfirm(payments);
			// onConfirmの処理が完了してもダイアログは閉じない
			// ページがリフレッシュされて完了画面が表示されるまで待つ
		}
	};

	const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
	const remaining = Math.max(0, total - totalPaid);

	return (
		<PosDialog open={open} onOpenChange={(newOpen) => {
			// 処理中はダイアログを閉じられないようにする
			if (!isProcessing) {
				onOpenChange(newOpen);
			}
		}}>
			<PosDialogContent className="w-full max-w-2xl" onPointerDownOutside={(e) => {
				// 処理中は外側クリックで閉じられないようにする
				if (isProcessing) {
					e.preventDefault();
				}
			}}>
				{/* 処理中のオーバーレイ */}
				{isProcessing && (
					<div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
						<div className="text-center">
							<div className="animate-spin h-12 w-12 border-4 border-pos-border border-t-transparent rounded-full mx-auto mb-4" />
							<p className="text-pos-lg font-medium">決済処理中...</p>
							<p className="text-pos-sm text-pos-muted mt-2">しばらくお待ちください</p>
						</div>
					</div>
				)}

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
						{payments.length === 0 && (
							<p className="text-pos-sm text-pos-muted">決済方法を選択してください</p>
						)}
						<div className="grid grid-cols-4 gap-2">
							{configData?.data?.payments
								?.filter((method: Payment) => {
									// 環境変数が設定されていない場合は全て表示
									if (!allowedPaymentIds) return true;
									// IDでフィルタリング
									return allowedPaymentIds.includes(method.id);
								})
								?.map((method: Payment) => {
								const Icon = getPaymentIcon(method.type);
								const isSelected = payments.some(
									(p) => p.paymentId === method.id,
								);
								return (
									<PosButton
										key={method.id}
										variant={isSelected ? "default" : "outline"}
										className="h-20 flex-col relative"
										onClick={() =>
											handlePaymentMethodSelect(method.id, method.name, method.type.toLowerCase())
										}
									>
										{isSelected && (
											<div className="absolute top-2 right-2">
												<Check className="h-4 w-4" />
											</div>
										)}
										<Icon className="h-6 w-6 mb-2" />
										<span className="text-pos-sm">{method.name}</span>
									</PosButton>
								);
							})}
						</div>
					</div>

					{/* 決済金額入力 */}
					{payments.length > 0 && (
						<div className="space-y-2">
							<h3 className="font-medium text-pos-base">決済金額</h3>
							<div className="space-y-2">
								{payments.map((payment, index) => (
								<div
									key={`${payment.paymentId}-${index}`}
									className="flex items-center gap-2"
								>
									<div className="flex items-center gap-2 w-40">
										<span className="text-pos-sm">{payment.paymentName}</span>
										<PosButton
											variant="ghost"
											size="sm"
											onClick={() => handleRemovePayment(index)}
											className="h-6 w-6 p-0"
										>
											<X className="h-4 w-4 text-destructive" />
										</PosButton>
									</div>
									<PosInput
										type="number"
										value={payment.amount}
										onChange={(e) =>
											handleAmountChange(index, parseInt(e.target.value) || 0)
										}
										className="flex-1"
									/>
								</div>
							))}
						</div>
					</div>
					)}

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
					<PosButton variant="secondary" onClick={() => onOpenChange(false)} disabled={isProcessing}>
						キャンセル
					</PosButton>
					<PosButton onClick={handleConfirm} disabled={remaining > 0 || isProcessing}>
						{isProcessing ? (
							<>
								<div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
								処理中...
							</>
						) : (
							"決済確定"
						)}
					</PosButton>
				</PosDialogFooter>
			</PosDialogContent>
		</PosDialog>
	);
}