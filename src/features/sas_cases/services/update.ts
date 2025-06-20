import { createServerContext } from "@/lib/context/server-context"
import { SasCasesClient } from "@/lib/recore/sas_cases"
import type { SasCase, SasCaseUpdateInput } from "../types"

/**
 * 店頭販売ケースを更新する
 */
export async function updateSasCase(
	id: string,
	input: SasCaseUpdateInput,
): Promise<SasCase> {
	const context = await createServerContext()
	const client = new SasCasesClient(context)

	return client.update(id, input)
}