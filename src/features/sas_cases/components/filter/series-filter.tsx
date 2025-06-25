"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import { useFilterStore } from "../../stores/filter-store";
import { useSasCaseEditStore } from "../../stores/edit-store";
import { useProductAttributes } from "../../hooks/useProductAttributes";
import { POPULAR_SERIES } from "../../constants/filter";
import { cn } from "@/lib/utils";

export function SeriesFilter() {
	const { 
		series: selectedSeries, 
		toggleSeries,
		categoryId: selectedCategoryId,
		colors: selectedColors,
		sizes: selectedSizes,
		priceRange: selectedPriceRange,
		searchKeyword
	} = useFilterStore();
	const { products } = useSasCaseEditStore();
	const { series: availableSeriesFromAPI, isLoading } = useProductAttributes();
	
	// シリーズ別の商品数を計算
	const seriesStats = useMemo(() => {
		const stats = new Map<string, number>();
		products.forEach((product) => {
			const series = product.attribute?.custom_series;
			if (series) {
				stats.set(series, (stats.get(series) || 0) + 1);
			}
		});
		return stats;
	}, [products]);
	
	// APIから取得したシリーズのうち、実際に商品があるもののみを使用
	const allSeries = useMemo(() => {
		if (!availableSeriesFromAPI || availableSeriesFromAPI.length === 0) {
			// APIからデータが取得できない場合は現在の商品から取得
			return Array.from(seriesStats.keys()).sort((a, b) => {
				const countA = seriesStats.get(a) || 0;
				const countB = seriesStats.get(b) || 0;
				return countB - countA;
			});
		}
		
		// APIのシリーズで実際に商品があるもののみをフィルタ
		return availableSeriesFromAPI.filter(series => seriesStats.has(series));
	}, [availableSeriesFromAPI, seriesStats]);
	
	// すべてのシリーズを一つのリストに（人気シリーズを先頭に配置）
	const sortedSeries = useMemo(() => {
		const popular = POPULAR_SERIES.filter((s) => seriesStats.has(s));
		const others = allSeries.filter((s) => !POPULAR_SERIES.includes(s));
		return [...popular, ...others];
	}, [allSeries, seriesStats]);
	
	// 複数フィルターが選択されているか確認
	const hasMultipleFilters = 
		(selectedCategoryId ? 1 : 0) +
		(selectedSeries.length > 0 ? 1 : 0) +
		(selectedColors.length > 0 ? 1 : 0) +
		(selectedSizes.length > 0 ? 1 : 0) +
		(selectedPriceRange ? 1 : 0) +
		(searchKeyword ? 1 : 0) > 1;
	
	const SeriesCard = ({ series }: { series: string }) => {
		const count = seriesStats.get(series) || 0;
		const isSelected = selectedSeries.includes(series);
		
		return (
			<button
				onClick={() => toggleSeries(series)}
				className={cn(
					"relative p-4 border-2 border-pos-border transition-all",
					"hover:shadow-md",
					isSelected
						? "bg-pos-primary text-white border-pos-primary"
						: "bg-white hover:bg-pos-hover"
				)}
			>
				{isSelected && (
					<div className="absolute top-2 right-2">
						<Check className="h-4 w-4" />
					</div>
				)}
				<div className="text-lg font-bold">{series}</div>
				{!hasMultipleFilters && <div className="text-sm mt-1">({count})</div>}
			</button>
		);
	};
	
	return (
		<div className="p-4">
			{/* すべてのシリーズを表示 */}
			{sortedSeries.length > 0 && (
				<div className="max-h-[400px] overflow-y-auto">
					<div className="grid grid-cols-4 gap-3">
						{sortedSeries.map((series) => (
							<SeriesCard key={series} series={series} />
						))}
					</div>
				</div>
			)}
			
			{isLoading && (
				<div className="text-center py-8 text-pos-muted">
					読み込み中...
				</div>
			)}
			
			{!isLoading && sortedSeries.length === 0 && (
				<div className="text-center py-8 text-pos-muted">
					シリーズ情報がありません
				</div>
			)}
		</div>
	);
}