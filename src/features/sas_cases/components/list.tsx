"use client";

import { useEffect } from "react";
import useSWR from "swr";
import type { SasCase } from "@/features/sas_cases/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const fetcher = async (url: string) => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error("Failed to fetch sas cases");
	}
	const json = await response.json();
	return json.data || [];
};

export function SasCasesList() {
	const {
		data: cases,
		error,
		isLoading,
	} = useSWR<SasCase[]>("/api/sas-cases", fetcher, {
		refreshInterval: 30000, // 30秒ごとに自動更新
	});
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

	if (!cases || cases.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">販売ケースがありません</p>
			</div>
		);
	}

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "IN_PROGRESS":
				return <Badge variant="default">進行中</Badge>;
			case "DONE":
				return <Badge variant="secondary">完了</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const formatDateTime = (dateOrTimestamp: Date | number | string | null) => {
		if (!dateOrTimestamp) return "-";
		
		let date: Date;
		if (dateOrTimestamp instanceof Date) {
			date = dateOrTimestamp;
		} else if (typeof dateOrTimestamp === 'string') {
			date = new Date(dateOrTimestamp);
		} else if (typeof dateOrTimestamp === 'number') {
			date = new Date(dateOrTimestamp * 1000);
		} else {
			return "-";
		}
		
		if (isNaN(date.getTime())) {
			console.error("Invalid date:", dateOrTimestamp);
			return "-";
		}
		
		return format(date, "yyyy/MM/dd HH:mm", {
			locale: ja,
		});
	};

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
					{(cases || []).map((sasCase) => (
						<TableRow key={sasCase.id}>
							<TableCell className="font-mono">{sasCase.code}</TableCell>
							<TableCell>{getStatusBadge(sasCase.status)}</TableCell>
							<TableCell>{sasCase.store?.name || "-"}</TableCell>
							<TableCell>{sasCase.staff?.name || "-"}</TableCell>
							<TableCell className="text-right">
								¥{sasCase.summary?.total.toLocaleString() || 0}
							</TableCell>
							<TableCell>{formatDateTime(sasCase.createdAt)}</TableCell>
							<TableCell className="text-right">
								<div className="flex justify-end gap-2">
									<Link href={`/sas-cases/${sasCase.id}`}>
										<Button variant="ghost" size="icon">
											<Eye className="h-4 w-4" />
										</Button>
									</Link>
									{sasCase.status === "IN_PROGRESS" && (
										<Link href={`/sas-cases/${sasCase.id}/edit`}>
											<Button variant="ghost" size="icon">
												<Edit className="h-4 w-4" />
											</Button>
										</Link>
									)}
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
