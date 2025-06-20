import { NextResponse } from "next/server"
import { RecoreError } from "@/lib/recore/baseClient"

/**
 * API レスポンスヘルパー
 */
export const apiResponse = {
	/**
	 * 成功レスポンスを返す
	 */
	success: <T>(data: T, status = 200) => {
		return NextResponse.json({ data }, { status })
	},

	/**
	 * エラーレスポンスを返す
	 */
	error: (error: unknown) => {
		console.error("API Error:", error)

		if (error instanceof RecoreError) {
			return NextResponse.json(
				{
					error: {
						message: error.message,
						code: error.code,
						details: error.details,
					},
				},
				{ status: error.status || 500 },
			)
		}

		if (error instanceof Error) {
			return NextResponse.json(
				{
					error: {
						message: error.message,
						code: "INTERNAL_ERROR",
					},
				},
				{ status: 500 },
			)
		}

		return NextResponse.json(
			{
				error: {
					message: "Internal Server Error",
					code: "UNKNOWN_ERROR",
				},
			},
			{ status: 500 },
		)
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
		)
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
		)
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
		)
	},
}