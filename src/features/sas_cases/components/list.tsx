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
import { PosButton } from "@/components/pos";
import Link from "next/link";
import { Eye, Edit, ShoppingCart } from "lucide-react";
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
	} = useSWR<SasCase[]>("/api/sas-cases?status=IN_PROGRESS", fetcher, {
		refreshInterval: 10000, // 10秒ごとに自動更新（進行中ケースは頻繁に更新）
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
				<p className="text-pos-muted text-lg">進行中の販売ケースはありません</p>
				<p className="text-pos-muted text-sm mt-2">上のボタンから新規販売を開始してください</p>
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
		<div className="space-y-4">
			{(cases || []).map((sasCase) => (
				<div 
					key={sasCase.id} 
					className="border-2 border-pos-border bg-pos-background p-4 hover:bg-pos-hover transition-colors"
				>
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<div className="flex items-center gap-4 mb-2">
								<span className="font-mono text-lg font-bold">{sasCase.code}</span>
								<span className="text-sm text-pos-muted">
									{formatDateTime(sasCase.createdAt)}
								</span>
							</div>
							<div className="flex items-center gap-6 text-sm">
								<span>スタッフ: {sasCase.staff?.name || "-"}</span>
								<span>商品数: {sasCase.summary?.quantity || 0}点</span>
								<span className="font-bold text-lg">
									¥{sasCase.summary?.total.toLocaleString() || 0}
								</span>
							</div>
						</div>
						<div>
							<Link href={`/sas-cases/${sasCase.id}`}>
								<PosButton size="lg" className="font-bold">
									<ShoppingCart className="mr-2 h-5 w-5" />
									販売を続ける
								</PosButton>
							</Link>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
