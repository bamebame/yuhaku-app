"use server";

import { createServerContext } from "@/lib/context/server-context";
import { SurveysClient } from "@/lib/recore/surveys";
import type { SurveySubmission } from "../types";
import { convertRecoreSurveySubmissionToSurveySubmission } from "../recore/convert";

export async function submitSurveyAnswers(
  surveyId: string,
  memberId: string,
  answers: Array<{
    questionId: string;
    answer: string | string[] | number;
  }>
): Promise<SurveySubmission> {
  // For testing, simulate successful submission for survey 1
  if (surveyId === "1") {
    console.log("[submitSurveyAnswers] Mock submission for survey 1", { memberId, answers });
    
    const mockSubmission: SurveySubmission = {
      id: Date.now().toString(),
      surveyId: surveyId,
      memberId: memberId,
      answers: answers.map((ans, index) => ({
        id: `${Date.now()}-${index}`,
        surveyId: surveyId,
        questionId: ans.questionId,
        memberId: memberId,
        answer: ans.answer,
        createdAt: new Date(),
      })),
      submittedAt: new Date(),
      createdAt: new Date(),
    };
    
    // Save to mock store
    const { saveSubmission } = await import("@/app/api/surveys/mock-store");
    saveSubmission(mockSubmission);
    
    return mockSubmission;
  }

  const context = await createServerContext();
  const client = new SurveysClient(context);

  // IDを数値に変換してReCORE APIに送信
  const recoreAnswers = answers.map((answer) => ({
    question_id: Number(answer.questionId),
    answer: answer.answer,
  }));

  const submission = await client.submitAnswers(
    surveyId,
    memberId,
    recoreAnswers
  );

  return convertRecoreSurveySubmissionToSurveySubmission(submission);
}