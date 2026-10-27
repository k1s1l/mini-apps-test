// Налаштування магазину. Контакти взято з постів каналу; інші поля
// лишаються порожніми, доки їх не погоджено — тоді інтерфейс їх не показує.

export const shopConfig = {
  name: 'КРАМ',
  subtitle: 'Мультикаталог',
  currency: '₴',
  contacts: {
    phone: '' as string,
    /** Менеджер для замовлень у Telegram, наприклад '@username'. Порожньо — не показується. */
    telegram: '' as string,
    email: '' as string,
    hours: '' as string,
  },
  /** Посилання на канал з відгуками (з постів каналу). */
  reviewsUrl: 'https://t.me/+hsdrgLqioEE1MjMy' as string,
  hero: {
    eyebrow: 'Парфумерія',
    title: 'Аромати в наявності',
    text: 'Свіжі надходження з нашого каналу',
  },
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
