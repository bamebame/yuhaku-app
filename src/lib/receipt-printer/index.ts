/**
 * レシートプリンターライブラリ
 */

export * from './types';
export { ReceiptPrinterClient } from './printer-client';
export { ReceiptFormatter } from './receipt-formatter';

// デフォルトのプリンター設定
export const DEFAULT_PRINTER_SETTINGS = {
  ipAddress: '',
  port: '8008',
  deviceId: 'local_printer',
  paperWidth: 80 as const,
  printDensity: 'medium' as const,
  cutType: 'partial' as const,
  drawerKick: true,
  buzzer: false,
  timeout: 60000,
};

// エラーメッセージ
export const PRINTER_ERROR_MESSAGES = {
  NOT_CONNECTED: 'プリンターが接続されていません',
  CONNECTION_FAILED: 'プリンターへの接続に失敗しました',
  PRINT_FAILED: '印刷に失敗しました',
  PAPER_END: '用紙がありません',
  COVER_OPEN: 'プリンターカバーが開いています',
  OFFLINE: 'プリンターがオフラインです',
  TIMEOUT: '処理がタイムアウトしました',
} as const;