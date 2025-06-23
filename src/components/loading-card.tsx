import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingCardProps {
	className?: string;
	lines?: number;
}

export function LoadingCard({ className, lines = 3 }: LoadingCardProps) {
	return (
		<Card className={cn("w-full", className)}>
			<CardContent className="pt-6">
				<div className="space-y-3">
					{Array.from({ length: lines }).map((_, i) => (
						<Skeleton
							key={i}
							className="h-4 w-full"
							style={{
								width: i === lines - 1 ? "60%" : "100%",
							}}
						/>
					))}
				</div>
			</CardContent>
		</Card>
	);
}