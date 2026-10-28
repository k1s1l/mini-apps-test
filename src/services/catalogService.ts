// Джерело каталогу. Зараз — локальні файли; який каталог показувати,
// визначає VITE_CATALOG (див. src/config/shop.ts).
// Щоб підключити сервер, замініть тіло loadCatalog на запит до API
// (наприклад, fetch(`${API_URL}/catalog`)), який повертає об'єкт типу Catalog.

import type { Catalog, Category, Product } from '../data/types';
import { demoCategories } from '../data/demo/categories';
import { demoProducts } from '../data/demo/products';
import { catalogProducts } from '../data/catalog/products';
import { activeCatalog, shopConfig } from '../config/shop';

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

const sources: Record<typeof activeCatalog, { categories: Category[]; products: Product[] }> = {
  multi: { categories: demoCategories, products: demoProducts },
  // Структура категорій спільна; фото категорій беруться з товарів.
  perfume: { categories: demoCategories.map((c) => ({ ...c, image: '' })), products: catalogProducts },
};

export async function loadCatalog(): Promise<Catalog> {
  const { categories, products } = sources[activeCatalog];
  return { categories: visibleCategories(categories, products), products, isDemo: shopConfig.isDemo };
}
