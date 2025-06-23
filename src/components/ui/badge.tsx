import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-all duration-150 hover:shadow-sm hover:scale-105",
	{
		variants: {
			variant: {
				default: "border-transparent bg-primary text-white",
				secondary: "border-transparent bg-secondary text-secondary-foreground",
				destructive: "border-transparent bg-error text-white",
				outline: "text-foreground border-border",
				// Status variants based on design
				draft: "bg-[#f3f4f6] text-[#4b5563] border-transparent",
				assessing: "bg-action/10 text-action border-transparent",
				assessed: "bg-[#dbeafe] text-[#1e40af] border-transparent",
				"approval-waiting":
					"bg-action text-action-foreground border-transparent",
				approved: "bg-success/10 text-success border-transparent",
				done: "bg-[#d1fae5] text-[#065f46] border-transparent",
				canceled: "bg-error/10 text-error border-transparent",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Badge({
	className,
	variant,
	asChild = false,
	...props
}: React.ComponentProps<"span"> &
	VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "span";

	return (
		<Comp
			data-slot="badge"
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
