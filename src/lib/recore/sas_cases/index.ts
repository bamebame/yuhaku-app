import {
	convertCheckoutInputToRecore,
	convertRecoreSasCaseToSasCase,
	convertSasCaseCreateInputToRecore,
	convertSasCaseSearchParamsToRecore,
	convertSasCaseUpdateInputToRecore,
} from "@/features/sas_cases/recore/convert";
import type { RecoreSasCase, RecoreCheckoutInfo } from "@/features/sas_cases/recore/types";
import type {
	CheckoutInput,
	SasCase,
	SasCaseCreateInput,
	SasCaseSearchParams,
	SasCaseUpdateInput,
} from "@/features/sas_cases/types";
import { BaseClient } from "../baseClient";
import type { CheckoutInfo } from "./checkout";
import { convertRecoreCheckoutInfoToCheckoutInfo } from "./checkout";

/**
 * 店頭販売ケースAPIクライアント
 */
export class SasCasesClient extends BaseClient {
	/**
	 * 店頭販売ケース一覧を取得
	 */
	async list(params: SasCaseSearchParams = {}): Promise<SasCase[]> {
		const recoreParams = convertSasCaseSearchParamsToRecore(params);
		const response = await this.get<RecoreSasCase[]>(
			"/sas_cases",
			recoreParams as Record<string, unknown>,
		);
		return response.map(convertRecoreSasCaseToSasCase);
	}

	/**
	 * 店頭販売ケースを取得
	 */
	async getById(id: string): Promise<SasCase> {
		const response = await this.get<RecoreSasCase>(`/sas_cases/${id}`);
		
		// デバッグ: APIレスポンスの確認
		if (process.env.DEBUG_API === "true") {
			console.log("[SasCasesClient.getById] Raw API Response:", JSON.stringify(response, null, 2));
			console.log("[SasCasesClient.getById] Summary taxes:", response.summary?.taxes);
		}
		
		const result = convertRecoreSasCaseToSasCase(response);
		
		// デバッグ: 変換後のデータ確認
		if (process.env.DEBUG_API === "true") {
			console.log("[SasCasesClient.getById] Converted summary taxes:", result.summary?.taxes);
		}
		
		return result;
	}

	/**
	 * 店頭販売ケースを作成
	 */
	async create(input: SasCaseCreateInput): Promise<SasCase> {
		console.log("[SasCasesClient.create] Input:", input);
		const recoreInput = convertSasCaseCreateInputToRecore(input);
		console.log("[SasCasesClient.create] ReCORE Input:", recoreInput);
		
		try {
			const response = await this.post<RecoreSasCase>("/sas_cases", recoreInput);
			console.log("[SasCasesClient.create] ReCORE Response:", response);
			
			const result = convertRecoreSasCaseToSasCase(response);
			console.log("[SasCasesClient.create] Converted Result:", result);
			
			return result;
		} catch (error) {
			console.error("[SasCasesClient.create] API Error:", error);
			throw error;
		}
	}

	/**
	 * 店頭販売ケースを更新
	 */
	async update(id: string, input: SasCaseUpdateInput): Promise<SasCase> {
		const recoreInput = convertSasCaseUpdateInputToRecore(input);
		const response = await this.put<RecoreSasCase>(
			`/sas_cases/${id}`,
			recoreInput,
		);
		return convertRecoreSasCaseToSasCase(response);
	}

	/**
	 * 店頭販売ケースを削除
	 */
	async deleteById(id: string): Promise<void> {
		await this.delete(`/sas_cases/${id}`);
	}

	/**
	 * 店頭販売ケースをチェックアウト
	 */
	async checkout(id: string, input: CheckoutInput): Promise<void> {
		const recoreInput = convertCheckoutInputToRecore(input);
		await this.put(`/sas_cases/${id}/checkout`, recoreInput);
	}
	
	/**
	 * チェックアウト情報を取得
	 */
	async getCheckoutInfo(id: string): Promise<CheckoutInfo> {
		const response = await this.get<RecoreCheckoutInfo>(`/sas_cases/${id}/checkout`);
		return convertRecoreCheckoutInfoToCheckoutInfo(response);
	}
}
