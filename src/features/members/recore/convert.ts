import type { RecoreMember, RecoreMemberPoint, RecoreMemberPointDetail } from "@/lib/recore/members/types";
import type { Member, MemberPoint, MemberPointDetail } from "../types";

/**
 * ReCORE API のポイント詳細を内部型に変換
 */
function convertRecoreMemberPointDetailToMemberPointDetail(recore: RecoreMemberPointDetail): MemberPointDetail {
  return {
    type: recore.type,
    title: recore.title,
    total: recore.total,
    expiresAmount: recore.expires_amount,
    expiresAt: new Date(recore.expires_at * 1000),
  };
}

/**
 * ReCORE API の会員ポイント情報を内部型に変換
 */
export function convertRecoreMemberPointToMemberPoint(recore: RecoreMemberPoint): MemberPoint {
  return {
    total: recore.total,
    expiresAmount: recore.expires_amount,
    expiresAt: new Date(recore.expires_at * 1000),
    details: recore.details.map(convertRecoreMemberPointDetailToMemberPointDetail),
  };
}

/**
 * ReCORE API の会員情報を内部型に変換
 */
export function convertRecoreMemberToMember(recore: RecoreMember): Member {
  return {
    id: recore.id.toString(),
    code: recore.code,
    aliasCode: recore.alias_code,
    firstName: recore.first_name,
    lastName: recore.last_name,
    firstNameKana: recore.first_name_kana,
    lastNameKana: recore.last_name_kana,
    companyName: recore.company_name,
    companyNameKana: recore.company_name_kana,
    email: recore.email,
    tel: recore.tel,
    status: recore.status,
    point: recore.point ? convertRecoreMemberPointToMemberPoint(recore.point) : null,
    createdAt: new Date(recore.created_at * 1000),
    updatedAt: new Date(recore.updated_at * 1000),
  };
}