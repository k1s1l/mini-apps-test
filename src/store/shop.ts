// Кошик, обране та чернетка форми. Зберігаються на пристрої користувача.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Selection } from '../data/types';
import type { DeliveryMethod } from '../services/orderService';
import { safeStorage } from './storage';

export interface CartItem {
  key: string;
  productId: string;
  selection: Selection;
  qty: number;
}

export interface CheckoutDraft {
  fullName: string;
  phone: string;
  city: string;
  method: DeliveryMethod;
  point: string;
  comment: string;
}

export const MAX_QTY = 10;

const cartKey = (productId: string, sel: Selection) =>
  productId +
  '|' +
  Object.keys(sel)
    .sort()
    .map((k) => `${k}=${sel[k]}`)
    .join('&');

interface ShopState {
  cart: CartItem[];
  favorites: string[];
  recentSearches: string[];
  draft: CheckoutDraft;
  addToCart(productId: string, selection: Selection, qty?: number): void;
  setQty(key: string, qty: number): void;
  removeFromCart(key: string): void;
  changeSelection(key: string, selection: Selection): void;
  clearCart(): void;
  toggleFavorite(id: string): boolean;
  addRecentSearch(q: string): void;
  clearRecentSearches(): void;
  updateDraft(patch: Partial<CheckoutDraft>): void;
}

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      favorites: [],
      recentSearches: [],
      draft: { fullName: '', phone: '', city: '', method: 'np_branch', point: '', comment: '' },

      addToCart(productId, selection, qty = 1) {
        const key = cartKey(productId, selection);
        set((s) => {
          const existing = s.cart.find((i) => i.key === key);
          if (existing)
            return {
              cart: s.cart.map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i)),
            };
          return { cart: [...s.cart, { key, productId, selection, qty: Math.min(MAX_QTY, qty) }] };
        });
      },
      setQty(key, qty) {
        if (qty <= 0) return get().removeFromCart(key);
        set((s) => ({ cart: s.cart.map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, qty) } : i)) }));
      },
      removeFromCart(key) {
        set((s) => ({ cart: s.cart.filter((i) => i.key !== key) }));
      },
      changeSelection(key, selection) {
        set((s) => {
          const item = s.cart.find((i) => i.key === key);
          if (!item) return s;
          const newKey = cartKey(item.productId, selection);
          if (newKey === key) return s;
          const twin = s.cart.find((i) => i.key === newKey);
          if (twin)
            // Такий варіант уже є в кошику — об'єднуємо позиції.
            return {
              cart: s.cart
                .filter((i) => i.key !== key)
                .map((i) => (i.key === newKey ? { ...i, qty: Math.min(MAX_QTY, i.qty + item.qty) } : i)),
            };
          return { cart: s.cart.map((i) => (i.key === key ? { ...i, key: newKey, selection } : i)) };
        });
      },
      clearCart() {
        set({ cart: [] });
      },
      toggleFavorite(id) {
        const has = get().favorites.includes(id);
        set((s) => ({ favorites: has ? s.favorites.filter((f) => f !== id) : [id, ...s.favorites] }));
        return !has;
      },
      addRecentSearch(q) {
        const t = q.trim();
        if (t.length < 2) return;
        set((s) => ({
          recentSearches: [t, ...s.recentSearches.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 6),
        }));
      },
      clearRecentSearches() {
        set({ recentSearches: [] });
      },
      updateDraft(patch) {
        set((s) => ({ draft: { ...s.draft, ...patch } }));
      },
    }),
    {
      name: 'kram-shop-v1',
      storage: createJSONStorage(() => safeStorage),
      version: 1,
    },
  ),
);
