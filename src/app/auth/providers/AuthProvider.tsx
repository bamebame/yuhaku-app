"use client";

import { useRouter } from "next/navigation";
import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { logoutAction } from "@/features/auth/actions";
import type { AuthHook } from "@/features/auth/types";
import { createClient } from "@/lib/supabase/client";

// Context type
interface AuthContextType extends AuthHook {}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ロック解除状態を確認する関数
function checkLockStatus(): boolean {
	if (typeof window === "undefined") return true;

	const lastActivity = localStorage.getItem("last_activity");
	const lockTimeout = 5 * 60 * 1000; // 5分

	if (!lastActivity) return true;

	return Date.now() - Number.parseInt(lastActivity) > lockTimeout;
}

// Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [isLocked, setIsLocked] = useState(true);
	const [staffId, setStaffId] = useState<string | null>(null);
	const [staffCode, setStaffCodeState] = useState<string | null>(null);
	const [staffName, setStaffName] = useState<string | null>(null);
	const router = useRouter();
	const supabase = createClient();

	useEffect(() => {
		const getUser = async () => {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				setUser(user);

				// スタッフ情報取得
				const savedStaffId = localStorage.getItem("staff_id");
				const savedStaffCode = localStorage.getItem("staff_code");
				const savedStaffName = localStorage.getItem("staff_name");
				if (savedStaffId && savedStaffCode) {
					setStaffId(savedStaffId);
					setStaffCodeState(savedStaffCode);
					setStaffName(savedStaffName);
				}

				// ロック状態確認
				setIsLocked(checkLockStatus());
			} catch (error) {
				console.error("Error loading user:", error);
			} finally {
				setLoading(false);
			}
		};

		// 認証状態変更リスナー設定
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			setUser(session?.user ?? null);
			setLoading(false);

			if (event === "SIGNED_OUT") {
				// サインアウト時の処理
				localStorage.removeItem("staff_id");
				localStorage.removeItem("staff_code");
				localStorage.removeItem("staff_name");
				localStorage.removeItem("last_activity");
				setStaffId(null);
				setStaffCodeState(null);
				setStaffName(null);
				setIsLocked(true);
				router.push("/auth/login");
			}
		});

		// 初期ユーザー取得
		getUser();

		// アクティビティタイムスタンプ更新
		const updateActivityTimestamp = () => {
			localStorage.setItem("last_activity", Date.now().toString());
			if (isLocked) {
				setIsLocked(false);
			}
		};

		// イベントリスナー登録
		if (typeof window !== "undefined") {
			window.addEventListener("click", updateActivityTimestamp);
			window.addEventListener("keydown", updateActivityTimestamp);
			window.addEventListener("touchstart", updateActivityTimestamp);
		}

		// クリーンアップ
		return () => {
			subscription.unsubscribe();
			if (typeof window !== "undefined") {
				window.removeEventListener("click", updateActivityTimestamp);
				window.removeEventListener("keydown", updateActivityTimestamp);
				window.removeEventListener("touchstart", updateActivityTimestamp);
			}
		};
	}, [supabase, router, isLocked]);

	// ロック解除
	const unlockWithStaffCode = async (code: string) => {
		// TODO: 実際のスタッフコード検証を実装
		const mockStaff = {
			id: "1",
			code: "TESTCODE01",
			name: "テストスタッフ",
		};

		if (code === mockStaff.code) {
			localStorage.setItem("staff_id", mockStaff.id);
			localStorage.setItem("staff_code", mockStaff.code);
			localStorage.setItem("staff_name", mockStaff.name);
			localStorage.setItem("last_activity", Date.now().toString());

			setStaffId(mockStaff.id);
			setStaffCodeState(mockStaff.code);
			setStaffName(mockStaff.name);
			setIsLocked(false);
		} else {
			throw new Error("スタッフコードが正しくありません");
		}
	};

	// ロック
	const lock = () => {
		setIsLocked(true);
		localStorage.removeItem("last_activity");
	};

	// ログアウト
	const logout = async () => {
		await logoutAction();
	};

	const value: AuthContextType = {
		user,
		loading,
		isLocked,
		staffId,
		staffCode,
		staffName,
		unlockWithStaffCode,
		lock,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// useAuthフック
export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}
