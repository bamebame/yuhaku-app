import { create } from "zustand";
import type { SasCase, Goods, GoodsInput, GoodsUpdateInput } from "@/features/sas_cases/types";
import type { Product } from "@/features/products/types";
import type { Category } from "@/features/categories/types";
import type { ItemStock } from "@/features/items/types";

export interface CartItem {
	id: string; // 一時ID
	productId: string;
	product: Product;
	itemId: string; // ReCORE APIのitemId
	quantity: number;
	unitPrice: number;
	locationId: number;
	unitAdjustment: number;
	action?: "CREATE" | "UPDATE" | "DELETE";
	originalGoodsId?: string; // 既存goods更新時のID
}

interface SasCaseEditStore {
	// 基本情報
	caseId: string | null;
	originalCase: SasCase | null;

	// カート状態
	cartItems: CartItem[];

	// 顧客情報
	memberId: string | null;
	note: string | null;
	customerNote: string | null;

	// 商品データ（キャッシュ）
	categories: Category[];
	products: Product[];
	productStocks: Map<string, ItemStock[]>; // productId -> stocks

	// UI状態
	selectedCategoryId: string | null;
	isLoading: boolean;
	isSaving: boolean;
	error: string | null;

	// 初期化
	initialize: (caseId: string, sasCase: SasCase) => void;
	reset: () => void;

	// カテゴリ・商品管理
	setCategories: (categories: Category[]) => void;
	setProducts: (products: Product[]) => void;
	setProductStocks: (productId: string, stocks: ItemStock[]) => void;
	setSelectedCategory: (categoryId: string | null) => void;

	// カート操作
	addToCart: (product: Product, quantity?: number) => void;
	updateQuantity: (itemId: string, quantity: number) => void;
	removeFromCart: (itemId: string) => void;
	clearCart: () => void;
	updateUnitAdjustment: (itemId: string, adjustment: number) => void;
	updateCaseAdjustment: (adjustment: number) => void;

	// 顧客情報更新
	updateMemberId: (memberId: string | null) => void;
	updateNote: (note: string) => void;
	updateCustomerNote: (customerNote: string) => void;

	// 保存・完了
	setSaving: (isSaving: boolean) => void;
	setError: (error: string | null) => void;
	
	// 保存用データ取得
	getUpdateData: () => {
		goods: GoodsUpdateInput[];
		memberId?: string | null;
		note?: string | null;
		customerNote?: string | null;
		caseAdjustment?: number;
		couponIds?: string[];
	};
}

