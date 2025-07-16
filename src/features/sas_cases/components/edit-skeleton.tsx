import { Skeleton } from "@/components/ui/skeleton";

export function SasCaseEditSkeleton() {
	return (
		<div className="flex-1 flex flex-col overflow-hidden">
			{/* ヘッダー */}
			<div className="border-b px-4 py-3 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-4 w-24" />
				</div>
				<div className="flex items-center gap-4">
					<Skeleton className="h-10 w-32" />
					<Skeleton className="h-10 w-24" />
				</div>
			</div>

			<div className="flex-1 flex overflow-hidden">
				{/* 商品選択パネル */}
				<div className="flex-1 overflow-y-auto">
					{/* カテゴリタブ */}
					<div className="border-b p-2 flex gap-2">
						{[...Array(5)].map((_, i) => (
							<Skeleton key={`tab-${i}`} className="h-8 w-20" />
						))}
					</div>

					{/* 商品グリッド */}
					<div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
						{[...Array(10)].map((_, i) => (
							<div key={`product-${i}`} className="space-y-3">
								<Skeleton className="aspect-square" />
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-2/3" />
								<Skeleton className="h-8 w-full" />
							</div>
						))}
					</div>
				</div>

				{/* カートパネル */}
				<div className="w-96 border-l overflow-y-auto bg-muted/30">
					<div className="p-4 border-b">
						<Skeleton className="h-6 w-24" />
					</div>
					<div className="p-8">
						<Skeleton className="h-12 w-12 mx-auto mb-3" />
						<Skeleton className="h-4 w-32 mx-auto" />
					</div>
				</div>
			</div>
		</div>
	);
}
