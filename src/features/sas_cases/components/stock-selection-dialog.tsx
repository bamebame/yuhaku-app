"use client";

import { 
	PosDialog,
	PosDialogContent,
	PosDialogHeader,
	PosDialogTitle,
	PosDialogDescription,
	PosDialogFooter,
	PosButton 
} from "@/components/pos";
import type { Product } from "@/features/products/types";
import type { ItemStock } from "@/features/items/types";

interface StockSelectionDialogProps {
	product: Product;
	stocks: ItemStock[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (stock: ItemStock) => void;
}

export function StockSelectionDialog({
	product,
	stocks,
	open,
	onOpenChange,
	onSelect,
}: StockSelectionDialogProps) {
	const availableStocks = stocks.filter((stock) => stock.quantity > 0);

	const handleSelect = (stock: ItemStock) => {
		onSelect(stock);
		onOpenChange(false);
	};

	return (
		<PosDialog open={open} onOpenChange={onOpenChange}>
			<PosDialogContent>
				<PosDialogHeader>
					<PosDialogTitle>在庫選択</PosDialogTitle>
					<PosDialogDescription>
						{product.title}の在庫を選択してください
					</PosDialogDescription>
				</PosDialogHeader>

				<div className="space-y-2">
					{availableStocks.map((stock) => (
						<PosButton
							key={`${stock.itemId}-${stock.location.id}`}
							variant="outline"
							className="w-full justify-between"
							onClick={() => handleSelect(stock)}
						>
							<span>{stock.location.name}</span>
							<span className="flex items-center gap-4">
								<span className="text-pos-muted">在庫: {stock.quantity}</span>
								<span className="font-bold">¥{stock.price.toLocaleString()}</span>
							</span>
						</PosButton>
					))}
				</div>

				<PosDialogFooter>
					<PosButton variant="secondary" onClick={() => onOpenChange(false)}>
						キャンセル
					</PosButton>
				</PosDialogFooter>
			</PosDialogContent>
		</PosDialog>
	);
}