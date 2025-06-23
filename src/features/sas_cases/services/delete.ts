import { createServerContext } from "@/lib/context/server-context";
import { SasCasesClient } from "@/lib/recore/sas_cases";

/**
 * 店頭販売ケースを削除する
 */
export async function deleteSasCase(id: string): Promise<void> {
	const context = await createServerContext();
	const client = new SasCasesClient(context);

	return client.deleteById(id);
}
