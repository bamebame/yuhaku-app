/**
 * レシートプリンター関連の型定義
 */

// ePOS SDKのグローバル宣言
declare global {
  interface Window {
    epson: {
      ePOSDevice: any;
    };
  }
}

// プリンター接続状態
export type PrinterConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// プリンター印刷状態
export type PrinterPrintStatus = 'idle' | 'printing' | 'success' | 'error';

// プリンター設定
export interface PrinterSettings {
  ipAddress: string;
  port: string;
  deviceId: string;
  paperWidth: 80; // 80mm固定
  printDensity: 'low' | 'medium' | 'high';
  cutType: 'full' | 'partial';
  drawerKick: boolean;
  buzzer: boolean;
  timeout?: number; // タイムアウト時間（ミリ秒）
}

// 店舗情報
export interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  registerId?: string;
}

// 取引情報
export interface TransactionInfo {
  id: string;
  date: Date;
  staffName: string;
  staffId: string;
}

// カート商品情報
export interface ReceiptCartItem {
  id: string;
  code: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unitAdjustment: number;
  total: number;
}

// サマリー情報
export interface ReceiptSummary {
  subtotal: number;
  caseAdjustment: number;
  couponDiscount: number;
  total: number;
  tax: number;
  taxRate: number;
}

// 支払い情報
export interface PaymentInfo {
  method: 'cash' | 'credit' | 'electronic' | 'gift';
  methodName: string;
  amount: number;
}

// レシートデータ
export interface ReceiptData {
  store: StoreInfo;
  transaction: TransactionInfo;
  items: ReceiptCartItem[];
  summary: ReceiptSummary;
  payments: PaymentInfo[];
  deposit: number;
  change: number;
  memberId?: string;
  memberName?: string;
  points?: number;
  footerMessage?: string;
  customerNote?: string;
}

// プリンターイベント
export interface PrinterEvents {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onReceive?: (response: PrinterResponse) => void;
  onStatusChange?: (status: PrinterStatus) => void;
  onError?: (error: PrinterError) => void;
  onOnline?: () => void;
  onOffline?: () => void;
  onPowerOff?: () => void;
  onCoverOk?: () => void;
  onCoverOpen?: () => void;
  onPaperOk?: () => void;
  onPaperNearEnd?: () => void;
  onPaperEnd?: () => void;
  onDrawerClosed?: () => void;
  onDrawerOpen?: () => void;
}

// プリンター応答
export interface PrinterResponse {
  success: boolean;
  code: string;
  status?: number;
  battery?: number;
  printjobid?: string;
}

// プリンターステータス
export interface PrinterStatus {
  online: boolean;
  coverOpen: boolean;
  paperEnd: boolean;
  paperNearEnd: boolean;
  drawerOpen: boolean;
  error?: string;
}

// プリンターエラー
export interface PrinterError {
  code: string;
  message: string;
  status?: number;
}

// レシート印刷オプション
export interface PrintReceiptOptions {
  copies?: number;
  cutAfterEachCopy?: boolean;
  openDrawer?: boolean;
  buzzer?: boolean;
}

// レシート印刷結果
export interface PrintReceiptResult {
  success: boolean;
  jobId?: string;
  error?: PrinterError;
  timestamp: Date;
}