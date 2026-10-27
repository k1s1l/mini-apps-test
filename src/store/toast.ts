import { create } from 'zustand';

interface Toast {
  id: number;
  text: string;
  action?: { label: string; run: () => void };
  tone?: 'default' | 'error';
}

interface ToastState {
  toast?: Toast;
  show(text: string, opts?: Omit<Toast, 'id' | 'text'>): void;
  hide(): void;
}

let timer: ReturnType<typeof setTimeout> | undefined;

export const useToast = create<ToastState>((set) => ({
  show(text, opts) {
    clearTimeout(timer);
    set({ toast: { id: Date.now(), text, ...opts } });
    timer = setTimeout(() => set({ toast: undefined }), 2600);
  },
  hide() {
    clearTimeout(timer);
    set({ toast: undefined });
  },
}));

export const toast = (text: string, opts?: Omit<Toast, 'id' | 'text'>) => useToast.getState().show(text, opts);
