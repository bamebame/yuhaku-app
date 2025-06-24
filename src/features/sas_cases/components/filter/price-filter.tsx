"use client";

import { useState, useMemo } from "react";
import { useFilterStore } from "../../stores/filter-store";
import { useSasCaseEditStore } from "../../stores/edit-store";
import { PRICE_RANGES } from "../../constants/filter";
import { cn } from "@/lib/utils";

export function PriceFilter() {
	const { 
		priceRange, 
		setPriceRange,
		categoryId: selectedCategoryId,
		series: selectedSeries,
		colors: selectedColors,
		sizes: selectedSizes,
		searchKeyword
	} = useFilterStore();
	const { products } = useSasCaseEditStore();
	const [customMin, setCustomMin] = useState("");
	const [customMax, setCustomMax] = useState("");
	
	// 価格帯別の商品数を計算（在庫情報から価格を取得）
	const priceStats = useMemo(() => {
		const stats = new Map<string, number>();
		
		// 各定義済み価格帯の初期化
		PRICE_RANGES.forEach((range) => {
			stats.set(range.label, 0);
		});
		
		// 商品ごとに価格を確認
		products.forEach((product) => {
			// TODO: 実際の価格データ構造に合わせて修正が必要
			// 仮実装：商品IDから仮の価格を生成
			const price = parseInt(product.id) * 100;
			
			// どの価格帯に属するか判定
			for (const range of PRICE_RANGES) {
				const inRange = 
					(range.min === null || price >= range.min) &&
					(range.max === null || price <= range.max);
				
				if (inRange) {
					stats.set(range.label, (stats.get(range.label) || 0) + 1);
					break;
				}
			}
		});
		
		return stats;
	}, [products]);
	
	// 複数フィルターが選択されているか確認
	const hasMultipleFilters = 
		(selectedCategoryId ? 1 : 0) +
		(selectedSeries.length > 0 ? 1 : 0) +
		(selectedColors.length > 0 ? 1 : 0) +
		(selectedSizes.length > 0 ? 1 : 0) +
		(priceRange ? 1 : 0) +
		(searchKeyword ? 1 : 0) > 1;
	
	// カスタム範囲の適用
	const handleCustomRange = () => {
		const min = customMin ? parseInt(customMin) : null;
		const max = customMax ? parseInt(customMax) : null;
		
		if (min !== null || max !== null) {
			const label = `¥${min?.toLocaleString() || '0'}〜${max ? `¥${max.toLocaleString()}` : ''}`;
			setPriceRange({ min, max, label });
		}
	};
	
	// カスタム範囲のクリア
	const handleClearCustom = () => {
		setCustomMin("");
		setCustomMax("");
		if (priceRange && !PRICE_RANGES.some(r => r.label === priceRange.label)) {
			setPriceRange(null);
		}
	};
	
	return (
		<div className="p-4 space-y-4">
			<div>
				<h3 className="text-sm font-semibold mb-3">価格帯を選択</h3>
				<div className="space-y-2">
					{PRICE_RANGES.map((range) => {
						const count = priceStats.get(range.label) || 0;
						const isSelected = priceRange?.label === range.label;
						
						return (
							<label
								key={range.label}
								className={cn(
									"flex items-center gap-3 p-3 border-2 border-pos-border cursor-pointer transition-colors",
									"hover:bg-pos-hover",
									isSelected && "bg-pos-primary text-white"
								)}
							>
								<input
									type="radio"
									name="price-range"
									checked={isSelected}
									onChange={() => setPriceRange(range)}
									className="w-4 h-4"
								/>
								<span className="flex-1">{range.label}</span>
								{!hasMultipleFilters && (
									<span className={cn(
										"text-sm",
										isSelected ? "text-white/80" : "text-pos-muted"
									)}>
										({count})
									</span>
								)}
							</label>
						);
					})}
				</div>
			</div>
			
			<div className="border-t-2 border-pos-border pt-4">
				<h3 className="text-sm font-semibold mb-3">カスタム範囲</h3>
				<div className="flex items-center gap-2">
					<span className="text-sm">¥</span>
					<input
						type="number"
						value={customMin}
						onChange={(e) => setCustomMin(e.target.value)}
						placeholder="最小"
						className="flex-1 px-2 py-1 border-2 border-pos-border focus:outline-none focus:ring-2 focus:ring-pos-accent"
					/>
					<span className="text-sm">〜</span>
					<span className="text-sm">¥</span>
					<input
						type="number"
						value={customMax}
						onChange={(e) => setCustomMax(e.target.value)}
						placeholder="最大"
						className="flex-1 px-2 py-1 border-2 border-pos-border focus:outline-none focus:ring-2 focus:ring-pos-accent"
					/>
				</div>
				<div className="flex gap-2 mt-3">
					<button
						onClick={handleCustomRange}
						disabled={!customMin && !customMax}
						className={cn(
							"flex-1 px-3 py-2 border-2 border-pos-border font-medium transition-colors",
							customMin || customMax
								? "bg-pos-primary text-white hover:bg-pos-primary-dark"
								: "bg-gray-100 text-gray-400 cursor-not-allowed"
						)}
					>
						適用
					</button>
					<button
						onClick={handleClearCustom}
						className="px-3 py-2 border-2 border-pos-border hover:bg-pos-hover transition-colors"
					>
						クリア
					</button>
				</div>
			</div>
		</div>
	);
}