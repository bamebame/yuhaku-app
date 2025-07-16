import useSWR from "swr";
import type { ProductAttribute } from "@/lib/recore/product-attributes";

const fetcher = (url: string) => fetch(url).then(res => res.json());

/**
 * 商品属性を取得するフック
 */
export function useProductAttributes() {
	const { data, error, isLoading } = useSWR<{ data: ProductAttribute[] }>(
		"/api/product-attributes",
		fetcher,
		{
			// 属性情報は頻繁に変わらないので長めにキャッシュ
			refreshInterval: 5 * 60 * 1000, // 5分
			revalidateOnFocus: false,
		}
	);
	
	// 特定の属性を取得するヘルパー関数
	const getAttributeValues = (attributeName: string): string[] => {
		if (!data?.data) return [];
		const attribute = data.data.find(attr => attr.name === attributeName);
		return attribute?.values || [];
	};
	
	// よく使う属性のショートカット
	const seriesValues = getAttributeValues("custom_series");
	const colorValues = getAttributeValues("color");
	const sizeValues = getAttributeValues("custom_size");
	const brandValues = getAttributeValues("brand");
	
	return {
		attributes: data?.data || [],
		isLoading,
		error,
		getAttributeValues,
		// 便利なショートカット
		series: seriesValues,
		colors: colorValues,
		sizes: sizeValues,
		brands: brandValues,
	};
}