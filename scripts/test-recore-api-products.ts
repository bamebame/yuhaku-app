/**
 * ReCORE API 商品・カテゴリ取得テスト
 */

import * as dotenv from "dotenv"
import * as path from "path"

// 環境変数をロード
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const BASE_URL = process.env.RECORE_API_URL || "https://co-api.recore-pos.com"
const JWT_KEY = process.env.RECORE_API_JWT || ""
const STORE_ID = process.env.RECORE_STORE_ID || "1"

console.log("🔍 環境変数確認:")
console.log(`BASE_URL: ${BASE_URL}`)
console.log(`JWT_KEY: ${JWT_KEY.substring(0, 40)}...`)
console.log(`STORE_ID: ${STORE_ID}`)

async function fetchRecore(path: string, params?: Record<string, string>): Promise<any> {
	let url = `${BASE_URL}${path}`
	
	// クエリパラメータを追加
	if (params) {
		const searchParams = new URLSearchParams(params)
		url += `?${searchParams.toString()}`
	}
	
	console.log(`\n📡 Fetching: ${url}`)
	console.log("📋 Headers:")
	console.log(`  X-Identification: ${JWT_KEY.substring(0, 40)}...`)
	console.log(`  X-Store-Id: ${STORE_ID}`)

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
			if (key.toLowerCase() !== 'x-identification') {
				console.log(`  ${key}: ${value}`)
			}
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

async function testCategories() {
	console.log("\n🔍 === カテゴリ取得テスト ===")
	try {
		const categories = await fetchRecore("/products/categories")
		console.log(`✅ カテゴリ取得成功`)
		console.log(`📊 カテゴリ数: ${Array.isArray(categories) ? categories.length : 'Not an array'}`);
		
		if (Array.isArray(categories) && categories.length > 0) {
			console.log("\n📦 最初の3件のカテゴリ:")
			categories.slice(0, 3).forEach(cat => {
				console.log(`- ID: ${cat.id}, Name: ${cat.name}`)
			})
			
			console.log("\n詳細サンプル (最初の1件):")
			console.log(JSON.stringify(categories[0], null, 2))
		}
		
		return true
	} catch (error) {
		console.error("❌ カテゴリ取得失敗")
		return false
	}
}

async function testProducts() {
	console.log("\n🔍 === 商品取得テスト ===")
	try {
		const products = await fetchRecore("/products", { limit: "5" })
		console.log(`✅ 商品取得成功`)
		console.log(`📊 商品数: ${Array.isArray(products) ? products.length : 'Not an array'}`);
		
		if (Array.isArray(products) && products.length > 0) {
			console.log("\n📦 取得した商品:")
			products.forEach(product => {
				console.log(`- ID: ${product.id}, Code: ${product.code}, Title: ${product.title}`)
			})
			
			console.log("\n詳細サンプル (最初の1件):")
			console.log(JSON.stringify(products[0], null, 2))
		}
		
		return true
	} catch (error) {
		console.error("❌ 商品取得失敗")
		return false
	}
}

async function testItems() {
	console.log("\n🔍 === 在庫取得テスト ===")
	try {
		const items = await fetchRecore("/items", { limit: "5" })
		console.log(`✅ 在庫取得成功`)
		console.log(`📊 在庫数: ${Array.isArray(items) ? items.length : 'Not an array'}`);
		
		if (Array.isArray(items) && items.length > 0) {
			console.log("\n📦 取得した在庫:")
			items.forEach(item => {
				console.log(`- ID: ${item.id}, Product ID: ${item.product_id}, Quantity: ${item.quantity}`)
			})
			
			console.log("\n詳細サンプル (最初の1件):")
			console.log(JSON.stringify(items[0], null, 2))
		}
		
		return true
	} catch (error) {
		console.error("❌ 在庫取得失敗")
		return false
	}
}

async function main() {
	console.log("🚀 ReCORE API 商品関連エンドポイントテスト開始")
	
	const results = {
		categories: await testCategories(),
		products: await testProducts(),
		items: await testItems(),
	}
	
	console.log("\n📊 === テスト結果サマリー ===")
	console.log(`カテゴリAPI: ${results.categories ? '✅ 成功' : '❌ 失敗'}`)
	console.log(`商品API: ${results.products ? '✅ 成功' : '❌ 失敗'}`)
	console.log(`在庫API: ${results.items ? '✅ 成功' : '❌ 失敗'}`)
	
	console.log("\n✨ テスト完了")
}

main().catch(console.error)