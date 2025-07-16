import type { RecoreStaff } from "@/lib/recore/staffs"
import type { Staff } from "../types"

/**
 * ReCORE API Staff型から内部Staff型への変換
 */
export function convertRecoreStaffToStaff(recore: RecoreStaff): Staff {
  // 姓名を結合して名前を生成
  const nameParts = [];
  if (recore.last_name) nameParts.push(recore.last_name);
  if (recore.first_name) nameParts.push(recore.first_name);
  const name = nameParts.length > 0 ? nameParts.join(" ") : "名前なし";
  
  return {
    id: recore.id.toString(),
    code: recore.code,
    name: name,
    storeId: recore.store.id.toString(),
    storeName: recore.store.name,
  }
}