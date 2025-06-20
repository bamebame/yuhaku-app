import { createServerContext } from "@/lib/context/server-context"
import { SasCasesClient } from "@/lib/recore/sas_cases"
import type { CheckoutInput } from "../types"

/**
 * 店頭販売ケースをチェックアウトする
 */
export async function checkoutSasCase(
	id: string,
	input: CheckoutInput,
): Promise<void> {
	const context = await createServerContext()
	const client = new SasCasesClient(context)

	return client.checkout(id, input)
}