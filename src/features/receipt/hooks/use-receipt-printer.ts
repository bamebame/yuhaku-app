"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  ReceiptPrinterClient, 
  ReceiptFormatter,
  type PrinterConnectionStatus,
  type PrinterPrintStatus,
  type PrinterSettings,
  type PrinterStatus,
  type PrinterError,
  type ReceiptData,
  type PrintReceiptOptions,
  type PrintReceiptResult,
  DEFAULT_PRINTER_SETTINGS,
  PRINTER_ERROR_MESSAGES,
} from '@/lib/receipt-printer';

interface UseReceiptPrinterOptions {
  autoConnect?: boolean;
  settings?: Partial<PrinterSettings>;
  onStatusChange?: (status: PrinterStatus) => void;
  onError?: (error: PrinterError) => void;
}

interface UseReceiptPrinterReturn {
  // 状態
  connectionStatus: PrinterConnectionStatus;
  printStatus: PrinterPrintStatus;
  printerStatus: PrinterStatus | null;
  lastError: PrinterError | null;
  
  // 操作
  connect: (ipAddress?: string, port?: string) => Promise<void>;
  disconnect: () => void;
  printReceipt: (receiptData: ReceiptData, options?: PrintReceiptOptions) => Promise<PrintReceiptResult>;
  clearError: () => void;
  
  // 設定
  updateSettings: (settings: Partial<PrinterSettings>) => void;
  getSettings: () => PrinterSettings;
  
  // ユーティリティ
  isConnected: boolean;
  isPrinting: boolean;
  canPrint: boolean;
}

/**
 * レシートプリンター操作用Hook
 */
