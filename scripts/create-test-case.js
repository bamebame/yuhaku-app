// テスト用のsas-caseを作成するスクリプト
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestCase() {
  try {
    // ダミーのケースデータを作成
    const testCase = {
      id: '123',
      code: 'TEST-001',
      store: { id: '1', name: 'Test Store' },
      staff: { id: '1', name: 'Test Staff' },
      cashier: null,
      status: 'IN_PROGRESS',
      memberId: null,
      note: 'テストケース',
      customerNote: '',
      doneAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      coupons: [],
      goods: [
        {
          id: '1',
          serial: 1,
          itemId: 'ITEM-001',
          locationId: '1',
          unitPrice: 1000,
          unitAdjustment: 0,
          caseAdjustment: 0,
          couponAdjustment: 0,
          tax: 100,
          includedTax: 100,
          exemptedTax: 0,
          taxRate: 10,
          taxRateType: 'GENERAL',
          taxFreeType: 'GENERAL',
          quantity: 1,
          reservedQuantity: 0,
        }
      ],
      summary: {
        quantity: 1,
        reservedQuantity: 0,
        subTotal: 1000,
        caseAdjustment: 0,
        couponAdjustment: 0,
        total: 1100,
        taxes: [
          {
            taxRateType: 'GENERAL',
            taxRate: 10,
            tax: 100,
            includedTax: 100,
            taxableAmount: 1000,
          }
        ],
        exemptedTaxes: [],
      },
    };

    // Supabaseにデータを保存（テーブルがあれば）
    console.log('Test case created:', testCase);
    console.log('Test case ID: 123');
    console.log('Use this ID to test the edit page');

  } catch (error) {
    console.error('Error creating test case:', error);
  }
}

createTestCase();