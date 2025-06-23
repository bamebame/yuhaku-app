"use client";

import { useSasCaseEditStore } from "@/features/sas_cases/stores/edit-store";
import { cn } from "@/lib/utils";

export function CategoryTabs() {
	const { categories, selectedCategoryId, setSelectedCategory } =
		useSasCaseEditStore();

	// 親カテゴリのみ表示（またはリーフカテゴリのみなど、要件に応じて調整）
	const topCategories = categories.filter((cat) => cat.ancestors.length === 0);

	return (
		<div className="border-b-2 border-pos-border bg-pos-background">
			<div className="w-full overflow-x-auto">
				<div className="flex p-2 gap-2 min-w-max">
					<button
						type="button"
						onClick={() => setSelectedCategory(null)}
						className={cn(
							"flex-shrink-0 px-4 py-2 text-pos-base font-medium transition-all",
							"border-2 border-pos-border",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
							selectedCategoryId === null
								? "bg-pos-foreground text-white border-pos-foreground hover:bg-pos-muted hover:text-white"
								: "bg-transparent hover:bg-pos-hover"
						)}
					>
						すべて
					</button>
					{topCategories.map((category) => (
						<button
							key={category.id}
							type="button"
							onClick={() => setSelectedCategory(category.id)}
							className={cn(
								"flex-shrink-0 px-4 py-2 text-pos-base font-medium transition-all",
								"border-2 border-pos-border",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
								selectedCategoryId === category.id
									? "bg-pos-foreground text-white border-pos-foreground hover:bg-pos-muted hover:text-white"
									: "bg-transparent hover:bg-pos-hover"
							)}
						>
							{category.name}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
