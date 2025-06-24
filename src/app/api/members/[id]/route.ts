import { NextRequest } from "next/server";
import { createServerContext } from "@/lib/context/server-context";
import { MembersClient } from "@/lib/recore/members";
import { apiResponse } from "@/app/api/_utils/response";
import { convertRecoreMemberToMember } from "@/features/members/recore/convert";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const context = await createServerContext();
		const client = new MembersClient(context);
		
		const recoreMember = await client.getByStringId(params.id);
		const member = convertRecoreMemberToMember(recoreMember);
		return apiResponse.success(member);
	} catch (error) {
		return apiResponse.error(error);
	}
}