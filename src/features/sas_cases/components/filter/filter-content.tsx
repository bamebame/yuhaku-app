"use client";

import { useFilterStore } from "../../stores/filter-store";
import { CategoryTabs } from "../category-tabs";
import { SeriesFilter } from "./series-filter";
import { ColorFilter } from "./color-filter";
import { PriceFilter } from "./price-filter";
import { SizeFilter } from "./size-filter";
import { FavoriteFilter } from "./favorite-filter";

export function FilterContent() {
	const { activeTab } = useFilterStore();
	
	return (
		<div className="border-t-2 border-b-2 border-pos-border">
			{activeTab === 'category' && <CategoryTabs />}
			
			{activeTab === 'series' && <SeriesFilter />}
			
			{activeTab === 'color' && <ColorFilter />}
			
			{activeTab === 'price' && <PriceFilter />}
			
			{activeTab === 'size' && <SizeFilter />}
			
			{activeTab === 'favorite' && <FavoriteFilter />}
		</div>
	);
}