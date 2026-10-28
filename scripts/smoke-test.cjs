// Наскрізна перевірка основних сценаріїв у мобільному вікні.
// Мультикаталог (VITE_CATALOG=multi). Запуск: npm run build && PORT=4173 node server.mjs &  node scripts/smoke-test.cjs [теку-для-скріншотів]
const { chromium } = require('playwright');

const URL = process.env.APP_URL || 'http://localhost:4173/';
const OUT = process.argv[2] || 'smoke-shots';
const fs = require('fs');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, ok, extra = '') => {
  results.push({ name, ok });
  console.log(`${ok ? '✔' : '✘'} ${name}${extra ? ' — ' + extra : ''}`);
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.text()) && errors.push(m.text()));
  page.on('requestfailed', (r) => !/fonts\.(googleapis|gstatic)/.test(r.url()) && errors.push('requestfailed ' + r.url()));

  const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` });
  const nav = (label) => page.locator('.bottom-nav .bn-item', { hasText: label }).click();

  await page.goto(URL);
  await page.waitForSelector('.hero');
  await page.waitForTimeout(600);
  check('Головна відкривається', await page.locator('text=Популярні товари').isVisible());
  const broken = await page.evaluate(() =>
    [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src.slice(0, 60)),
  );
  check('Усі фото на головній завантажились', broken.length === 0, broken.join(', '));
  await shot('01-home');
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(300);
  await shot('02-home-scrolled');

  // Обране з картки
  const firstFav = page.locator('.rail .fav-btn').first();
  await firstFav.click();
  check('Іконка обраного оновлюється', (await firstFav.getAttribute('aria-pressed')) === 'true');

  // Каталог → категорія
  await nav('Каталог');
  await page.waitForSelector('.catalog-cat');
  await shot('03-catalog');
  await page.locator('.catalog-cat-head', { hasText: 'Кросівки' }).click();
  await page.waitForSelector('.grid .card');
  const totalSneakers = await page.locator('.grid .card').count();
  await shot('04-category');

  // Фільтри
  await page.locator('.tool-btn', { hasText: 'Фільтри' }).click();
  await page.waitForSelector('.sheet');
  await page.locator('.sheet .chip', { hasText: /^Adidas$/ }).click();
  await shot('05-filters');
  await page.locator('.sheet-foot .btn-primary').click();
  const adidasCount = await page.locator('.grid .card').count();
  const brands = await page.locator('.grid .card-brand').allTextContents();
  check('Фільтр за брендом', adidasCount > 0 && adidasCount < totalSneakers && brands.every((b) => /adidas/i.test(b)), `${adidasCount} з ${totalSneakers}`);

  // Сортування за ціною
  await page.locator('.tool-btn', { hasText: 'популярністю' }).click();
  await page.locator('.sort-item', { hasText: 'Від дешевших' }).click();
  const prices = (await page.locator('.grid .price-now').allTextContents()).map((t) => parseInt(t.replace(/\D/g, ''), 10));
  check('Сортування за зростанням ціни', prices.every((p, i) => i === 0 || p >= prices[i - 1]), prices.join(' '));

  // Порожній результат фільтрів
  await page.locator('.tool-btn', { hasText: 'Фільтри' }).click();
  await page.fill('#f-price-max', '100');
  await page.locator('.sheet-foot .btn-primary').click({ force: true }).catch(() => {});
  if (await page.locator('.sheet').isVisible()) await page.locator('.sheet .icon-btn[aria-label="Закрити"]').click();
  // Кнопка «Немає товарів» неактивна — застосовуємо через ціну 1500 і бренд Converse
  await page.locator('.tool-btn', { hasText: 'Фільтри' }).click();
  await page.fill('#f-price-max', '');
  await page.locator('.sheet .chip', { hasText: /^Converse$/ }).click();
  await page.locator('.sheet .chip', { hasText: 'від 5 000' }).click();
  const btnText = await page.locator('.sheet-foot .btn-primary').textContent();
  check('Лічильник у фільтрах показує 0', /Немає товарів/.test(btnText), btnText);
  await page.locator('.sheet .icon-btn[aria-label="Закрити"]').click();

  // Товар
  await page.locator('.active-filters .link-btn', { hasText: 'Скинути все' }).click();
  await page.locator('.grid .card-name', { hasText: 'Campus' }).click();
  await page.waitForSelector('.pd-title');
  await page.waitForTimeout(400);
  await shot('06-product');
  await page.locator('.buy-bar .btn-primary').click();
  check('Без розміру товар не додається', (await page.locator('.toast').textContent()).includes('Оберіть'));
  const disabledSizes = await page.locator('.opt-group:has(legend:has-text("Розмір")) .opt:disabled').allTextContents();
  check('Відсутні розміри неактивні', disabledSizes.includes('45'), disabledSizes.join(','));
  // темно-синій + 44 відсутній
  await page.locator('.opt-color[aria-label^="Темно-синій"]').click();
  const s44 = page.locator('.opt-group:has(legend:has-text("Розмір")) .opt', { hasText: /^44$/ });
  check('Відсутня комбінація колір+розмір заблокована', await s44.isDisabled());
  await page.locator('.opt-group:has(legend:has-text("Розмір")) .opt', { hasText: /^42$/ }).click();
  await page.locator('.stepper button[aria-label="Збільшити"]').click();
  await shot('07-product-selected');
  await page.locator('.buy-bar .btn-primary').click();
  check('Товар додано в кошик', (await page.locator('.toast').textContent()).includes('Додано'));
  await page.evaluate(() => window.scrollTo(0, 700));
  await shot('08-product-details');

  // Пошук
  await page.locator('.pd-float .icon-btn').first().click();
  await nav('Головна');
  await page.locator('.search-field').click();
  await page.fill('#search-query', 'bois');
  await page.waitForTimeout(400);
  check('Пошук за назвою', (await page.locator('.grid .card-name').allTextContents()).includes('Bois Noir'));
  await page.fill('#search-query', 'деревні');
  await page.waitForTimeout(400);
  const woody = await page.locator('.grid .card').count();
  check('Пошук за підкатегорією', woody >= 2, `${woody}`);
  await page.fill('#search-query', 'nike');
  await page.waitForTimeout(400);
  const nike = await page.locator('.grid .card-brand').allTextContents();
  check('Пошук за брендом', nike.length > 0 && nike.every((b) => /nike/i.test(b)), `${nike.length}`);
  await page.fill('#search-query', 'ксилофон');
  await page.waitForTimeout(400);
  check('Повідомлення «нічого не знайдено»', await page.locator('.empty h2', { hasText: 'Нічого не знайдено' }).isVisible());
  await shot('09-search-empty');

  // Швидке додавання з картки (парфум з вибором об'єму)
  await page.fill('#search-query', 'Fleur');
  await page.waitForTimeout(400);
  await page.locator('.grid .cart-btn').first().click();
  await page.waitForSelector('.sheet');
  await page.locator('.sheet .opt', { hasText: '100 мл' }).click();
  await shot('10-quick-add');
  await page.locator('.sheet-foot .btn-primary').click();
  check('Швидке додавання з картки', (await page.locator('.toast').textContent()).includes('Додано'));

  // Кошик
  await nav('Кошик');
  await page.waitForSelector('.cart-row');
  const totalText = async () => parseInt((await page.locator('.summary-total span').last().textContent()).replace(/\D/g, ''), 10);
  const t1 = await totalText();
  check('Сума в кошику коректна', t1 === 4299 * 2 + 3990, `${t1}`);
  await shot('11-cart');
  await page.locator('.cart-row').first().locator('button[aria-label="Збільшити"]').click();
  const t2 = await totalText();
  check('Сума оновлюється при зміні кількості', t2 === 4299 * 3 + 3990, `${t2}`);
  await page.locator('.cart-row').nth(1).locator('select').selectOption('50');
  const t3 = await totalText();
  check('Зміна варіанта в кошику змінює ціну', t3 === 4299 * 3 + 2850, `${t3}`);

  // Збереження після перезавантаження
  await page.reload();
  await page.waitForSelector('.hero');
  await nav('Кошик');
  await page.waitForSelector('.cart-row');
  check('Кошик зберігається після перезапуску', (await page.locator('.cart-row').count()) === 2);
  await nav('Обране');
  check('Обране зберігається після перезапуску', (await page.locator('.grid .card').count()) === 1);
  await shot('12-favorites');
  await nav('Кошик');

  // Оформлення
  await page.locator('.buy-bar .btn-primary', { hasText: 'Оформити' }).click();
  await page.waitForSelector('.co-form');
  await page.locator('button[type=submit]').click();
  const errs = await page.locator('.field-error').count();
  check('Обов’язкові поля перевіряються', errs === 4, `${errs} помилок`);
  await shot('13-checkout-errors');
  await page.fill('#co-fullName', 'Олена Коваль');
  await page.fill('#co-phone', '067 123 45');
  await page.locator('#co-city').click();
  check('Некоректний телефон відхиляється', await page.locator('.field.has-error #co-phone').count() === 1);
  await page.fill('#co-phone', '0671234567');
  check('Маска телефону', (await page.inputValue('#co-phone')) === '+380 67 123 45 67', await page.inputValue('#co-phone'));
  await page.fill('#co-city', 'Львів');
  await page.locator('.radio-row', { hasText: 'поштомат' }).click();
  await page.fill('#co-point', 'Поштомат №5521');
  await page.fill('#co-comment', 'Зателефонуйте перед відправкою');
  await shot('14-checkout-filled');
  await page.locator('button[type=submit]').click();
  await page.waitForSelector('.success', { timeout: 5000 });
  check('Демо-замовлення оформлено', await page.locator('text=Демо-замовлення оформлено').isVisible());
  await shot('15-success');
  await page.locator('.success .btn-primary').click();
  await nav('Кошик');
  check('Після замовлення кошик порожній', await page.locator('text=Кошик порожній').isVisible());
  await shot('16-cart-empty');

  await nav('Профіль');
  await shot('17-profile');

  // Немає в наявності
  await nav('Каталог');
  await page.locator('.catalog-cat-head', { hasText: 'Кросівки' }).click();
  await page.locator('.grid .card-name', { hasText: 'Night Knit' }).click();
  check('Товар без наявності не можна купити', await page.locator('.buy-bar .btn', { hasText: 'Немає в наявності' }).isDisabled());

  // Горизонтальний скрол
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  check('Немає горизонтальної прокрутки', !overflow);

  // Українська мова: шукаємо російські літери
  await page.locator('.pd-float .icon-btn').first().click();
  await nav('Головна');
  const ru = await page.evaluate(() => (document.body.innerText.match(/[ыэъё]/gi) || []).length);
  check('Немає російських літер у тексті головної', ru === 0, `${ru}`);

  check('Без помилок у консолі', errors.length === 0, errors.slice(0, 5).join(' | '));
  await browser.close();
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} перевірок пройдено`);
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
