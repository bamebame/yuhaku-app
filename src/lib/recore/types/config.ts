// ReCORE API Config types

export interface RecorePayment {
  id: number;
  name: string;
  type: "CASH" | "POINT" | "CASHABLE" | "CAT" | "BANK" | "OTHER";
}

export interface RecoreCashier {
  id: number;
  name: string;
  store: {
    id: number;
    name: string;
  };
}

export interface RecoreConfigResponse {
  payments: RecorePayment[];
  cashiers: RecoreCashier[];
}