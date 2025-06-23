import { createServerContext } from "@/lib/context/server-context";
import { SasCasesClient } from "@/lib/recore/sas_cases";
import type { CheckoutInput } from "../types";

/**
 * 店頭販売ケースをチェックアウトする
 */
export async function checkoutSasCase(
	id: string,
	input: CheckoutInput,
): Promise<void> {
	// DEV: テスト用のモック実装
	if (process.env.NODE_ENV === 'development' && id === 'test-123') {
		console.log("Mock checkout for test-123 with input:", input);
		// チェックアウト成功をシミュレート
		return;
	}
	
	const context = await createServerContext();
	const client = new SasCasesClient(context);

	return client.checkout(id, input);
}
