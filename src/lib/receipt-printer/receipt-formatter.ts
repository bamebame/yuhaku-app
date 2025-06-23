import type { ReceiptData, ReceiptCartItem, PaymentInfo } from './types';

/**
 * レシートフォーマッター
 * 80mm幅のレシート用紙に最適化されたフォーマット
 */
export class ReceiptFormatter {
  private readonly PAPER_WIDTH = 80; // 80mm固定
  private readonly CHARS_PER_LINE = 48; // 80mm幅での1行あたりの文字数
  private readonly LINE_SEPARATOR = '─'.repeat(48);
  private readonly DOUBLE_LINE_SEPARATOR = '═'.repeat(48);

  /**
   * レシートをフォーマットしてプリンターに送信
   */
  formatReceipt(receiptData: ReceiptData, printer: any): void {
    // プリンターの初期化
    printer.addTextAlign(printer.ALIGN_CENTER);
    printer.addTextLang(printer.LANG_JA);
    printer.addTextSmooth(true);

    // ヘッダー
    this.addHeader(receiptData.store, printer);

    // 取引情報
    this.addTransactionInfo(receiptData.transaction, printer);

    // 商品明細
    this.addItemDetails(receiptData.items, printer);

    // サマリー
    this.addSummary(receiptData.summary, printer);

    // 支払い情報
    this.addPaymentInfo(receiptData.payments, receiptData.deposit, receiptData.change, printer);

    // 会員情報
    if (receiptData.memberId || receiptData.points) {
      this.addMemberInfo(receiptData, printer);
    }

    // フッター
    this.addFooter(receiptData.footerMessage, printer);
  }

  /**
   * ヘッダー部分
   */
  private addHeader(store: any, printer: any): void {
    printer.addTextAlign(printer.ALIGN_CENTER);
    
    // 区切り線
    printer.addText(this.DOUBLE_LINE_SEPARATOR + '\n');
    
    // 店舗名（大きめの文字）
    printer.addTextSize(2, 2);
    printer.addText(store.name + '\n');
    
    // 住所・電話番号（通常サイズ）
    printer.addTextSize(1, 1);
    printer.addText(store.address + '\n');
    printer.addText('TEL: ' + store.phone + '\n');
    
    // 区切り線
    printer.addText(this.DOUBLE_LINE_SEPARATOR + '\n');
  }

  /**
   * 取引情報
   */
  private addTransactionInfo(transaction: any, printer: any): void {
    printer.addTextAlign(printer.ALIGN_LEFT);
    
    const dateStr = this.formatDate(transaction.date);
    const receiptNo = `#${transaction.id.slice(-4).padStart(4, '0')}`;
    
    // 日時とレシート番号を同じ行に
    const dateReceiptLine = this.formatLine(dateStr, receiptNo);
    printer.addText(dateReceiptLine + '\n');
    
    // レジ番号とスタッフ名
    const registerInfo = `レジ: 01  スタッフ: ${transaction.staffName}`;
    printer.addText(registerInfo + '\n\n');
  }

  /**
   * 商品明細
   */
  private addItemDetails(items: ReceiptCartItem[], printer: any): void {
    printer.addTextAlign(printer.ALIGN_LEFT);
    
    // ヘッダー行
    printer.addText('商品名                          数量      金額\n');
    printer.addText(this.LINE_SEPARATOR + '\n');
    
    // 商品明細
    items.forEach(item => {
      // 商品名行
      const itemLine = this.formatItemLine(
        item.name,
        item.quantity.toString(),
        `¥${item.total.toLocaleString()}`
      );
      printer.addText(itemLine + '\n');
      
      // 単価と調整額（必要な場合）
      if (item.unitAdjustment !== 0) {
        const unitPrice = `  @¥${item.unitPrice.toLocaleString()}`;
        const adjustment = item.unitAdjustment > 0 
          ? ` (+¥${item.unitAdjustment.toLocaleString()})` 
          : ` (¥${item.unitAdjustment.toLocaleString()})`;
        printer.addText(unitPrice + adjustment + '\n');
      } else if (item.quantity > 1) {
        // 複数個の場合は単価を表示
        printer.addText(`  @¥${item.unitPrice.toLocaleString()}\n`);
      }
    });
    
    printer.addText(this.LINE_SEPARATOR + '\n');
  }

  /**
   * サマリー情報
   */
  private addSummary(summary: any, printer: any): void {
    printer.addTextAlign(printer.ALIGN_LEFT);
    
    // 小計
    const subtotalLine = this.formatLine('小計', `¥${summary.subtotal.toLocaleString()}`);
    printer.addText(subtotalLine + '\n');
    
    // ケース調整（0円でない場合）
    if (summary.caseAdjustment !== 0) {
      const adjustmentLine = this.formatLine(
        'ケース調整',
        `¥${summary.caseAdjustment.toLocaleString()}`
      );
      printer.addText(adjustmentLine + '\n');
    }
    
    // クーポン割引（0円でない場合）
    if (summary.couponDiscount !== 0) {
      const couponLine = this.formatLine(
        'クーポン割引',
        `¥${summary.couponDiscount.toLocaleString()}`
      );
      printer.addText(couponLine + '\n');
    }
    
    printer.addText(this.LINE_SEPARATOR + '\n');
    
    // 合計（強調表示）
    printer.addTextStyle(false, false, true, printer.COLOR_1);
    const totalLine = this.formatLine('合計（税込）', `¥${summary.total.toLocaleString()}`);
    printer.addText(totalLine + '\n');
    printer.addTextStyle(false, false, false, printer.COLOR_1);
    
    // 内消費税
    const taxInfo = `  （内消費税 ${summary.taxRate}%`;
    const taxAmount = `¥${summary.tax.toLocaleString()}）`;
    const taxLine = this.formatLine(taxInfo, taxAmount);
    printer.addText(taxLine + '\n\n');
  }

