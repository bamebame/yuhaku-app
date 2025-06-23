"use client";

import { ProductCard } from "./product-card";
import type { Product } from "@/features/products/types";

interface ProductGridProps {
	products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
	if (products.length === 0) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-pos-muted">商品がありません</p>
			</div>
		);
	}

	return (
		<div className="p-4 grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
			{products.map((product) => (
				<ProductCard key={product.id} product={product} />
			))}
		</div>
	);
}
