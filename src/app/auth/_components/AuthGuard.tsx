"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { StaffCodeLock } from "./StaffCodeLock"

interface AuthGuardProps {
	children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
	const { user, loading, isLocked } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!loading && !user) {
			router.push("/auth/login")
		}
	}, [user, loading, router])

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="mt-2 text-sm text-muted-foreground">読み込み中...</p>
				</div>
			</div>
		)
	}

	if (!user) {
		return null
	}

	if (isLocked) {
		return <StaffCodeLock />
	}

	return <>{children}</>
}