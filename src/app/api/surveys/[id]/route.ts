import { NextRequest } from "next/server";
import { createServerContext } from "@/lib/context/server-context";
import { SurveysClient } from "@/lib/recore/surveys";
import { apiResponse } from "@/app/api/_utils/response";
import { convertRecoreSurveyToSurvey } from "@/features/surveys/recore/convert";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await createServerContext();
    const client = new SurveysClient(context);
    
    const survey = await client.getById(params.id);
    
    if (!survey) {
      return apiResponse.error(new Error("Survey not found"));
    }
    
    const convertedSurvey = convertRecoreSurveyToSurvey(survey);
    
    return apiResponse.success(convertedSurvey);
  } catch (error) {
    console.error("[API] Survey fetch error:", error);
    return apiResponse.error(error);
  }
}