import type { NextRequest } from "next/server";
import { createServerContext } from "@/lib/context/server-context";
import { MembersClient } from "@/lib/recore/members";
import { apiResponse } from "@/app/api/_utils/response";
import { convertRecoreMemberToMember } from "@/features/members/recore/convert";

export async function GET(request: NextRequest) {
  try {
    const context = await createServerContext();
    const client = new MembersClient(context);
    
    const searchParams = request.nextUrl.searchParams;
    const params: Record<string, unknown> = {};
    
    // パラメータの取得
    const ids = searchParams.get("ids");
    if (ids) {
      params.ids = ids.split(",").map(id => parseInt(id));
    }
    
    const codes = searchParams.get("codes");
    if (codes) {
      params.codes = codes.split(",");
    }
    
    const keyword = searchParams.get("keyword");
    if (keyword) {
      params.keyword = keyword;
    }
    
    const statuses = searchParams.get("statuses");
    if (statuses) {
      params.statuses = statuses.split(",");
    }
    
    const page = searchParams.get("page");
    if (page) {
      params.page = parseInt(page);
    }
    
    const limit = searchParams.get("limit");
    if (limit) {
      params.limit = parseInt(limit);
    }
    
    // API呼び出し
    const recoreMembers = await client.list(params);
    
    // 内部型に変換
    const members = recoreMembers.map(convertRecoreMemberToMember);
    
    return apiResponse.success(members);
  } catch (error) {
    return apiResponse.error(error);
  }
}