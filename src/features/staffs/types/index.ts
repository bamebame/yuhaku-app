// スタッフ情報
export interface Staff {
  id: string;
  code: string;
  name: string;
  storeId: string;
  storeName: string;
}

// スタッフセッション情報
export interface StaffSession extends Staff {
  lastActivity: number;
  permissions?: string[];
}

// スタッフ認証状態
export interface StaffAuthState {
  isAuthenticated: boolean;
  staff: StaffSession | null;
  isLoading: boolean;
  error: string | null;
}

// スタッフコード形式
export const STAFF_CODE_PATTERN = /^SF[A-Z0-9]{10}$/;
export const STAFF_CODE_LENGTH = 12;

// テスト用スタッフ情報
export const TEST_STAFF: Staff = {
  id: "1",
  code: "TESTCODE01",
  name: "テストスタッフ",
  storeId: "1",
  storeName: "テスト店舗"
};