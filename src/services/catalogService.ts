// Джерело каталогу. Зараз — локальний файл з товарами з Telegram-каналу.
// Щоб підключити сервер, замініть тіло loadCatalog на запит до API
// (наприклад, fetch(`${API_URL}/catalog`)), який повертає об'єкт типу Catalog.

import type { Catalog, Category, Product } from '../data/types';
import { demoCategories } from '../data/demo/categories';
import { catalogProducts } from '../data/catalog/products';

// Структура категорій спільна; фото категорій беруться з товарів.
const baseCategories: Category[] = demoCategories.map((c) => ({ ...c, image: '' }));

/** Прибирає категорії й підкатегорії, у яких немає жодного товару. */
export function visibleCategories(categories: Category[], products: Product[]): Category[] {
  return categories
    .map((c) => {
      const own = products.filter((p) => p.categoryId === c.id);
      if (!own.length) return null;
      return {
        ...c,
        image: c.image || own.find((p) => p.images[0])?.images[0] || '',
        subcategories: c.subcategories.filter((s) =>
          own.some((p) => (s.byTag ? p.tags.includes(s.byTag) : p.subcategoryIds.includes(s.id))),
        ),
      };
    })
    .filter((c): c is Category => c !== null);
}

export async function loadCatalog(): Promise<Catalog> {
  const products = catalogProducts;
  return { categories: visibleCategories(baseCategories, products), products, isDemo: false };
}
