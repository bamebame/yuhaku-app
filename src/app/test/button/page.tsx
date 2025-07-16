"use client";

import { PosButton } from "@/components/pos";

export default function TestButtonPage() {
  return (
    <div className="min-h-screen bg-pos-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">ボタンスタイルテスト</h1>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">通常状態</h2>
          <div className="flex gap-4">
            <PosButton>決済へ進む（有効）</PosButton>
            <PosButton variant="secondary">キャンセル（有効）</PosButton>
            <PosButton variant="outline">編集（有効）</PosButton>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">無効状態（disabled）</h2>
          <div className="flex gap-4">
            <PosButton disabled>決済へ進む（無効）</PosButton>
            <PosButton variant="secondary" disabled>キャンセル（無効）</PosButton>
            <PosButton variant="outline" disabled>編集（無効）</PosButton>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">サイズバリエーション（無効状態）</h2>
          <div className="flex gap-4 items-center">
            <PosButton size="sm" disabled>小（無効）</PosButton>
            <PosButton size="default" disabled>標準（無効）</PosButton>
            <PosButton size="lg" disabled>大（無効）</PosButton>
            <PosButton size="xl" disabled>特大（無効）</PosButton>
          </div>
        </div>

        <div className="bg-pos-light p-6 rounded border-2 border-pos-border">
          <h3 className="text-lg font-semibold mb-4">カート画面の決済ボタン例</h3>
          <div className="space-y-4">
            <p className="text-sm text-pos-muted">カートが空の場合：</p>
            <PosButton className="w-full h-14 text-pos-lg font-bold" disabled>
              決済へ進む
            </PosButton>
            
            <p className="text-sm text-pos-muted mt-6">カートに商品がある場合：</p>
            <PosButton className="w-full h-14 text-pos-lg font-bold">
              決済へ進む
            </PosButton>
          </div>
        </div>
      </div>
    </div>
  );
}