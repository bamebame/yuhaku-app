/**
 * クライアントファクトリーのコンテキスト型定義
 */
export interface ClientContext {
	headers?: Record<string, string>
	timeout?: number
}