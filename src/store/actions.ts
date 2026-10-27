// Дії, що поєднують кілька сховищ: додавання в кошик з перевіркою, обране, швидкий вибір варіанта.

import { create } from 'zustand';
import type { Product, Selection } from '../data/types';
import { defaultSelection, isSelectionAvailable, missingGroups, needsChoice } from '../lib/product';
import { telegram } from '../services/telegram';
import { useNav } from './nav';
import { useShop } from './shop';
import { toast } from './toast';

export function addProductToCart(product: Product, selection: Selection, qty = 1): boolean {
  if (product.stock === 'out_of_stock') {
    toast('Цього товару зараз немає в наявності', { tone: 'error' });
    telegram.haptic('error');
    return false;
  }
  const missing = missingGroups(product, selection);
  if (missing.length) {
    toast(`Оберіть: ${missing.map((g) => g.label.toLowerCase()).join(', ')}`, { tone: 'error' });
    telegram.haptic('error');
    return false;
  }
  if (!isSelectionAvailable(product, selection)) {
    toast('Такого варіанта немає в наявності', { tone: 'error' });
    telegram.haptic('error');
    return false;
  }
  useShop.getState().addToCart(product.id, selection, qty);
  telegram.haptic('success');
  toast('Додано в кошик', {
    action: { label: 'До кошика', run: () => useNav.getState().switchTab('cart') },
  });
  return true;
}

/** Кнопка «у кошик» на картці: якщо треба обрати варіант — відкриваємо швидкий вибір. */
export function quickAdd(product: Product) {
  if (product.stock === 'out_of_stock') {
    toast('Цього товару зараз немає в наявності', { tone: 'error' });
    return;
  }
  if (needsChoice(product)) useQuickAdd.getState().open(product.id);
  else addProductToCart(product, defaultSelection(product));
}

export function toggleFavorite(product: Product) {
  const added = useShop.getState().toggleFavorite(product.id);
  telegram.haptic('light');
  toast(added ? 'Додано в обране' : 'Прибрано з обраного', added
    ? { action: { label: 'Переглянути', run: () => useNav.getState().switchTab('favorites') } }
    : undefined);
}

interface QuickAddState {
  productId?: string;
  open(id: string): void;
  close(): void;
}

export const useQuickAdd = create<QuickAddState>((set) => ({
  open: (productId) => set({ productId }),
  close: () => set({ productId: undefined }),
}));
