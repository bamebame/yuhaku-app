import { create } from "zustand";
import type { SasCase, Goods, GoodsInput, GoodsUpdateInput } from "@/features/sas_cases/types";
import type { Product } from "@/features/products/types";
import type { Category } from "@/features/categories/types";
import type { Item, ItemStock } from "@/features/items/types";
import { updateSasCaseFormAction } from "@/features/sas_cases/actions";
import { mutate } from "swr";
import { fetchMissingProductsForCase } from "@/features/sas_cases/helpers/fetch-missing-products";

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
	lastSaved: Date | null;
	saveTimeoutId: NodeJS.Timeout | null;

	// 初期化
	initialize: (caseId: string, sasCase: SasCase) => void;
	reset: () => void;
	updateOriginalCase: (sasCase: SasCase) => void;

	// カテゴリ・商品管理
	setCategories: (categories: Category[]) => void;
	setProducts: (products: Product[]) => void;
	setProductStocks: (productId: string, stocks: ItemStock[]) => void;
	setSelectedCategory: (categoryId: string | null) => void;
	
	// 商品情報解決
	getProductById: (productId: string) => Product | undefined;
	resolveProductsForGoods: (goods: Goods[]) => Promise<void>;

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
	
	// 自動保存
	triggerAutoSave: () => void;
	cancelAutoSave: () => void;
	
	// 状態チェック
	isDirty: () => boolean;
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
	lastSaved: null,
	saveTimeoutId: null,

	// 初期化
	initialize: (caseId, sasCase) => {
		const state = get();
		
		// 既存のcartItemsから商品情報を保持するためのマップを作成
		const existingProductMap = new Map<string, Product>();
		state.cartItems.forEach(item => {
			if (item.product) {
				existingProductMap.set(item.itemId, item.product);
			}
		});
		
		// 既存のgoodsをカートアイテムに変換（一時的な商品情報で）
		const cartItems: CartItem[] = sasCase.goods.map((goods) => {
			// 既存の商品情報があれば使用、なければ基本情報で作成
			const existingProduct = existingProductMap.get(goods.itemId);
			const product = existingProduct || {
				id: goods.itemId.toString(),
				title: goods.productName || `商品 ${goods.itemId}`,
				code: goods.productCode || goods.itemId,
				aliasCode: null,
				status: "ACTIVE" as const,
				attribute: {},
				imageUrls: [],
				categoryId: "",
				createdAt: new Date(),
				updatedAt: new Date(),
			} as Product;
			
			return {
				id: goods.id.toString(),
				productId: goods.itemId.toString(), // 一時的にitemIdを使用
				product,
				itemId: goods.itemId,
				quantity: goods.quantity,
				unitPrice: goods.unitPrice,
				locationId: Number(goods.locationId),
				unitAdjustment: goods.unitAdjustment,
				originalGoodsId: goods.id.toString(),
			};
		});

		set({
			caseId,
			originalCase: sasCase,
			cartItems,
			memberId: sasCase.memberId,
			note: sasCase.note || null,
			customerNote: sasCase.customerNote || null,
			error: null,
		});
		
		// 非同期で商品情報を解決
		get().resolveProductsForGoods(sasCase.goods);
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

	updateOriginalCase: (sasCase) => {
		set({ originalCase: sasCase });
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
	
	// 商品情報解決
	getProductById: (productId) => {
		const { products } = get();
		return products.find(p => p.id === productId);
	},
	
	resolveProductsForGoods: async (goods) => {
		const state = get();
		
		// goodsからitemIdを収集
		const itemIds = goods.map(g => g.itemId);
		if (itemIds.length === 0) return;
		
		try {
			// 在庫情報を一括取得
			const response = await fetch(`/api/items?ids=${itemIds.join(',')}`);
			if (!response.ok) {
				throw new Error('Failed to fetch items');
			}
			
			const { data: items } = await response.json() as { data: Item[] };
			
			// itemId -> Item のマップを作成
			const itemMap = new Map<string, Item>();
			items.forEach(item => {
				itemMap.set(item.id, item);
			});
			
			// 既存のcartItemsを更新
			const updatedCartItems = state.cartItems.map(cartItem => {
				const item = itemMap.get(cartItem.itemId);
				if (item) {
					// キャッシュから商品情報を取得
					const product = state.getProductById(item.productId);
					if (product) {
						return {
							...cartItem,
							productId: item.productId,
							product,
						};
					}
				}
				return cartItem;
			});
			
			set({ cartItems: updatedCartItems });
		} catch (error) {
			console.error('Failed to resolve products for goods:', error);
			set({ error: '商品情報の取得に失敗しました' });
		}
	},

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

		if (!defaultStock || !defaultStock.itemId) {
			set({ error: "在庫情報が見つかりません" });
			return;
		}

		// 新規カートアイテム作成
		const newItem: CartItem = {
			id: `new-${Date.now()}-${Math.random()}`,
			productId: product.id.toString(),
			product,
			itemId: defaultStock.itemId, // 在庫情報のitemIdを使用
			quantity,
			unitPrice: defaultStock.price,
			locationId: defaultStock.location.id,
			unitAdjustment: 0,
			action: "CREATE",
		};

		set({ cartItems: [...cartItems, newItem], error: null });
		console.log("[AutoSave] addToCart calling triggerAutoSave");
		get().triggerAutoSave();
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
		get().triggerAutoSave();
	},

	removeFromCart: (itemId) => {
		const { cartItems } = get();
		const item = cartItems.find((i) => i.id === itemId);

		if (item?.originalGoodsId) {
			// 既存のgoodsの場合はDELETEフラグを立てる
			const updatedItems = cartItems.map((i) =>
				i.id === itemId ? { ...i, action: "DELETE" as const } : i,
			);
			set({ cartItems: updatedItems });
		} else {
			// 新規の場合は削除
			set({ cartItems: cartItems.filter((i) => i.id !== itemId) });
		}
		get().triggerAutoSave();
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
		get().triggerAutoSave();
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
			get().triggerAutoSave();
		}
	},

	// 顧客情報更新
	updateMemberId: (memberId) => {
		set({ memberId });
		get().triggerAutoSave();
	},
	updateNote: (note) => {
		set({ note });
		get().triggerAutoSave();
	},
	updateCustomerNote: (customerNote) => {
		set({ customerNote });
		get().triggerAutoSave();
	},

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
					quantity: item.quantity,
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
	
	// 自動保存
	triggerAutoSave: () => {
		const state = get();
		console.log("[AutoSave] triggerAutoSave called, caseId:", state.caseId);
		
		// 既存のタイマーをクリア
		if (state.saveTimeoutId) {
			clearTimeout(state.saveTimeoutId);
		}
		
		// 2秒後に保存を実行
		const timeoutId = setTimeout(async () => {
			const { caseId, getUpdateData, setSaving } = get();
			console.log("[AutoSave] Timer fired, caseId:", caseId);
			if (!caseId) {
				console.warn("[AutoSave] No caseId, skipping auto-save");
				return;
			}
			
			setSaving(true);
			try {
				const updateData = getUpdateData();
				const formData = new FormData();
				
				// goodsを個別にFormDataに追加
				updateData.goods.forEach((item, index) => {
					formData.append(`goods[${index}][action]`, item.action);
					if (item.id) formData.append(`goods[${index}][id]`, item.id);
					if (item.itemId) formData.append(`goods[${index}][itemId]`, item.itemId);
					if (item.locationId) formData.append(`goods[${index}][locationId]`, item.locationId);
					formData.append(`goods[${index}][quantity]`, item.quantity.toString());
					formData.append(`goods[${index}][unitPrice]`, (item.unitPrice || 0).toString());
					formData.append(`goods[${index}][unitAdjustment]`, (item.unitAdjustment || 0).toString());
				});
				
				// その他のフィールドも追加
				if (updateData.memberId !== undefined) {
					formData.append("memberId", updateData.memberId || "");
				}
				if (updateData.note !== undefined) {
					formData.append("note", updateData.note || "");
				}
				if (updateData.customerNote !== undefined) {
					formData.append("customerNote", updateData.customerNote || "");
				}
				if (updateData.caseAdjustment !== undefined) {
					formData.append("caseAdjustment", updateData.caseAdjustment.toString());
				}
				
				const result = await updateSasCaseFormAction(caseId, null, formData);
				console.log("[AutoSave] Update result:", result);
				
				if (result.data) {
					// 商品情報が不足している場合は補完
					const updatedCase = await fetchMissingProductsForCase(result.data);
					
					// SWRキャッシュを更新
					await mutate(`/api/sas-cases/${caseId}`, async () => {
						return { data: updatedCase };
					}, false);
					
					// 保存成功後、カートアイテムのaction属性をクリア
					const currentState = get();
					const cleanedCartItems = currentState.cartItems
						.filter(item => item.action !== "DELETE") // 削除済みアイテムを除去
						.map(item => {
							const { action, ...cleanItem } = item; // action属性を除去
							return cleanItem as CartItem;
						});
					
					// ストアのoriginalCaseも更新し、顧客情報も同期
					set({ 
						originalCase: updatedCase,
						cartItems: cleanedCartItems,
						memberId: updatedCase.memberId,
						note: updatedCase.note,
						customerNote: updatedCase.customerNote,
						lastSaved: new Date(), 
						saveTimeoutId: null 
					});
					console.log("[AutoSave] Auto-save completed successfully");
				} else {
					throw new Error("更新に失敗しました");
				}
			} catch (error) {
				console.error("Auto save error:", error);
				set({ error: "自動保存に失敗しました" });
			} finally {
				setSaving(false);
			}
		}, 2000); // 2秒のdebounce
		
		set({ saveTimeoutId: timeoutId });
	},
	
	cancelAutoSave: () => {
		const { saveTimeoutId } = get();
		if (saveTimeoutId) {
			clearTimeout(saveTimeoutId);
			set({ saveTimeoutId: null });
		}
	},
	
	// dirty状態をチェック
	isDirty: () => {
		const { originalCase, cartItems, memberId, note, customerNote } = get();
		if (!originalCase) return false;
		
		// カートに実際の変更があるかチェック
		// action属性がないアイテムは既存のもので変更なしとして扱う
		const hasCartChanges = cartItems.some(item => 
			item.action === "CREATE" || item.action === "UPDATE" || item.action === "DELETE"
		);
		
		// 顧客情報に変更があるかチェック（null と空文字列、undefinedを同一視）
		const normalizeValue = (value: string | null | undefined) => value || "";
		const memberIdChanged = normalizeValue(originalCase.memberId) !== normalizeValue(memberId);
		const noteChanged = normalizeValue(originalCase.note) !== normalizeValue(note);
		const customerNoteChanged = normalizeValue(originalCase.customerNote) !== normalizeValue(customerNote);
		
		const isDirtyResult = hasCartChanges || memberIdChanged || noteChanged || customerNoteChanged;
		
		console.log("[isDirty] Debug:", {
			isDirtyResult,
			hasCartChanges,
			memberIdChanged,
			noteChanged,
			customerNoteChanged,
			cartItemsWithActions: cartItems.filter(item => item.action).map(item => ({ id: item.id, action: item.action })),
			originalMemberId: originalCase.memberId,
			currentMemberId: memberId,
			originalNote: originalCase.note,
			currentNote: note,
			originalCustomerNote: originalCase.customerNote,
			currentCustomerNote: customerNote,
		});
		
		return isDirtyResult;
	},
}));
