/**
 * 内部モデル型定義
 */

// 会員ステータス
export type MemberStatus = "ACTIVE" | "TENTATIVE" | "WITHDRAWAL" | "DELETED";

// ポイント詳細
export interface MemberPointDetail {
  type: "DEFAULT" | "PAID";
  title: string;
  total: number;
  expiresAmount: number;
  expiresAt: Date;
}

// 会員ポイント情報
export interface MemberPoint {
  total: number;
  expiresAmount: number;
  expiresAt: Date;
  details: MemberPointDetail[];
}

// 会員情報
export interface Member {
  id: string;
  code: string;
  aliasCode: string | null;
  firstName: string | null;
  lastName: string | null;
  firstNameKana: string | null;
  lastNameKana: string | null;
  companyName: string | null;
  companyNameKana: string | null;
  email: string | null;
  tel: string | null;
  status: MemberStatus;
  point: MemberPoint | null;
  createdAt: Date;
  updatedAt: Date;
}

// 会員検索パラメータ
export interface MemberSearchParams {
  ids?: string[];
  codes?: string[];
  keyword?: string;
  statuses?: MemberStatus[];
  createdAtFrom?: Date;
  createdAtTo?: Date;
  updatedAtFrom?: Date;
  updatedAtTo?: Date;
  page?: number;
  limit?: number;
}