"use client";

import {
	PosDialog,
	PosDialogContent,
	PosDialogHeader,
	PosDialogTitle,
	PosDialogFooter,
	PosButton,
} from "@/components/pos";
import { CheckCircle } from "lucide-react";

interface CheckoutCompleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	total: number;
	paid: number;
	change: number;
	onClose: () => void;
}

export function CheckoutCompleteDialog({
	open,
	onOpenChange,
	total,
	paid,
	change,
	onClose,
}: CheckoutCompleteDialogProps) {
	return (
		<PosDialog open={open} onOpenChange={onOpenChange}>
			<PosDialogContent className="max-w-md">
				<PosDialogHeader>
					<PosDialogTitle className="flex items-center gap-2">
						<CheckCircle className="h-6 w-6 text-success" />
						決済完了
					</PosDialogTitle>
				</PosDialogHeader>

				<div className="space-y-4">
					{/* 決済金額 */}
					<div className="bg-pos-light p-4 border-2 border-pos-border space-y-2">
						<div className="flex justify-between text-pos-base">
							<span>合計金額</span>
							<span>¥{total.toLocaleString()}</span>
						</div>
						<div className="flex justify-between text-pos-base">
							<span>お預かり</span>
							<span>¥{paid.toLocaleString()}</span>
						</div>
						<div className="border-t border-pos-border pt-2">
							<div className="flex justify-between text-pos-xl font-bold">
								<span>お釣り</span>
								<span className="text-success">¥{change.toLocaleString()}</span>
							</div>
						</div>
					</div>

					{/* メッセージ */}
					<div className="text-center text-pos-base">
						<p>ありがとうございました</p>
						{change > 0 && (
							<p className="mt-2 text-pos-lg font-bold">
								お釣り ¥{change.toLocaleString()} をお渡しください
							</p>
						)}
					</div>
				</div>

				<PosDialogFooter>
					<PosButton onClick={onClose} className="w-full">
						閉じる
					</PosButton>
				</PosDialogFooter>
			</PosDialogContent>
		</PosDialog>
	);
}