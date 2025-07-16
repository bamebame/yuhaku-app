// Survey Types

export interface Survey {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveyQuestion {
  id: string;
  surveyId: string;
  type: "TEXT" | "RADIO" | "CHECKBOX" | "TEXTAREA" | "SELECT" | "SCALE";
  question: string;
  description: string | null;
  options: string[] | null;
  required: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveyAnswer {
  id: string;
  surveyId: string;
  questionId: string;
  memberId: string;
  answer: string | string[] | number;
  createdAt: Date;
}

export interface SurveySubmission {
  id: string;
  surveyId: string;
  memberId: string;
  answers: SurveyAnswer[];
  submittedAt: Date;
  createdAt: Date;
}

export interface SurveyFormData {
  answers: {
    questionId: string;
    answer: string | string[] | number;
  }[];
}