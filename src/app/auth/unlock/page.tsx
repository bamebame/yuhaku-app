"use client";

import { StaffCodeLock } from "@/app/auth/_components";

export default function UnlockPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<StaffCodeLock />
		</div>
	);
}