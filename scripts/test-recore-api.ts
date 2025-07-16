/**
 * ReCORE API テストスクリプト
 * カテゴリ、商品、属性の構造を調査
 */

const BASE_URL = process.env.RECORE_API_URL || "https://co-api.recore-pos.com"
const JWT_KEY = process.env.RECORE_API_JWT || ""

interface ApiError {
	message: string
	code?: string
	details?: unknown
}

async function fetchRecore(path: string): Promise<any> {
	const url = `${BASE_URL}${path}`
	console.log(`\n📡 Fetching: ${url}`)

	try {
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${JWT_KEY}`,
			},
		})

		if (!response.ok) {
			const error = await response.json().catch(() => ({}))
			throw new Error(
				`HTTP ${response.status}: ${error.message || response.statusText}`,
			)
		}

		const data = await response.json()
		return data
	} catch (error) {
		console.error(`❌ Error fetching ${path}:`, error)
		throw error
	}
}

async function investigateCategories() {
	console.log("\n🔍 === カテゴリ構造の調査 ===")
	try {
		const categories = await fetchRecore("/categories")
		console.log(`✅ カテゴリ数: ${categories.length}`)

		// 最初の3件を詳細表示
		const samples = categories.slice(0, 3)
		for (const category of samples) {
			console.log("\nカテゴリサンプル:")
			console.log(JSON.stringify(category, null, 2))
		}

		// カテゴリ構造の分析
		if (categories.length > 0) {
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
		// 少数の商品を取得
		const products = await fetchRecore("/products?limit=5")
		console.log(`✅ 商品数: ${products.length}`)

		// 最初の商品を詳細表示
		if (products.length > 0) {
			console.log("\n商品サンプル:")
			console.log(JSON.stringify(products[0], null, 2))

			const keys = Object.keys(products[0])
			console.log("\n📊 商品のキー構造:", keys)
		}
	} catch (error) {
		console.error("商品取得失敗:", error)
	}
}

async function investigateProductAttributes() {
	console.log("\n🔍 === 商品属性構造の調査 ===")
	try {
		const attributes = await fetchRecore("/products/attributes")
		console.log(`✅ 属性数: ${attributes.length}`)

		// 最初の3件を詳細表示
		const samples = attributes.slice(0, 3)
		for (const attr of samples) {
			console.log("\n属性サンプル:")
			console.log(JSON.stringify(attr, null, 2))
		}

		// 属性構造の分析
		if (attributes.length > 0) {
			const keys = Object.keys(attributes[0])
			console.log("\n📊 属性のキー構造:", keys)
		}
	} catch (error) {
		console.error("属性取得失敗:", error)
	}
}

async function investigateItemAttributes() {
	console.log("\n🔍 === アイテム属性構造の調査 ===")
	try {
		const attributes = await fetchRecore("/items/attributes")
		console.log(`✅ アイテム属性数: ${attributes.length}`)

		// 最初の3件を詳細表示
		const samples = attributes.slice(0, 3)
		for (const attr of samples) {
			console.log("\nアイテム属性サンプル:")
			console.log(JSON.stringify(attr, null, 2))
		}
	} catch (error) {
		console.error("アイテム属性取得失敗:", error)
	}
}

async function main() {
	console.log("🚀 ReCORE API 調査開始")
	console.log(`📍 API URL: ${BASE_URL}`)
	console.log(`🔑 JWT: ${JWT_KEY.substring(0, 20)}...`)

	try {
		await investigateCategories()
		await investigateProducts()
		await investigateProductAttributes()
		await investigateItemAttributes()
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