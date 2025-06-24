"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import { useFilterStore } from "../../stores/filter-store";
import { useSasCaseEditStore } from "../../stores/edit-store";
import { useProductAttributes } from "../../hooks/useProductAttributes";
import { cn } from "@/lib/utils";

export function SizeFilter() {
	const { 
		categoryId: selectedCategoryId,
		series: selectedSeries,
		colors: selectedColors,
		sizes: selectedSizes,
		priceRange: selectedPriceRange,
		searchKeyword,
		toggleSize
	} = useFilterStore();
	const { products } = useSasCaseEditStore();
	const { sizes: availableSizesFromAPI, isLoading } = useProductAttributes();
	
	// 複数フィルターが選択されているか確認
	const hasMultipleFilters = 
		(selectedCategoryId ? 1 : 0) +
		(selectedSeries.length > 0 ? 1 : 0) +
		(selectedColors.length > 0 ? 1 : 0) +
		(selectedSizes.length > 0 ? 1 : 0) +
		(selectedPriceRange ? 1 : 0) +
		(searchKeyword ? 1 : 0) > 1;
	
	// サイズ別の商品数を計算
	const sizeStats = useMemo(() => {
		const stats = new Map<string, number>();
		products.forEach((product) => {
			const size = product.attribute?.custom_size;
			if (size) {
				stats.set(size, (stats.get(size) || 0) + 1);
			}
		});
		return stats;
	}, [products]);
	
	// APIから取得したサイズのうち、実際に商品があるもののみを使用
	const availableSizes = useMemo(() => {
		if (!availableSizesFromAPI || availableSizesFromAPI.length === 0) {
			// APIからデータが取得できない場合は現在の商品から取得
			return Array.from(sizeStats.keys()).sort();
		}
		// APIのサイズで実際に商品があるもののみ
		return availableSizesFromAPI.filter(size => sizeStats.has(size));
	}, [availableSizesFromAPI, sizeStats]);
	
	// サイズの表示順を整理（数値、アルファベット順など）
	const sortedSizes = useMemo(() => {
		return [...availableSizes].sort((a, b) => {
			// 数値サイズを優先
			const aNum = parseFloat(a);
			const bNum = parseFloat(b);
			if (!isNaN(aNum) && !isNaN(bNum)) {
				return aNum - bNum;
			}
			// その他は文字列として比較
			return a.localeCompare(b, 'ja');
		});
	}, [availableSizes]);
	
	if (isLoading) {
		return (
			<div className="p-8 text-center text-pos-muted">
				読み込み中...
			</div>
		);
	}
	
	if (sortedSizes.length === 0) {
		return (
			<div className="p-8 text-center text-pos-muted">
				サイズ情報がありません
			</div>
		);
	}
	
	return (
		<div className="p-4">
			<div className="mb-4">
				<h3 className="text-sm font-semibold mb-3">サイズを選択</h3>
				<div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
					{sortedSizes.map((size) => {
						const count = sizeStats.get(size) || 0;
						const isSelected = selectedSizes.includes(size);
						
						return (
							<button
								key={size}
								onClick={() => toggleSize(size)}
								disabled={count === 0}
								className={cn(
									"relative p-2 text-sm font-medium border-2 border-pos-border transition-all",
									"hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
									isSelected
										? "bg-pos-primary text-white border-pos-primary"
										: "bg-white hover:bg-pos-hover disabled:hover:bg-white"
								)}
							>
								{isSelected && (
									<div className="absolute top-0.5 right-0.5">
										<Check className="h-3 w-3" />
									</div>
								)}
								<div>{size}</div>
								{!hasMultipleFilters && (
									<div className={cn(
										"text-xs mt-0.5",
										isSelected ? "text-white/80" : "text-pos-muted"
									)}>
										({count})
									</div>
								)}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}