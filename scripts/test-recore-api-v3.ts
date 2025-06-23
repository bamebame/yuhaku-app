/**
 * ReCORE API テストスクリプト v3
 * mono.appの実装を参考に修正
 */

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
				"Content-Type": "application/json",
				"X-Identification": JWT_KEY,
				"X-Store-Id": STORE_ID,
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

async function investigateCategories() {
	console.log("\n🔍 === カテゴリ構造の調査 ===")
	try {
		// パラメータなしで取得を試みる
		const categories = await fetchRecore("/categories")
		console.log(`✅ カテゴリ数: ${Array.isArray(categories) ? categories.length : 'Not an array'}`);

		if (Array.isArray(categories) && categories.length > 0) {
			// カテゴリ構造の分析
			console.log("\n📊 最初の5件のカテゴリ:")
			const samples = categories.slice(0, 5)
			for (const category of samples) {
				console.log(`- ID: ${category.id}, Name: ${category.name}, Parent: ${category.ancestors?.length ? category.ancestors[category.ancestors.length - 1].name : 'なし'}`)
			}

			// 詳細サンプル
			console.log("\n詳細サンプル (最初の1件):")
			console.log(JSON.stringify(categories[0], null, 2))

			// キー構造
			const keys = Object.keys(categories[0])
			console.log("\n📊 カテゴリのキー構造:", keys)
		}
	} catch (error) {
		console.error("カテゴリ取得失敗:", error)
	}
}

async function investigateProducts() {
	console.log("\n🔍 === 商品構造の調査 ===")
	try {
		// limitパラメータ付きで取得
		const products = await fetchRecore("/products", { limit: "5" })
		console.log(`✅ 商品数: ${Array.isArray(products) ? products.length : 'Not an array'}`);

		if (Array.isArray(products) && products.length > 0) {
			// 商品構造の分析
			console.log("\n📊 取得した商品:")
			for (const product of products) {
				console.log(`- ID: ${product.id}, Code: ${product.code}, Title: ${product.title}`)
			}

			// 詳細サンプル
			console.log("\n詳細サンプル (最初の1件):")
			console.log(JSON.stringify(products[0], null, 2))

			const keys = Object.keys(products[0])
			console.log("\n📊 商品のキー構造:", keys)
			
			// 属性がある場合は属性も表示
			if (products[0].attribute) {
				const attrKeys = Object.keys(products[0].attribute)
				console.log("📊 商品属性のキー構造:", attrKeys)
			}
			
			// カテゴリ構造
			if (products[0].category) {
				console.log("📊 商品カテゴリの構造:")
				console.log(JSON.stringify(products[0].category, null, 2))
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
			
			// 属性キーの一覧
			console.log("\n📊 属性キー一覧:")
			const uniqueKeys = new Set<string>()
			for (const attr of attributes) {
				if (attr.key) uniqueKeys.add(attr.key)
			}
			console.log([...uniqueKeys].join(", "))
			
			// 最初の5件を表示
			console.log("\n属性サンプル (最初の5件):")
			const samples = attributes.slice(0, 5)
			for (const attr of samples) {
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
			
			// 属性キーの一覧
			console.log("\n📊 アイテム属性キー一覧:")
			const uniqueKeys = new Set<string>()
			for (const attr of attributes) {
				if (attr.key) uniqueKeys.add(attr.key)
			}
			console.log([...uniqueKeys].join(", "))
			
			// 最初の5件を表示
			console.log("\nアイテム属性サンプル (最初の5件):")
			const samples = attributes.slice(0, 5)
			for (const attr of samples) {
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

// 特定カテゴリの商品を取得
async function investigateProductsByCategory() {
	console.log("\n🔍 === カテゴリ別商品の調査 ===")
	try {
		// まずカテゴリを取得
		const categories = await fetchRecore("/categories", { limit: "10" })
		if (Array.isArray(categories) && categories.length > 0) {
			// 最初のカテゴリで商品を検索
			const categoryId = categories[0].id
			console.log(`\n📦 カテゴリID ${categoryId} (${categories[0].name}) の商品を取得...`)
			
			const products = await fetchRecore("/products", { 
				category_id: categoryId.toString(),
				limit: "3"
			})
			
			if (Array.isArray(products) && products.length > 0) {
				console.log(`✅ 商品数: ${products.length}`)
				for (const product of products) {
					console.log(`- ${product.title} (ID: ${product.id})`)
				}
			} else {
				console.log("このカテゴリには商品がありません")
			}
		}
	} catch (error) {
		console.error("カテゴリ別商品取得失敗:", error)
	}
}

async function main() {
	console.log("🚀 ReCORE API 調査開始 v3")
	console.log(`📍 API URL: ${BASE_URL}`)
	console.log(`🔑 JWT: ${JWT_KEY.substring(0, 20)}...`)
	console.log(`🏪 Store ID: ${STORE_ID}`)

	try {
		await investigateCategories()
		await investigateProducts()
		await investigateProductAttributes()
		await investigateItemAttributes()
		await investigateProductsByCategory()
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