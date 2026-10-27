// Безпечне сховище: localStorage може бути недоступним (приватний режим,
// заблоковані дані сайту). Тоді дані живуть лише до закриття застосунку.
// Пізніше тут можна підключити Telegram CloudStorage або серверний профіль.

import type { StateStorage } from 'zustand/middleware';

const memory = new Map<string, string>();

export const safeStorage: StateStorage = {
  getItem(name) {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return memory.get(name) ?? null;
    }
  },
  setItem(name, value) {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      memory.set(name, value);
    }
  },
  removeItem(name) {
    try {
      window.localStorage.removeItem(name);
    } catch {
      memory.delete(name);
    }
  },
};
