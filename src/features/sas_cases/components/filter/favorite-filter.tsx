"use client";

import { Heart } from "lucide-react";
import { useFilterStore } from "../../stores/filter-store";

export function FavoriteFilter() {
	const { favorites } = useFilterStore();
	
	return (
		<div className="p-4">
			<div className="flex items-center gap-2">
				<Heart className="h-5 w-5 fill-destructive text-destructive" />
				<h3 className="text-lg font-semibold">
					お気に入り商品 ({favorites.length}件)
				</h3>
			</div>
			{favorites.length === 0 && (
				<p className="text-sm text-pos-muted mt-2">
					商品カードの♡ボタンでお気に入りに追加できます
				</p>
			)}
		</div>
	);
}