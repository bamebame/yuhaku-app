import type {
  RecoreSurvey,
  RecoreSurveyQuestion,
  RecoreSurveyAnswer,
  RecoreSurveySubmission,
} from "@/lib/recore/surveys/types";
import type {
  Survey,
  SurveyQuestion,
  SurveyAnswer,
  SurveySubmission,
} from "../types";

export function convertRecoreSurveyToSurvey(recore: RecoreSurvey): Survey {
  if (!recore) {
    throw new Error("Survey data is undefined");
  }
  
  return {
    id: recore.id.toString(),
    name: recore.name,
    slug: recore.slug,
    description: recore.description,
    status: recore.status,
    createdAt: new Date(recore.created_at * 1000),
    updatedAt: new Date(recore.updated_at * 1000),
  };
}

export function convertRecoreSurveyQuestionToSurveyQuestion(
  recore: RecoreSurveyQuestion
): SurveyQuestion {
  return {
    id: recore.id.toString(),
    surveyId: recore.survey_id.toString(),
    type: recore.type,
    question: recore.question,
    description: recore.description,
    options: recore.options,
    required: recore.required,
    order: recore.order,
    createdAt: new Date(recore.created_at * 1000),
    updatedAt: new Date(recore.updated_at * 1000),
  };
}

export function convertRecoreSurveyAnswerToSurveyAnswer(
  recore: RecoreSurveyAnswer
): SurveyAnswer {
  return {
    id: recore.id.toString(),
    surveyId: recore.survey_id.toString(),
    questionId: recore.question_id.toString(),
    memberId: recore.member_id.toString(),
    answer: recore.answer,
    createdAt: new Date(recore.created_at * 1000),
  };
}

export function convertRecoreSurveySubmissionToSurveySubmission(
  recore: RecoreSurveySubmission
): SurveySubmission {
  return {
    id: recore.id.toString(),
    surveyId: recore.survey_id.toString(),
    memberId: recore.member_id.toString(),
    answers: recore.answers.map(convertRecoreSurveyAnswerToSurveyAnswer),
    submittedAt: new Date(recore.submitted_at * 1000),
    createdAt: new Date(recore.created_at * 1000),
  };
}