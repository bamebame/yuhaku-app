import useSWR from "swr";
import type { Survey, SurveyQuestion, SurveySubmission } from "../types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSurvey(surveyId: string | null) {
  const { data, error, isLoading } = useSWR<{ data: Survey }>(
    surveyId ? `/api/surveys/${surveyId}` : null,
    fetcher
  );

  return {
    survey: data?.data,
    isLoading,
    isError: error,
  };
}

export function useSurveyQuestions(surveyId: string | null) {
  const { data, error, isLoading } = useSWR<{ data: SurveyQuestion[] }>(
    surveyId ? `/api/surveys/${surveyId}/questions` : null,
    fetcher
  );

  return {
    questions: data?.data,
    isLoading,
    isError: error,
  };
}

export function useSurveySubmission(surveyId: string | null, memberId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{ data: SurveySubmission | null }>(
    surveyId && memberId
      ? `/api/surveys/${surveyId}/submissions?member_id=${memberId}`
      : null,
    fetcher
  );

  return {
    submission: data?.data,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}