export const useSasCaseEditStore = create<SasCaseEditStore>((set, get) => ({
	// 初期状態
	caseId: null,
	originalCase: null,
	cartItems: [],
	memberId: null,
	note: null,
	customerNote: null,
	categories: [],
	products: [],
	productStocks: new Map(),
	selectedCategoryId: null,
	isLoading: false,
	isSaving: false,
	error: null,

	// 初期化
	initialize: (caseId, sasCase) => {
		// 既存のgoodsをカートアイテムに変換
		const cartItems: CartItem[] = sasCase.goods.map((goods) => ({
			id: goods.id.toString(),
			productId: goods.itemId.toString(), // TODO: itemIdからproductIdへの変換が必要
			product: {} as Product, // TODO: 商品情報の取得が必要
			itemId: goods.itemId,
			quantity: goods.quantity,
			unitPrice: goods.unitPrice,
			locationId: Number(goods.locationId),
			unitAdjustment: goods.unitAdjustment,
			originalGoodsId: goods.id.toString(),
		}));

		set({
			caseId,
			originalCase: sasCase,
			cartItems,
			memberId: sasCase.memberId,
			note: sasCase.note || null,
			customerNote: sasCase.customerNote || null,
			error: null,
		});
	},

	reset: () => {
		set({
			caseId: null,
			originalCase: null,
			cartItems: [],
			memberId: null,
			note: null,
			customerNote: null,
			categories: [],
			products: [],
			productStocks: new Map(),
			selectedCategoryId: null,
			isLoading: false,
			isSaving: false,
			error: null,
		});
	},

	// カテゴリ・商品管理
	setCategories: (categories) => set({ categories }),
	setProducts: (products) => set({ products }),
	setProductStocks: (productId, stocks) => {
		const newStocks = new Map(get().productStocks);
		newStocks.set(productId, stocks);
		set({ productStocks: newStocks });
	},
	setSelectedCategory: (categoryId) => set({ selectedCategoryId: categoryId }),

	// カート操作
	addToCart: (product, quantity = 1) => {
		const { cartItems, productStocks } = get();

		// 既存のカートアイテムを確認
		const existingItem = cartItems.find(
			(item) => item.productId === product.id.toString(),
		);

		if (existingItem) {
			// 既存の場合は数量を増やす
			get().updateQuantity(existingItem.id, existingItem.quantity + quantity);
			return;
		}

		// 在庫情報から価格とロケーションを取得
		const stocks = productStocks.get(product.id.toString()) || [];
		const defaultStock = stocks.find((s) => s.status === "ACTIVE") || stocks[0];

		if (!defaultStock) {
			set({ error: "在庫情報が見つかりません" });
			return;
		}

		// 新規カートアイテム作成
		const newItem: CartItem = {
			id: `new-${Date.now()}-${Math.random()}`,
			productId: product.id.toString(),
			product,
			itemId: defaultStock.itemId || product.id.toString(), // itemIdが無い場合はproductIdを使用
			quantity,
			unitPrice: defaultStock.price,
			locationId: defaultStock.location.id,
			unitAdjustment: 0,
			action: "CREATE",
		};

		set({ cartItems: [...cartItems, newItem], error: null });
	},

	updateQuantity: (itemId, quantity) => {
		if (quantity <= 0) {
			get().removeFromCart(itemId);
			return;
		}

		const { cartItems } = get();
		const updatedItems = cartItems.map((item) =>
			item.id === itemId
				? {
						...item,
						quantity,
						action: item.originalGoodsId ? "UPDATE" : item.action,
					}
				: item,
		);

		set({ cartItems: updatedItems });
	},

	removeFromCart: (itemId) => {
		const { cartItems } = get();
		const item = cartItems.find((i) => i.id === itemId);

		if (item?.originalGoodsId) {
			// 既存のgoodsの場合はDELETEフラグを立てる
			const updatedItems = cartItems.map((i) =>
				i.id === itemId ? { ...i, action: "DELETE" as const, quantity: 0 } : i,
			);
			set({ cartItems: updatedItems });
		} else {
			// 新規の場合は削除
			set({ cartItems: cartItems.filter((i) => i.id !== itemId) });
		}
	},

	clearCart: () => {
		set({ cartItems: [] });
	},

	updateUnitAdjustment: (itemId, adjustment) => {
		const { cartItems } = get();
		const updatedItems = cartItems.map((item) => {
			if (item.id === itemId) {
				// 既存アイテムの場合はaction更新
				const action = item.originalGoodsId ? "UPDATE" as const : "CREATE" as const;
				return { ...item, unitAdjustment: adjustment, action };
			}
			return item;
		});
		set({ cartItems: updatedItems });
	},

	updateCaseAdjustment: (adjustment) => {
		const { originalCase } = get();
		if (originalCase) {
			set({
				originalCase: {
					...originalCase,
					summary: {
						...originalCase.summary,
						caseAdjustment: adjustment,
					},
				},
			});
		}
	},

	// 顧客情報更新
	updateMemberId: (memberId) => set({ memberId }),
	updateNote: (note) => set({ note }),
	updateCustomerNote: (customerNote) => set({ customerNote }),

	// 保存・完了
	setSaving: (isSaving) => set({ isSaving }),
	setError: (error) => set({ error }),
	
	// 保存用データ取得
	getUpdateData: () => {
		const { cartItems, originalCase, memberId, note, customerNote } = get();
		const goods: GoodsUpdateInput[] = [];
		
		// カートアイテムをGoodsUpdateInputに変換
		cartItems.forEach((item) => {
			if (item.action === "DELETE" && item.originalGoodsId) {
				// 削除
				goods.push({
					action: "DELETE",
					id: item.originalGoodsId,
					itemId: item.itemId,
					locationId: item.locationId.toString(),
					quantity: 0,
				});
			} else if (item.action === "UPDATE" && item.originalGoodsId) {
				// 更新
				goods.push({
					action: "UPDATE",
					id: item.originalGoodsId,
					itemId: item.itemId,
					locationId: item.locationId.toString(),
					quantity: item.quantity,
					unitPrice: item.unitPrice,
					unitAdjustment: item.unitAdjustment,
				});
			} else if (item.action === "CREATE") {
				// 新規作成
				goods.push({
					action: "CREATE",
					itemId: item.itemId,
					locationId: item.locationId.toString(),
					quantity: item.quantity,
					unitPrice: item.unitPrice,
					unitAdjustment: item.unitAdjustment,
				});
			}
		});
		
		return {
			goods,
			memberId,
			note,
			customerNote,
			caseAdjustment: originalCase?.summary?.caseAdjustment,
			couponIds: originalCase?.coupons?.map(c => c.couponId),
		};
	},
}));
