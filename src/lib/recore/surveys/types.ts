// ReCORE API Survey Types

export interface RecoreSurvey {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  created_at: number;
  updated_at: number;
}

export interface RecoreSurveyQuestion {
  id: number;
  survey_id: number;
  type: "TEXT" | "RADIO" | "CHECKBOX" | "TEXTAREA" | "SELECT" | "SCALE";
  question: string;
  description: string | null;
  options: string[] | null;
  required: boolean;
  order: number;
  created_at: number;
  updated_at: number;
}

export interface RecoreSurveyAnswer {
  id: number;
  survey_id: number;
  question_id: number;
  member_id: number;
  answer: string | string[] | number;
  created_at: number;
}

export interface RecoreSurveySubmission {
  id: number;
  survey_id: number;
  member_id: number;
  answers: RecoreSurveyAnswer[];
  submitted_at: number;
  created_at: number;
}