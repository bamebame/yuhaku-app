import type { StaffSession } from "@/features/staffs/types";

const STORAGE_KEYS = {
  STAFF_ID: "staff_id",
  STAFF_CODE: "staff_code",
  STAFF_NAME: "staff_name",
  STORE_ID: "store_id",
  STORE_NAME: "store_name",
  LAST_ACTIVITY: "last_activity",
  PERMISSIONS: "permissions",
} as const;

// 非アクティブタイムアウト時間（10分）
const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

export class StaffStorage {
  /**
   * スタッフ情報を保存
   */
  static save(staff: StaffSession): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEYS.STAFF_ID, staff.id);
      localStorage.setItem(STORAGE_KEYS.STAFF_CODE, staff.code);
      localStorage.setItem(STORAGE_KEYS.STAFF_NAME, staff.name);
      localStorage.setItem(STORAGE_KEYS.STORE_ID, staff.storeId);
      localStorage.setItem(STORAGE_KEYS.STORE_NAME, staff.storeName);
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, staff.lastActivity.toString());
      
      if (staff.permissions) {
        localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(staff.permissions));
      }
    } catch (error) {
      console.error("Failed to save staff info to localStorage:", error);
    }
  }

  /**
   * スタッフ情報を取得
   */
  static get(): StaffSession | null {
    if (typeof window === "undefined") return null;

    try {
      const staffId = localStorage.getItem(STORAGE_KEYS.STAFF_ID);
      const staffCode = localStorage.getItem(STORAGE_KEYS.STAFF_CODE);
      const staffName = localStorage.getItem(STORAGE_KEYS.STAFF_NAME);
      const storeId = localStorage.getItem(STORAGE_KEYS.STORE_ID);
      const storeName = localStorage.getItem(STORAGE_KEYS.STORE_NAME);
      const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
      const permissions = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);

      if (!staffId || !staffCode || !staffName || !storeId || !storeName || !lastActivity) {
        return null;
      }

      const lastActivityTime = parseInt(lastActivity, 10);
      
      // 非アクティブタイムアウトチェック
      if (Date.now() - lastActivityTime > INACTIVITY_TIMEOUT) {
        this.clear();
        return null;
      }

      return {
        id: staffId,
        code: staffCode,
        name: staffName,
        storeId,
        storeName,
        lastActivity: lastActivityTime,
        permissions: permissions ? JSON.parse(permissions) : undefined,
      };
    } catch (error) {
      console.error("Failed to get staff info from localStorage:", error);
      return null;
    }
  }

  /**
   * 最終アクティビティ時刻を更新
   */
  static updateActivity(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    } catch (error) {
      console.error("Failed to update last activity:", error);
    }
  }

  /**
   * スタッフ情報をクリア
   */
  static clear(): void {
    if (typeof window === "undefined") return;

    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error("Failed to clear staff info from localStorage:", error);
    }
  }

  /**
   * スタッフが認証済みかチェック
   */
  static isAuthenticated(): boolean {
    const staff = this.get();
    return staff !== null;
  }
}