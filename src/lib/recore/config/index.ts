import { BaseClient } from "../baseClient"
import type { RecoreConfigResponse } from "../types/config"
import type { ClientContext } from "@/lib/context/client-factory"

export class ConfigClient extends BaseClient {
  constructor(context: ClientContext) {
    super(context)
  }

  async list(): Promise<RecoreConfigResponse> {
    return this.get<RecoreConfigResponse>("/configs")
  }
}