/**
 * パラメータの変換ユーティリティ
 * undefined値を除外し、配列をカンマ区切り文字列に変換
 */
export function transformParams<T extends Record<string, unknown>>(
	params: T,
): Record<string, string> {
	const result: Record<string, string> = {}

	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null) {
			continue
		}

		if (Array.isArray(value)) {
			result[key] = value.join(",")
		} else {
			result[key] = String(value)
		}
	}

	return result
}