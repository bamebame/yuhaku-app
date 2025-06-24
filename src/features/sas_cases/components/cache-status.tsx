"use client";

import { useCache } from "@/lib/cache";
import { PosButton } from "@/components/pos";
import { RefreshCw, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export function CacheStatus() {
	const { cacheState, refresh, clearCache } = useCache();

	return (
		<div className="border-2 border-pos-border bg-pos-background p-4 space-y-4">
			<h3 className="font-bold text-lg">データキャッシュ状態</h3>
			
			<div className="space-y-2 text-sm">
				<div className="flex justify-between">
					<span>最終更新:</span>
					<span className="font-mono">
						{cacheState.lastUpdated
							? format(new Date(cacheState.lastUpdated), "yyyy/MM/dd HH:mm", { locale: ja })
							: "未取得"}
					</span>
				</div>
				
				{cacheState.updateAvailable && (
					<div className="text-warning font-semibold">
						新しいデータが利用可能です
					</div>
				)}
				
				{cacheState.error && (
					<div className="text-destructive">
						エラー: {cacheState.error.message}
					</div>
				)}
			</div>
			
			<div className="flex gap-2">
				<PosButton
					size="sm"
					onClick={refresh}
					disabled={cacheState.isLoading}
					className="flex-1"
				>
					<RefreshCw className="mr-2 h-4 w-4" />
					{cacheState.isLoading ? "更新中..." : "データ更新"}
				</PosButton>
				
				<PosButton
					size="sm"
					variant="secondary"
					onClick={clearCache}
					disabled={cacheState.isLoading}
				>
					<Trash2 className="mr-2 h-4 w-4" />
					キャッシュクリア
				</PosButton>
			</div>
			
			<div className="text-xs text-pos-muted">
				<p>• 商品データ: 24時間キャッシュ</p>
				<p>• カテゴリデータ: 7日間キャッシュ</p>
				<p>• 在庫データ: リアルタイム取得</p>
			</div>
		</div>
	);
}