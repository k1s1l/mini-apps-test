// Обгортка над Telegram Mini Apps SDK (telegram-web-app.js).
// SDK підвантажується лише всередині Telegram, тож у звичайному браузері
// застосунок працює без нього.

interface TgUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

interface TgButton {
  show(): void;
  hide(): void;
  onClick(cb: () => void): void;
  offClick(cb: () => void): void;
}

interface TgWebApp {
  initData: string;
  initDataUnsafe: { user?: TgUser };
  platform: string;
  version: string;
  ready(): void;
  expand(): void;
  setHeaderColor?(c: string): void;
  setBackgroundColor?(c: string): void;
  setBottomBarColor?(c: string): void;
  disableVerticalSwipes?(): void;
  isVersionAtLeast?(v: string): boolean;
  BackButton: TgButton;
  openTelegramLink?(url: string): void;
  openLink?(url: string): void;
  HapticFeedback?: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp: TgWebApp };
  }
}

const SDK_URL = 'https://telegram.org/js/telegram-web-app.js';

function launchedFromTelegram(): boolean {
  try {
    return /tgWebApp(Data|Platform|Version)=/.test(window.location.hash + window.location.search);
  } catch {
    return false;
  }
}

let webApp: TgWebApp | undefined;

export async function initTelegram(bg: string): Promise<void> {
  if (!launchedFromTelegram()) return;
  if (!window.Telegram?.WebApp) {
    await new Promise<void>((resolve) => {
      const s = document.createElement('script');
      s.src = SDK_URL;
      s.onload = () => resolve();
      s.onerror = () => resolve();
      document.head.appendChild(s);
    });
  }
  webApp = window.Telegram?.WebApp;
  if (!webApp) return;
  try {
    webApp.ready();
    webApp.expand();
    webApp.setHeaderColor?.(bg);
    webApp.setBackgroundColor?.(bg);
    webApp.setBottomBarColor?.(bg);
    if (webApp.isVersionAtLeast?.('7.7')) webApp.disableVerticalSwipes?.();
  } catch {
    /* старі клієнти Telegram підтримують не всі методи */
  }
}

export const telegram = {
  get available() {
    return Boolean(webApp);
  },
  /** Дані користувача з клієнта. НЕ перевірені: довіряти можна лише після перевірки initData на сервері. */
  get user(): TgUser | undefined {
    return webApp?.initDataUnsafe?.user;
  },
  get initData(): string | undefined {
    return webApp?.initData || undefined;
  },
  backButton(visible: boolean, onClick: () => void): () => void {
    if (!webApp) return () => {};
    const b = webApp.BackButton;
    if (visible) {
      b.show();
      b.onClick(onClick);
    } else b.hide();
    return () => b.offClick(onClick);
  },
  /** Відкриває посилання t.me всередині Telegram; у браузері — у новій вкладці. */
  openLink(url: string) {
    try {
      if (webApp && /^https:\/\/t\.me\//.test(url) && webApp.openTelegramLink) return webApp.openTelegramLink(url);
      if (webApp?.openLink) return webApp.openLink(url);
    } catch {
      /* падаємо на звичайне відкриття */
    }
    window.open(url, '_blank', 'noopener');
  },
  haptic(kind: 'light' | 'success' | 'error' | 'select' = 'light') {
    const h = webApp?.HapticFeedback;
    if (!h) return;
    try {
      if (kind === 'light') h.impactOccurred('light');
      else if (kind === 'select') h.selectionChanged();
      else h.notificationOccurred(kind);
    } catch {
      /* ігноруємо */
    }
  },
};
