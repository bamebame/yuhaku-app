#!/usr/bin/env node
/**
 * ReCORE APIから商品一覧を取得して確認するスクリプト
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

async function getProducts() {
	try {
		const response = await fetch(`${RECORE_API_URL}/products?limit=10&status=ACTIVE`, {
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

		const products = await response.json();
		console.log("商品一覧（最初の10件）:");
		products.forEach((product: any) => {
			console.log(`ID: ${product.id}, Code: ${product.code}, Title: ${product.title}`);
		});
	} catch (error) {
		console.error("エラー:", error);
	}
}

getProducts();