export function useReceiptPrinter(options: UseReceiptPrinterOptions = {}): UseReceiptPrinterReturn {
  const {
    autoConnect = false,
    settings: initialSettings = {},
    onStatusChange,
    onError,
  } = options;

  // Refs
  const printerClientRef = useRef<ReceiptPrinterClient | null>(null);
  const formatterRef = useRef<ReceiptFormatter | null>(null);
  const isMountedRef = useRef(true);

  // State
  const [connectionStatus, setConnectionStatus] = useState<PrinterConnectionStatus>('disconnected');
  const [printStatus, setPrintStatus] = useState<PrinterPrintStatus>('idle');
  const [printerStatus, setPrinterStatus] = useState<PrinterStatus | null>(null);
  const [lastError, setLastError] = useState<PrinterError | null>(null);

  // プリンタークライアントの初期化
  useEffect(() => {
    const settings = { ...DEFAULT_PRINTER_SETTINGS, ...initialSettings };
    printerClientRef.current = new ReceiptPrinterClient(settings);
    formatterRef.current = new ReceiptFormatter();

    // イベントハンドラの設定
    printerClientRef.current.setEvents({
      onConnect: () => {
        if (isMountedRef.current) {
          setConnectionStatus('connected');
          setLastError(null);
        }
      },
      onDisconnect: () => {
        if (isMountedRef.current) {
          setConnectionStatus('disconnected');
          setPrinterStatus(null);
        }
      },
      onStatusChange: (status) => {
        if (isMountedRef.current) {
          setPrinterStatus(status);
          onStatusChange?.(status);
        }
      },
      onError: (error) => {
        if (isMountedRef.current) {
          setLastError(error);
          setConnectionStatus('error');
          onError?.(error);
        }
      },
      onPaperEnd: () => {
        if (isMountedRef.current) {
          setLastError({
            code: 'PAPER_END',
            message: PRINTER_ERROR_MESSAGES.PAPER_END,
          });
        }
      },
      onCoverOpen: () => {
        if (isMountedRef.current) {
          setLastError({
            code: 'COVER_OPEN',
            message: PRINTER_ERROR_MESSAGES.COVER_OPEN,
          });
        }
      },
      onOffline: () => {
        if (isMountedRef.current) {
          setLastError({
            code: 'OFFLINE',
            message: PRINTER_ERROR_MESSAGES.OFFLINE,
          });
        }
      },
    });

    // 自動接続
    if (autoConnect && settings.ipAddress) {
      connect(settings.ipAddress, settings.port);
    }

    // クリーンアップ
    return () => {
      isMountedRef.current = false;
      if (printerClientRef.current) {
        printerClientRef.current.disconnect();
      }
    };
  }, []); // 初回のみ実行

  /**
   * プリンターに接続
   */
  const connect = useCallback(async (ipAddress?: string, port?: string) => {
    if (!printerClientRef.current) return;

    try {
      setConnectionStatus('connecting');
      setLastError(null);
      
      await printerClientRef.current.connect(ipAddress, port);
      
      // ステータスモニターを開始
      printerClientRef.current.startMonitor();
    } catch (error) {
      if (isMountedRef.current) {
        setConnectionStatus('error');
        const printerError: PrinterError = {
          code: 'CONNECTION_FAILED',
          message: error instanceof Error ? error.message : PRINTER_ERROR_MESSAGES.CONNECTION_FAILED,
        };
        setLastError(printerError);
        throw printerError;
      }
    }
  }, []);

  /**
   * プリンターから切断
   */
  const disconnect = useCallback(() => {
    if (printerClientRef.current) {
      printerClientRef.current.stopMonitor();
      printerClientRef.current.disconnect();
      setConnectionStatus('disconnected');
      setPrinterStatus(null);
    }
  }, []);

  /**
   * レシート印刷
   */
  const printReceipt = useCallback(async (
    receiptData: ReceiptData,
    options: PrintReceiptOptions = {}
  ): Promise<PrintReceiptResult> => {
    if (!printerClientRef.current || !formatterRef.current) {
      const error: PrinterError = {
        code: 'NOT_INITIALIZED',
        message: 'プリンターが初期化されていません',
      };
      setLastError(error);
      return {
        success: false,
        error,
        timestamp: new Date(),
      };
    }

    if (!printerClientRef.current.isConnected()) {
      const error: PrinterError = {
        code: 'NOT_CONNECTED',
        message: PRINTER_ERROR_MESSAGES.NOT_CONNECTED,
      };
      setLastError(error);
      return {
        success: false,
        error,
        timestamp: new Date(),
      };
    }

    try {
      setPrintStatus('printing');
      setLastError(null);

      const result = await printerClientRef.current.printReceipt(
        receiptData,
        formatterRef.current,
        options
      );

      if (isMountedRef.current) {
        setPrintStatus(result.success ? 'success' : 'error');
        if (!result.success && result.error) {
          setLastError(result.error);
        }
      }

      // 3秒後に印刷状態をリセット
      setTimeout(() => {
        if (isMountedRef.current) {
          setPrintStatus('idle');
        }
      }, 3000);

      return result;
    } catch (error) {
      const printerError: PrinterError = {
        code: 'PRINT_FAILED',
        message: error instanceof Error ? error.message : PRINTER_ERROR_MESSAGES.PRINT_FAILED,
      };
      
      if (isMountedRef.current) {
        setPrintStatus('error');
        setLastError(printerError);
      }

      return {
        success: false,
        error: printerError,
        timestamp: new Date(),
      };
    }
  }, []);

  /**
   * エラーをクリア
   */
  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  /**
   * 設定を更新
   */
  const updateSettings = useCallback((newSettings: Partial<PrinterSettings>) => {
    if (printerClientRef.current) {
      printerClientRef.current.updateSettings(newSettings);
    }
  }, []);

  /**
   * 現在の設定を取得
   */
  const getSettings = useCallback((): PrinterSettings => {
    if (printerClientRef.current) {
      return printerClientRef.current.getSettings();
    }
    return { ...DEFAULT_PRINTER_SETTINGS, ...initialSettings };
  }, [initialSettings]);

  // 計算されたプロパティ
  const isConnected = connectionStatus === 'connected';
  const isPrinting = printStatus === 'printing';
  const canPrint = isConnected && !isPrinting && printerStatus?.online === true;

  return {
    // 状態
    connectionStatus,
    printStatus,
    printerStatus,
    lastError,
    
    // 操作
    connect,
    disconnect,
    printReceipt,
    clearError,
    
    // 設定
    updateSettings,
    getSettings,
    
    // ユーティリティ
    isConnected,
    isPrinting,
    canPrint,
  };
}