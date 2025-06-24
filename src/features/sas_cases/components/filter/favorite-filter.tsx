"use client";

import { useMemo } from "react";
import { Heart } from "lucide-react";
import { useFilterStore } from "../../stores/filter-store";
import { useSasCaseEditStore } from "../../stores/edit-store";

export function FavoriteFilter() {
	const { favorites } = useFilterStore();
	const { products } = useSasCaseEditStore();
	
	// お気に入り商品を取得
	const favoriteProducts = useMemo(() => {
		return products.filter(product => 
			favorites.some(fav => fav.productId === product.id)
		);
	}, [products, favorites]);
	
	if (favoriteProducts.length === 0) {
		return (
			<div className="p-8 text-center text-pos-muted">
				<Heart className="h-12 w-12 mx-auto mb-4" />
				<p className="text-lg font-medium mb-2">お気に入りがありません</p>
				<p className="text-sm">商品カードの♡ボタンでお気に入りに追加できます</p>
			</div>
		);
	}
	
	return (
		<div className="p-4">
			<div className="flex items-center gap-2 mb-4">
				<Heart className="h-5 w-5 fill-red-500 text-red-500" />
				<h3 className="text-lg font-semibold">
					お気に入り商品 ({favoriteProducts.length}件)
				</h3>
			</div>
			
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
				{favoriteProducts.map((product) => (
					<div
						key={product.id}
						className="p-3 border-2 border-pos-border hover:bg-pos-hover transition-colors cursor-pointer"
					>
						<div className="aspect-square bg-pos-light border border-pos-border mb-2 flex items-center justify-center text-pos-muted">
							{product.imageUrls?.[0] ? (
								<img
									src={product.imageUrls[0]}
									alt={product.title}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="text-xs">No Image</div>
							)}
						</div>
						<div className="text-sm font-medium line-clamp-2 mb-1">
							{product.title}
						</div>
						<div className="text-xs text-pos-muted">
							{product.code}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}