import type {
  PrinterConnectionStatus,
  PrinterSettings,
  PrinterEvents,
  PrinterResponse,
  PrinterStatus,
  PrinterError,
  ReceiptData,
  PrintReceiptOptions,
  PrintReceiptResult,
} from './types';

/**
 * レシートプリンタークライアント
 * Epson ePOS SDK を使用してプリンターと通信
 */
export class ReceiptPrinterClient {
  private eposDevice: any = null;
  private printer: any = null;
  private connectionStatus: PrinterConnectionStatus = 'disconnected';
  private settings: PrinterSettings;
  private events: PrinterEvents = {};
  private isSDKLoaded = false;

  constructor(settings: Partial<PrinterSettings> = {}) {
    this.settings = {
      ipAddress: '',
      port: '8008',
      deviceId: 'local_printer',
      paperWidth: 80,
      printDensity: 'medium',
      cutType: 'partial',
      drawerKick: true,
      buzzer: false,
      timeout: 60000, // 60秒
      ...settings,
    };
  }

  /**
   * SDKの読み込み確認
   */
  private async ensureSDKLoaded(): Promise<void> {
    if (this.isSDKLoaded) return;

    // SDKが読み込まれるまで待機
    let attempts = 0;
    while (!(window as any).epson && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!(window as any).epson) {
      throw new Error('ePOS SDK が読み込まれていません');
    }

    this.isSDKLoaded = true;
  }

