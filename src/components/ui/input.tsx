"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Input コンポーネント - フォーム入力フィールド
 */
export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, onFocus, ...props }, ref) => {
		const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
			// 数値入力の場合は全選択
			if (type === "number") {
				e.target.select();
			}
			// 元のonFocusハンドラーがあれば実行
			onFocus?.(e);
		};

		return (
			<input
				type={type}
				className={cn(
					"flex h-10 w-full rounded-sm border border-[#e2e8f0] bg-white px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-150 hover:border-primary/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-bg",
					className,
				)}
				ref={ref}
				onFocus={handleFocus}
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";

export { Input };
