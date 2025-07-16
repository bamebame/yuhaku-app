"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "./product-card";
import { ProductDetailDialog } from "./product-detail-dialog";
import type { Product } from "@/features/products/types";
import type { ItemStock } from "@/features/items/types";
import { Grid, List, Package, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFilterStore } from "../stores/filter-store";
import { useSasCaseEditStore } from "../stores/edit-store";

interface ProductGridProps {
	products: Product[];
	isLoadingInventory?: boolean;
	loadingItemsCount?: number;
}

type ViewMode = 'grid' | 'list';
type SortOrder = 'newest' | 'name' | 'price-asc' | 'price-desc';

export function ProductGrid({ products, isLoadingInventory = false, loadingItemsCount = 0 }: ProductGridProps) {
	const [viewMode, setViewMode] = useState<ViewMode>('grid');
	const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [showDetailDialog, setShowDetailDialog] = useState(false);
	const { showInStockOnly } = useFilterStore();
	const { addToCart } = useSasCaseEditStore();
	
	// 商品のソート
	const sortedProducts = useMemo(() => {
		const sorted = [...products];
		
		switch (sortOrder) {
			case 'newest':
				// 更新日時で降順（新しい順）
				sorted.sort((a, b) => {
					const dateA = new Date(a.updatedAt).getTime();
					const dateB = new Date(b.updatedAt).getTime();
					return dateB - dateA;
				});
				break;
			case 'name':
				// 商品名で昇順
				sorted.sort((a, b) => a.title.localeCompare(b.title, 'ja'));
				break;
			case 'price-asc':
			case 'price-desc':
				// TODO: 価格情報が商品に含まれていないため、仮実装
				// 実際の実装では在庫情報から最低価格を取得する必要がある
				break;
		}
		
		return sorted;
	}, [products, sortOrder]);
	
	// 商品詳細を表示
	const handleShowDetail = (product: Product) => {
		setSelectedProduct(product);
		setShowDetailDialog(true);
	};
	
	// カートに追加
	const handleAddToCart = (product: Product, stock: ItemStock) => {
		// TODO: 特定の在庫を選択してカートに追加する機能を実装
		addToCart(product, 1);
		setShowDetailDialog(false);
	};
	
	if (products.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-pos-muted">
				<p className="text-lg mb-4">該当する商品がありません</p>
				<p className="text-sm">フィルター条件を変更してください</p>
			</div>
		);
	}
	
	return (
		<div className="flex flex-col h-full">
			{/* ヘッダー */}
			<div className="flex items-center justify-between p-4 border-b border-pos-border">
				<div className="flex items-center gap-3 text-sm">
					<div className="flex items-center gap-2">
						<span>検索結果: <span className="font-bold">{products.length}</span>件</span>
						{isLoadingInventory && (
							<div className="flex items-center gap-1 text-pos-muted">
								<Loader2 className="h-3 w-3 animate-spin" />
								<span className="text-xs">在庫情報を取得中...</span>
							</div>
						)}
					</div>
					{showInStockOnly && (
						<span className="flex items-center gap-1 px-2 py-1 bg-pos-primary text-white rounded text-xs">
							<Package className="h-3 w-3" />
							在庫ありのみ
						</span>
					)}
				</div>
				
				<div className="flex items-center gap-4">
					{/* 表示モード切り替え */}
					<div className="flex items-center gap-1 border-2 border-pos-border">
						<button
							onClick={() => setViewMode('grid')}
							className={cn(
								"p-2 transition-colors",
								viewMode === 'grid'
									? "bg-pos-primary text-white"
									: "hover:bg-pos-hover"
							)}
							title="タイル表示"
						>
							<Grid className="h-4 w-4" />
						</button>
						<button
							onClick={() => setViewMode('list')}
							className={cn(
								"p-2 transition-colors",
								viewMode === 'list'
									? "bg-pos-primary text-white"
									: "hover:bg-pos-hover"
							)}
							title="リスト表示"
						>
							<List className="h-4 w-4" />
						</button>
					</div>
					
					{/* ソート順 */}
					<div className="flex items-center gap-2">
						<span className="text-sm">並び順:</span>
						<select
							value={sortOrder}
							onChange={(e) => setSortOrder(e.target.value as SortOrder)}
							className="px-3 py-1 border-2 border-pos-border focus:outline-none focus:ring-2 focus:ring-pos-accent"
						>
							<option value="newest">新着順</option>
							<option value="name">商品名順</option>
							<option value="price-asc">価格が安い順</option>
							<option value="price-desc">価格が高い順</option>
						</select>
					</div>
				</div>
			</div>
			
			{/* 商品グリッド */}
			<div className="flex-1 overflow-y-auto">
				{viewMode === 'grid' ? (
					<div className="p-4 grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
						{sortedProducts.map((product) => (
							<ProductCard 
								key={product.id} 
								product={product}
								onShowDetail={handleShowDetail}
							/>
						))}
					</div>
				) : (
					<div className="divide-y-2 divide-pos-border">
						{sortedProducts.map((product) => (
							<ProductCard 
								key={product.id} 
								product={product} 
								isListView={true}
								onShowDetail={handleShowDetail}
							/>
						))}
					</div>
				)}
			</div>
			
			{/* 商品詳細ダイアログ */}
			<ProductDetailDialog
				product={selectedProduct}
				products={sortedProducts}
				open={showDetailDialog}
				onOpenChange={setShowDetailDialog}
				onProductChange={setSelectedProduct}
				onAddToCart={handleAddToCart}
			/>
		</div>
	);
}
