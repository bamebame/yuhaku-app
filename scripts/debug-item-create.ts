#!/usr/bin/env node
/**
 * ReCORE APIの在庫作成エンドポイントをデバッグするスクリプト
 */

import dotenv from "dotenv";
import path from "path";

// 環境変数を読み込み
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const RECORE_API_URL = process.env.RECORE_API_URL;
const RECORE_API_JWT = process.env.RECORE_API_JWT;

if (!RECORE_API_URL || !RECORE_API_JWT) {
	console.error("環境変数が設定されていません");
	process.exit(1);
}

async function testCreate() {
	// 最もシンプルなデータで試す
	const testData = {
		store_id: 1,
		product_id: 1060,
		price: 35000,
		grade_id: 1,
	};
	
	console.log("送信データ:", JSON.stringify(testData, null, 2));
	
	try {
		const response = await fetch(`${RECORE_API_URL}/items`, {
			method: "POST",
			headers: {
				"X-Identification": RECORE_API_JWT,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(testData),
		});

		const responseText = await response.text();
		console.log("レスポンスステータス:", response.status);
		console.log("レスポンス:", responseText);
		
		if (response.ok) {
			const result = JSON.parse(responseText);
			console.log("作成成功! ID:", result.id);
		}
	} catch (error) {
		console.error("エラー:", error);
	}
}

testCreate();