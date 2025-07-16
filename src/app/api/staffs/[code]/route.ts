import type { NextRequest } from "next/server";
import { apiResponse } from "@/app/api/_utils/response";
import { createClient } from "@/lib/supabase/server";
import { createServerContext } from "@/lib/context/server-context";
import { StaffsClient } from "@/lib/recore/staffs";
import { convertRecoreStaffToStaff } from "@/features/staffs/recore/convert";

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

    // ReCORE APIからスタッフ情報を取得
    try {
      const context = await createServerContext();
      const client = new StaffsClient(context);
      
      const recoreStaff = await client.getByCode(staffCode);

      if (!recoreStaff) {
        return apiResponse.notFound("スタッフコードが見つかりません");
      }

      const staff = convertRecoreStaffToStaff(recoreStaff);
      return apiResponse.success(staff);
    } catch (recoreError) {
      console.error("[API] Staff fetch error from ReCORE:", recoreError);
      return apiResponse.notFound("スタッフコードが見つかりません");
    }
  } catch (error) {
    return apiResponse.error(error);
  }
}