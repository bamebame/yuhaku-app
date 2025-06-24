import type { RecoreCheckoutInfo } from "@/features/sas_cases/recore/types";

export interface CheckoutInfo {
	charges: Array<{
		payment: {
			id: number;
			name: string;
			type: string;
		};
		amount: number;
		change: number;
	}>;
}

/**
 * ReCORE APIのチェックアウト情報を内部型に変換
 */
export function convertRecoreCheckoutInfoToCheckoutInfo(
	recore: RecoreCheckoutInfo
): CheckoutInfo {
	return {
		charges: recore.charges.map(charge => ({
			payment: {
				id: charge.payment.id,
				name: charge.payment.name,
				type: charge.payment.type,
			},
			amount: charge.amount,
			change: charge.change,
		})),
	};
}