  /**
   * 支払い情報
   */
  private addPaymentInfo(payments: PaymentInfo[], deposit: number, change: number, printer: any): void {
    printer.addTextAlign(printer.ALIGN_LEFT);
    
    // 支払い方法ごとの金額
    payments.forEach(payment => {
      const paymentLine = this.formatLine(
        `お預り（${payment.methodName}）`,
        `¥${payment.amount.toLocaleString()}`
      );
      printer.addText(paymentLine + '\n');
    });
    
    // お釣り（現金支払いがある場合）
    if (change > 0) {
      const changeLine = this.formatLine('お釣り', `¥${change.toLocaleString()}`);
      printer.addText(changeLine + '\n');
    }
    
    printer.addText('\n');
  }

  /**
   * 会員情報
   */
  private addMemberInfo(receiptData: ReceiptData, printer: any): void {
    printer.addTextAlign(printer.ALIGN_LEFT);
    
    if (receiptData.memberId) {
      printer.addText(`会員ID: ${receiptData.memberId}\n`);
    }
    
    if (receiptData.points && receiptData.points > 0) {
      printer.addText(`ポイント: ${receiptData.points}pt 付与\n`);
    }
    
    printer.addText('\n');
  }

  /**
   * フッター
   */
  private addFooter(footerMessage: string | undefined, printer: any): void {
    printer.addTextAlign(printer.ALIGN_CENTER);
    
    // 区切り線
    printer.addText(this.DOUBLE_LINE_SEPARATOR + '\n');
    
    // フッターメッセージ
    const defaultMessage = [
      'ご来店ありがとうございました',
      'またのお越しをお待ちしております'
    ];
    
    if (footerMessage) {
      printer.addText(footerMessage + '\n');
    } else {
      defaultMessage.forEach(msg => {
        printer.addText(msg + '\n');
      });
    }
    
    // 区切り線
    printer.addText(this.DOUBLE_LINE_SEPARATOR + '\n');
    
    // 改行を追加
    printer.addFeedLine(3);
  }

  /**
   * 日付フォーマット
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hour = d.getHours().toString().padStart(2, '0');
    const minute = d.getMinutes().toString().padStart(2, '0');
    
    return `${year}/${month}/${day} ${hour}:${minute}`;
  }

  /**
   * 行フォーマット（左寄せと右寄せ）
   */
  private formatLine(left: string, right: string): string {
    const totalLength = this.CHARS_PER_LINE;
    const leftLength = this.getStringLength(left);
    const rightLength = this.getStringLength(right);
    const spaceLength = totalLength - leftLength - rightLength;
    
    if (spaceLength < 1) {
      // スペースが足りない場合は左側を切り詰める
      const maxLeftLength = totalLength - rightLength - 2;
      left = this.truncateString(left, maxLeftLength);
      return left + '  ' + right;
    }
    
    return left + ' '.repeat(spaceLength) + right;
  }

  /**
   * 商品明細行のフォーマット
   */
  private formatItemLine(name: string, quantity: string, price: string): string {
    const nameWidth = 30;
    const quantityWidth = 5;
    const priceWidth = 12;
    
    // 商品名を必要に応じて切り詰める
    const formattedName = this.padOrTruncate(name, nameWidth);
    const formattedQuantity = this.padLeft(quantity, quantityWidth);
    const formattedPrice = this.padLeft(price, priceWidth);
    
    return formattedName + formattedQuantity + formattedPrice;
  }

  /**
   * 文字列の表示幅を取得（全角文字を考慮）
   */
  private getStringLength(str: string): number {
    let length = 0;
    for (const char of str) {
      // 全角文字は2文字分としてカウント
      length += this.isFullWidth(char) ? 2 : 1;
    }
    return length;
  }

  /**
   * 全角文字判定
   */
  private isFullWidth(char: string): boolean {
    const code = char.charCodeAt(0);
    return (
      (code >= 0x3000 && code <= 0x303f) || // CJK記号と句読点
      (code >= 0x3040 && code <= 0x309f) || // ひらがな
      (code >= 0x30a0 && code <= 0x30ff) || // カタカナ
      (code >= 0x4e00 && code <= 0x9faf) || // CJK統合漢字
      (code >= 0xff00 && code <= 0xffef)    // 半角・全角形
    );
  }

  /**
   * 文字列を指定幅で切り詰める
   */
  private truncateString(str: string, maxLength: number): string {
    let length = 0;
    let result = '';
    
    for (const char of str) {
      const charLength = this.isFullWidth(char) ? 2 : 1;
      if (length + charLength > maxLength) break;
      length += charLength;
      result += char;
    }
    
    return result;
  }

  /**
   * 文字列を指定幅にパディングまたは切り詰め
   */
  private padOrTruncate(str: string, width: number): string {
    const currentLength = this.getStringLength(str);
    
    if (currentLength > width) {
      return this.truncateString(str, width);
    } else if (currentLength < width) {
      return str + ' '.repeat(width - currentLength);
    }
    
    return str;
  }

  /**
   * 右寄せパディング
   */
  private padLeft(str: string, width: number): string {
    const currentLength = this.getStringLength(str);
    
    if (currentLength >= width) {
      return str;
    }
    
    return ' '.repeat(width - currentLength) + str;
  }
}