export interface Payment {
  id: string;
  name: string;
  type: "CASH" | "POINT" | "CASHABLE" | "CAT" | "BANK" | "OTHER";
}

export interface Cashier {
  id: string;
  name: string;
  storeId: string;
  storeName: string;
}

export interface Config {
  payments: Payment[];
  cashiers: Cashier[];
}