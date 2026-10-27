// Чисті функції пошуку, фільтрації та сортування — не залежать від інтерфейсу.

import type { Category, Product } from '../data/types';
import { normalize } from './format';
import { minPrice } from './product';

export type SortKey = 'popular' | 'new' | 'price_asc' | 'price_desc';

export const sortLabels: Record<SortKey, string> = {
  popular: 'За популярністю',
  new: 'Спочатку новинки',
  price_asc: 'Від дешевших',
  price_desc: 'Від дорожчих',
};

export interface Filters {
  priceMin?: number;
  priceMax?: number;
  brands: string[];
  /** id групи варіантів → обрані мітки значень */
  options: Record<string, string[]>;
  inStockOnly: boolean;
  saleOnly: boolean;
}

export const emptyFilters = (): Filters => ({
  brands: [],
  options: {},
  inStockOnly: false,
  saleOnly: false,
});

export function activeFilterCount(f: Filters) {
  return (
    (f.priceMin != null || f.priceMax != null ? 1 : 0) +
    f.brands.length +
    Object.values(f.options).reduce((n, a) => n + a.length, 0) +
    (f.inStockOnly ? 1 : 0) +
    (f.saleOnly ? 1 : 0)
  );
}

export function searchProducts(products: Product[], categories: Category[], query: string) {
  const q = normalize(query);
  if (!q) return products;
  const words = q.split(' ');
  return products.filter((p) => {
    const cat = categories.find((c) => c.id === p.categoryId);
    const subs = cat?.subcategories.filter((s) => p.subcategoryIds.includes(s.id)).map((s) => s.name) ?? [];
    const hay = normalize([p.name, p.brand, cat?.name ?? '', ...subs, p.shortDescription].join(' '));
    return words.every((w) => hay.includes(w));
  });
}

export function inSubcategory(p: Product, cat: Category, subId?: string) {
  if (!subId) return true;
  const sub = cat.subcategories.find((s) => s.id === subId);
  if (!sub) return true;
  return sub.byTag ? p.tags.includes(sub.byTag) : p.subcategoryIds.includes(sub.id);
}

export function applyFilters(products: Product[], f: Filters) {
  return products.filter((p) => {
    const price = minPrice(p).price;
    if (f.priceMin != null && price < f.priceMin) return false;
    if (f.priceMax != null && price > f.priceMax) return false;
    if (f.brands.length && !f.brands.includes(p.brand)) return false;
    if (f.inStockOnly && p.stock === 'out_of_stock') return false;
    if (f.saleOnly && !p.oldPrice && !p.options.some((g) => g.values.some((v) => v.oldPrice))) return false;
    for (const [gid, labels] of Object.entries(f.options)) {
      if (!labels.length) continue;
      const g = p.options.find((x) => x.id === gid);
      if (!g) return false;
      const ok = g.values.some((v) => labels.includes(v.label) && (!f.inStockOnly || v.available));
      if (!ok) return false;
    }
    return true;
  });
}

export function sortProducts(products: Product[], key: SortKey) {
  const arr = [...products];
  // Товари, яких немає, завжди в кінці списку.
  const oos = (p: Product) => (p.stock === 'out_of_stock' ? 1 : 0);
  arr.sort((a, b) => {
    const d = oos(a) - oos(b);
    if (d) return d;
    switch (key) {
      case 'price_asc':
        return minPrice(a).price - minPrice(b).price;
      case 'price_desc':
        return minPrice(b).price - minPrice(a).price;
      case 'new':
        return b.addedAt.localeCompare(a.addedAt);
      default:
        return b.popularity - a.popularity;
    }
  });
  return arr;
}

/** Набір значень для панелі фільтрів, зібраний із товарів. */
export function facetValues(products: Product[], groupIds: string[]) {
  const brands = [...new Set(products.map((p) => p.brand))].sort((a, b) => a.localeCompare(b, 'uk'));
  const groups: { id: string; label: string; values: { label: string; swatch?: string }[] }[] = [];
  for (const gid of groupIds) {
    const map = new Map<string, string | undefined>();
    let label = '';
    for (const p of products) {
      const g = p.options.find((x) => x.id === gid);
      if (!g) continue;
      label ||= g.label;
      for (const v of g.values) if (!map.has(v.label)) map.set(v.label, v.swatch);
    }
    if (map.size > 1)
      groups.push({
        id: gid,
        label: label || gid,
        values: [...map.entries()].map(([l, swatch]) => ({ label: l, swatch })).sort(sizeOrder),
      });
  }
  const prices = products.map((p) => minPrice(p).price);
  return {
    brands,
    groups,
    priceRange: prices.length ? [Math.min(...prices), Math.max(...prices)] : [0, 0],
  };
}

const APPAREL_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
function sizeOrder(a: { label: string }, b: { label: string }) {
  const ia = APPAREL_ORDER.indexOf(a.label);
  const ib = APPAREL_ORDER.indexOf(b.label);
  if (ia >= 0 && ib >= 0) return ia - ib;
  const na = parseFloat(a.label.replace(/[^\d.]/g, ''));
  const nb = parseFloat(b.label.replace(/[^\d.]/g, ''));
  if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
  return 0;
}
