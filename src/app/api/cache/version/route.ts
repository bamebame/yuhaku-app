import type { NextRequest } from "next/server";
import { apiResponse } from "@/app/api/_utils/response";
import { createClient } from "@/lib/supabase/server";
import type { DataVersion } from "@/lib/cache/types";

/**
 * GET /api/cache/version
 * キャッシュデータのバージョン情報を取得
 */
export async function GET(request: NextRequest) {
	try {
		// 認証チェック
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return apiResponse.unauthorized();
		}

		// TODO: 実際の実装では、データベースやRedisからバージョン情報を取得
		// 現在は仮のバージョン情報を返す
		const version: DataVersion = {
			products: `products-${new Date().toISOString().split('T')[0]}`, // 日付ベースのバージョン
			categories: `categories-2025-01-01`, // カテゴリは変更頻度が低い
			checkedAt: Date.now(),
		};

		return apiResponse.success(version);
	} catch (error) {
		return apiResponse.error(error);
	}
}