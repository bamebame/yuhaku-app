#!/usr/bin/env node
/**
 * ReCORE APIを使用してテスト用の在庫データを作成するスクリプト
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

// テスト用の在庫データ
const testItems = [
	{
		product_id: 1060, // YSG052 NVY ボディバッグ
		store_id: 1,
		price: 35000,
		grade_id: 1,
		stocks: [
			{
				location_id: 1,
				quantity: 5,
				status: "ACTIVE",
				cost_price: 20000,
			}
		],
	},
	{
		product_id: 1059, // YSG052 GY ボディバッグ
		store_id: 1,
		price: 35000,
		grade_id: 1,
		stocks: [
			{
				location_id: 1,
				quantity: 3,
				status: "ACTIVE",
				cost_price: 20000,
			}
		],
	},
	{
		product_id: 1058, // YVE171 BLU キーケース
		store_id: 1,
		price: 8800,
		grade_id: 1,
		stocks: [
			{
				location_id: 1,
				quantity: 10,
				status: "ACTIVE",
				cost_price: 5000,
			}
		],
	},
	{
		product_id: 1055, // YVE160 WI 名刺入れ
		store_id: 1,
		price: 12000,
		grade_id: 1,
		stocks: [
			{
				location_id: 1,
				quantity: 7,
				status: "ACTIVE",
				cost_price: 7000,
			}
		],
	},
	{
		product_id: 1054, // YSG014GENEI NVY トートバッグ
		store_id: 1,
		price: 45000,
		grade_id: 1,
		stocks: [
			{
				location_id: 1,
				quantity: 2,
				status: "ACTIVE",
				cost_price: 25000,
			}
		],
	},
];

async function createItem(itemData: any) {
	try {
		const response = await fetch(`${RECORE_API_URL}/items`, {
			method: "POST",
			headers: {
				"X-Identification": RECORE_API_JWT,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(itemData),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`エラー (${itemData.product_id}):`, response.status, errorText);
			return null;
		}

		const result = await response.json();
		console.log(`作成成功 (${itemData.product_id}):`, result.id);
		return result;
	} catch (error) {
		console.error(`エラー (${itemData.product_id}):`, error);
		return null;
	}
}

async function main() {
	console.log("テスト用在庫データを作成します...");
	
	for (const item of testItems) {
		await createItem(item);
		// API制限を考慮して少し待機
		await new Promise(resolve => setTimeout(resolve, 500));
	}
	
	console.log("完了しました");
}

main();