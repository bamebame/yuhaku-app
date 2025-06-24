"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useFilterStore } from "../../stores/filter-store";
import { useSasCaseEditStore } from "../../stores/edit-store";
import { useProductAttributes } from "../../hooks/useProductAttributes";
import { COLOR_DEFINITIONS, MAIN_COLOR_CODES } from "../../constants/filter";
import { cn } from "@/lib/utils";

export function ColorFilter() {
	const { 
		colors: selectedColors, 
		toggleColor,
		categoryId: selectedCategoryId,
		series: selectedSeries,
		sizes: selectedSizes,
		priceRange: selectedPriceRange,
		searchKeyword
	} = useFilterStore();
	const { products } = useSasCaseEditStore();
	const { colors: availableColorsFromAPI, isLoading } = useProductAttributes();
	const [showOthers, setShowOthers] = useState(false);
	
	// 色別の商品数を計算
	const colorStats = useMemo(() => {
		const stats = new Map<string, number>();
		products.forEach((product) => {
			const color = product.attribute?.color;
			if (color) {
				stats.set(color, (stats.get(color) || 0) + 1);
			}
		});
		return stats;
	}, [products]);
	
	// APIから取得した色の中で実際に商品があるもの
	const actualColors = useMemo(() => {
		if (!availableColorsFromAPI || availableColorsFromAPI.length === 0) {
			// APIからデータが取得できない場合は現在の商品から取得
			return Array.from(colorStats.keys());
		}
		// APIの色で実際に商品があるもののみ
		return availableColorsFromAPI.filter(color => colorStats.has(color));
	}, [availableColorsFromAPI, colorStats]);
	
	// メイン色とその他の色に分ける
	const mainColors = COLOR_DEFINITIONS.filter((color) => 
		MAIN_COLOR_CODES.includes(color.code) && actualColors.includes(color.code)
	);
	
	const definedOtherColors = COLOR_DEFINITIONS.filter((color) => 
		!MAIN_COLOR_CODES.includes(color.code) && actualColors.includes(color.code)
	);
	
	// APIにあるが定義されていない色
	const undefinedColors = actualColors.filter(
		(code) => !COLOR_DEFINITIONS.some((def) => def.code === code)
	);
	
	// 複数フィルターが選択されているか確認
	const hasMultipleFilters = 
		(selectedCategoryId ? 1 : 0) +
		(selectedSeries.length > 0 ? 1 : 0) +
		(selectedColors.length > 0 ? 1 : 0) +
		(selectedSizes.length > 0 ? 1 : 0) +
		(selectedPriceRange ? 1 : 0) +
		(searchKeyword ? 1 : 0) > 1;
	
	const ColorItem = ({ code, name, hex }: { code: string; name: string; hex: string }) => {
		const count = colorStats.get(code) || 0;
		const isSelected = selectedColors.includes(code);
		
		return (
			<button
				onClick={() => toggleColor(code)}
				className={cn(
					"relative p-2 border-2 border-pos-border transition-all",
					"hover:shadow-md group",
					isSelected
						? "bg-pos-foreground"
						: "bg-white hover:bg-pos-hover"
				)}
			>
				{isSelected && (
					<div className="absolute top-1 right-1 bg-white rounded-full p-0.5">
						<Check className="h-3 w-3 text-pos-foreground" />
					</div>
				)}
				<div className="w-10 h-10 mx-auto mb-2 rounded-full border-2 border-pos-border" 
					style={{ backgroundColor: hex }}
				/>
				<div className={cn(
					"text-xs font-medium",
					isSelected ? "text-white" : "text-pos-foreground"
				)}>
					{code}
				</div>
				{!hasMultipleFilters && (
					<div className={cn(
						"text-xs",
						isSelected ? "text-white/80" : "text-pos-muted"
					)}>
						({count})
					</div>
				)}
			</button>
		);
	};
	
	// その他の色の総数を計算
	const otherColorsCount = definedOtherColors.length + undefinedColors.length;
	
	return (
		<div className="p-4 space-y-4">
			{/* メイン色 */}
			{mainColors.length > 0 && (
				<div>
					<h3 className="text-sm font-semibold mb-3">メイン色</h3>
					<div className="grid grid-cols-8 gap-2">
						{mainColors.map((color) => (
							<ColorItem
								key={color.code}
								code={color.code}
								name={color.name}
								hex={color.hex}
							/>
						))}
					</div>
				</div>
			)}
			
			{/* その他の色 */}
			{otherColorsCount > 0 && (
				<div>
					<button
						onClick={() => setShowOthers(!showOthers)}
						className="flex items-center gap-2 text-sm font-semibold mb-3 hover:text-pos-muted"
					>
						その他の色 ({otherColorsCount})
						{showOthers ? (
							<ChevronUp className="h-4 w-4" />
						) : (
							<ChevronDown className="h-4 w-4" />
						)}
					</button>
					
					{showOthers && (
						<div className="grid grid-cols-8 gap-2">
							{/* 定義されているその他の色 */}
							{definedOtherColors.map((color) => (
								<ColorItem
									key={color.code}
									code={color.code}
									name={color.name}
									hex={color.hex}
								/>
							))}
							{/* 未定義の色 */}
							{undefinedColors.map((code) => (
								<ColorItem
									key={code}
									code={code}
									name={code}
									hex="#E5E7EB"
								/>
							))}
						</div>
					)}
				</div>
			)}
			
			{isLoading && (
				<div className="text-center py-8 text-pos-muted">
					読み込み中...
				</div>
			)}
			
			{!isLoading && mainColors.length === 0 && otherColorsCount === 0 && (
				<div className="text-center py-8 text-pos-muted">
					色情報がありません
				</div>
			)}
		</div>
	);
}