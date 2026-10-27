// Налаштування магазину. Контакти поки не задані — інтерфейс показує,
// що їх буде додано. Заповніть поля, коли дані будуть погоджені.

export const shopConfig = {
  name: 'КРАМ',
  subtitle: 'Мультикаталог',
  currency: '₴',
  contacts: {
    phone: '' as string,
    telegram: '' as string,
    email: '' as string,
    hours: '' as string,
  },
  delivery: {
    /** Від якої суми доставка безкоштовна (для підказки в кошику). 0 — не показувати. */
    freeFrom: 0,
  },
};
