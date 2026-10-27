import type { Product, Selection } from '../data/types';

/** Чи доступна конкретна комбінація варіантів. */
export function isSelectionAvailable(p: Product, sel: Selection): boolean {
  if (p.stock === 'out_of_stock') return false;
  for (const g of p.options) {
    const v = g.values.find((x) => x.id === sel[g.id]);
    if (!v || !v.available) return false;
  }
  return !(p.soldOutCombos ?? []).some((combo) =>
    Object.entries(combo).every(([k, v]) => sel[k] === v),
  );
}

/** Чи можна обрати значення value групи groupId з урахуванням уже обраних інших варіантів. */
export function isValueSelectable(p: Product, groupId: string, valueId: string, sel: Selection) {
  if (p.stock === 'out_of_stock') return false;
  const group = p.options.find((g) => g.id === groupId);
  const value = group?.values.find((v) => v.id === valueId);
  if (!value?.available) return false;
  const next = { ...sel, [groupId]: valueId };
  return !(p.soldOutCombos ?? []).some((combo) =>
    Object.entries(combo).every(([k, v]) => next[k] === v),
  );
}

/** Ціна з урахуванням обраних варіантів (наприклад, об'єму). */
export function priceFor(p: Product, sel: Selection = {}) {
  let price = p.price;
  let oldPrice = p.oldPrice;
  for (const g of p.options) {
    const v = g.values.find((x) => x.id === sel[g.id]);
    if (v?.price != null) {
      price = v.price;
      oldPrice = v.oldPrice;
    }
  }
  return { price, oldPrice };
}

/** Найнижча ціна серед доступних варіантів — для картки «від …». */
export function minPrice(p: Product) {
  let min = p.price;
  let priced = false;
  for (const g of p.options)
    for (const v of g.values)
      if (v.price != null && v.available) {
        min = priced ? Math.min(min, v.price) : v.price;
        priced = true;
      }
  return { price: min, hasRange: priced && p.options.some((g) => g.values.filter((v) => v.price != null).length > 1) };
}

/** Початковий вибір: якщо в групі лише один доступний варіант — обираємо його; для об'єму — базовий. */
export function defaultSelection(p: Product): Selection {
  const sel: Selection = {};
  for (const g of p.options) {
    const avail = g.values.filter((v) => v.available);
    if (avail.length === 1) sel[g.id] = avail[0].id;
    else if (g.id === 'volume' || g.id === 'strap' || g.id === 'color') {
      const base = avail.find((v) => v.price == null || v.price === p.price) ?? avail[0];
      if (base) sel[g.id] = base.id;
    }
  }
  return sel;
}

export function missingGroups(p: Product, sel: Selection) {
  return p.options.filter((g) => !sel[g.id]);
}

export function selectionLabel(p: Product, sel: Selection) {
  return p.options
    .map((g) => {
      const v = g.values.find((x) => x.id === sel[g.id]);
      return v ? `${g.label}: ${v.label}` : null;
    })
    .filter(Boolean)
    .join(' · ');
}

export const stockLabel: Record<Product['stock'], string> = {
  in_stock: 'В наявності',
  low: 'Закінчується',
  out_of_stock: 'Немає в наявності',
};

export const needsChoice = (p: Product) =>
  p.options.some((g) => g.values.filter((v) => v.available).length > 1);
