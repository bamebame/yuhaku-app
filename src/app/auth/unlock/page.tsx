"use client";

import dynamic from "next/dynamic";

// StaffCodeLockを動的インポート（SSRを無効化）
const StaffCodeLock = dynamic(
	() => import("@/app/auth/_components").then((mod) => mod.StaffCodeLock),
	{ 
		ssr: false,
		loading: () => (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
			</div>
		)
	}
);

export default function UnlockPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<StaffCodeLock />
		</div>
	);
}