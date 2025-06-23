import { SasCaseNewForm } from "@/features/sas_cases/components/new-form";
import { PosCard, PosCardHeader, PosCardTitle, PosCardContent } from "@/components/pos";
import { PosButton } from "@/components/pos";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SasCaseNewPage() {
	return (
		<div className="container mx-auto py-6">
			<div className="mb-6">
				<PosButton variant="ghost" asChild>
					<Link href="/sas-cases">
						<ArrowLeft className="mr-2 h-4 w-4" />
						一覧に戻る
					</Link>
				</PosButton>
			</div>
			<PosCard className="max-w-2xl mx-auto">
				<PosCardHeader>
					<PosCardTitle>新規販売ケース作成</PosCardTitle>
				</PosCardHeader>
				<PosCardContent>
					<SasCaseNewForm />
				</PosCardContent>
			</PosCard>
		</div>
	);
}