import { useState, useEffect } from "react";

/**
 * 値の変更をdebounceするカスタムフック
 * @param value debounceする値
 * @param delay debounceする時間（ミリ秒）
 * @returns debounceされた値
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}