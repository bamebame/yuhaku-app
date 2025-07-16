import { z } from "zod";
import { STAFF_CODE_PATTERN, STAFF_CODE_LENGTH } from "../types";

// スタッフコード検証スキーマ
export const staffCodeSchema = z.object({
  code: z
    .string()
    .length(STAFF_CODE_LENGTH, `スタッフコードは${STAFF_CODE_LENGTH}桁で入力してください`)
    .regex(STAFF_CODE_PATTERN, "スタッフコードの形式が正しくありません（SFから始まる12桁）")
    .transform((val) => val.toUpperCase()),
});

// スタッフ情報スキーマ
export const staffSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  storeId: z.string(),
  storeName: z.string(),
});

// スタッフセッションスキーマ
export const staffSessionSchema = staffSchema.extend({
  lastActivity: z.number(),
  permissions: z.array(z.string()).optional(),
});