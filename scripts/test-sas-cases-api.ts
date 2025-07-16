/**
 * SAS Cases API テストスクリプト
 * 店頭販売ケースAPIの動作確認
 */

import * as dotenv from "dotenv"
import * as path from "path"

// 環境変数をロード
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const BASE_URL = process.env.RECORE_API_URL || "https://co-api.recore-pos.com"
const JWT_KEY = process.env.RECORE_API_JWT || ""
const STORE_ID = process.env.RECORE_STORE_ID || "1"

interface ApiError {
	message: string
	code?: string
	details?: unknown
}

async function fetchRecore(path: string, params?: Record<string, string>): Promise<any> {
	let url = `${BASE_URL}${path}`
	
	// クエリパラメータを追加
	if (params) {
		const searchParams = new URLSearchParams(params)
		url += `?${searchParams.toString()}`
	}
	
	console.log(`\n📡 Fetching: ${url}`)

	try {
		const response = await fetch(url, {
			method: "GET",
			headers: {
				// GETリクエストにはContent-Typeヘッダーを含めない
				"X-Identification": JWT_KEY,
				"X-Store-Id": STORE_ID,
			},
		})

		const responseText = await response.text()
		console.log(`📊 Response status: ${response.status}`)
		console.log(`📋 Response headers:`)
		response.headers.forEach((value, key) => {
			console.log(`  ${key}: ${value}`)
		})

		if (!response.ok) {
			console.error(`❌ Response body: ${responseText}`)
			throw new Error(
				`HTTP ${response.status}: ${response.statusText}`,
			)
		}

		// 空のレスポンスの場合
		if (!responseText) {
			return null
		}

		const data = JSON.parse(responseText)
		return data
	} catch (error) {
		console.error(`❌ Error fetching ${path}:`, error)
		throw error
	}
}

async function testSasCases() {
	console.log("\n🔍 === 店頭販売ケース一覧の取得 ===")
	try {
		const cases = await fetchRecore("/sas_cases", { limit: "5" })
		console.log(`✅ ケース数: ${Array.isArray(cases) ? cases.length : 'Not an array'}`);

		if (Array.isArray(cases)) {
			if (cases.length === 0) {
				console.log("📭 ケースがありません")
			} else {
				console.log("\n📊 取得したケース:")
				for (const sasCase of cases) {
					console.log(`- ID: ${sasCase.id}, Code: ${sasCase.code}, Status: ${sasCase.status}`)
					if (sasCase.store) {
						console.log(`  店舗: ${sasCase.store.name} (ID: ${sasCase.store.id})`)
					}
					if (sasCase.summary) {
						console.log(`  合計: ¥${sasCase.summary.total.toLocaleString()}`)
					}
				}

				// 詳細サンプル
				console.log("\n詳細サンプル (最初の1件):")
				console.log(JSON.stringify(cases[0], null, 2))
			}
		} else {
			console.log("レスポンス内容:")
			console.log(JSON.stringify(cases, null, 2))
		}
	} catch (error) {
		console.error("ケース取得失敗:", error)
	}
}

async function testCreateSasCase() {
	console.log("\n🔍 === 店頭販売ケースの作成 ===")
	
	const url = `${BASE_URL}/sas_cases`
	const body = {
		reserve_mode: "RESERVE",
		staff_id: null,
		cashier_id: null,
		note: "APIテストケース",
		goods: []
	}

	console.log(`📡 Creating case at: ${url}`)
	console.log("📦 Request body:")
	console.log(JSON.stringify(body, null, 2))

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Identification": JWT_KEY,
				"X-Store-Id": STORE_ID,
			},
			body: JSON.stringify(body)
		})

		const responseText = await response.text()
		console.log(`📊 Response status: ${response.status}`)

		if (!response.ok) {
			console.error(`❌ Response body: ${responseText}`)
			return
		}

		const data = JSON.parse(responseText)
		console.log("✅ ケースが作成されました:")
		console.log(JSON.stringify(data, null, 2))
		
		return data.id
	} catch (error) {
		console.error("❌ ケース作成失敗:", error)
	}
}

async function main() {
	console.log("🚀 店頭販売ケースAPI調査開始")
	console.log(`📍 API URL: ${BASE_URL}`)
	console.log(`🔑 JWT: ${JWT_KEY.substring(0, 20)}...`)
	console.log(`🏪 Store ID: ${STORE_ID}`)

	try {
		// 一覧取得
		await testSasCases()
		
		// 作成テスト
		await testCreateSasCase()
		
		// 再度一覧取得
		console.log("\n🔍 === 作成後の一覧確認 ===")
		await testSasCases()
		
	} catch (error) {
		console.error("\n❌ 調査中にエラーが発生しました:", error)
	}

	console.log("\n✨ 調査完了")
}

main().catch(console.error)