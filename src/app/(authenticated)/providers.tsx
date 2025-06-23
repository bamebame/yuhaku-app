"use client";

import { CacheProvider } from "@/lib/cache";

export function AuthenticatedProviders({ children }: { children: React.ReactNode }) {
	return (
		<CacheProvider>
			{children}
		</CacheProvider>
	);
}