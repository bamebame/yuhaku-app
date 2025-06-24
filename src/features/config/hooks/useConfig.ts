import useSWR from "swr"
import type { Config } from "../types"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useConfig() {
  const { data, error, isLoading } = useSWR<{ data: Config }>(
    "/api/config",
    fetcher,
    {
      // 24時間キャッシュ（クライアント側）
      dedupingInterval: 24 * 60 * 60 * 1000,
      refreshInterval: 24 * 60 * 60 * 1000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    config: data?.data,
    payments: data?.data?.payments || [],
    cashiers: data?.data?.cashiers || [],
    isLoading,
    isError: error,
  }
}

export function usePayments() {
  const { payments, isLoading, isError } = useConfig()
  
  return {
    payments,
    isLoading,
    isError,
  }
}

export function useCashiers() {
  const { cashiers, isLoading, isError } = useConfig()
  
  return {
    cashiers,
    isLoading,
    isError,
  }
}