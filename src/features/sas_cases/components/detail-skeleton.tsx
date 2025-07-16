import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SasCaseDetailSkeleton() {
	return (
		<div className="space-y-6">
			{/* ヘッダー情報 */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Skeleton className="h-8 w-48" />
							<Skeleton className="h-5 w-16" />
						</div>
						<Skeleton className="h-10 w-20" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{[...Array(6)].map((_, i) => (
							<div key={`info-${i}`}>
								<Skeleton className="h-4 w-16 mb-1" />
								<Skeleton className="h-4 w-32" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* 商品明細 */}
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-24" />
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{[...Array(3)].map((_, i) => (
							<Skeleton key={`goods-${i}`} className="h-12 w-full" />
						))}
					</div>
				</CardContent>
			</Card>

			{/* サマリー */}
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-16" />
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{[...Array(4)].map((_, i) => (
							<div key={`summary-${i}`} className="flex justify-between">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-4 w-24" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
