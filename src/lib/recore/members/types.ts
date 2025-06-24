/**
 * ReCORE API members 型定義
 */

// 会員ステータス
export type RecoreMemberStatus = "ACTIVE" | "TENTATIVE" | "WITHDRAWAL" | "DELETED";

// ポイント詳細
export interface RecoreMemberPointDetail {
  type: "DEFAULT" | "PAID";
  title: string;
  total: number;
  expires_amount: number;
  expires_at: number;
}

// 会員ポイント情報
export interface RecoreMemberPoint {
  total: number;
  expires_amount: number;
  expires_at: number;
  details: RecoreMemberPointDetail[];
}

// 会員情報
export interface RecoreMember {
  id: number;
  code: string;
  alias_code: string | null;
  first_name: string | null;
  last_name: string | null;
  first_name_kana: string | null;
  last_name_kana: string | null;
  company_name: string | null;
  company_name_kana: string | null;
  email: string | null;
  tel: string | null;
  status: RecoreMemberStatus;
  point: RecoreMemberPoint | null;
  created_at: number;
  updated_at: number;
}

// 会員検索パラメータ
export interface RecoreMemberSearchParams {
  ids?: number[];
  codes?: string[];
  keyword?: string;
  statuses?: RecoreMemberStatus[];
  created_at_from?: string;
  created_at_to?: string;
  updated_at_from?: string;
  updated_at_to?: string;
  page?: number;
  limit?: number;
}