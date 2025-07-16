import { NextRequest } from "next/server";
import { apiResponse } from "@/app/api/_utils/response";
import { TEST_STAFF } from "@/features/staffs/types";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/staffs/[code]
 * スタッフコードの検証とスタッフ情報の取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    // 認証チェック
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiResponse.unauthorized();
    }

    const { code } = await params;
    const staffCode = code.toUpperCase();

    // テスト環境では固定のスタッフコードで認証
    if (staffCode === TEST_STAFF.code) {
      return apiResponse.success(TEST_STAFF);
    }

    // 本番環境ではReCORE APIを呼び出す
    // TODO: ReCORE APIとの連携実装
    // const context = await createServerContext();
    // const client = new StaffsClient(context);
    // const staff = await client.getByCode(staffCode);

    // 現時点ではテストコード以外はエラー
    return apiResponse.notFound("スタッフコードが見つかりません");
  } catch (error) {
    return apiResponse.error(error);
  }
}