  /**
   * プリンターに接続
   */
  async connect(ipAddress?: string, port?: string): Promise<void> {
    try {
      await this.ensureSDKLoaded();

      if (ipAddress) this.settings.ipAddress = ipAddress;
      if (port) this.settings.port = port;

      if (!this.settings.ipAddress) {
        throw new Error('IPアドレスが設定されていません');
      }

      this.connectionStatus = 'connecting';
      this.eposDevice = new (window as any).epson.ePOSDevice();

      // 接続イベントの設定
      this.setupDeviceEvents();

      return new Promise((resolve, reject) => {
        this.eposDevice.connect(
          this.settings.ipAddress,
          this.settings.port,
          (result: string) => {
            if (result === 'OK' || result === 'SSL_CONNECT_OK') {
              this.createPrinterDevice(resolve, reject);
            } else {
              this.connectionStatus = 'error';
              const error: PrinterError = {
                code: result,
                message: this.getErrorMessage(result),
              };
              this.events.onError?.(error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      this.connectionStatus = 'error';
      throw error;
    }
  }

  /**
   * プリンターデバイスの作成
   */
  private createPrinterDevice(
    resolve: (value: void) => void,
    reject: (reason: any) => void
  ): void {
    this.eposDevice.createDevice(
      this.settings.deviceId,
      this.eposDevice.DEVICE_TYPE_PRINTER,
      { crypto: false, buffer: false },
      (deviceObj: any, code: string) => {
        if (code === 'OK') {
          this.printer = deviceObj;
          this.setupPrinterEvents();
          this.connectionStatus = 'connected';
          this.events.onConnect?.();
          resolve();
        } else {
          this.connectionStatus = 'error';
          const error: PrinterError = {
            code,
            message: this.getErrorMessage(code),
          };
          this.events.onError?.(error);
          reject(error);
        }
      }
    );
  }

  /**
   * デバイスイベントの設定
   */
  private setupDeviceEvents(): void {
    this.eposDevice.onreconnecting = () => {
      this.connectionStatus = 'connecting';
    };

    this.eposDevice.onreconnect = () => {
      this.connectionStatus = 'connected';
      this.events.onConnect?.();
    };

    this.eposDevice.ondisconnect = () => {
      this.connectionStatus = 'disconnected';
      this.printer = null;
      this.events.onDisconnect?.();
    };
  }

  /**
   * プリンターイベントの設定
   */
  private setupPrinterEvents(): void {
    if (!this.printer) return;

    // プリンタータイムアウト設定
    this.printer.timeout = this.settings.timeout;

    // レスポンス受信
    this.printer.onreceive = (response: any) => {
      const printerResponse: PrinterResponse = {
        success: response.success,
        code: response.code,
        status: response.status,
        battery: response.battery,
        printjobid: response.printjobid,
      };
      this.events.onReceive?.(printerResponse);
    };

    // ステータス変更
    this.printer.onstatuschange = (status: number) => {
      const printerStatus = this.parseStatus(status);
      this.events.onStatusChange?.(printerStatus);
    };

    // オンライン/オフライン
    this.printer.ononline = () => this.events.onOnline?.();
    this.printer.onoffline = () => this.events.onOffline?.();
    this.printer.onpoweroff = () => this.events.onPowerOff?.();

    // カバー状態
    this.printer.oncoverok = () => this.events.onCoverOk?.();
    this.printer.oncoveropen = () => this.events.onCoverOpen?.();

    // 用紙状態
    this.printer.onpaperok = () => this.events.onPaperOk?.();
    this.printer.onpapernearend = () => this.events.onPaperNearEnd?.();
    this.printer.onpaperend = () => this.events.onPaperEnd?.();

    // ドロワー状態
    this.printer.ondrawerclosed = () => this.events.onDrawerClosed?.();
    this.printer.ondraweropen = () => this.events.onDrawerOpen?.();
  }

  /**
   * ステータスの解析
   */
  private parseStatus(status: number): PrinterStatus {
    return {
      online: !(status & this.printer.ASB_OFF_LINE),
      coverOpen: !!(status & this.printer.ASB_COVER_OPEN),
      paperEnd: !!(status & this.printer.ASB_RECEIPT_END),
      paperNearEnd: !!(status & this.printer.ASB_RECEIPT_NEAR_END),
      drawerOpen: !!(status & this.printer.ASB_DRAWER_KICK),
      error: this.getStatusError(status),
    };
  }

  /**
   * ステータスからエラーメッセージを取得
   */
  private getStatusError(status: number): string | undefined {
    if (status & this.printer.ASB_NO_RESPONSE) return 'プリンターが応答しません';
    if (status & this.printer.ASB_MECHANICAL_ERR) return '機械的エラー';
    if (status & this.printer.ASB_AUTOCUTTER_ERR) return 'オートカッターエラー';
    if (status & this.printer.ASB_UNRECOVER_ERR) return '復旧不可能なエラー';
    if (status & this.printer.ASB_AUTORECOVER_ERR) return '自動復旧エラー';
    return undefined;
  }

  /**
   * エラーコードからメッセージを取得
   */
  private getErrorMessage(code: string): string {
    const errorMessages: Record<string, string> = {
      'DEVICE_NOT_FOUND': 'デバイスが見つかりません',
      'DEVICE_BUSY': 'デバイスが使用中です',
      'DEVICE_IN_USE': 'デバイスは既に使用されています',
      'DEVICE_TYPE_INVALID': '無効なデバイスタイプです',
      'DEVICE_OPEN_ERROR': 'デバイスのオープンに失敗しました',
      'CONNECT_TIMEOUT': '接続タイムアウト',
      'SSL_CONNECT_FAIL': 'SSL接続に失敗しました',
      'DISCONNECT': '切断されました',
      'ERR_PARAM': 'パラメータエラー',
      'ERR_MEMORY': 'メモリエラー',
      'ERR_PROCESSING': '処理エラー',
      'ERR_UNSUPPORTED': 'サポートされていない操作です',
    };
    return errorMessages[code] || `エラー: ${code}`;
  }

  /**
   * レシート印刷（ReceiptFormatterと連携）
   */
  async printReceipt(
    receiptData: ReceiptData,
    formatter: any, // ReceiptFormatterのインスタンス
    options: PrintReceiptOptions = {}
  ): Promise<PrintReceiptResult> {
    if (!this.isConnected()) {
      throw new Error('プリンターが接続されていません');
    }

    const startTime = new Date();
    const copies = options.copies || 1;

    try {
      for (let i = 0; i < copies; i++) {
        // ドロワーを開く（初回のみ）
        if (i === 0 && (options.openDrawer ?? this.settings.drawerKick)) {
          this.printer.addPulse(this.printer.DRAWER_1, this.printer.PULSE_100);
        }

        // レシートフォーマット
        formatter.formatReceipt(receiptData, this.printer);

        // カット
        if (i < copies - 1 && options.cutAfterEachCopy) {
          this.printer.addCut(this.printer.CUT_FEED);
        }
      }

      // 最終カット
      this.printer.addCut(
        this.settings.cutType === 'full' 
          ? this.printer.CUT_NO_FEED 
          : this.printer.CUT_FEED
      );

      // ブザー
      if (options.buzzer ?? this.settings.buzzer) {
        this.printer.addSound(this.printer.PATTERN_A, 3);
      }

      // 送信
      return new Promise((resolve) => {
        const jobId = `R${Date.now()}`;
        let responseReceived = false;

        // タイムアウト処理
        const timeout = setTimeout(() => {
          if (!responseReceived) {
            resolve({
              success: false,
              error: {
                code: 'TIMEOUT',
                message: '印刷タイムアウト',
              },
              timestamp: new Date(),
            });
          }
        }, this.settings.timeout!);

        // 一時的なレスポンスハンドラ
        const originalOnReceive = this.printer.onreceive;
        this.printer.onreceive = (response: any) => {
          responseReceived = true;
          clearTimeout(timeout);
          
          // 元のハンドラを復元
          this.printer.onreceive = originalOnReceive;
          
          // 元のハンドラも呼び出す
          originalOnReceive?.(response);

          resolve({
            success: response.success,
            jobId: response.printjobid || jobId,
            error: response.success ? undefined : {
              code: response.code,
              message: this.getErrorMessage(response.code),
              status: response.status,
            },
            timestamp: new Date(),
          });
        };

        // 印刷実行
        this.printer.send(jobId);
      });
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN',
          message: error instanceof Error ? error.message : '不明なエラー',
        },
        timestamp: startTime,
      };
    }
  }

  /**
   * プリンターのクリア
   */
  clearPrinter(): void {
    if (this.printer) {
      this.printer.clearCommandBuffer();
    }
  }

  /**
   * プリンターの切断
   */
  disconnect(): void {
    if (this.eposDevice) {
      try {
        if (this.printer) {
          this.eposDevice.deleteDevice(this.printer, () => {});
        }
        this.eposDevice.disconnect();
      } catch (error) {
        console.error('切断エラー:', error);
      }
    }
    this.printer = null;
    this.eposDevice = null;
    this.connectionStatus = 'disconnected';
  }

  /**
   * 接続状態の確認
   */
  isConnected(): boolean {
    return this.connectionStatus === 'connected' && this.printer !== null;
  }

  /**
   * 現在の接続状態を取得
   */
  getConnectionStatus(): PrinterConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * 設定の更新
   */
  updateSettings(settings: Partial<PrinterSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * 現在の設定を取得
   */
  getSettings(): PrinterSettings {
    return { ...this.settings };
  }

  /**
   * イベントハンドラの設定
   */
  setEvents(events: PrinterEvents): void {
    this.events = { ...this.events, ...events };
  }

  /**
   * ステータスモニターの開始
   */
  startMonitor(): void {
    if (this.printer && this.printer.startMonitor) {
      this.printer.startMonitor();
    }
  }

  /**
   * ステータスモニターの停止
   */
  stopMonitor(): void {
    if (this.printer && this.printer.stopMonitor) {
      this.printer.stopMonitor();
    }
  }
}