import { createServerContext } from "@/lib/context/server-context"
import { SasCasesClient } from "@/lib/recore/sas_cases"
import type { SasCase, SasCaseCreateInput } from "../types"

/**
 * 店頭販売ケースを作成する
 */
export async function createSasCase(
	input: SasCaseCreateInput,
): Promise<SasCase> {
	const context = await createServerContext()
	const client = new SasCasesClient(context)

	return client.create(input)
}