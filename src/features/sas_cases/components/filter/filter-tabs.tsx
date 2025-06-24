"use client";

import { X, ChevronDown } from "lucide-react";
import { useFilterStore } from "../../stores/filter-store";
import { cn } from "@/lib/utils";

export function FilterTabs() {
	const {
		activeTab,
		toggleActiveTab,
		setActiveTab,
		categoryId,
		series,
		colors,
		priceRange,
		sizes,
		clearFilters,
	} = useFilterStore();
	
	// 適用中のフィルター数を計算
	const activeFilterCount = [
		categoryId ? 1 : 0,
		series.length,
		colors.length,
		sizes.length,
		priceRange ? 1 : 0,
	].reduce((a, b) => a + b, 0);
	
	const tabs = [
		{ id: 'category' as const, label: 'カテゴリ' },
		{ id: 'series' as const, label: 'シリーズ' },
		{ id: 'color' as const, label: '色' },
		{ id: 'price' as const, label: '価格帯' },
		{ id: 'size' as const, label: 'サイズ' },
		{ id: 'favorite' as const, label: 'お気に入り' },
	];
	
	return (
		<div className={cn(
			"flex items-center justify-between px-4 py-2 bg-pos-background",
			!activeTab && "border-b-2 border-pos-border"
		)}>
			<div className="flex gap-1">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => toggleActiveTab(tab.id)}
						className={cn(
							"px-4 py-2 font-medium transition-colors",
							"border-2 border-pos-border",
							activeTab === tab.id
								? "bg-pos-foreground text-white"
								: "bg-white text-pos-foreground hover:bg-pos-hover"
						)}
					>
						{tab.label}
					</button>
				))}
			</div>
			
			<div className="flex items-center gap-4">
				{activeFilterCount > 0 && (
					<div className="flex items-center gap-2">
						<span className="text-sm">
							適用中: <span className="font-bold">{activeFilterCount}</span>
						</span>
						<button
							onClick={clearFilters}
							className="p-1 hover:bg-pos-hover rounded transition-colors"
							title="フィルターをクリア"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				)}
				
				{activeTab && (
					<button
						onClick={() => setActiveTab(null)}
						className="p-1 hover:bg-pos-hover rounded transition-colors"
						title="フィルターを閉じる"
					>
						<ChevronDown className="h-4 w-4" />
					</button>
				)}
			</div>
		</div>
	);
}