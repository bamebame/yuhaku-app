#!/usr/bin/env node
/**
 * ReCORE APIから在庫一覧を取得して確認するスクリプト
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

async function getItems() {
	try {
		const response = await fetch(`${RECORE_API_URL}/items?limit=10`, {
			method: "GET",
			headers: {
				"X-Identification": RECORE_API_JWT,
			},
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("エラー:", response.status, errorText);
			return;
		}

		const items = await response.json();
		console.log("在庫一覧（最初の10件）:");
		items.forEach((item: any) => {
			console.log(`ID: ${item.id}, Product: ${item.product?.title || item.product_id}, Price: ${item.price}, Quantity: ${item.quantity}, Location: ${item.location?.name || item.location_id}`);
		});
		
		// 一つの在庫の詳細を確認
		if (items.length > 0) {
			console.log("\n在庫詳細サンプル:");
			console.log(JSON.stringify(items[0], null, 2));
		}
	} catch (error) {
		console.error("エラー:", error);
	}
}

getItems();