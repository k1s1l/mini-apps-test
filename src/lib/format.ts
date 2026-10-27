const nf = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 });

export const formatPrice = (n: number) => `${nf.format(n)} ₴`;

/** Українські форми множини: 1 товар, 2 товари, 5 товарів. */
export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

export const itemsLabel = (n: number) => `${n} ${plural(n, 'товар', 'товари', 'товарів')}`;

export const discountPercent = (price: number, oldPrice?: number) =>
  oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;

/** Нормалізація для пошуку: регістр, різні апострофи, ё/ґ тощо. */
export function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[’ʼ`'"]/g, '')
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .trim();
}
