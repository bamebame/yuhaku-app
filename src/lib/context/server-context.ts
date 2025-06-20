import type { ClientContext } from "./client-factory"

/**
 * サーバーサイドで使用するクライアントコンテキストを作成
 */
export async function createServerContext(): Promise<ClientContext> {
	// 必要に応じて認証情報やヘッダーを設定
	return {
		headers: {
			"X-Store-Id": process.env.RECORE_STORE_ID || "1",
		},
		timeout: 30000,
	}
}