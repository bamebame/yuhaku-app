import { createServerContext } from "@/lib/context/server-context";
import { SasCasesClient } from "@/lib/recore/sas_cases";
import type { SasCase, SasCaseCreateInput } from "../types";

/**
 * 店頭販売ケースを作成する
 */
export async function createSasCase(
	input: SasCaseCreateInput,
): Promise<SasCase> {
	// DEV: モック実装
	if (process.env.NODE_ENV === 'development') {
		console.log("Mock create sas case with input:", input);
		
		// モックレスポンス
		const mockCase: SasCase = {
			id: `case-${Date.now()}`,
			code: `TEST-${Date.now().toString().slice(-6)}`,
			store: { id: '1', name: 'Test Store' },
			staff: null,
			cashier: null,
			status: 'IN_PROGRESS',
			memberId: null,
			note: '',
			customerNote: '',
			doneAt: null,
			createdAt: new Date(),
			updatedAt: new Date(),
			coupons: [],
			goods: [],
			summary: {
				quantity: 0,
				reservedQuantity: 0,
				subTotal: 0,
				caseAdjustment: 0,
				couponAdjustment: 0,
				total: 0,
				taxes: [],
				exemptedTaxes: [],
			},
		};
		
		return mockCase;
	}

	const context = await createServerContext();
	const client = new SasCasesClient(context);

	return client.create(input);
}
