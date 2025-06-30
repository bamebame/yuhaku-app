"use client";

import { CacheProvider } from "@/lib/cache";
import { AuthProvider } from "@/app/auth/providers/AuthProvider";
import { StaffProvider } from "@/app/auth/providers/StaffProvider";
import { AuthGuard } from "@/app/auth/_components/AuthGuard";

export function AuthenticatedProviders({ children }: { children: React.ReactNode }) {
	return (
		<AuthProvider>
			<CacheProvider>
				<StaffProvider>
					<AuthGuard>
						{children}
					</AuthGuard>
				</StaffProvider>
			</CacheProvider>
		</AuthProvider>
	);
}