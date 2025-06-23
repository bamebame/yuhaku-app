import { createServerContext } from "@/lib/context/server-context";
import { SasCasesClient } from "@/lib/recore/sas_cases";
import type { SasCase, SasCaseUpdateInput } from "../types";

/**
 * 店頭販売ケースを更新する
 */
export async function updateSasCase(
	id: string,
	input: SasCaseUpdateInput,
): Promise<SasCase> {
	// DEV: テスト用のモック実装
	if (process.env.NODE_ENV === 'development' && id === 'test-123') {
		console.log("Mock update for test-123 with input:", input);
		
		// 現在の状態を取得（実際はDBから取得）
		const currentCase: SasCase = {
			id: 'test-123',
			code: 'TEST-001',
			store: { id: '1', name: 'Test Store' },
			staff: { id: '1', name: 'Test Staff' },
			cashier: null,
			status: 'IN_PROGRESS',
			memberId: input.memberId !== undefined ? input.memberId : null,
			note: input.note !== undefined ? (input.note || '') : 'テストケース',
			customerNote: input.customerNote !== undefined ? (input.customerNote || '') : '',
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
		
		// goodsの更新を反映
		if (input.goods) {
			let totalQuantity = 0;
			let subTotal = 0;
			
			currentCase.goods = input.goods.map((g, index) => {
				const quantity = g.quantity || 1;
				const unitPrice = g.unitPrice || 1000;
				const unitAdjustment = g.unitAdjustment || 0;
				
				totalQuantity += quantity;
				subTotal += (unitPrice + unitAdjustment) * quantity;
				
				return {
					id: g.id || `${index + 1}`,
					serial: index + 1,
					itemId: g.itemId,
					locationId: g.locationId,
					unitPrice,
					unitAdjustment,
					caseAdjustment: 0,
					couponAdjustment: 0,
					tax: Math.floor(unitPrice * 0.1),
					includedTax: Math.floor(unitPrice * 0.1),
					exemptedTax: 0,
					taxRate: 10,
					taxRateType: 'GENERAL' as const,
					taxFreeType: 'GENERAL' as const,
					quantity,
					reservedQuantity: 0,
				};
			});
			
			// サマリーを更新
			const tax = Math.floor(subTotal * 0.1);
			currentCase.summary = {
				quantity: totalQuantity,
				reservedQuantity: 0,
				subTotal,
				caseAdjustment: input.caseAdjustment || 0,
				couponAdjustment: 0,
				total: subTotal + tax,
				taxes: [{
					taxRateType: 'GENERAL',
					taxRate: 10,
					tax,
					includedTax: tax,
					taxableAmount: subTotal,
				}],
				exemptedTaxes: [],
			};
		}
		
		return currentCase;
	}
	
	const context = await createServerContext();
	const client = new SasCasesClient(context);

	return client.update(id, input);
}
