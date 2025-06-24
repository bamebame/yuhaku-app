"use client";

import { useEffect } from "react";
import useSWR from "swr";
import type { SasCase } from "@/features/sas_cases/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Edit, ShoppingCart, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SasCaseDetailProps {
	id: number;
}

const fetcher = async (url: string) => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error("Failed to fetch sas case");
	}
	return response.json();
};

export function SasCaseDetail({ id }: SasCaseDetailProps) {
	const {
		data: sasCase,
		error,
		isLoading,
	} = useSWR<SasCase>(`/api/sas-cases/${id}`, fetcher);
	const { toast } = useToast();

	useEffect(() => {
		if (error) {
			toast({
				title: "エラー",
				description: "販売ケースの取得に失敗しました",
				variant: "destructive",
			});
		}
	}, [error, toast]);

	if (isLoading) {
		return null; // Skeletonはpage.tsxで表示
	}

	if (!sasCase) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">販売ケースが見つかりません</p>
			</div>
		);
	}

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "IN_PROGRESS":
				return (
					<Badge variant="default" className="gap-1">
						<ShoppingCart className="h-3 w-3" />
						進行中
					</Badge>
				);
			case "DONE":
				return (
					<Badge variant="secondary" className="gap-1">
						<CheckCircle className="h-3 w-3" />
						完了
					</Badge>
				);
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const formatDateTime = (dateOrTimestamp: Date | number | null) => {
		if (!dateOrTimestamp) return "-";
		const date =
			dateOrTimestamp instanceof Date
				? dateOrTimestamp
				: new Date(dateOrTimestamp * 1000);
		return format(date, "yyyy/MM/dd HH:mm", {
			locale: ja,
		});
	};

	return (
		<div className="space-y-6">
			{/* ヘッダー情報 */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-4">
							<span>販売ケース #{sasCase.code}</span>
							{getStatusBadge(sasCase.status)}
						</CardTitle>
						{sasCase.status === "IN_PROGRESS" && (
							<Button asChild>
								<Link href={`/sas-cases/${id}/edit`}>
									<Edit className="mr-2 h-4 w-4" />
									編集
								</Link>
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<dt className="text-sm font-medium text-muted-foreground">
								店舗
							</dt>
							<dd className="text-sm">{sasCase.store?.name || "-"}</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-muted-foreground">
								スタッフ
							</dt>
							<dd className="text-sm">{sasCase.staff?.name || "-"}</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-muted-foreground">
								レジ
							</dt>
							<dd className="text-sm">{sasCase.cashier?.name || "-"}</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-muted-foreground">
								会員ID
							</dt>
							<dd className="text-sm">{sasCase.memberId || "-"}</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-muted-foreground">
								作成日時
							</dt>
							<dd className="text-sm">{formatDateTime(sasCase.createdAt)}</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-muted-foreground">
								更新日時
							</dt>
							<dd className="text-sm">{formatDateTime(sasCase.updatedAt)}</dd>
						</div>
						{sasCase.doneAt && (
							<div>
								<dt className="text-sm font-medium text-muted-foreground">
									完了日時
								</dt>
								<dd className="text-sm">{formatDateTime(sasCase.doneAt)}</dd>
							</div>
						)}
					</dl>
					{sasCase.note && (
						<div className="mt-4">
							<dt className="text-sm font-medium text-muted-foreground">
								ケースメモ
							</dt>
							<dd className="text-sm mt-1 whitespace-pre-wrap">
								{sasCase.note}
							</dd>
						</div>
					)}
					{sasCase.customerNote && (
						<div className="mt-4">
							<dt className="text-sm font-medium text-muted-foreground">
								顧客メモ
							</dt>
							<dd className="text-sm mt-1 whitespace-pre-wrap">
								{sasCase.customerNote}
							</dd>
						</div>
					)}
				</CardContent>
			</Card>

			{/* 商品明細 */}
			<Card>
				<CardHeader>
					<CardTitle>商品明細</CardTitle>
				</CardHeader>
				<CardContent>
					{sasCase.goods && sasCase.goods.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>No.</TableHead>
									<TableHead>在庫ID</TableHead>
									<TableHead>ロケーション</TableHead>
									<TableHead className="text-right">数量</TableHead>
									<TableHead className="text-right">単価</TableHead>
									<TableHead className="text-right">調整</TableHead>
									<TableHead className="text-right">小計</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sasCase.goods.map((item) => (
									<TableRow key={item.id}>
										<TableCell>{item.serial}</TableCell>
										<TableCell>{item.itemId}</TableCell>
										<TableCell>{item.locationId}</TableCell>
										<TableCell className="text-right">
											{item.quantity}
										</TableCell>
										<TableCell className="text-right">
											¥{item.unitPrice.toLocaleString()}
										</TableCell>
										<TableCell className="text-right">
											{item.unitAdjustment !== 0 && (
												<span className="text-destructive">
													¥{item.unitAdjustment.toLocaleString()}
												</span>
											)}
										</TableCell>
										<TableCell className="text-right">
											¥
											{(
												item.unitPrice * item.quantity +
												item.unitAdjustment * item.quantity
											).toLocaleString()}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-center py-4 text-muted-foreground">
							商品がありません
						</p>
					)}
				</CardContent>
			</Card>

			{/* サマリー */}
			<Card>
				<CardHeader>
					<CardTitle>合計</CardTitle>
				</CardHeader>
				<CardContent>
					<dl className="space-y-2">
						<div className="flex justify-between">
							<dt className="text-sm">小計</dt>
							<dd className="text-sm">
								¥{sasCase.summary?.subTotal.toLocaleString() || 0}
							</dd>
						</div>
						{sasCase.summary?.caseAdjustment !== 0 && (
							<div className="flex justify-between">
								<dt className="text-sm">ケース調整</dt>
								<dd className="text-sm text-destructive">
									¥{sasCase.summary?.caseAdjustment.toLocaleString()}
								</dd>
							</div>
						)}
						{sasCase.summary?.couponAdjustment !== 0 && (
							<div className="flex justify-between">
								<dt className="text-sm">クーポン調整</dt>
								<dd className="text-sm text-destructive">
									¥{sasCase.summary?.couponAdjustment.toLocaleString()}
								</dd>
							</div>
						)}
						<div className="flex justify-between border-t pt-2">
							<dt className="font-medium">合計</dt>
							<dd className="font-medium">
								¥{sasCase.summary?.total.toLocaleString() || 0}
							</dd>
						</div>
					</dl>
				</CardContent>
			</Card>

			{/* クーポン情報 */}
			{sasCase.coupons && sasCase.coupons.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>適用クーポン</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2">
							{sasCase.coupons.map((coupon, index) => (
								<li key={index} className="flex justify-between">
									<span className="text-sm">クーポンID: {coupon.couponId}</span>
									<span className="text-sm text-destructive">
										¥{coupon.amount.toLocaleString()}
									</span>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
