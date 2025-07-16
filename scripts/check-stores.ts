#!/usr/bin/env node
/**
 * ReCORE APIから店舗一覧を取得して確認するスクリプト
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

async function getStores() {
	try {
		const response = await fetch(`${RECORE_API_URL}/stores`, {
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

		const stores = await response.json();
		console.log("店舗一覧:");
		stores.forEach((store: any) => {
			console.log(`ID: ${store.id}, Name: ${store.name}`);
		});
		
		// ロケーションも確認
		console.log("\nロケーション一覧:");
		const locResponse = await fetch(`${RECORE_API_URL}/locations`, {
			method: "GET",
			headers: {
				"X-Identification": RECORE_API_JWT,
			},
		});
		
		if (locResponse.ok) {
			const locations = await locResponse.json();
			locations.forEach((loc: any) => {
				console.log(`ID: ${loc.id}, Name: ${loc.name}, Store: ${loc.store?.name || loc.store_id}`);
			});
		}
	} catch (error) {
		console.error("エラー:", error);
	}
}

getStores();