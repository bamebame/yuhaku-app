import type { NextRequest } from "next/server";
import { apiResponse } from "@/app/api/_utils/response";
import { createServerContext } from "@/lib/context/server-context";
import { SasCasesClient } from "@/lib/recore/sas_cases";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/sas-cases/[id]
 * 店頭販売ケース詳細取得
 */
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		// 認証チェック
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return apiResponse.unauthorized();
		}

		// パラメータを await で取得
		const { id } = await params;

		// DEV: テスト用のモックデータを返す
		if (process.env.NODE_ENV === 'development' && (id === 'test-123' || id.startsWith('case-'))) {
			const mockCase = {
				id: id,
				code: id === 'test-123' ? 'TEST-001' : `TEST-${id.slice(-6)}`,
				store: { id: '1', name: 'Test Store' },
				staff: { id: '1', name: 'Test Staff' },
				cashier: null,
				status: 'IN_PROGRESS',
				memberId: null,
				note: 'テストケース',
				customerNote: '',
				doneAt: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				coupons: [],
				goods: id === 'test-123' ? [
					{
						id: '1',
						serial: 1,
						itemId: 'ITEM-001',
						locationId: '1',
						unitPrice: 1000,
						unitAdjustment: 0,
						caseAdjustment: 0,
						couponAdjustment: 0,
						tax: 100,
						includedTax: 100,
						exemptedTax: 0,
						taxRate: 10,
						taxRateType: 'GENERAL',
						taxFreeType: 'GENERAL',
						quantity: 1,
						reservedQuantity: 0,
					}
				] : [],
				summary: {
					quantity: id === 'test-123' ? 1 : 0,
					reservedQuantity: 0,
					subTotal: id === 'test-123' ? 1000 : 0,
					caseAdjustment: 0,
					couponAdjustment: 0,
					total: id === 'test-123' ? 1100 : 0,
					taxes: id === 'test-123' ? [
						{
							taxRateType: 'GENERAL',
							taxRate: 10,
							tax: 100,
							includedTax: 100,
							taxableAmount: 1000,
						}
					] : [],
					exemptedTaxes: [],
				},
			};
			return apiResponse.success(mockCase);
		}

		// APIクライアント作成
		const context = await createServerContext();
		const client = new SasCasesClient(context);

		// データ取得
		const result = await client.getById(id);

		return apiResponse.success(result);
	} catch (error) {
		return apiResponse.error(error);
	}
}
