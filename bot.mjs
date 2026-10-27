// Мінімальний Telegram-бот: відповідає на /start кнопкою, що відкриває Mini App,
// і встановлює кнопку меню. Працює через long polling (без вебхука), тож
// окремих налаштувань у Railway, окрім BOT_TOKEN, не потребує.
//
// Змінні середовища:
//   BOT_TOKEN             — токен від @BotFather (лише на сервері!)
//   WEBAPP_URL            — адреса магазину; якщо не задана, береться RAILWAY_PUBLIC_DOMAIN
//   TELEGRAM_API_BASE     — лише для тестів (за замовчуванням https://api.telegram.org)

const API_BASE = process.env.TELEGRAM_API_BASE || 'https://api.telegram.org';

function webAppUrl() {
  if (process.env.WEBAPP_URL) return process.env.WEBAPP_URL;
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  return null;
}

export function startBot() {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    console.log('Бот: BOT_TOKEN не задано, бот вимкнено');
    return;
  }
  const url = webAppUrl();
  const hasUrl = Boolean(url && url.startsWith('https://'));
  if (!hasUrl)
    console.log('Бот: немає HTTPS-адреси магазину. Згенеруйте домен у Railway (Settings → Networking) і зробіть Redeploy');

  const call = async (method, body) => {
    const res = await fetch(`${API_BASE}/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
    const data = await res.json().catch(() => ({}));
    // Токен ніколи не потрапляє в логи — лише назва методу та опис помилки.
    if (!data.ok) throw new Error(`${method}: ${data.description || res.status}`);
    return data.result;
  };

  const openButton = { text: '🛍 Відкрити магазин', web_app: { url } };

  async function handle(update) {
    const msg = update.message;
    if (!msg?.text || msg.chat?.type !== 'private') return;
    const text = msg.text.trim();
    console.log(`Бот: повідомлення «${text.slice(0, 20)}» від чату ${msg.chat.id}`);
    if (!hasUrl) {
      await call('sendMessage', {
        chat_id: msg.chat.id,
        text: 'Магазин ще налаштовується: у сервера немає публічної адреси. Спробуйте трохи пізніше.',
      });
      return;
    }
    if (text.startsWith('/start') || text.startsWith('/shop')) {
      await call('sendMessage', {
        chat_id: msg.chat.id,
        text:
          'Вітаємо! 👋\n\nУсі наші аромати в одному каталозі: фото, ціни та ноти. ' +
          'Натисніть кнопку нижче, щоб відкрити магазин.',
        reply_markup: { inline_keyboard: [[openButton]] },
      });
    } else if (text.startsWith('/help')) {
      await call('sendMessage', {
        chat_id: msg.chat.id,
        text: 'Команди:\n/start — відкрити магазин\n/help — допомога',
      });
    } else {
      await call('sendMessage', {
        chat_id: msg.chat.id,
        text: 'Щоб переглянути товари, відкрийте магазин 👇',
        reply_markup: { inline_keyboard: [[openButton]] },
      });
    }
  }

  async function setup() {
    // Polling не працює одночасно з вебхуком — вимикаємо його, якщо був.
    await call('deleteWebhook', { drop_pending_updates: false });
    const me = await call('getMe');
    if (!hasUrl) {
      console.log(`Бот: @${me.username} працює без кнопки магазину (немає домену)`);
      return;
    }
    await call('setChatMenuButton', { menu_button: { type: 'web_app', text: 'Магазин', web_app: { url } } });
    await call('setMyCommands', {
      commands: [
        { command: 'start', description: 'Відкрити магазин' },
        { command: 'help', description: 'Допомога' },
      ],
    });
    console.log(`Бот: @${me.username} запущено, магазин ${url}`);
  }

  async function loop() {
    let offset = 0;
    let delay = 1000;
    for (;;) {
      try {
        const updates = await call('getUpdates', { offset, timeout: 30, allowed_updates: ['message'] });
        delay = 1000;
        for (const u of updates) {
          offset = u.update_id + 1;
          await handle(u).catch((e) => console.error('Бот:', e.message));
        }
      } catch (e) {
        console.error('Бот:', e.message);
        // 409 — бот уже запущено в іншому місці (наприклад, у старому деплої); чекаємо довше.
        await new Promise((r) => setTimeout(r, delay));
        delay = Math.min(delay * 2, 30000);
      }
    }
  }

  (async () => {
    for (let attempt = 0; ; attempt++) {
      try {
        await setup();
        break;
      } catch (e) {
        console.error('Бот: не вдалося запустити —', e.message);
        if (/Unauthorized|Not Found/i.test(e.message)) {
          console.error('Бот: перевірте BOT_TOKEN у змінних Railway');
          return;
        }
        await new Promise((r) => setTimeout(r, Math.min(30000, 2000 * 2 ** attempt)));
      }
    }
    loop();
  })();
}
