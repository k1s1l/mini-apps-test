// РЕАЛЬНИЙ КАТАЛОГ — перенесено з постів Telegram-каналу (17–26.10.2026).
// Беремо лише те, що написано в постах. Чого в пості немає (фото, об'єм,
// стать тощо) — не вигадуємо: поле лишається порожнім.
// Ціни в постах без позначки валюти — вважаємо, що це гривні.

import type { Attribute, Product } from '../types';

const notes = (top?: string, heart?: string, base?: string): Attribute[] =>
  [
    top && { label: 'Початкові ноти', value: top },
    heart && { label: 'Ноти серця', value: heart },
    base && { label: 'Кінцеві ноти', value: base },
  ].filter(Boolean) as Attribute[];

type Draft = Omit<Product, 'categoryId' | 'options' | 'images' | 'popularity'> & { images?: string[] };

const perfume = (p: Draft): Product => ({
  categoryId: 'perfume',
  options: [],
  images: p.images ?? [],
  popularity: 0,
  ...p,
});

export const catalogProducts: Product[] = [
  perfume({
    id: 'armani-stronger-with-you-powerfully',
    images: ['armani-stronger-with-you-powerfully'],
    subcategoryIds: ['men'],
    brand: 'Armani',
    name: 'Armani Stronger With You Powerfully',
    shortDescription: 'Вишня, мандарин · спеції, лаванда · каштан, ваніль',
    description: 'Новинка 2026 року. Вони повертаються!',
    price: 999,
    attributes: [
      // З упаковки на фото: Eau de Parfum pour Homme, 100 ml
      { label: 'Тип', value: 'Парфумована вода (EDP), чоловіча' },
      { label: "Об'єм", value: '100 мл' },
      ...notes('Вишня, мандарин', 'Спеції, лаванда', 'Каштан, амбервуд, ваніль'),
    ],
    stock: 'in_stock',
    tags: ['new'],
    addedAt: '2026-10-17T12:34',
  }),
  perfume({
    id: 'tom-ford-ombre-leather',
    subcategoryIds: ['men'],
    brand: 'Tom Ford',
    name: 'Tom Ford Ombre Leather',
    shortDescription: 'Аромат справжнього чоловіка',
    description:
      'Поновили наявність. Аромат справжнього чоловіка, який не залишить вас без уваги оточуючих.',
    price: 1299,
    attributes: [],
    stock: 'in_stock',
    tags: [],
    addedAt: '2026-10-18T10:35',
  }),
  perfume({
    id: 'louis-vuitton-moon-tale',
    subcategoryIds: [],
    brand: 'Louis Vuitton',
    name: 'Louis Vuitton Moon Tale',
    shortDescription: 'Фруктово-квітковий аромат з ефектом люксової парфумерії',
    description:
      'Парфум, на який довго чекали. Аромат доглянутої шкіри, дорогої косметики й свіжого квіткового букета. ' +
      'Вишуканий, ніжний і водночас помітний аромат для тих, хто любить фруктово-квіткові композиції з ефектом люксової парфумерії.\n\n' +
      'Малина розкриває композицію разом з щедрим букетом найпрекрасніших квітів Китаю. У базовій ноті мускуси створюють ефірну завісу з косметичними акцентами. ' +
      'Парфуми, що нагадують останній жест перед тим, як вийти у світло серед бурхливої енергії ночі.',
    price: 2099,
    attributes: [],
    stock: 'in_stock',
    tags: [],
    addedAt: '2026-10-19T13:04',
  }),
  perfume({
    id: 'hormone-paris-this-is-not-caffeine',
    subcategoryIds: [],
    brand: 'Hormone Paris',
    name: 'Hormone Paris This is not Caffeine',
    shortDescription: 'Карамель, кориця · чорна кава, імбир · ваніль, шкіра',
    description: '',
    price: 1499,
    attributes: notes(
      'Карамель, кориця, шавлія, кокос, м’ята',
      'Боби тонка, імбир, чорна кава, нагармота (циперіол), жасмин',
      'Ваніль, бензоїн, сіра амбра, шкіра, кедр',
    ),
    stock: 'in_stock',
    tags: [],
    addedAt: '2026-10-20T09:18',
  }),
  perfume({
    id: 'tom-ford-vanilla-sex',
    subcategoryIds: ['unisex', 'sweet'],
    brand: 'Tom Ford',
    name: 'Tom Ford Vanilla Sex',
    shortDescription: 'Ваніль, гіркий мигдаль, сандал',
    description:
      'Аромат спокуси з характером. Ваніль, якій важко опиратися. Густа, вершкова, з легкою гірчинкою мигдалю та чуттєвим теплом шкіри. ' +
      'Vanilla Sex — це аромат близької дистанції, м’яких дотиків і солодкої спокуси, яка не потребує зайвих слів. ' +
      'Вишуканий, провокативний і надзвичайно привабливий.',
    price: 999,
    attributes: [
      { label: 'Стать', value: 'Унісекс' },
      ...notes('Гіркий мигдаль', 'Ванільна настоянка, білі квіти, жасмин', 'Абсолют ванілі, сандал, боби тонка, пудрові ноти'),
    ],
    stock: 'in_stock',
    tags: [],
    addedAt: '2026-10-20T15:32',
  }),
  perfume({
    id: 'kayali-elixir-11',
    subcategoryIds: ['women'],
    brand: 'Kayali',
    name: 'Kayali Elixir | 11',
    shortDescription: 'Червоне яблуко, троянда · жасмин · пачулі, ваніль',
    description: '',
    price: 899,
    attributes: [
      { label: 'Стать', value: 'Жіночий' },
      ...notes('Червоне яблуко, пелюстки троянди', 'Травнева троянда, жасмин самбак', 'Пачулі, амбра, ваніль'),
    ],
    stock: 'in_stock',
    tags: [],
    addedAt: '2026-10-21T13:19',
  }),
  perfume({
    id: 'ysl-y',
    subcategoryIds: ['men', 'fresh'],
    brand: 'Yves Saint Laurent',
    name: 'Yves Saint Laurent Y',
    shortDescription: 'Бергамот, яблуко, імбир · шавлія · боби тонка, кедр',
    description:
      'Друзі, цей аромат чекали всі, а зараз він по такій низькій ціні. Встигніть собі його взяти!\n\n' +
      'Початок вибухає прохолодною свіжістю бергамоту, яблука та імбиру — ніби перший ковток енергії зранку. ' +
      'Потім розкривається насичене серце з шавлії та герані — аромат сили, впевненості й харизми. ' +
      'У базі — амбра, боби тонка та деревина, які створюють глибокий, чоловічний шлейф із відтінком елегантності.',
    price: 1199,
    attributes: [
      { label: 'Тип аромату', value: 'Ароматичні, фужерні' },
      ...notes(
        'Імбир, бергамот, яблуко',
        'Герань, шавлія, ягоди ялівцю',
        'Боби тонка, білий кедр, ветівер, деревинний бурштин, олібанум',
      ),
    ],
    stock: 'in_stock',
    tags: [],
    addedAt: '2026-10-22T19:17',
  }),
  perfume({
    id: 'creed-aventus-absolu',
    subcategoryIds: ['men', 'woody'],
    brand: 'Creed',
    name: 'Creed Aventus Absolu',
    shortDescription: 'Бергамот, смородина · кардамон · ветивер, пачулі',
    description: '',
    price: 1749,
    attributes: [
      { label: 'Стать', value: 'Для чоловіків' },
      { label: 'Класифікація', value: 'Нішева' },
      { label: 'Тип аромату', value: 'Деревинні, цитрусові' },
      ...notes(
        'Бергамот, грейпфрут, чорна смородина',
        'Імбир, кардамон, кориця, цитронела',
        'Ветівер, пачулі, рожевий перець',
      ),
    ],
    stock: 'in_stock',
    tags: [],
    addedAt: '2026-10-22T22:33',
  }),
  perfume({
    id: 'versace-eros',
    subcategoryIds: ['men', 'fresh'],
    brand: 'Versace',
    name: 'Versace Eros',
    shortDescription: 'М’ята, лимон, зелене яблуко · боби тонка · ваніль, кедр',
    description: 'Аромат для впевнених у собі чоловіків, які хочуть пахнути свіжо та мужньо кожного дня.',
    price: 1249,
    attributes: notes(
      'М’ята, італійський лимон, зелене яблуко',
      'Боби тонка, герань, амброксан',
      'Ваніль, ветивер, кедр, дубовий мох',
    ),
    stock: 'in_stock',
    tags: [],
    addedAt: '2026-10-23T12:19',
  }),
  perfume({
    id: 'tom-ford-black-lacquer',
    subcategoryIds: ['men', 'woody'],
    brand: 'Tom Ford',
    name: 'Tom Ford Black Lacquer',
    shortDescription: 'Ром, чорний перець · абрикос, ебенове дерево · олібанум',
    description:
      'Ідеальний аромат на холодну пору, запах справжнього чоловіка, з яким ви отримаєте купу компліментів.',
    price: 1149,
    attributes: [
      { label: 'Тип аромату', value: 'Деревні, східні' },
      ...notes('Вініл, ром, чорний перець, чорнило', 'Абрикос, ебенове дерево, елемі, півонія', 'Олібанум'),
    ],
    stock: 'in_stock',
    tags: [],
    addedAt: '2026-10-23T17:12',
  }),
  perfume({
    id: 'tom-ford-fucking-fabulous',
    subcategoryIds: [],
    brand: 'Tom Ford',
    name: 'Tom Ford Fucking Fabulous',
    shortDescription: 'Лаванда · ваніль, ірис, мигдаль · шкіра, кашмеран',
    description: 'Аромат, від якого пахне грошима та впевненістю.',
    price: 999,
    attributes: [
      { label: 'Тип аромату', value: 'Шкіряні' },
      ...notes(
        'Лаванда, мускатна шавлія',
        'Ваніль, ірис, мигдаль, шкіра',
        // У пості «амура» — залишено як є, уточнити у власника каналу.
        'Амура, боби тонка, деревина світлих порід, кашмеран, шкіра',
      ),
    ],
    stock: 'in_stock',
    tags: [],
    addedAt: '2026-10-24T13:44',
  }),
  perfume({
    id: 'jpg-le-male-elixir',
    subcategoryIds: ['sweet'],
    brand: 'Jean Paul Gaultier',
    name: 'Jean Paul Gaultier Le Male Elixir',
    shortDescription: 'Медово-ванільна солодкість, 100 мл',
    description:
      'Знову в наявності. Дуже солодкий, густий і спокусливий аромат, який буквально огортає теплом. ' +
      'Le Male Elixir — про медово-ванільну солодкість. Аромат яскравий, сексуальний і особливо добре розкривається ввечері та в прохолодну погоду.',
    price: 1299,
    attributes: [
      { label: "Об'єм", value: '100 мл' },
      { label: 'Позначка', value: 'LUX, у тубусі' },
    ],
    stock: 'in_stock',
    tags: [],
    addedAt: '2026-10-24T14:41',
  }),
  perfume({
    id: 'jpg-ultra-male',
    images: ['jpg-ultra-male'],
    subcategoryIds: ['men'],
    brand: 'Jean Paul Gaultier',
    name: 'Jean Paul Gaultier Ultra Male',
    shortDescription: 'Груша, лаванда · кориця · чорна ваніль, амбра',
    description: 'Знову в наявності. Кількість обмежена.',
    price: 1299,
    attributes: [
      { label: 'Стать', value: 'Для чоловіків' },
      ...notes(
        'Груша, лаванда, м’ята, бергамот, лимон',
        'Кориця, кмин, шавлія',
        'Чорна ваніль, амбра, пачулі, кедр',
      ),
    ],
    stock: 'low',
    tags: [],
    addedAt: '2026-10-24T21:29',
  }),
  perfume({
    id: 'lacoste-l1212-noir-intense',
    images: ['lacoste-l1212-noir-intense'],
    subcategoryIds: ['men', 'woody'],
    brand: 'Lacoste',
    name: 'Lacoste Eau De L.12.12. Noir Intense',
    shortDescription: 'Кавун · базилік, лаванда · темний шоколад, 100 мл',
    description: 'Ідеальний аромат на кожен день.',
    price: 949,
    attributes: [
      { label: "Об'єм", value: '100 мл' },
      { label: 'Країна-виробник', value: 'Франція' },
      { label: 'Стать', value: 'Чоловіча' },
      { label: 'Тип аромату', value: 'Фужерні, деревні' },
      ...notes('Кавун', 'Базилік, лаванда, вербена', 'Темний шоколад, кашмеран, кумарин, пачулі'),
    ],
    stock: 'in_stock',
    tags: [],
    addedAt: '2026-10-25T17:49',
  }),
  perfume({
    id: 'eros-flame',
    images: ['eros-flame'],
    subcategoryIds: [],
    // Бренд та об'єм — з упаковки на фото (Versace Eros Flame, EDP, 100 ml).
    brand: 'Versace',
    name: 'Versace Eros Flame',
    shortDescription: 'Парфумована вода, 100 мл',
    description: 'Знову в наявності.',
    price: 1199,
    attributes: [
      { label: 'Тип', value: 'Парфумована вода (EDP)' },
      { label: "Об'єм", value: '100 мл' },
    ],
    stock: 'in_stock',
    tags: [],
    addedAt: '2026-10-26T11:37',
  }),
  perfume({
    id: 'dior-sauvage-edp',
    images: ['dior-sauvage-edp'],
    subcategoryIds: [],
    brand: 'Dior',
    name: 'Dior Sauvage EDP',
    shortDescription: 'Бергамот, перець · лаванда, ветивер · амброксан, кедр',
    description: '',
    price: 1649,
    attributes: [
      { label: 'Позначка', value: 'LUX' },
      ...notes(
        'Бергамот, перець',
        'Сичуанський перець, лаванда, рожевий перець, ветивер, пачулі, герань, елемі',
        'Амброксан, кедр, лабданум',
      ),
    ],
    stock: 'in_stock',
    tags: [],
    addedAt: '2026-10-26T18:05',
  }),
];
