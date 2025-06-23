import useSWR, { type SWRConfiguration } from "swr";
import { useState, useCallback } from "react";

interface RetryOptions {
	maxRetries?: number;
	retryDelay?: number;
	retryDelayMultiplier?: number;
}

interface UseSWRWithRetryResult<T> {
	data: T | undefined;
	error: Error | undefined;
	isLoading: boolean;
	isRetrying: boolean;
	retry: () => void;
	retryCount: number;
}

/**
 * SWRにリトライ機能を追加したカスタムフック
 * @param key SWRのキー
 * @param fetcher データフェッチャー関数
 * @param options SWRとリトライのオプション
 */
export function useSWRWithRetry<T>(
	key: string | null,
	fetcher: (key: string) => Promise<T>,
	options?: SWRConfiguration<T> & RetryOptions
): UseSWRWithRetryResult<T> {
	const {
		maxRetries = 3,
		retryDelay = 1000,
		retryDelayMultiplier = 2,
		...swrOptions
	} = options || {};

	const [retryCount, setRetryCount] = useState(0);
	const [isRetrying, setIsRetrying] = useState(false);

	const { data, error, mutate, isLoading } = useSWR<T>(key, fetcher, {
		...swrOptions,
		onError: (err, key, config) => {
			console.error("SWR Error:", err);
			swrOptions.onError?.(err, key, config);
		},
	});

	const retry = useCallback(async () => {
		if (!key || retryCount >= maxRetries) return;

		setIsRetrying(true);
		const delay = retryDelay * Math.pow(retryDelayMultiplier, retryCount);

		// 指数バックオフによる遅延
		await new Promise((resolve) => setTimeout(resolve, delay));

		try {
			await mutate();
			setRetryCount(0);
		} catch (err) {
			setRetryCount((prev) => prev + 1);
		} finally {
			setIsRetrying(false);
		}
	}, [key, mutate, retryCount, maxRetries, retryDelay, retryDelayMultiplier]);

	return {
		data,
		error,
		isLoading,
		isRetrying,
		retry,
		retryCount,
	};
}