import { Suspense } from "react";
import { SasCasesList } from "@/features/sas_cases/components/list";
import { SasCasesListSkeleton } from "@/features/sas_cases/components/list-skeleton";
import { PosButton } from "@/components/pos/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function SasCasesPage() {
	return (
		<div className="p-4">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">店頭販売ケース</h1>
				<Link href="/sas-cases/new">
					<PosButton>
						<Plus className="mr-2 h-4 w-4" />
						新規作成
					</PosButton>
				</Link>
			</div>
			<Suspense fallback={<SasCasesListSkeleton />}>
				<SasCasesList />
			</Suspense>
		</div>
	);
}
