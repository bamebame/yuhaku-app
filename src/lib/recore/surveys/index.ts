import { BaseClient } from "../baseClient";
import type { ClientContext } from "@/lib/context/client-factory";
import type {
  RecoreSurvey,
  RecoreSurveyQuestion,
  RecoreSurveySubmission,
} from "./types";

export class SurveysClient extends BaseClient {
  constructor(context: ClientContext) {
    super(context);
  }

  /**
   * 指定したIDのアンケートを取得
   */
  async getById(id: string | number): Promise<RecoreSurvey> {
    console.log("[SurveysClient.getById] Fetching survey:", id);
    try {
      const response = await this.get<RecoreSurvey>(`/surveys/${id}`);
      console.log("[SurveysClient.getById] Response:", response);
      return response;
    } catch (error) {
      console.error("[SurveysClient.getById] Error:", error);
      throw error;
    }
  }

  /**
   * アンケートの質問一覧を取得
   */
  async getQuestions(surveyId: string | number): Promise<RecoreSurveyQuestion[]> {
    try {
      const response = await this.get<RecoreSurveyQuestion[]>(
        `/surveys/${surveyId}/questions`
      );
      return response;
    } catch (error) {
      console.error("[SurveysClient.getQuestions] Error:", error);
      throw error;
    }
  }

  /**
   * 会員のアンケート回答を取得
   */
  async getMemberSubmission(
    surveyId: string | number,
    memberId: string | number
  ): Promise<RecoreSurveySubmission | null> {
    try {
      const response = await this.get<RecoreSurveySubmission[]>(
        `/surveys/${surveyId}/submissions?member_id=${memberId}&limit=1`
      );
      // 配列で返ってくる場合は最初の要素を返す
      return Array.isArray(response) && response.length > 0 
        ? response[0] 
        : null;
    } catch (error) {
      console.error("[SurveysClient.getMemberSubmission] Error:", error);
      // 回答がない場合はnullを返す
      return null;
    }
  }

  /**
   * アンケート回答を送信
   */
  async submitAnswers(
    surveyId: string | number,
    memberId: string | number,
    answers: Array<{
      question_id: number;
      answer: string | string[] | number;
    }>
  ): Promise<RecoreSurveySubmission> {
    try {
      const response = await this.post<RecoreSurveySubmission>(
        `/surveys/${surveyId}/submissions`,
        {
          member_id: Number(memberId),
          answers,
        }
      );
      return response;
    } catch (error) {
      console.error("[SurveysClient.submitAnswers] Error:", error);
      throw error;
    }
  }
}