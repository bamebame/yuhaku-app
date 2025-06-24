"use client";

import { useState } from "react";
import { useSasCaseEditStore } from "@/features/sas_cases/stores/edit-store";
import { useFilterStore } from "@/features/sas_cases/stores/filter-store";
import { PosButton, PosCard } from "@/components/pos";
import { Plus, Package, Heart } from "lucide-react";
import { StockSelectionDialog } from "./stock-selection-dialog";
import type { Product } from "@/features/products/types";
import type { ItemStock } from "@/features/items/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
	product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
	const [isAdding, setIsAdding] = useState(false);
	const [showStockDialog, setShowStockDialog] = useState(false);
	const { productStocks, addToCart } = useSasCaseEditStore();
	const { isFavorite, toggleFavorite } = useFilterStore();

	// 在庫情報を取得
	const stocks = productStocks.get(product.id) || [];
	const totalStock = stocks.reduce((sum, stock) => sum + stock.quantity, 0);
	const hasStock = totalStock > 0;
	const defaultPrice = stocks[0]?.price || 0;

	const handleAddToCart = async () => {
		// 在庫が1つだけの場合は直接追加
		const availableStocks = stocks.filter((stock) => stock.quantity > 0);
		if (availableStocks.length === 1) {
			setIsAdding(true);
			try {
				const stock = availableStocks[0];
				// 在庫情報を含めて商品を追加
				const productWithStock = {
					...product,
					price: stock.price, // 在庫の価格を使用
				};
				addToCart(productWithStock, 1);
			} finally {
				setIsAdding(false);
			}
		} else if (availableStocks.length > 1) {
			// 複数在庫がある場合はダイアログを表示
			setShowStockDialog(true);
		}
	};

	const handleStockSelect = (stock: ItemStock) => {
		setIsAdding(true);
		try {
			// 在庫情報を含めて商品を追加
			const productWithStock = {
				...product,
				price: stock.price, // 在庫の価格を使用
			};
			addToCart(productWithStock, 1);
		} finally {
			setIsAdding(false);
		}
	};

	return (
		<PosCard className="relative p-3 flex flex-col gap-2 hover:bg-pos-hover transition-colors cursor-pointer">
			{/* お気に入りボタン */}
			<button
				onClick={(e) => {
					e.stopPropagation();
					toggleFavorite(product.id);
				}}
				className={cn(
					"absolute top-2 right-2 z-10 p-1.5 rounded-full transition-colors",
					"bg-white/80 hover:bg-white border-2 border-pos-border",
					isFavorite(product.id) && "bg-destructive hover:bg-destructive/90 border-destructive"
				)}
			>
				<Heart className={cn(
					"h-4 w-4",
					isFavorite(product.id) ? "fill-white text-white" : "text-pos-muted"
				)} />
			</button>
			
			{/* 商品画像 */}
			<div className="aspect-square bg-pos-light border-2 border-pos-border flex items-center justify-center overflow-hidden">
				{product.imageUrls && product.imageUrls.length > 0 ? (
					<img
						src={product.imageUrls[0]}
						alt={product.title}
						className="w-full h-full object-cover"
					/>
				) : (
					<Package className="h-12 w-12 text-pos-muted" />
				)}
			</div>

			{/* 商品情報 */}
			<div className="flex-1 flex flex-col">
				<h3 className="font-medium text-pos-sm line-clamp-2">{product.title}</h3>
				<p className="text-pos-xs text-pos-muted">{product.code}</p>
			</div>

			{/* 価格と在庫 */}
			<div className="space-y-1">
				<div className="flex items-center justify-between">
					<span className="text-pos-base font-bold">
						¥{defaultPrice.toLocaleString()}
					</span>
					<span className={`text-pos-xs ${hasStock ? "" : "text-destructive"}`}>
						在庫: {totalStock}
					</span>
				</div>

				{/* カートへ追加ボタン */}
				<PosButton
					className="w-full"
					size="sm"
					onClick={handleAddToCart}
					disabled={!hasStock || isAdding}
					variant={hasStock ? "default" : "secondary"}
				>
					<Plus className="mr-1 h-3 w-3" />
					{hasStock ? "カートへ" : "在庫なし"}
				</PosButton>
			</div>

			{/* 在庫選択ダイアログ */}
			<StockSelectionDialog
				product={product}
				stocks={stocks}
				open={showStockDialog}
				onOpenChange={setShowStockDialog}
				onSelect={handleStockSelect}
			/>
		</PosCard>
	);
}
