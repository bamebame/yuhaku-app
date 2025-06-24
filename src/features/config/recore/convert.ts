import type { RecorePayment, RecoreCashier, RecoreConfigResponse } from "@/lib/recore/types/config"
import type { Payment, Cashier, Config } from "../types"

export function convertRecorePaymentToPayment(recore: RecorePayment): Payment {
  return {
    id: recore.id.toString(),
    name: recore.name,
    type: recore.type,
  }
}

export function convertRecoreCashierToCashier(recore: RecoreCashier): Cashier {
  return {
    id: recore.id.toString(),
    name: recore.name,
    storeId: recore.store.id.toString(),
    storeName: recore.store.name,
  }
}

export function convertRecoreConfigToConfig(recore: RecoreConfigResponse): Config {
  return {
    payments: recore.payments.map(convertRecorePaymentToPayment),
    cashiers: recore.cashiers.map(convertRecoreCashierToCashier),
  }
}