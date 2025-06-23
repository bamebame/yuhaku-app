import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingCart, Package, TrendingUp, Users } from "lucide-react";

export default function DashboardPage() {
	return (
		<div className="container mx-auto py-6">
			<h1 className="text-3xl font-bold mb-6">ダッシュボード</h1>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">本日の売上</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">¥0</div>
						<p className="text-xs text-muted-foreground">前日比 +0%</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">本日の販売数</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">0 商品</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">進行中の販売</CardTitle>
						<ShoppingCart className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">未完了のケース</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">本日の顧客数</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">ユニーク顧客</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>クイックアクション</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						<Button className="w-full" asChild>
							<Link href="/sas-cases/new">
								<ShoppingCart className="mr-2 h-4 w-4" />
								新規販売を開始
							</Link>
						</Button>
						<Button variant="outline" className="w-full" asChild>
							<Link href="/sas-cases">販売ケース一覧を見る</Link>
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>最近の活動</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							最近の活動はありません
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
