"use client";

import { useState } from "react";
import { Printer, Wifi, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PosButton, PosInput } from "@/components/pos";
import { Label } from "@/components/ui/label";
import { useReceiptPrinter } from "../hooks/use-receipt-printer";
import type { PrinterSettings } from "@/lib/receipt-printer";

interface PrinterSettingsDialogProps {
  printer: ReturnType<typeof useReceiptPrinter>;
  trigger?: React.ReactNode;
}

export function PrinterSettingsDialog({ printer, trigger }: PrinterSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [ipAddress, setIpAddress] = useState(printer.getSettings().ipAddress || "");
  const [port, setPort] = useState(printer.getSettings().port || "8008");
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await printer.connect(ipAddress, port);
      setOpen(false);
    } catch (error) {
      console.error("接続エラー:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    printer.disconnect();
  };

  const connectionStatusText = () => {
    switch (printer.connectionStatus) {
      case "connected":
        return "接続済み";
      case "connecting":
        return "接続中...";
      case "error":
        return "エラー";
      default:
        return "未接続";
    }
  };

  const connectionStatusColor = () => {
    switch (printer.connectionStatus) {
      case "connected":
        return "text-success";
      case "error":
        return "text-destructive";
      default:
        return "text-pos-muted";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <PosButton variant="outline" size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            プリンター設定
          </PosButton>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            レシートプリンター設定
          </DialogTitle>
          <DialogDescription>
            Epson TM シリーズプリンターに接続します
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 接続状態 */}
          <div className="rounded-lg border-2 border-pos-border p-4 bg-pos-light">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                <span className="font-medium">接続状態</span>
              </div>
              <span className={`font-medium ${connectionStatusColor()}`}>
                {connectionStatusText()}
              </span>
            </div>

            {printer.printerStatus && printer.connectionStatus === "connected" && (
              <div className="mt-3 space-y-1 text-sm text-pos-muted">
                <div>用紙: {printer.printerStatus.paperEnd ? "なし" : "あり"}</div>
                <div>カバー: {printer.printerStatus.coverOpen ? "開" : "閉"}</div>
                <div>
                  オンライン: {printer.printerStatus.online ? "はい" : "いいえ"}
                </div>
              </div>
            )}

            {printer.lastError && (
              <div className="mt-3 text-sm text-destructive">
                エラー: {printer.lastError.message}
              </div>
            )}
          </div>

          {/* IPアドレス設定 */}
          <div className="space-y-2">
            <Label htmlFor="ip-address">IPアドレス</Label>
            <PosInput
              id="ip-address"
              placeholder="192.168.1.100"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              disabled={printer.connectionStatus === "connected"}
            />
            <p className="text-xs text-pos-muted">
              プリンターのIPアドレスを入力してください
            </p>
          </div>

          {/* ポート設定 */}
          <div className="space-y-2">
            <Label htmlFor="port">ポート番号</Label>
            <PosInput
              id="port"
              placeholder="8008"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              disabled={printer.connectionStatus === "connected"}
            />
            <p className="text-xs text-pos-muted">通常は8008を使用します</p>
          </div>

          {/* プリンター設定 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">印刷設定</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>用紙幅</span>
                <span className="font-medium">80mm</span>
              </div>
              <div className="flex items-center justify-between">
                <span>カット方法</span>
                <span className="font-medium">
                  {printer.getSettings().cutType === "full" ? "フルカット" : "部分カット"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>ドロワーキック</span>
                <span className="font-medium">
                  {printer.getSettings().drawerKick ? "有効" : "無効"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-2">
          {printer.connectionStatus === "connected" ? (
            <>
              <PosButton
                variant="outline"
                onClick={handleDisconnect}
                className="flex-1"
              >
                切断
              </PosButton>
              <PosButton
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                閉じる
              </PosButton>
            </>
          ) : (
            <>
              <PosButton
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                キャンセル
              </PosButton>
              <PosButton
                onClick={handleConnect}
                disabled={!ipAddress || isConnecting}
                className="flex-1"
              >
                {isConnecting ? "接続中..." : "接続"}
              </PosButton>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}