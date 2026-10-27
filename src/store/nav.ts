// Легкий навігатор зі стеком екранів. Працює однаково в Telegram і в браузері
// та не залежить від адресного рядка (у Mini App його не видно).

import { create } from 'zustand';

export type Tab = 'home' | 'catalog' | 'favorites' | 'cart' | 'profile';

export type Route =
  | { name: 'home' }
  | { name: 'catalog' }
  | { name: 'favorites' }
  | { name: 'cart' }
  | { name: 'profile' }
  | { name: 'category'; categoryId: string; subId?: string; preset?: 'sale' }
  | { name: 'collection'; tag: 'popular' | 'new' | 'recommended' | 'sale' }
  | { name: 'search'; query?: string }
  | { name: 'product'; productId: string }
  | { name: 'checkout' }
  | { name: 'success'; reference: string; total: number; count: number };

interface Entry {
  route: Route;
  id: number;
  scrollY: number;
}

interface NavState {
  stack: Entry[];
  direction: 'forward' | 'back' | 'none';
  push(route: Route): void;
  replace(route: Route): void;
  back(): void;
  switchTab(tab: Tab): void;
}

let seq = 1;
const entry = (route: Route): Entry => ({ route, id: seq++, scrollY: 0 });

const tabOf = (r: Route): Tab | undefined =>
  ['home', 'catalog', 'favorites', 'cart', 'profile'].includes(r.name) ? (r.name as Tab) : undefined;

export const useNav = create<NavState>((set, get) => ({
  stack: [entry({ name: 'home' })],
  direction: 'none',
  push(route) {
    const stack = [...get().stack];
    stack[stack.length - 1] = { ...stack[stack.length - 1], scrollY: window.scrollY };
    set({ stack: [...stack, entry(route)], direction: 'forward' });
    window.scrollTo(0, 0);
  },
  replace(route) {
    const stack = get().stack.slice(0, -1);
    set({ stack: [...stack, entry(route)], direction: 'none' });
    window.scrollTo(0, 0);
  },
  back() {
    const { stack } = get();
    if (stack.length <= 1) {
      if (stack[0].route.name !== 'home') set({ stack: [entry({ name: 'home' })], direction: 'back' });
      return;
    }
    const next = stack.slice(0, -1);
    set({ stack: next, direction: 'back' });
    const y = next[next.length - 1].scrollY;
    requestAnimationFrame(() => window.scrollTo(0, y));
  },
  switchTab(tab) {
    const current = get().stack;
    if (current.length === 1 && current[0].route.name === tab) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    set({ stack: [entry({ name: tab } as Route)], direction: 'none' });
    window.scrollTo(0, 0);
  },
}));

export const useRoute = () => useNav((s) => s.stack[s.stack.length - 1]);

/** Активна вкладка нижнього меню — за коренем стеку. */
export const useActiveTab = () => useNav((s) => tabOf(s.stack[0].route) ?? 'home');
