"use client";

import { useState } from "react";
import { PosButton, PosCard, PosCardContent, PosCardHeader, PosCardTitle } from "@/components/pos";
import { useReceiptPrinter } from "@/features/receipt/hooks/use-receipt-printer";
import { PrinterSettingsDialog } from "@/features/receipt/components";
import type { ReceiptData } from "@/lib/receipt-printer";

// テスト用のレシートデータ
const createTestReceiptData = (): ReceiptData => {
  const now = new Date();
  
  return {
    store: {
      name: "YUHAKU 渋谷店",
      address: "東京都渋谷区渋谷1-1-1",
      phone: "03-1234-5678",
      registerId: "01",
    },
    transaction: {
      id: "TEST-20250620-001",
      date: now,
      staffName: "テストスタッフ",
      staffId: "STAFF001",
    },
    items: [
      {
        id: "1",
        code: "ITEM001",
        name: "テスト商品A（長い商品名のテストです）",
        quantity: 2,
        unitPrice: 1000,
        unitAdjustment: 0,
        total: 2000,
      },
      {
        id: "2",
        code: "ITEM002",
        name: "テスト商品B",
        quantity: 1,
        unitPrice: 1500,
        unitAdjustment: -100,
        total: 1400,
      },
      {
        id: "3",
        code: "ITEM003",
        name: "テスト商品C（セール品）",
        quantity: 3,
        unitPrice: 500,
        unitAdjustment: -50,
        total: 1350,
      },
    ],
    summary: {
      subtotal: 4000,
      caseAdjustment: -200,
      couponDiscount: -100,
      total: 4450,
      tax: 405,
      taxRate: 10,
    },
    payments: [
      {
        method: "cash",
        methodName: "現金",
        amount: 5000,
      },
    ],
    deposit: 5000,
    change: 550,
    memberId: "MEMBER12345",
    customerNote: "テスト用のお客様メモです",
  };
};

export default function TestReceiptPage() {
  const [isPrinting, setIsPrinting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);

  const printer = useReceiptPrinter({
    autoConnect: false,
    onError: (error) => {
      console.error("プリンターエラー:", error);
      setLastError(error.message);
      setLastSuccess(null);
    },
  });

  const handleTestPrint = async () => {
    if (!printer.isConnected) {
      setLastError("プリンターが接続されていません");
      return;
    }

    setIsPrinting(true);
    setLastError(null);
    setLastSuccess(null);

    try {
      const receiptData = createTestReceiptData();
      const result = await printer.printReceipt(receiptData);

      if (result.success) {
        setLastSuccess("レシート印刷に成功しました");
      } else {
        setLastError(result.error?.message || "印刷に失敗しました");
      }
    } catch (error) {
      setLastError(error instanceof Error ? error.message : "不明なエラー");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-pos-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">レシート印刷テスト</h1>

        {/* プリンター状態 */}
        <PosCard>
          <PosCardHeader>
            <PosCardTitle>プリンター状態</PosCardTitle>
          </PosCardHeader>
          <PosCardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-pos-muted">接続状態</p>
                <p className="font-medium">
                  {printer.connectionStatus === "connected" && "接続済み"}
                  {printer.connectionStatus === "connecting" && "接続中..."}
                  {printer.connectionStatus === "disconnected" && "未接続"}
                  {printer.connectionStatus === "error" && "エラー"}
                </p>
              </div>
              <div>
                <p className="text-sm text-pos-muted">印刷状態</p>
                <p className="font-medium">
                  {printer.printStatus === "idle" && "待機中"}
                  {printer.printStatus === "printing" && "印刷中..."}
                  {printer.printStatus === "success" && "成功"}
                  {printer.printStatus === "error" && "エラー"}
                </p>
              </div>
            </div>

            {printer.printerStatus && (
              <div className="border-t pt-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-pos-muted">用紙</p>
                  <p className="font-medium">
                    {printer.printerStatus.paperEnd ? "なし" : "あり"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-pos-muted">カバー</p>
                  <p className="font-medium">
                    {printer.printerStatus.coverOpen ? "開" : "閉"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-pos-muted">オンライン</p>
                  <p className="font-medium">
                    {printer.printerStatus.online ? "はい" : "いいえ"}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <PrinterSettingsDialog printer={printer} />
              <PosButton
                onClick={handleTestPrint}
                disabled={!printer.isConnected || isPrinting}
              >
                {isPrinting ? "印刷中..." : "テスト印刷"}
              </PosButton>
            </div>

            {lastError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
                エラー: {lastError}
              </div>
            )}

            {lastSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded text-green-700">
                {lastSuccess}
              </div>
            )}
          </PosCardContent>
        </PosCard>

        {/* テストデータプレビュー */}
        <PosCard>
          <PosCardHeader>
            <PosCardTitle>テストデータ</PosCardTitle>
          </PosCardHeader>
          <PosCardContent>
            <pre className="text-xs overflow-auto p-4 bg-pos-light border rounded">
              {JSON.stringify(createTestReceiptData(), null, 2)}
            </pre>
          </PosCardContent>
        </PosCard>
      </div>
    </div>
  );
}