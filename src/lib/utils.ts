import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSSクラス名を結合・マージするユーティリティ関数
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
