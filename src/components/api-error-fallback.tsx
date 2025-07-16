import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ApiErrorFallbackProps {
	error: Error;
	reset?: () => void;
	message?: string;
}

export function ApiErrorFallback({ 
	error, 
	reset, 
	message = "データの取得中にエラーが発生しました" 
}: ApiErrorFallbackProps) {
	return (
		<Alert variant="destructive">
			<AlertCircle className="h-4 w-4" />
			<AlertTitle>エラー</AlertTitle>
			<AlertDescription className="mt-2 flex flex-col gap-3">
				<p>{message}</p>
				{process.env.NODE_ENV !== "production" && (
					<p className="text-xs font-mono">{error.message}</p>
				)}
				{reset && (
					<Button
						onClick={reset}
						variant="outline"
						size="sm"
						className="w-fit"
					>
						<RefreshCw className="mr-2 h-4 w-4" />
						再試行
					</Button>
				)}
			</AlertDescription>
		</Alert>
	);
}