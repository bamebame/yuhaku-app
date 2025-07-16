"use client";

import { useState } from "react";
import { PosButton } from "@/components/pos";
import { CheckCircle2, Circle, Square, CheckSquare, AlertCircle } from "lucide-react";
import type { SurveyQuestion, SurveySubmission } from "../types";
import { submitSurveyAnswers } from "../actions";
import { useToast } from "@/hooks/use-toast";

interface SurveyFormProps {
  questions: SurveyQuestion[];
  surveyId: string;
  memberId: string;
  submission?: SurveySubmission | null;
  onSubmit?: () => void;
}

export function SurveyForm({
  questions,
  surveyId,
  memberId,
  submission,
  onSubmit,
}: SurveyFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>(() => {
    // 既存の回答がある場合は初期値として設定
    if (submission) {
      const initial: Record<string, string | string[] | number> = {};
      submission.answers.forEach((answer) => {
        initial[answer.questionId] = answer.answer;
      });
      return initial;
    }
    return {};
  });

  const handleAnswerChange = (questionId: string, value: string | string[] | number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 必須項目のチェック
    const missingRequired = questions
      .filter((q) => q.required && !answers[q.id])
      .map((q) => q.question);

    if (missingRequired.length > 0) {
      toast({
        title: "入力エラー",
        description: `必須項目が入力されていません: ${missingRequired.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      await submitSurveyAnswers(surveyId, memberId, formattedAnswers);

      toast({
        title: "送信完了",
        description: "アンケートを送信しました",
      });

      onSubmit?.();
    } catch (error) {
      toast({
        title: "エラー",
        description: "アンケートの送信に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 質問のタイプに応じたフォームフィールドをレンダリング
  const renderQuestionField = (question: SurveyQuestion) => {
    const value = answers[question.id];

    switch (question.type) {
      case "TEXT":
        return (
          <input
            type="text"
            value={(value as string) || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border-2 border-pos-border focus:outline-none focus:ring-2 focus:ring-pos-accent"
            disabled={isSubmitting || !!submission}
          />
        );

      case "TEXTAREA":
        return (
          <textarea
            value={(value as string) || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border-2 border-pos-border focus:outline-none focus:ring-2 focus:ring-pos-accent"
            disabled={isSubmitting || !!submission}
          />
        );

      case "RADIO":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 cursor-pointer"
              >
                <button
                  type="button"
                  onClick={() => !submission && handleAnswerChange(question.id, option)}
                  disabled={isSubmitting || !!submission}
                  className="p-0"
                >
                  {value === option ? (
                    <CheckCircle2 className="h-5 w-5 text-pos-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-pos-border" />
                  )}
                </button>
                <span className="text-pos-base">{option}</span>
              </label>
            ))}
          </div>
        );

      case "CHECKBOX":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => {
              const currentValues = (value as string[]) || [];
              const isChecked = currentValues.includes(option);

              return (
                <label
                  key={option}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (submission) return;
                      const newValues = isChecked
                        ? currentValues.filter((v) => v !== option)
                        : [...currentValues, option];
                      handleAnswerChange(question.id, newValues);
                    }}
                    disabled={isSubmitting || !!submission}
                    className="p-0"
                  >
                    {isChecked ? (
                      <CheckSquare className="h-5 w-5 text-pos-primary" />
                    ) : (
                      <Square className="h-5 w-5 text-pos-border" />
                    )}
                  </button>
                  <span className="text-pos-base">{option}</span>
                </label>
              );
            })}
          </div>
        );

      case "SELECT":
        return (
          <select
            value={(value as string) || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border-2 border-pos-border focus:outline-none focus:ring-2 focus:ring-pos-accent"
            disabled={isSubmitting || !!submission}
          >
            <option value="">選択してください</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "SCALE":
        const scaleValue = (value as number) || 0;
        return (
          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="10"
              value={scaleValue}
              onChange={(e) => handleAnswerChange(question.id, Number(e.target.value))}
              className="w-full"
              disabled={isSubmitting || !!submission}
            />
            <div className="flex justify-between text-pos-sm text-pos-muted">
              <span>1</span>
              <span className="text-pos-base font-medium">{scaleValue || "-"}</span>
              <span>10</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions
        .sort((a, b) => a.order - b.order)
        .map((question) => (
          <div key={question.id} className="space-y-2">
            <div className="flex items-start gap-2">
              <h3 className="font-medium text-pos-base">
                {question.question}
                {question.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </h3>
            </div>
            {question.description && (
              <p className="text-pos-sm text-pos-muted">{question.description}</p>
            )}
            {renderQuestionField(question)}
          </div>
        ))}

      {submission ? (
        <div className="flex items-center gap-2 p-4 bg-pos-light border-2 border-pos-border">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <span className="text-pos-base">
            アンケートは既に送信されています（送信日時: {new Date(submission.submittedAt).toLocaleString()}）
          </span>
        </div>
      ) : (
        <div className="flex justify-end gap-2">
          <PosButton
            type="submit"
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? "送信中..." : "アンケートを送信"}
          </PosButton>
        </div>
      )}
    </form>
  );
}