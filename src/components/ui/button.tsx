"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * ボタンのスタイルバリエーションを定義
 */
const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-white transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm",
	{
		variants: {
			variant: {
				default: "bg-primary text-white hover:bg-primary-dark hover:shadow-md",
				primary: "bg-primary text-white hover:bg-primary-dark hover:shadow-md",
				action:
					"bg-action text-action-foreground hover:bg-action/90 hover:shadow-md",
				secondary:
					"bg-white text-primary border border-primary hover:bg-primary hover:text-white",
				error: "bg-error text-white hover:bg-[#e03333] hover:shadow-md",
				success: "bg-success text-white hover:bg-[#2eb352] hover:shadow-md",
				purchase:
					"bg-purchase text-purchase-foreground font-semibold hover:bg-purchase/90 hover:shadow-lg shadow-md",
				outline:
					"border border-action bg-white text-action hover:bg-action hover:text-white",
				ghost: "hover:bg-primary/10 hover:text-primary shadow-none",
				link: "text-primary underline-offset-4 hover:underline shadow-none hover:text-primary-dark",
			},
			size: {
				default: "h-10 px-5 py-2.5",
				sm: "h-8 px-4 text-xs",
				lg: "h-12 px-7 py-3 text-base",
				icon: "h-10 w-10 p-0",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

/**
 * Buttonコンポーネントのprops
 */
export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	isLoading?: boolean;
	icon?: React.ReactNode;
	asChild?: boolean;
}

/**
 * Button コンポーネント
 * 既存のButtonコンポーネントとの互換性を保ちつつ、shadcn/uiの機能を提供
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			size,
			isLoading,
			icon,
			asChild = false,
			children,
			...props
		},
		ref,
	) => {
		// asChildがtrueの場合、Slotを使用して子要素にpropsを渡す
		const Comp = asChild ? Slot : "button";

		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			>
				{isLoading ? (
					<>
						<span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
						<span>読み込み中...</span>
					</>
				) : (
					<>
						{icon && <span className="mr-2">{icon}</span>}
						{children}
					</>
				)}
			</Comp>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
