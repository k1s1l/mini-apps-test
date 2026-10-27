// Наскрізна перевірка основних сценаріїв у мобільному вікні (на реальному каталозі).
// Запуск: npm run build && PORT=4173 node server.mjs &  node scripts/smoke-test.cjs [теку-для-скріншотів]
const { chromium } = require('playwright');
const fs = require('fs');

const URL = process.env.APP_URL || 'http://localhost:4173/';
const OUT = process.argv[2] || 'smoke-shots';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, ok, extra = '') => {
  results.push({ name, ok });
  console.log(`${ok ? '✔' : '✘'} ${name}${extra ? ' — ' + extra : ''}`);
};
const num = (t) => parseInt(String(t).replace(/\D/g, ''), 10);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  const ignore = /fonts\.(googleapis|gstatic)/;
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !ignore.test(m.text()) && errors.push(m.text()));
  page.on('requestfailed', (r) => !ignore.test(r.url()) && errors.push('requestfailed ' + r.url()));

  const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` });
  const nav = (label) => page.locator('.bottom-nav .bn-item', { hasText: label }).click();
  const settle = () => page.waitForTimeout(450);

  await page.goto(URL);
  await page.waitForSelector('.hero');
  await settle();
  check('Головна відкривається', await page.locator('.section-head h2', { hasText: 'Новинки' }).isVisible());
  check('Демо-банер прибрано', (await page.locator('.demo-note').count()) === 0);
  await shot('01-home');
  await page.evaluate(() => window.scrollTo(0, 700));
  await settle();
  await shot('02-home-scrolled');

  // Каталог: лише категорії з товарами
  await nav('Каталог');
  await page.waitForSelector('.catalog-cat');
  const cats = await page.locator('.catalog-cat h2').allTextContents();
  check('Порожні категорії приховано', cats.length === 1 && cats[0] === 'Парфумерія', cats.join(', '));
  await page.locator('.catalog-cat-head').first().click();
  await page.waitForSelector('.grid .card');
  const total = await page.locator('.grid .card').count();
  check('У категорії 16 ароматів', total === 16, `${total}`);
  await settle();
  await shot('03-category');

  // Підкатегорія
  await page.locator('.sub-chips-scroll .chip', { hasText: 'Чоловічі' }).click();
  const men = await page.locator('.grid .card').count();
  check('Підкатегорія «Чоловічі»', men > 0 && men < total, `${men}`);
  await page.locator('.sub-chips-scroll .chip', { hasText: 'Усі' }).click();

  // Фільтр за брендом + сортування
  await page.locator('.tool-btn', { hasText: 'Фільтри' }).click();
  await page.locator('.sheet .chip', { hasText: /^Tom Ford$/ }).click();
  await page.locator('.sheet-foot .btn-primary').click();
  const brands = await page.locator('.grid .card-brand').allTextContents();
  check('Фільтр за брендом', brands.length === 4 && brands.every((b) => /tom ford/i.test(b)), `${brands.length}`);
  await page.locator('.tool-btn', { hasText: 'новинки' }).click();
  await page.locator('.sort-item', { hasText: 'Від дорожчих' }).click();
  const prices = (await page.locator('.grid .price-now').allTextContents()).map(num);
  check('Сортування від дорожчих', prices.every((p, i) => i === 0 || p <= prices[i - 1]), prices.join(' '));
  await page.locator('.active-filters .link-btn', { hasText: 'Скинути все' }).click();

  // Товар
  await page.locator('.grid .card-name', { hasText: 'Creed Aventus Absolu' }).click();
  await page.waitForSelector('.pd-title');
  await settle();
  check('Ціна товару з поста', num(await page.locator('.pd-price-row .price-now').textContent()) === 1749);
  check('Ноти показано в характеристиках', await page.locator('.specs dd', { hasText: 'Бергамот, грейпфрут' }).isVisible());
  check('Посилання на менеджера', await page.locator('.pd-perks a', { hasText: '@Kada_Adminn' }).isVisible());
  await shot('04-product');
  await page.evaluate(() => window.scrollTo(0, 600));
  await settle();
  await shot('05-product-details');
  await page.locator('.buy-bar .btn-primary').click();
  check('Додано в кошик', (await page.locator('.toast').textContent()).includes('Додано'));

  // Швидке додавання з картки
  await page.locator('.pd-float .icon-btn').first().click();
  await page.locator('.grid .card', { hasText: 'Kayali' }).locator('.cart-btn').click();
  await page.locator('.grid .card', { hasText: 'Kayali' }).locator('.fav-btn').click();

  // Пошук
  await nav('Головна');
  await page.locator('.search-field').click();
  await page.fill('#search-query', 'ваніль');
  await page.waitForTimeout(400);
  const vanilla = await page.locator('.grid .card').count();
  check('Пошук за нотами в описі', vanilla > 0, `${vanilla}`);
  await page.fill('#search-query', 'jean paul');
  await page.waitForTimeout(400);
  check('Пошук за брендом', (await page.locator('.grid .card').count()) === 2);
  await page.fill('#search-query', 'кросівки');
  await page.waitForTimeout(400);
  check('Порожній результат пошуку', await page.locator('.empty h2', { hasText: 'Нічого не знайдено' }).isVisible());

  // Кошик
  await page.locator('.search-bar .icon-btn').first().click();
  await nav('Кошик');
  await page.waitForSelector('.cart-row');
  const sum = num(await page.locator('.summary-total span').last().textContent());
  check('Сума в кошику', sum === 1749 + 899, `${sum}`);
  await page.locator('.cart-row').first().locator('button[aria-label="Збільшити"]').click();
  check('Сума оновлюється', num(await page.locator('.summary-total span').last().textContent()) === 1749 * 2 + 899);
  await shot('06-cart');

  // Збереження
  await page.reload();
  await page.waitForSelector('.hero');
  await nav('Кошик');
  check('Кошик зберігається після перезапуску', (await page.locator('.cart-row').count()) === 2);

  // Оформлення
  await page.locator('.buy-bar .btn-primary', { hasText: 'Оформити' }).click();
  await page.locator('button[type=submit]').click();
  check('Перевірка обов’язкових полів', (await page.locator('.field-error').count()) === 4);
  await page.fill('#co-fullName', 'Олена Коваль');
  await page.fill('#co-phone', '0671234567');
  await page.fill('#co-city', 'Львів');
  await page.fill('#co-point', 'Відділення №12');
  await page.locator('button[type=submit]').click();
  await page.waitForSelector('.success', { timeout: 5000 });
  check('Демо-замовлення оформлено', true);

  await page.locator('.success .btn-primary').click();
  await nav('Обране');
  check('Обране', (await page.locator('.grid .card').count()) === 1);
  await nav('Профіль');
  check('Контакт менеджера в профілі', await page.locator('.contact-list a', { hasText: '@Kada_Adminn' }).isVisible());
  await shot('07-profile');

  await nav('Головна');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  check('Немає горизонтальної прокрутки', !overflow);
  const ru = await page.evaluate(() => (document.body.innerText.match(/[ыэъё]/gi) || []).length);
  check('Немає російських літер', ru === 0, `${ru}`);
  check('Без помилок у консолі', errors.length === 0, errors.slice(0, 5).join(' | '));

  await browser.close();
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} перевірок пройдено`);
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
