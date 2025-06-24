import { PosCard, PosCardHeader, PosCardContent } from "@/components/pos";
import { Skeleton } from "@/components/ui/skeleton";

export function SasCasesListSkeleton() {
	return (
		<div className="grid gap-4 grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
			{[...Array(12)].map((_, i) => (
				<PosCard key={i} className="min-w-[200px]">
					<PosCardHeader className="pb-3">
						<div className="flex justify-between items-start">
							<div>
								<Skeleton className="h-6 w-24 mb-2" />
								<Skeleton className="h-5 w-16" />
							</div>
							<Skeleton className="h-5 w-5 rounded-full" />
						</div>
					</PosCardHeader>
					<PosCardContent>
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<Skeleton className="h-4 w-4 rounded-full" />
								<Skeleton className="h-4 w-20" />
							</div>
							<div className="flex items-center gap-2">
								<Skeleton className="h-4 w-4 rounded-full" />
								<Skeleton className="h-4 w-32" />
							</div>
							<div className="flex justify-between items-center pt-2">
								<div>
									<Skeleton className="h-3 w-12 mb-1" />
									<Skeleton className="h-5 w-8" />
								</div>
								<div>
									<Skeleton className="h-3 w-12 mb-1" />
									<Skeleton className="h-5 w-16" />
								</div>
							</div>
							<div className="flex justify-end mt-4">
								<Skeleton className="h-8 w-28" />
							</div>
						</div>
					</PosCardContent>
				</PosCard>
			))}
		</div>
	);
}