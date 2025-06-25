import { useEffect, useState, useRef } from "react";
import type { Item } from "@/features/items/types";

const BATCH_SIZE = 250;

interface UseBatchItemsOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

interface UseBatchItemsResult {
  data: Item[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

/**
 * 商品IDのリストを250件ずつのバッチに分けて在庫情報を取得するカスタムフック
 */
export function useBatchItems(
  productIds: string[],
  options: UseBatchItemsOptions = {}
): UseBatchItemsResult {
  const { refreshInterval = 30000, enabled = true } = options;
  const [data, setData] = useState<Item[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchBatchItems = async (signal?: AbortSignal) => {
    if (!enabled || productIds.length === 0) {
      setData([]);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      // 商品IDを250件ずつのバッチに分割
      const batches: string[][] = [];
      for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
        batches.push(productIds.slice(i, i + BATCH_SIZE));
      }

      // 各バッチを並列で取得
      const batchPromises = batches.map(async (batch) => {
        const idsParam = batch.join(",");
        const response = await fetch(`/api/items?product_ids=${idsParam}`, {
          signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch items: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data as Item[];
      });

      // 全てのバッチの結果を待つ
      const batchResults = await Promise.all(batchPromises);
      
      // 結果をフラットな配列に結合
      const allItems = batchResults.flat();
      
      setData(allItems);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err);
        console.error("Error fetching batch items:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 初回取得とリフレッシュ間隔の設定
  useEffect(() => {
    // 前回のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 新しいAbortControllerを作成
    abortControllerRef.current = new AbortController();
    
    // データ取得
    fetchBatchItems(abortControllerRef.current.signal);

    // リフレッシュ間隔の設定
    if (refreshInterval && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        fetchBatchItems(abortControllerRef.current.signal);
      }, refreshInterval);
    }

    // クリーンアップ
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [productIds.join(","), refreshInterval, enabled]); // productIdsの内容が変わったら再取得

  return { data, isLoading, error };
}