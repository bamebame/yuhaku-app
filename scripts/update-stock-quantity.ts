#!/usr/bin/env node
/**
 * ReCORE APIを使用して既存の在庫の数量を更新するスクリプト
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

// 更新するアイテム（product_idで検索して更新）
const targetProducts = [
	{ product_id: 1060, quantity: 5 }, // YSG052 NVY ボディバッグ
	{ product_id: 1059, quantity: 3 }, // YSG052 GY ボディバッグ
	{ product_id: 1058, quantity: 10 }, // YVE171 BLU キーケース
	{ product_id: 1055, quantity: 7 }, // YVE160 WI 名刺入れ
	{ product_id: 1054, quantity: 2 }, // YSG014GENEI NVY トートバッグ
];

async function findItemByProductId(productId: number) {
	try {
		const response = await fetch(`${RECORE_API_URL}/items?product_id=${productId}`, {
			method: "GET",
			headers: {
				"X-Identification": RECORE_API_JWT,
			},
		});

		if (!response.ok) {
			return null;
		}

		const items = await response.json();
		return items.length > 0 ? items[0] : null;
	} catch (error) {
		console.error(`エラー (product_id: ${productId}):`, error);
		return null;
	}
}

async function updateItemStock(itemId: number, quantity: number) {
	try {
		// まず現在のアイテム情報を取得
		const getResponse = await fetch(`${RECORE_API_URL}/items/${itemId}`, {
			method: "GET",
			headers: {
				"X-Identification": RECORE_API_JWT,
			},
		});

		if (!getResponse.ok) {
			console.error(`アイテム取得エラー (ID: ${itemId}):`, getResponse.status);
			return false;
		}

		const item = await getResponse.json();
		
		// stocksを更新
		if (item.stocks && item.stocks.length > 0) {
			item.stocks[0].quantity = quantity;
		} else {
			item.stocks = [{
				location_id: 1,
				quantity: quantity,
				status: "ACTIVE",
				cost_price: item.price * 0.6, // 仮の原価
			}];
		}

		// 更新リクエスト
		const updateResponse = await fetch(`${RECORE_API_URL}/items/${itemId}`, {
			method: "PUT",
			headers: {
				"X-Identification": RECORE_API_JWT,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				store_id: item.store.id,
				product_id: item.product_id,
				price: item.price,
				grade_id: item.grade?.id || 1,
				stocks: item.stocks,
			}),
		});

		if (!updateResponse.ok) {
			const errorText = await updateResponse.text();
			console.error(`更新エラー (ID: ${itemId}):`, updateResponse.status, errorText);
			return false;
		}

		console.log(`更新成功 (ID: ${itemId}, Product: ${item.product_id}, Quantity: ${quantity})`);
		return true;
	} catch (error) {
		console.error(`エラー (ID: ${itemId}):`, error);
		return false;
	}
}

async function main() {
	console.log("既存の在庫数量を更新します...");
	
	for (const target of targetProducts) {
		// product_idから該当するアイテムを検索
		const item = await findItemByProductId(target.product_id);
		
		if (item) {
			console.log(`アイテム発見 (Product ID: ${target.product_id}, Item ID: ${item.id})`);
			await updateItemStock(item.id, target.quantity);
		} else {
			console.log(`アイテムが見つかりません (Product ID: ${target.product_id})`);
		}
		
		// API制限を考慮して少し待機
		await new Promise(resolve => setTimeout(resolve, 500));
	}
	
	console.log("完了しました");
}

main();