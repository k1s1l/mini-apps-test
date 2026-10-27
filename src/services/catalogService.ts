// Джерело каталогу. Зараз — локальні демо-дані.
// Щоб підключити сервер, замініть тіло loadCatalog на запит до API
// (наприклад, fetch(`${API_URL}/catalog`)), який повертає об'єкт типу Catalog.

import type { Catalog } from '../data/types';
import { demoCategories } from '../data/demo/categories';
import { demoProducts } from '../data/demo/products';

export async function loadCatalog(): Promise<Catalog> {
  // Невелика затримка, щоб у демо було видно стан завантаження.
  await new Promise((r) => setTimeout(r, 450));
  return { categories: demoCategories, products: demoProducts, isDemo: true };
}
