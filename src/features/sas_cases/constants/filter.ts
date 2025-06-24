/**
 * フィルター関連の定数
 */

import type { ColorDefinition, PriceRange } from "../types/filter";

/**
 * 色の定義
 */
export const COLOR_DEFINITIONS: ColorDefinition[] = [
	// ブルー系
	{ code: 'BLU', name: 'ブルー', hex: '#1E40AF', group: 'メイン色' },
	{ code: 'TBLU', name: 'ターコイズブルー', hex: '#0891B2', group: 'メイン色' },
	{ code: 'BLUGRN', name: 'ブルーグリーン', hex: '#059669', group: 'メイン色' },
	{ code: 'BLUMLT', name: 'ブルーマルチ', hex: '#3B82F6', group: 'メイン色' },
	{ code: 'NVY', name: 'ネイビー', hex: '#1E3A8A', group: 'メイン色' },
	
	// ブラウン系
	{ code: 'DBR', name: 'ダークブラウン', hex: '#7C2D12', group: 'メイン色' },
	{ code: 'CM', name: 'キャメル', hex: '#D97706', group: 'メイン色' },
	
	// グレー系
	{ code: 'GY', name: 'グレー', hex: '#6B7280', group: 'メイン色' },
	{ code: 'GYMLT', name: 'グレーマルチ', hex: '#9CA3AF', group: 'メイン色' },
	
	// その他の特定色
	{ code: 'WI', name: 'ワイン', hex: '#BE123C', group: 'メイン色' },
	{ code: 'PP', name: 'パープル', hex: '#9333EA', group: 'メイン色' },
	{ code: 'MPL', name: 'メープル', hex: '#EA580C', group: 'メイン色' },
	{ code: 'GRN', name: 'グリーン', hex: '#16A34A', group: 'メイン色' },
	{ code: 'WIMLT', name: 'ワインマルチ', hex: '#E11D48', group: 'メイン色' },
	{ code: 'BLK', name: 'ブラック', hex: '#000000', group: 'メイン色' },
	{ code: 'BLKGRN', name: 'ブラックグリーン', hex: '#064E3B', group: 'メイン色' },
];

/**
 * メイン色のカラーコード（色フィルターで最初から表示する色）
 */
export const MAIN_COLOR_CODES = [
	'BLU', 'TBLU', 'BLUGRN', 'BLUMLT', 'NVY', // ブルー系
	'DBR', 'CM', // ブラウン系
	'GY', 'GYMLT', // グレー系
	'WI', 'PP', 'MPL', 'GRN', 'WIMLT', 'BLK', 'BLKGRN', // その他の特定色
];

/**
 * 価格帯の定義
 */
export const PRICE_RANGES: PriceRange[] = [
	{ min: null, max: 10000, label: '〜¥10,000' },
	{ min: 10001, max: 30000, label: '¥10,001〜¥30,000' },
	{ min: 30001, max: 50000, label: '¥30,001〜¥50,000' },
	{ min: 50001, max: null, label: '¥50,001〜' },
];

/**
 * 人気シリーズ（上位4つ）
 */
export const POPULAR_SERIES = ['Veratula', 'Signature', 'Diamant', 'Proof'];

/**
 * 最近の検索履歴の最大保存数
 */
export const MAX_SEARCH_HISTORY = 5;

/**
 * お気に入りの最大保存数
 */
export const MAX_FAVORITES = 50;