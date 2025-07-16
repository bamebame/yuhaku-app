import type * as React from "react";

import { cn } from "@/lib/utils";
import AutoSizeTextarea from "react-textarea-autosize";

function Textarea({
	className,
	maxRows,
	minRows,
	...props
}: React.ComponentProps<typeof AutoSizeTextarea>) {
	return (
		<AutoSizeTextarea
			data-slot="textarea"
			maxRows={maxRows ?? 4}
			minRows={minRows ?? 2}
			className={cn(
				"flex min-h-16 w-full rounded-sm border border-[#e2e8f0] bg-white px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-150 hover:border-primary/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-bg",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
