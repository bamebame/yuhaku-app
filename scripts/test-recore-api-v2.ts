/**
 * ReCORE API テストスクリプト v2
 * カテゴリ、商品、属性の構造を調査（修正版）
 */

const BASE_URL = process.env.RECORE_API_URL || "https://co-api.recore-pos.com"
const JWT_KEY = process.env.RECORE_API_JWT || ""

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
				"Content-Type": "application/json",
				Authorization: `Bearer ${JWT_KEY}`,
			},
		})

		const responseText = await response.text()
		console.log(`📊 Response status: ${response.status}`)

		if (!response.ok) {
			console.error(`❌ Response body: ${responseText}`)
			throw new Error(
				`HTTP ${response.status}: ${response.statusText}`,
			)
		}

		const data = JSON.parse(responseText)
		return data
	} catch (error) {
		console.error(`❌ Error fetching ${path}:`, error)
		throw error
	}
}

async function investigateCategories() {
	console.log("\n🔍 === カテゴリ構造の調査 ===")
	try {
		// パラメータなしで取得を試みる
		const categories = await fetchRecore("/categories")
		console.log(`✅ カテゴリ数: ${Array.isArray(categories) ? categories.length : 'Not an array'}`);

		if (Array.isArray(categories) && categories.length > 0) {
			// 最初の3件を詳細表示
			const samples = categories.slice(0, 3)
			for (const category of samples) {
				console.log("\nカテゴリサンプル:")
				console.log(JSON.stringify(category, null, 2))
			}

			// カテゴリ構造の分析
			const keys = Object.keys(categories[0])
			console.log("\n📊 カテゴリのキー構造:", keys)
		}
	} catch (error) {
		console.error("カテゴリ取得失敗:", error)
		
		// 特定のIDで再試行
		try {
			console.log("\n🔄 特定IDで再試行...")
			const categories = await fetchRecore("/categories", { ids: "1" })
			console.log("✅ 再試行成功:")
			console.log(JSON.stringify(categories, null, 2))
		} catch (retryError) {
			console.error("再試行も失敗:", retryError)
		}
	}
}

async function investigateProducts() {
	console.log("\n🔍 === 商品構造の調査 ===")
	try {
		// limitパラメータ付きで取得
		const products = await fetchRecore("/products", { limit: "5" })
		console.log(`✅ 商品数: ${Array.isArray(products) ? products.length : 'Not an array'}`);

		if (Array.isArray(products) && products.length > 0) {
			// 最初の商品を詳細表示
			console.log("\n商品サンプル:")
			console.log(JSON.stringify(products[0], null, 2))

			const keys = Object.keys(products[0])
			console.log("\n📊 商品のキー構造:", keys)
			
			// 属性がある場合は属性も表示
			if (products[0].attribute) {
				const attrKeys = Object.keys(products[0].attribute)
				console.log("📊 商品属性のキー構造:", attrKeys)
			}
		}
	} catch (error) {
		console.error("商品取得失敗:", error)
	}
}

async function investigateProductAttributes() {
	console.log("\n🔍 === 商品属性構造の調査 ===")
	try {
		const attributes = await fetchRecore("/products/attributes")
		console.log(`✅ 属性タイプ: ${typeof attributes}`);
		
		if (Array.isArray(attributes)) {
			console.log(`✅ 属性数: ${attributes.length}`)
			// 最初の3件を詳細表示
			const samples = attributes.slice(0, 3)
			for (const attr of samples) {
				console.log("\n属性サンプル:")
				console.log(JSON.stringify(attr, null, 2))
			}
		} else {
			console.log("レスポンス内容:")
			console.log(JSON.stringify(attributes, null, 2))
		}
	} catch (error) {
		console.error("属性取得失敗:", error)
	}
}

async function investigateItemAttributes() {
	console.log("\n🔍 === アイテム属性構造の調査 ===")
	try {
		const attributes = await fetchRecore("/items/attributes")
		console.log(`✅ アイテム属性タイプ: ${typeof attributes}`);
		
		if (Array.isArray(attributes)) {
			console.log(`✅ アイテム属性数: ${attributes.length}`)
			// 最初の3件を詳細表示
			const samples = attributes.slice(0, 3)
			for (const attr of samples) {
				console.log("\nアイテム属性サンプル:")
				console.log(JSON.stringify(attr, null, 2))
			}
		} else {
			console.log("レスポンス内容:")
			console.log(JSON.stringify(attributes, null, 2))
		}
	} catch (error) {
		console.error("アイテム属性取得失敗:", error)
	}
}

// 個別の商品を取得してみる
async function investigateSingleProduct() {
	console.log("\n🔍 === 個別商品の調査 ===")
	try {
		// まず商品一覧から1件取得
		const products = await fetchRecore("/products", { limit: "1" })
		if (Array.isArray(products) && products.length > 0) {
			const productId = products[0].id
			console.log(`\n📦 商品ID ${productId} の詳細を取得...`)
			
			const product = await fetchRecore(`/products/${productId}`)
			console.log("商品詳細:")
			console.log(JSON.stringify(product, null, 2))
		}
	} catch (error) {
		console.error("個別商品取得失敗:", error)
	}
}

async function main() {
	console.log("🚀 ReCORE API 調査開始 v2")
	console.log(`📍 API URL: ${BASE_URL}`)
	console.log(`🔑 JWT: ${JWT_KEY.substring(0, 20)}...`)

	try {
		await investigateCategories()
		await investigateProducts()
		await investigateProductAttributes()
		await investigateItemAttributes()
		await investigateSingleProduct()
	} catch (error) {
		console.error("\n❌ 調査中にエラーが発生しました:", error)
	}

	console.log("\n✨ 調査完了")
}

// 環境変数をロード
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

main().catch(console.error)