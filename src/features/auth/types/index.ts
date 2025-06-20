import type { User } from "@supabase/supabase-js"

export interface AuthHook {
	user: User | null
	loading: boolean
	isLocked: boolean
	staffId: string | null
	staffCode: string | null
	staffName: string | null
	unlockWithStaffCode: (code: string) => Promise<void>
	lock: () => void
	logout: () => Promise<void>
}

export interface Staff {
	id: string
	code: string
	name: string
	storeId: string
}

export interface LoginCredentials {
	email: string
	password: string
}

export interface StaffCode {
	code: string
}