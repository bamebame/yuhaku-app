import { BaseClient } from "../baseClient"
import type { ClientContext } from "@/lib/context/client-factory"

// ReCORE API Staff types
export interface RecoreStaff {
  id: number;
  code: string;
  store: {
    id: number;
    name: string;
  };
  status: string;
  last_name: string | null;
  last_kana: string | null;
  first_name: string | null;
  first_kana: string | null;
  tel: string | null;
  email: string | null;
  birthdate: string | null;
  sex: string | null;
  note: string | null;
  photo_url: string | null;
}

export interface RecoreStaffListResponse {
  data: RecoreStaff[];
  total: number;
}

export class StaffsClient extends BaseClient {
  constructor(context: ClientContext) {
    // X-Store-Idヘッダーを除外したコンテキストを作成
    const staffContext = {
      ...context,
      headers: {
        ...context.headers,
      }
    };
    // X-Store-Idヘッダーを削除
    delete staffContext.headers["X-Store-Id"];
    
    super(staffContext)
  }

  /**
   * スタッフ一覧を取得
   */
  async list(params?: { codes?: string | string[] }): Promise<RecoreStaffListResponse> {
    // codesパラメータが文字列配列の場合はカンマ区切りに変換
    const processedParams = params?.codes ? {
      codes: Array.isArray(params.codes) ? params.codes.join(',') : params.codes
    } : undefined;
    
    const response = await this.get<RecoreStaff[]>("/staffs", processedParams);
    
    // ReCORE APIは配列を直接返すため、ラップする
    return {
      data: response,
      total: response.length
    };
  }

  /**
   * スタッフコードでスタッフ情報を取得
   */
  async getByCode(code: string): Promise<RecoreStaff | null> {
    try {
      const response = await this.list({ codes: code })
      return response.data.length > 0 ? response.data[0] : null
    } catch (error) {
      console.error("Failed to get staff by code:", error)
      return null
    }
  }

  /**
   * IDでスタッフ情報を取得
   */
  async getById(id: number): Promise<RecoreStaff> {
    return this.get<RecoreStaff>(`/staffs/${id}`)
  }
}