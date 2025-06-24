"use client";

import { PosButton, PosInput } from "@/components/pos";
import { useSasCaseEditStore } from "@/features/sas_cases/stores/edit-store";
import { Plus, Minus, Trash2, Edit2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { CartItem as CartItemType } from "@/features/sas_cases/stores/edit-store";

interface CartItemProps {
	item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
	const { updateQuantity, removeFromCart, updateUnitAdjustment, productStocks } = useSasCaseEditStore();
	const [isEditingPrice, setIsEditingPrice] = useState(false);
	const [adjustmentInput, setAdjustmentInput] = useState(item.unitAdjustment.toString());

	// 在庫情報を取得
	const stocks = productStocks.get(item.productId) || [];
	const availableStock = stocks.find(stock => stock.itemId === item.itemId)?.quantity || 0;
	const isOverStock = item.quantity > availableStock;

	const handleIncrement = () => {
		updateQuantity(item.id, item.quantity + 1);
	};

	const handleDecrement = () => {
		if (item.quantity > 1) {
			updateQuantity(item.id, item.quantity - 1);
		}
	};

	const handleRemove = () => {
		removeFromCart(item.id);
	};

	const handleAdjustmentSave = () => {
		const adjustment = parseInt(adjustmentInput) || 0;
		updateUnitAdjustment(item.id, adjustment);
		setIsEditingPrice(false);
	};

	const handleAdjustmentCancel = () => {
		setAdjustmentInput(item.unitAdjustment.toString());
		setIsEditingPrice(false);
	};

	const itemTotal = (item.unitPrice + item.unitAdjustment) * item.quantity;

	return (
		<div className="p-4 hover:bg-pos-hover transition-colors">
			<div className="space-y-2">
				{/* 商品名と削除ボタン */}
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1">
						<h4 className="font-medium text-pos-sm line-clamp-2">
							{item.product.title || `商品ID: ${item.productId}`}
						</h4>
						<p className="text-pos-xs text-pos-muted">
							{item.product.code || `在庫ID: ${item.productId}`}
						</p>
						{/* 在庫警告 */}
						{isOverStock && (
							<div className="flex items-center gap-1 mt-1 text-destructive text-pos-xs">
								<AlertTriangle className="h-3 w-3" />
								<span>在庫不足（残り{availableStock}個）</span>
							</div>
						)}
					</div>
					<PosButton
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-destructive hover:text-red-700 hover:bg-red-50"
						onClick={handleRemove}
					>
						<Trash2 className="h-4 w-4" />
					</PosButton>
				</div>

				{/* 価格と数量 */}
				<div className="flex items-center justify-between">
					<div className="text-sm">
						<div className="flex items-center gap-2">
							<span>¥{item.unitPrice.toLocaleString()}</span>
							{isEditingPrice ? (
								<div className="flex items-center gap-1">
									<PosInput
										type="number"
										value={adjustmentInput}
										onChange={(e) => setAdjustmentInput(e.target.value)}
										className="h-7 w-20 text-xs"
										placeholder="調整額"
										onKeyDown={(e) => {
											if (e.key === "Enter") handleAdjustmentSave();
											if (e.key === "Escape") handleAdjustmentCancel();
										}}
									/>
									<PosButton
										size="icon"
										variant="ghost"
										className="h-6 w-6"
										onClick={handleAdjustmentSave}
									>
										<span className="text-xs">✓</span>
									</PosButton>
									<PosButton
										size="icon"
										variant="ghost"
										className="h-6 w-6"
										onClick={handleAdjustmentCancel}
									>
										<span className="text-xs">✕</span>
									</PosButton>
								</div>
							) : (
								<>
									{item.unitAdjustment !== 0 && (
										<span
											className={`${item.unitAdjustment < 0 ? "text-destructive" : ""}`}
										>
											{item.unitAdjustment > 0 ? "+" : ""}
											{item.unitAdjustment}
										</span>
									)}
									<PosButton
										size="icon"
										variant="ghost"
										className="h-6 w-6"
										onClick={() => {
											setAdjustmentInput(item.unitAdjustment.toString());
											setIsEditingPrice(true);
										}}
									>
										<Edit2 className="h-3 w-3" />
									</PosButton>
								</>
							)}
						</div>
					</div>

					{/* 数量コントロール */}
					<div className="flex items-center gap-1">
						<PosButton
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={handleDecrement}
							disabled={item.quantity <= 1}
						>
							<Minus className="h-3 w-3" />
						</PosButton>
						<span className={`w-12 text-center font-medium text-pos-base ${isOverStock ? "text-destructive" : ""}`}>
							{item.quantity}
						</span>
						<PosButton
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={handleIncrement}
							disabled={item.quantity >= availableStock}
							title={item.quantity >= availableStock ? `在庫上限: ${availableStock}個` : ""}
						>
							<Plus className="h-3 w-3" />
						</PosButton>
					</div>
				</div>

				{/* 小計 */}
				<div className="flex justify-between text-pos-sm font-medium">
					<span>小計</span>
					<span>¥{itemTotal.toLocaleString()}</span>
				</div>
			</div>
		</div>
	);
}
