import { Suspense } from "react";
import { SasCaseEditContainer } from "@/features/sas_cases/components/edit-container";
import { SasCaseEditSkeleton } from "@/features/sas_cases/components/edit-skeleton";
import { PosLayout, PosHeader, PosMain } from "@/components/pos/layout";
import { PosButton } from "@/components/pos";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface SasCaseEditPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function SasCaseEditPage({
	params,
}: SasCaseEditPageProps) {
	const { id } = await params;

	return (
		<PosLayout>
			{/* <PosHeader className="px-4 py-2"> */}
			{/* 	<PosButton variant="ghost" size="sm" asChild> */}
			{/* 		<Link href={`/sas-cases/${id}`}> */}
			{/* 			<ArrowLeft className="mr-2 h-4 w-4" /> */}
			{/* 			詳細に戻る */}
			{/* 		</Link> */}
			{/* 	</PosButton> */}
			{/* </PosHeader> */}
			<PosMain>
				<Suspense fallback={<SasCaseEditSkeleton />}>
					<SasCaseEditContainer caseId={id} />
				</Suspense>
			</PosMain>
		</PosLayout>
	);
}
