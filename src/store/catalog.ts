import { create } from 'zustand';
import type { Catalog, Category, Product } from '../data/types';
import { loadCatalog } from '../services/catalogService';

interface CatalogState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  catalog?: Catalog;
  error?: string;
  load(): Promise<void>;
}

export const useCatalog = create<CatalogState>((set, get) => ({
  status: 'idle',
  async load() {
    if (get().status === 'loading') return;
    set({ status: 'loading', error: undefined });
    try {
      const catalog = await loadCatalog();
      set({ status: 'ready', catalog });
    } catch (e) {
      set({ status: 'error', error: e instanceof Error ? e.message : 'Невідома помилка' });
    }
  },
}));

export const useProducts = (): Product[] => useCatalog((s) => s.catalog?.products ?? EMPTY_P);
export const useCategories = (): Category[] => useCatalog((s) => s.catalog?.categories ?? EMPTY_C);
export const useProduct = (id: string) =>
  useCatalog((s) => s.catalog?.products.find((p) => p.id === id));

const EMPTY_P: Product[] = [];
const EMPTY_C: Category[] = [];
