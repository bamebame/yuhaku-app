/**
 * JWT デコードスクリプト
 */

const JWT_KEY = process.env.RECORE_API_JWT || ""

function decodeJWT(token: string) {
	const parts = token.split('.')
	if (parts.length !== 3) {
		throw new Error('Invalid JWT format')
	}

	// ヘッダーをデコード
	const header = JSON.parse(Buffer.from(parts[0], 'base64').toString())
	console.log("🔐 JWT Header:")
	console.log(JSON.stringify(header, null, 2))

	// ペイロードをデコード
	const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
	console.log("\n📦 JWT Payload:")
	console.log(JSON.stringify(payload, null, 2))

	// 署名部分（検証はしない）
	console.log("\n✍️ JWT Signature (base64):")
	console.log(parts[2])

	return { header, payload }
}

// 環境変数をロード
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

console.log("🚀 JWT デコード開始")
console.log(`🔑 JWT: ${JWT_KEY.substring(0, 40)}...`)

try {
	const decoded = decodeJWT(JWT_KEY)
	
	// スコープの確認
	if (decoded.payload.scope) {
		console.log("\n📋 利用可能なスコープ:")
		const scopes = decoded.payload.scope.split(' ')
		scopes.forEach(scope => {
			console.log(`  - ${scope}`)
		})
	} else {
		console.log("\n⚠️ スコープが定義されていません")
	}

	// 有効期限の確認
	if (decoded.payload.exp) {
		const expDate = new Date(decoded.payload.exp * 1000)
		console.log(`\n⏰ 有効期限: ${expDate.toLocaleString()}`)
	} else if (decoded.payload.iat) {
		console.log(`\n⏰ 発行日時: ${new Date(decoded.payload.iat * 1000).toLocaleString()}`)
		console.log("（有効期限なし）")
	}
} catch (error) {
	console.error("❌ JWT デコードエラー:", error)
}