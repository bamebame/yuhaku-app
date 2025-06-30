"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Package, Barcode, Hash, Palette, Ruler, Globe, Info } from "lucide-react";
import { PosDialog, PosDialogContent, PosDialogHeader, PosDialogTitle } from "@/components/pos";
import { PosButton } from "@/components/pos";
import { PosTabs, PosTabsList, PosTabsTrigger, PosTabsContent } from "@/components/pos";
import { PosBadge } from "@/components/pos";
import type { Product } from "@/features/products/types";
import type { ItemStock } from "@/features/items/types";
import { useSasCaseEditStore } from "@/features/sas_cases/stores/edit-store";
import { formatCurrency } from "@/lib/utils";

interface ProductDetailDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart?: (product: Product, stock: ItemStock) => void;
}

export function ProductDetailDialog({
  product,
  open,
  onOpenChange,
  onAddToCart,
}: ProductDetailDialogProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("basic");
  const productStocks = useSasCaseEditStore((state) => state.productStocks);
  
  if (!product) return null;
  
  const stocks = productStocks.get(product.id) || [];
  const totalStock = stocks.reduce((sum, stock) => sum + stock.quantity, 0);
  const hasStock = totalStock > 0;

  return (
    <PosDialog open={open} onOpenChange={onOpenChange}>
      <PosDialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <PosDialogHeader className="flex flex-row items-center justify-between border-b-3 border-pos-border pb-4">
          <PosDialogTitle className="text-xl font-bold">商品詳細</PosDialogTitle>
          <PosButton
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </PosButton>
        </PosDialogHeader>
        
        <div className="grid grid-cols-2 gap-6 overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {/* 左側：画像エリア */}
          <div className="space-y-4">
            {/* メイン画像 */}
            <div className="relative aspect-square border-3 border-pos-border bg-pos-light overflow-hidden">
              {product.imageUrls.length > 0 ? (
                <Image
                  src={product.imageUrls[selectedImageIndex] || "/placeholder.png"}
                  alt={product.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-24 w-24 text-pos-muted" />
                </div>
              )}
            </div>
            
            {/* サムネイル画像 */}
            {product.imageUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.imageUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-20 border-3 flex-shrink-0 ${
                      selectedImageIndex === index
                        ? "border-pos-accent"
                        : "border-pos-border hover:border-pos-muted"
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* 右側：商品情報エリア */}
          <div className="space-y-4">
            {/* 商品名・コード */}
            <div>
              <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
              <div className="flex items-center gap-4 text-sm text-pos-muted">
                <span className="flex items-center gap-1">
                  <Barcode className="h-4 w-4" />
                  {product.code}
                </span>
                {product.aliasCode && (
                  <span className="flex items-center gap-1">
                    <Hash className="h-4 w-4" />
                    {product.aliasCode}
                  </span>
                )}
              </div>
            </div>
            
            {/* 在庫状況 */}
            <div className="flex items-center gap-2">
              <PosBadge variant={hasStock ? "default" : "secondary"}>
                {hasStock ? `在庫あり (${totalStock}点)` : "在庫なし"}
              </PosBadge>
              <PosBadge variant="outline">
                {product.status === "ACTIVE" ? "販売中" : "販売停止"}
              </PosBadge>
            </div>
            
            {/* タブ */}
            <PosTabs value={activeTab} onValueChange={setActiveTab}>
              <PosTabsList className="grid w-full grid-cols-3">
                <PosTabsTrigger value="basic">基本情報</PosTabsTrigger>
                <PosTabsTrigger value="stock">在庫情報</PosTabsTrigger>
                <PosTabsTrigger value="attributes">属性情報</PosTabsTrigger>
              </PosTabsList>
              
              {/* 基本情報タブ */}
              <PosTabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">カテゴリ</h3>
                  <p className="text-pos-muted">{product.categoryPath || product.categoryName || "未設定"}</p>
                </div>
                
                {product.attribute?.custom_description && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">商品説明</h3>
                    <p className="text-sm leading-relaxed">{product.attribute.custom_description}</p>
                  </div>
                )}
                
                {product.attribute?.custom_series && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">シリーズ</h3>
                    <p>{product.attribute.custom_series}</p>
                  </div>
                )}
              </PosTabsContent>
              
              {/* 在庫情報タブ */}
              <PosTabsContent value="stock" className="space-y-4 mt-4">
                {stocks.length > 0 ? (
                  <div className="space-y-3">
                    {stocks.map((stock, index) => (
                      <div
                        key={index}
                        className="border-2 border-pos-border p-4 space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">
                            ロケーション: {stock.locationName || `ID: ${stock.locationId}`}
                          </span>
                          <PosBadge variant="outline">{stock.quantity}点</PosBadge>
                        </div>
                        <div className="text-lg font-bold">
                          {formatCurrency(stock.price)}
                        </div>
                        {onAddToCart && stock.quantity > 0 && (
                          <PosButton
                            size="sm"
                            className="w-full"
                            onClick={() => onAddToCart(product, stock)}
                          >
                            カートに追加
                          </PosButton>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-pos-muted py-8">在庫情報がありません</p>
                )}
              </PosTabsContent>
              
              {/* 属性情報タブ */}
              <PosTabsContent value="attributes" className="space-y-4 mt-4">
                <div className="space-y-3">
                  {product.attribute?.color && (
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-pos-muted" />
                      <span className="font-semibold">色:</span>
                      <span>{product.attribute.color}</span>
                    </div>
                  )}
                  
                  {product.attribute?.custom_size && (
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-pos-muted" />
                      <span className="font-semibold">サイズ:</span>
                      <span>{product.attribute.custom_size}</span>
                    </div>
                  )}
                  
                  {product.attribute?.custom_material && (
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-pos-muted" />
                      <span className="font-semibold">素材:</span>
                      <span>{product.attribute.custom_material}</span>
                    </div>
                  )}
                  
                  {product.attribute?.custom_country && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-pos-muted" />
                      <span className="font-semibold">原産国:</span>
                      <span>{product.attribute.custom_country}</span>
                    </div>
                  )}
                  
                  {/* その他の属性 */}
                  {Object.entries(product.attribute || {}).map(([key, value]) => {
                    // 既に表示した属性はスキップ
                    if (
                      !value ||
                      ["color", "custom_size", "custom_material", "custom_country", "custom_description", "custom_series"].includes(key)
                    ) {
                      return null;
                    }
                    
                    // HTMLコンテンツはスキップ
                    if (key.includes("html")) {
                      return null;
                    }
                    
                    // キー名を人間が読みやすい形式に変換
                    const displayKey = key
                      .replace(/^custom_/, "")
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase());
                    
                    return (
                      <div key={key} className="flex gap-2">
                        <span className="font-semibold">{displayKey}:</span>
                        <span className="break-all">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </PosTabsContent>
            </PosTabs>
          </div>
        </div>
      </PosDialogContent>
    </PosDialog>
  );
}