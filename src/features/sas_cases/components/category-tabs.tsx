"use client";

import { useMemo } from "react";
import { useSasCaseEditStore } from "@/features/sas_cases/stores/edit-store";
import { useFilterStore } from "@/features/sas_cases/stores/filter-store";
import { cn } from "@/lib/utils";

export function CategoryTabs() {
	const { categories, products } = useSasCaseEditStore();
	const { 
		categoryId: selectedCategoryId, 
		setCategoryId,
		series: selectedSeries,
		colors: selectedColors,
		sizes: selectedSizes,
		priceRange: selectedPriceRange,
		searchKeyword
	} = useFilterStore();

	// 商品数をカテゴリごとに集計
	const categoryProductCounts = useMemo(() => {
		const counts = new Map<string, number>();
		
		// 各カテゴリの商品数をカウント
		products.forEach((product) => {
			if (product.categoryId) {
				counts.set(product.categoryId, (counts.get(product.categoryId) || 0) + 1);
			}
		});
		
		// 子カテゴリの商品数を親カテゴリにも加算
		categories.forEach((category) => {
			const directCount = counts.get(category.id) || 0;
			if (directCount > 0 && category.ancestors.length > 0) {
				// 祖先カテゴリにも加算
				category.ancestors.forEach((ancestor) => {
					counts.set(ancestor.id, (counts.get(ancestor.id) || 0) + directCount);
				});
			}
		});
		
		return counts;
	}, [categories, products]);

	// 商品がある親カテゴリのみ表示
	const topCategories = categories.filter((cat) => {
		return cat.ancestors.length === 0 && (categoryProductCounts.get(cat.id) || 0) > 0;
	});

	// 複数フィルターが選択されているか確認
	const hasMultipleFilters = 
		(selectedCategoryId ? 1 : 0) +
		(selectedSeries.length > 0 ? 1 : 0) +
		(selectedColors.length > 0 ? 1 : 0) +
		(selectedSizes.length > 0 ? 1 : 0) +
		(selectedPriceRange ? 1 : 0) +
		(searchKeyword ? 1 : 0) > 1;

	return (
		<div className="border-b-2 border-pos-border">
			<div className="w-full">
				<div className="flex flex-wrap p-2 gap-2">
					<button
						type="button"
						onClick={() => setCategoryId(null)}
						className={cn(
							"flex-shrink-0 px-4 py-2 text-pos-base font-medium transition-all",
							"border-2 border-pos-border",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
							selectedCategoryId === null
								? "bg-pos-primary text-white border-pos-primary hover:bg-pos-primary-dark hover:text-white"
								: "bg-transparent hover:bg-pos-hover"
						)}
					>
						すべて {!hasMultipleFilters && `(${products.length})`}
					</button>
					{topCategories.map((category) => {
						const productCount = categoryProductCounts.get(category.id) || 0;
						return (
							<button
								key={category.id}
								type="button"
								onClick={() => setCategoryId(category.id)}
								className={cn(
									"flex-shrink-0 px-4 py-2 text-pos-base font-medium transition-all",
									"border-2 border-pos-border",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
									selectedCategoryId === category.id
										? "bg-pos-primary text-white border-pos-primary hover:bg-pos-primary-dark hover:text-white"
										: "bg-transparent hover:bg-pos-hover"
								)}
							>
								{category.name} {!hasMultipleFilters && `(${productCount})`}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}
