"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { StaffStorage } from "@/lib/storage/staff-storage";
import type { StaffAuthState, StaffSession } from "@/features/staffs/types";

interface StaffContextValue extends StaffAuthState {
  authenticate: (staffCode: string) => Promise<void>;
  logout: () => void;
  updateActivity: () => void;
}

const StaffContext = createContext<StaffContextValue | null>(null);

interface StaffProviderProps {
  children: React.ReactNode;
}

export function StaffProvider({ children }: StaffProviderProps) {
  const [state, setState] = useState<StaffAuthState>({
    isAuthenticated: false,
    staff: null,
    isLoading: true,
    error: null,
  });

  // 初期化：LocalStorageから復元
  useEffect(() => {
    const staff = StaffStorage.get();
    setState({
      isAuthenticated: !!staff,
      staff,
      isLoading: false,
      error: null,
    });
  }, []);

  // アクティビティ監視
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const events = ["mousedown", "keydown", "touchstart"];
    let activityTimer: NodeJS.Timeout;

    const updateActivity = () => {
      StaffStorage.updateActivity();
      
      // 30秒ごとにチェック
      clearTimeout(activityTimer);
      activityTimer = setTimeout(() => {
        const staff = StaffStorage.get();
        if (!staff) {
          setState({
            isAuthenticated: false,
            staff: null,
            isLoading: false,
            error: "セッションがタイムアウトしました",
          });
        }
      }, 30000);
    };

    // イベントリスナー登録
    events.forEach((event) => {
      window.addEventListener(event, updateActivity);
    });

    // 初回チェック
    updateActivity();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
      clearTimeout(activityTimer);
    };
  }, [state.isAuthenticated]);

  // スタッフ認証
  const authenticate = useCallback(async (staffCode: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // APIでスタッフコードを検証
      const response = await fetch(`/api/staffs/${staffCode}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "スタッフ認証に失敗しました");
      }

      const staffSession: StaffSession = {
        ...data.data,
        lastActivity: Date.now(),
      };

      // LocalStorageに保存
      StaffStorage.save(staffSession);

      setState({
        isAuthenticated: true,
        staff: staffSession,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        isAuthenticated: false,
        staff: null,
        isLoading: false,
        error: error instanceof Error ? error.message : "認証エラーが発生しました",
      });
    }
  }, []);

  // ログアウト
  const logout = useCallback(() => {
    StaffStorage.clear();
    setState({
      isAuthenticated: false,
      staff: null,
      isLoading: false,
      error: null,
    });
  }, []);

  // アクティビティ更新
  const updateActivity = useCallback(() => {
    if (state.isAuthenticated) {
      StaffStorage.updateActivity();
    }
  }, [state.isAuthenticated]);

  const value: StaffContextValue = {
    ...state,
    authenticate,
    logout,
    updateActivity,
  };

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
}

export function useStaff() {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error("useStaff must be used within StaffProvider");
  }
  return context;
}