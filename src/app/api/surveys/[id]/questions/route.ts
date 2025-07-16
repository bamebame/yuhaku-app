import type { NextRequest } from "next/server";
import { createServerContext } from "@/lib/context/server-context";
import { SurveysClient } from "@/lib/recore/surveys";
import { apiResponse } from "@/app/api/_utils/response";
import { convertRecoreSurveyQuestionToSurveyQuestion } from "@/features/surveys/recore/convert";
import type { SurveyQuestion } from "@/features/surveys/types";

// Mock data for testing since ReCORE API doesn't have questions endpoint yet
const MOCK_QUESTIONS: SurveyQuestion[] = [
  {
    id: "1",
    surveyId: "1",
    type: "RADIO",
    question: "ご来店のきっかけを教えてください",
    description: null,
    options: ["インターネット検索", "SNS", "知人の紹介", "通りがかり", "その他"],
    required: true,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    surveyId: "1",
    type: "CHECKBOX",
    question: "興味のある商品カテゴリをお選びください（複数選択可）",
    description: "該当するものをすべて選択してください",
    options: ["財布", "バッグ", "キーケース", "名刺入れ", "ベルト", "アクセサリー"],
    required: false,
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    surveyId: "1",
    type: "SCALE",
    question: "スタッフの接客満足度を教えてください",
    description: "1（不満）〜10（満足）でお答えください",
    options: null,
    required: true,
    order: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    surveyId: "1",
    type: "TEXTAREA",
    question: "その他、ご意見・ご要望がございましたらお聞かせください",
    description: null,
    options: null,
    required: false,
    order: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const context = await createServerContext();
    
    // For now, return mock data if survey ID is 1
    if (id === "1") {
      console.log("[API] Returning mock questions for survey 1");
      return apiResponse.success(MOCK_QUESTIONS);
    }
    
    // Try to fetch from ReCORE API
    const client = new SurveysClient(context);
    
    try {
      const questions = await client.getQuestions(id);
      const convertedQuestions = questions.map(convertRecoreSurveyQuestionToSurveyQuestion);
      return apiResponse.success(convertedQuestions);
    } catch (recoreError) {
      console.error("[API] Survey questions fetch error from ReCORE:", recoreError);
      // Return empty array if ReCORE API doesn't support questions endpoint
      return apiResponse.success([]);
    }
  } catch (error) {
    console.error("[API] Survey questions fetch error:", error);
    return apiResponse.error(error);
  }
}