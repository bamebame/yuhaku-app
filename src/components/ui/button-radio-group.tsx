"use client";

import type * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function ButtonRadioGroup({
	className,
	...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
	return (
		<RadioGroupPrimitive.Root
			data-slot="radio-group"
			className={cn("w-full grid grid-cols-3 gap-3", className)}
			{...props}
		/>
	);
}

function ButtonRadioGroupItem({
	className,
	...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
	return (
		<RadioGroupPrimitive.Item
			data-slot="radio-group-item"
			className={cn(
				"ring-[1px] ring-border rounded py-1 px-3 data-[state=checked]:ring-2 data-[state=checked]:ring-blue-500",
				className,
			)}
			{...props}
		/>
	);
}

export { ButtonRadioGroup, ButtonRadioGroupItem };
