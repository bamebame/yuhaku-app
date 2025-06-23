import { NextResponse } from "next/server";
import { RecoreError } from "@/lib/recore/baseClient";

/**
 * API レスポンスヘルパー
 */
export const apiResponse = {
	/**
	 * 成功レスポンスを返す
	 */
	success: <T>(data: T, status = 200) => {
		return NextResponse.json({ data }, { status });
	},

	/**
	 * エラーレスポンスを返す
	 */
	error: (error: unknown) => {
		// デバッグモードでは詳細なエラー情報を出力
		if (process.env.DEBUG_API === "true") {
			console.error("API Error Details:", {
				error,
				stack: error instanceof Error ? error.stack : undefined,
				timestamp: new Date().toISOString(),
			});
		} else {
			console.error("API Error:", error instanceof Error ? error.message : "Unknown error");
		}

		if (error instanceof RecoreError) {
			// 本番環境では機密情報を含む可能性のある詳細を除外
			const safeDetails = process.env.NODE_ENV === "production" 
				? undefined 
				: error.details;

			return NextResponse.json(
				{
					error: {
						message: error.message,
						code: error.code,
						details: safeDetails,
						timestamp: new Date().toISOString(),
					},
				},
				{ status: error.status || 500 },
			);
		}

		if (error instanceof Error) {
			const message = process.env.NODE_ENV === "production"
				? "エラーが発生しました"
				: error.message;

			return NextResponse.json(
				{
					error: {
						message,
						code: "INTERNAL_ERROR",
						timestamp: new Date().toISOString(),
					},
				},
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{
				error: {
					message: "エラーが発生しました",
					code: "UNKNOWN_ERROR",
					timestamp: new Date().toISOString(),
				},
			},
			{ status: 500 },
		);
	},

	/**
	 * 認証エラーレスポンスを返す
	 */
	unauthorized: (message = "Unauthorized") => {
		return NextResponse.json(
			{
				error: {
					message,
					code: "UNAUTHORIZED",
				},
			},
			{ status: 401 },
		);
	},

	/**
	 * バリデーションエラーレスポンスを返す
	 */
	validationError: (errors: Record<string, string[]>) => {
		return NextResponse.json(
			{
				error: {
					message: "Validation failed",
					code: "VALIDATION_ERROR",
					details: { errors },
				},
			},
			{ status: 400 },
		);
	},

	/**
	 * Not Foundレスポンスを返す
	 */
	notFound: (message = "Resource not found") => {
		return NextResponse.json(
			{
				error: {
					message,
					code: "NOT_FOUND",
				},
			},
			{ status: 404 },
		);
	},
};
