// Модель даних каталогу. Справжній каталог має відповідати цим типам —
// тоді інтерфейс не потребує змін (див. README, розділ «Заміна каталогу»).

export type CategoryId = 'sneakers' | 'clothing' | 'perfume' | 'watches' | 'accessories';

export type ProductTag = 'new' | 'popular' | 'recommended' | 'sale';

export interface Subcategory {
  id: string;
  name: string;
  /** Якщо задано, підкатегорія формується автоматично за тегом товару. */
  byTag?: ProductTag;
}

export interface Category {
  id: CategoryId;
  name: string;
  /** Коротка підказка під назвою категорії. */
  tagline: string;
  image: string;
  subcategories: Subcategory[];
  /** Які групи варіантів показувати у фільтрах цієї категорії. */
  filterOptions: string[];
}

export interface OptionValue {
  id: string;
  label: string;
  available: boolean;
  /** Колір для кружечка-зразка (для групи «Колір»). */
  swatch?: string;
  /** Ціна саме для цього варіанта (наприклад, для об'єму парфуму). */
  price?: number;
  oldPrice?: number;
  /** Індекс фото в галереї, яке показати при виборі (для кольорів). */
  imageIndex?: number;
}

export interface OptionGroup {
  /** Стабільний ідентифікатор: size, color, volume, strap тощо. */
  id: string;
  label: string;
  values: OptionValue[];
}

export interface Attribute {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  categoryId: CategoryId;
  subcategoryIds: string[];
  brand: string;
  name: string;
  shortDescription: string;
  description: string;
  /** Базова ціна в гривнях (якщо варіант не задає власну). */
  price: number;
  oldPrice?: number;
  /** Ключі локальних зображень або повні URL. */
  images: string[];
  attributes: Attribute[];
  options: OptionGroup[];
  /** Комбінації варіантів, яких немає (наприклад, синій + 44). */
  soldOutCombos?: Record<string, string>[];
  /** Загальна наявність товару. */
  stock: 'in_stock' | 'low' | 'out_of_stock';
  tags: ProductTag[];
  /** Для сортування «За популярністю». */
  popularity: number;
  /** Дата появи в каталозі (ISO) — для сортування «Новинки». */
  addedAt: string;
  /** Позначка для демо-даних: фото є студійним рендером, а не фотографією. */
  imageIsRender?: boolean;
}

export type Selection = Record<string, string>;

export interface Catalog {
  categories: Category[];
  products: Product[];
  /** true — демонстраційні дані, у інтерфейсі показується відповідна позначка. */
  isDemo: boolean;
}
