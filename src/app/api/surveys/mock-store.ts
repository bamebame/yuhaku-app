// Mock store for survey submissions (for testing purposes)
// In production, this would be stored in a database

import type { SurveySubmission } from "@/features/surveys/types";

// メモリ内ストア（開発用）
const submissionsStore = new Map<string, SurveySubmission>();

export function getSubmissionKey(surveyId: string, memberId: string): string {
  return `${surveyId}-${memberId}`;
}

export function saveSubmission(submission: SurveySubmission): void {
  const key = getSubmissionKey(submission.surveyId, submission.memberId);
  submissionsStore.set(key, submission);
  console.log("[MockStore] Saved submission:", key, submission);
}

export function getSubmission(surveyId: string, memberId: string): SurveySubmission | null {
  const key = getSubmissionKey(surveyId, memberId);
  const submission = submissionsStore.get(key) || null;
  console.log("[MockStore] Retrieved submission:", key, submission);
  return submission;
}

export function deleteSubmission(surveyId: string, memberId: string): void {
  const key = getSubmissionKey(surveyId, memberId);
  submissionsStore.delete(key);
  console.log("[MockStore] Deleted submission:", key);
}

export function getAllSubmissions(): SurveySubmission[] {
  return Array.from(submissionsStore.values());
}