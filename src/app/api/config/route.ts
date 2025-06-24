import type { NextRequest } from "next/server"
import { createServerContext } from "@/lib/context/server-context"
import { ConfigClient } from "@/lib/recore/config"
import { apiResponse } from "@/app/api/_utils/response"
import { convertRecoreConfigToConfig } from "@/features/config/recore/convert"

// 24時間のキャッシュを設定
export const revalidate = 86400

export async function GET(_request: NextRequest) {
  try {
    const context = await createServerContext()
    const client = new ConfigClient(context)
    
    const recoreConfig = await client.list()
    const config = convertRecoreConfigToConfig(recoreConfig)
    
    return apiResponse.success(config)
  } catch (error) {
    return apiResponse.error(error)
  }
}