import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
	className?: string;
	size?: "sm" | "default" | "lg";
}

export function LoadingSpinner({ className, size = "default" }: LoadingSpinnerProps) {
	const sizeClasses = {
		sm: "h-4 w-4",
		default: "h-8 w-8",
		lg: "h-12 w-12",
	};

	return (
		<div className={cn("flex items-center justify-center", className)}>
			<Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size])} />
		</div>
	);
}