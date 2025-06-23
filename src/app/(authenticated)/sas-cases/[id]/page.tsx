import { Suspense } from "react";
import { SasCaseDetail } from "@/features/sas_cases/components/detail";
import { SasCaseDetailSkeleton } from "@/features/sas_cases/components/detail-skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface SasCaseDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function SasCaseDetailPage({
	params,
}: SasCaseDetailPageProps) {
	const { id } = await params;

	return (
		<div className="container mx-auto py-6">
			<div className="mb-6">
				<Button variant="ghost" asChild>
					<Link href="/sas-cases">
						<ArrowLeft className="mr-2 h-4 w-4" />
						一覧に戻る
					</Link>
				</Button>
			</div>
			<Suspense fallback={<SasCaseDetailSkeleton />}>
				<SasCaseDetail id={parseInt(id)} />
			</Suspense>
		</div>
	);
}
