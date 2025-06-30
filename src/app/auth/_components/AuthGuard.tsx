"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useStaff } from "../hooks/useStaff";
import { StaffAuthDialog } from "./StaffAuthDialog";

interface AuthGuardProps {
	children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
	const { user, loading: authLoading } = useAuth();
	const { 
		isAuthenticated: isStaffAuthenticated, 
		isLoading: staffLoading,
		error: staffError,
		authenticate 
	} = useStaff();
	const router = useRouter();

	// Supabase認証チェック
	useEffect(() => {
		if (!authLoading && !user) {
			router.push("/auth/login");
		}
	}, [user, authLoading, router]);

	// ローディング中
	if (authLoading || staffLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="mt-2 text-sm text-muted-foreground">読み込み中...</p>
				</div>
			</div>
		);
	}

	// 未ログイン
	if (!user) {
		return null;
	}

	// スタッフ認証が必要
	if (!isStaffAuthenticated) {
		return (
			<StaffAuthDialog
				open={true}
				onSuccess={authenticate}
				isLoading={staffLoading}
				error={staffError}
			/>
		);
	}

	return <>{children}</>;
}
