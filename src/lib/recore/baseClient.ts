/**
 * ReCORE API基底クライアントクラス
 *
 * 各リソース固有のクライアントクラスの基底となるクラスです。
 * 共通のHTTPリクエスト処理、エラーハンドリング、認証などを提供します。
 */

import type { ClientContext } from "@/lib/context/client-factory";
import { transformParams } from "./utils";

const BASE_URL =
	process.env.RECORE_API_URL || "https://qa003.co-api.recore-pos.com";
const JWT_KEY = process.env.RECORE_API_JWT || "";

// デバッグモード確認
const DEBUG_API = process.env.DEBUG_API === "true";

// クライアントオプションの型定義
export interface ReCoreClientOptions {
	headers?: Record<string, string>;
	timeout?: number;
}

// リクエストオプションの型定義
export interface RequestOptions {
	headers?: Record<string, string>;
	timeout?: number;
}

// APIエラーの型定義
export interface RecoreApiError {
	code: string;
	message: string;
	details?: Record<string, unknown>;
}

// APIレスポンスの型定義
export interface RecoreApiResponse<T> {
	data?: T;
	error?: RecoreApiError;
}

/**
 * ReCORE APIエラーを表すクラス
 */
export class RecoreError extends Error {
	code: string;
	details?: Record<string, unknown>;
	status?: number;

	constructor(
		message: string,
		code: string,
		details?: Record<string, unknown>,
		status?: number,
	) {
		super(message);
		this.name = "RecoreError";
		this.code = code;
		this.details = details;
		this.status = status;
	}
}

/**
 * ReCORE API基底クライアントクラス
 */
export class BaseClient {
	protected baseHeaders: Record<string, string>;
	protected timeout: number;
	protected context: ClientContext;

	/**
	 * コンストラクタ
	 * @param context クライアントコンテキスト
	 * @param options クライアントオプション
	 */
	constructor(context: ClientContext, options: ReCoreClientOptions = {}) {
		this.context = context;
		this.baseHeaders = {
			...options.headers,
		};
		this.timeout = options.timeout || 30000; // デフォルトタイムアウト: 30秒

		// JWT設定確認
		if (!JWT_KEY) {
			console.error("WARNING: RECORE_API_JWT is not set");
		}
		if (DEBUG_API) {
			console.log("ReCORE API Configuration:", {
				baseUrl: BASE_URL,
				hasJWT: !!JWT_KEY,
				jwtLength: JWT_KEY.length,
			});
		}
	}

	/**
	 * 指定されたURLへのGETリクエストを実行します
	 * @param path エンドポイントパス
	 * @param params クエリパラメータ
	 * @param options リクエストオプション（ヘッダーやタイムアウト設定）
	 * @returns レスポンスデータ
	 */
	protected async get<
		T,
		P extends Record<string, unknown> = Record<string, unknown>,
	>(
		path: string,
		params: P = {} as P,
		options: RequestOptions = {},
	): Promise<T> {
		const url = this.buildUrl(path, params);
		return this.request<T>({
			method: "GET",
			url,
			...options,
		});
	}

	/**
	 * 指定されたURLへのPOSTリクエストを実行します
	 * @param path エンドポイントパス
	 * @param body リクエストボディ
	 * @param options リクエストオプション
	 * @returns レスポンスデータ
	 */
	protected async post<T>(
		path: string,
		body: unknown,
		options: RequestOptions = {},
	): Promise<T> {
		const url = this.buildUrl(path);
		return this.request<T>({
			method: "POST",
			url,
			body,
			...options,
		});
	}

	/**
	 * 指定されたURLへのPUTリクエストを実行します
	 * @param path エンドポイントパス
	 * @param body リクエストボディ
	 * @param options リクエストオプション
	 * @returns レスポンスデータ
	 */
	protected async put<T>(
		path: string,
		body: unknown,
		options: RequestOptions = {},
	): Promise<T> {
		const url = this.buildUrl(path);
		return this.request<T>({
			method: "PUT",
			url,
			body,
			...options,
		});
	}

	/**
	 * 指定されたURLへのDELETEリクエストを実行します
	 * @param path エンドポイントパス
	 * @param options リクエストオプション
	 * @returns レスポンスデータ
	 */
	protected async delete<T>(
		path: string,
		options: RequestOptions = {},
	): Promise<T> {
		const url = this.buildUrl(path);
		return this.request<T>({
			method: "DELETE",
			url,
			...options,
		});
	}

	/**
	 * URLを構築します
	 * @param path エンドポイントパス
	 * @param params クエリパラメータ
	 * @returns 完全なURL
	 */
	private buildUrl<P extends Record<string, unknown>>(
		path: string,
		params?: P,
	): string {
		const url = new URL(path, BASE_URL);

		if (params) {
			const transformedParams = transformParams(params);
			for (const [key, value] of Object.entries(transformedParams)) {
				url.searchParams.append(key, value);
			}
		}

		return url.toString();
	}

	/**
	 * HTTPリクエストを実行します
	 * @param config リクエスト設定
	 * @returns レスポンスデータ
	 */
	private async request<T>(config: {
		method: string;
		url: string;
		body?: unknown;
		headers?: Record<string, string>;
		timeout?: number;
	}): Promise<T> {
		const controller = new AbortController();
		const timeout = config.timeout || this.timeout;

		const timeoutId = setTimeout(() => controller.abort(), timeout);

		try {
			const headers: Record<string, string> = {
				"X-Identification": JWT_KEY,
				...this.baseHeaders,
				...this.context.headers,
				...config.headers,
			};

			// POSTやPUTリクエストの場合のみContent-Typeを追加
			if (config.method === "POST" || config.method === "PUT" || config.method === "PATCH") {
				headers["Content-Type"] = "application/json";
			}

			if (DEBUG_API) {
				console.log("ReCORE API Request:", {
					method: config.method,
					url: config.url,
					headers: {
						...headers,
						"X-Identification": headers["X-Identification"] ? "[REDACTED]" : undefined,
					},
					body: config.body,
				});
			}

			const response = await fetch(config.url, {
				method: config.method,
				headers,
				body: config.body ? JSON.stringify(config.body) : undefined,
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			const responseText = await response.text();
			let responseData: any;

			try {
				responseData = JSON.parse(responseText);
			} catch (e) {
				if (DEBUG_API) {
					console.error("Failed to parse response:", responseText);
				}
				throw new RecoreError(
					`Invalid JSON response: ${responseText}`,
					"PARSE_ERROR",
					{ responseText },
					response.status,
				);
			}

			if (DEBUG_API) {
				console.log("ReCORE API Response:", {
					status: response.status,
					data: responseData,
				});
			}

			if (!response.ok) {
				throw new RecoreError(
					responseData.message || `HTTP error! status: ${response.status}`,
					responseData.code || "HTTP_ERROR",
					responseData.details,
					response.status,
				);
			}

			return responseData as T;
		} catch (error) {
			clearTimeout(timeoutId);

			if (error instanceof RecoreError) {
				throw error;
			}

			if (error instanceof Error) {
				if (error.name === "AbortError") {
					throw new RecoreError("Request timeout", "TIMEOUT_ERROR", {
						timeout,
					});
				}
				throw new RecoreError(error.message, "NETWORK_ERROR");
			}

			throw new RecoreError("Unknown error occurred", "UNKNOWN_ERROR");
		}
	}
}