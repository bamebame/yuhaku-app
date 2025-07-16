"use client";

import { PosCard, PosCardContent, PosCardHeader, PosCardTitle } from "@/components/pos";
import { ClipboardList, Loader2 } from "lucide-react";
import { useSurvey, useSurveyQuestions, useSurveySubmission } from "../hooks";
import { SurveyForm } from "./survey-form";

interface SurveySectionProps {
  memberId: string | null;
}

export function SurveySection({ memberId }: SurveySectionProps) {
  const surveyId = process.env.NEXT_PUBLIC_SURVEY_ID || "1";
  
  console.log("[SurveySection] Survey ID:", surveyId);
  console.log("[SurveySection] Member ID:", memberId);
  
  const { survey, isLoading: isLoadingSurvey, isError: isSurveyError } = useSurvey(surveyId);
  const { questions, isLoading: isLoadingQuestions, isError: isQuestionsError } = useSurveyQuestions(surveyId);
  const { submission, isLoading: isLoadingSubmission, refresh } = useSurveySubmission(
    surveyId,
    memberId
  );

  console.log("[SurveySection] Survey:", survey);
  console.log("[SurveySection] Questions:", questions);
  console.log("[SurveySection] Submission:", submission);
  console.log("[SurveySection] Survey Error:", isSurveyError);
  console.log("[SurveySection] Questions Error:", isQuestionsError);

  const isLoading = isLoadingSurvey || isLoadingQuestions || isLoadingSubmission;

  if (!memberId) {
    return (
      <PosCard>
        <PosCardHeader>
          <PosCardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            顧客アンケート
          </PosCardTitle>
        </PosCardHeader>
        <PosCardContent>
          <p className="text-pos-muted">会員を選択してください</p>
        </PosCardContent>
      </PosCard>
    );
  }

  return (
    <PosCard>
      <PosCardHeader>
        <PosCardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          顧客アンケート
        </PosCardTitle>
      </PosCardHeader>
      <PosCardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-pos-muted" />
          </div>
        ) : isSurveyError || isQuestionsError ? (
          <div className="text-center py-4">
            <p className="text-pos-muted mb-2">アンケート機能は現在利用できません</p>
            <p className="text-pos-xs text-pos-muted">
              システム管理者にお問い合わせください
            </p>
          </div>
        ) : survey && questions && questions.length > 0 ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-pos-lg font-semibold">{survey.name}</h3>
              {survey.description && (
                <p className="text-pos-sm text-pos-muted mt-1">{survey.description}</p>
              )}
            </div>
            <SurveyForm
              questions={questions}
              surveyId={surveyId}
              memberId={memberId}
              submission={submission}
              onSubmit={refresh}
            />
          </div>
        ) : (
          <p className="text-pos-muted">アンケートが見つかりません</p>
        )}
      </PosCardContent>
    </PosCard>
  );
}