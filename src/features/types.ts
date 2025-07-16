import type { SubmissionResult } from "@conform-to/react";

/**
 * Server Actionの共通レスポンス型
 */
export interface ActionResult<T = unknown> {
	result: SubmissionResult<string[]>;
	data?: T;
}
