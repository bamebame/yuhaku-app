import type { NextRequest } from "next/server";
import { createServerContext } from "@/lib/context/server-context";
import { SurveysClient } from "@/lib/recore/surveys";
import { apiResponse } from "@/app/api/_utils/response";
import { convertRecoreSurveySubmissionToSurveySubmission } from "@/features/surveys/recore/convert";
import { getSubmission } from "../../mock-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const memberId = searchParams.get("member_id");
    
    if (!memberId) {
      return apiResponse.error(new Error("member_id is required"));
    }
    
    // For testing with survey ID 1, check mock store
    if (id === "1") {
      console.log("[API] Checking mock submission for survey 1, member", memberId);
      const mockSubmission = getSubmission(id, memberId);
      return apiResponse.success(mockSubmission);
    }
    
    const context = await createServerContext();
    const client = new SurveysClient(context);
    
    const submission = await client.getMemberSubmission(id, memberId);
    
    if (!submission) {
      return apiResponse.success(null);
    }
    
    const convertedSubmission = convertRecoreSurveySubmissionToSurveySubmission(submission);
    return apiResponse.success(convertedSubmission);
  } catch (error) {
    console.error("[API] Survey submission fetch error:", error);
    return apiResponse.error(error);
  }
}