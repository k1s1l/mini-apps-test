import type { Product } from '../data/types';
import type { CartItem } from '../store/shop';
import { isSelectionAvailable, priceFor, selectionLabel } from './product';

export interface CartLine {
  item: CartItem;
  product?: Product;
  unitPrice: number;
  unitOldPrice?: number;
  lineTotal: number;
  available: boolean;
  label: string;
}

/** Ціни завжди беремо з каталогу, а не з того, що збережено в кошику. */
export function resolveCart(cart: CartItem[], products: Product[]) {
  const lines: CartLine[] = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return { item, unitPrice: 0, lineTotal: 0, available: false, label: '' };
    const { price, oldPrice } = priceFor(product, item.selection);
    return {
      item,
      product,
      unitPrice: price,
      unitOldPrice: oldPrice,
      lineTotal: price * item.qty,
      available: isSelectionAvailable(product, item.selection),
      label: selectionLabel(product, item.selection),
    };
  });
  const ok = lines.filter((l) => l.available);
  const total = ok.reduce((s, l) => s + l.lineTotal, 0);
  const full = ok.reduce((s, l) => s + (l.unitOldPrice && l.unitOldPrice > l.unitPrice ? l.unitOldPrice : l.unitPrice) * l.item.qty, 0);
  const count = ok.reduce((s, l) => s + l.item.qty, 0);
  return { lines, total, savings: full - total, subtotal: full, count, hasUnavailable: lines.some((l) => !l.available) };
}
