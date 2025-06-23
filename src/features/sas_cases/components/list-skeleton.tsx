import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function SasCasesListSkeleton() {
	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>コード</TableHead>
						<TableHead>ステータス</TableHead>
						<TableHead>店舗</TableHead>
						<TableHead>スタッフ</TableHead>
						<TableHead className="text-right">合計金額</TableHead>
						<TableHead>作成日時</TableHead>
						<TableHead className="text-right">アクション</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{[...Array(5)].map((_, i) => (
						<TableRow key={`row-${i}`}>
							<TableCell>
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-5 w-16" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell className="text-right">
								<Skeleton className="h-4 w-20 ml-auto" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-32" />
							</TableCell>
							<TableCell>
								<div className="flex justify-end gap-2">
									<Skeleton className="h-8 w-8" />
									<Skeleton className="h-8 w-8" />
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
