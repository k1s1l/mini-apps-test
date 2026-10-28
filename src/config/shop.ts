// Налаштування магазину.
//
// Застосунок вміє показувати різні каталоги. Який саме — задає змінна
// VITE_CATALOG під час збірки (у Railway: Variables → VITE_CATALOG):
//   multi   — мультикаталог: кросівки, одяг, парфумерія, годинники, аксесуари (за замовчуванням)
//   perfume — парфумерія з Telegram-каналу (16 ароматів з фото)

export type CatalogId = 'multi' | 'perfume';

interface StoreProfile {
  subtitle: string;
  /** Демо-дані: на головній показується позначка «Демоверсія». */
  isDemo: boolean;
  hero: { eyebrow: string; title: string; text: string; image?: string };
  /** Посилання на відгуки. Порожньо — не показується. */
  reviewsUrl: string;
}

const profiles: Record<CatalogId, StoreProfile> = {
  multi: {
    subtitle: 'мультикаталог',
    isDemo: true,
    hero: {
      eyebrow: 'Осінь 2026',
      title: 'Нове надходження',
      text: 'Кросівки, одяг та аксесуари на сезон',
      image: 'hero',
    },
    reviewsUrl: '',
  },
  perfume: {
    subtitle: 'парфумерія',
    isDemo: false,
    hero: {
      eyebrow: 'Парфумерія',
      title: 'Аромати в наявності',
      text: 'Свіжі надходження з нашого каналу',
    },
    reviewsUrl: 'https://t.me/+hsdrgLqioEE1MjMy',
  },
};

const requested = import.meta.env.VITE_CATALOG as string | undefined;
export const activeCatalog: CatalogId = requested === 'perfume' ? 'perfume' : 'multi';
const profile = profiles[activeCatalog];

export const shopConfig = {
  name: 'КРАМ',
  subtitle: profile.subtitle,
  currency: '₴',
  isDemo: profile.isDemo,
  contacts: {
    phone: '' as string,
    /** Менеджер для замовлень у Telegram, наприклад '@username'. Порожньо — не показується. */
    telegram: '' as string,
    email: '' as string,
    hours: '' as string,
  },
  reviewsUrl: profile.reviewsUrl,
  hero: profile.hero,
  delivery: {
    /** Від якої суми доставка безкоштовна (для підказки в кошику). 0 — не показувати. */
    freeFrom: 0,
  },
};

/** Посилання на чат з менеджером. */
export const managerUrl = () => {
  const u = shopConfig.contacts.telegram.replace(/^@/, '');
  return u ? `https://t.me/${u}` : '';
};
