import { BaseClient } from "../baseClient";
import type { RecoreMember, RecoreMemberSearchParams } from "./types";

export class MembersClient extends BaseClient {

  async list(params?: RecoreMemberSearchParams): Promise<RecoreMember[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.ids) {
      searchParams.append("ids", params.ids.join(","));
    }
    if (params?.codes) {
      searchParams.append("codes", params.codes.join(","));
    }
    if (params?.keyword) {
      searchParams.append("keyword", params.keyword);
    }
    if (params?.statuses) {
      searchParams.append("statuses", params.statuses.join(","));
    }
    if (params?.created_at_from) {
      searchParams.append("created_at_from", params.created_at_from);
    }
    if (params?.created_at_to) {
      searchParams.append("created_at_to", params.created_at_to);
    }
    if (params?.updated_at_from) {
      searchParams.append("updated_at_from", params.updated_at_from);
    }
    if (params?.updated_at_to) {
      searchParams.append("updated_at_to", params.updated_at_to);
    }
    if (params?.page) {
      searchParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      searchParams.append("limit", params.limit.toString());
    }
    
    // SearchParamsをオブジェクトに変換
    const queryParams = Object.fromEntries(searchParams);
    return await this.get<RecoreMember[]>("/members", queryParams);
  }

  async getById(id: number): Promise<RecoreMember> {
    return await this.get<RecoreMember>(`/members/${id}`);
  }

  async getByStringId(id: string): Promise<RecoreMember> {
    return await this.getById(parseInt(id));
  }
}