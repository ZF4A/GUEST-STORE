import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lang, Theme } from '@/types';

interface AppState {
  lang: Lang;
  theme: Theme;
  activeStore: 'yaounde' | 'kribi' | null;
  searchOpen: boolean;
  setLang: (lang: Lang) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setActiveStore: (store: 'yaounde' | 'kribi' | null) => void;
  setSearchOpen: (v: boolean) => void;
}

const getSystemTheme = (): Theme => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const getBrowserLang = (): Lang => {
  try {
    const nav = (navigator.language || navigator.languages?.[0] || 'fr').toLowerCase();
    return nav.startsWith('en') ? 'en' : 'fr';
  } catch { return 'fr'; }
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      lang: getBrowserLang(),
      theme: getSystemTheme(),
      activeStore: null,
      searchOpen: false,
      setLang: (lang) => set({ lang }),
      setTheme: (theme) => {
        set({ theme });
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { theme: newTheme };
        }),
      setActiveStore: (store) => set({ activeStore: store }),
      setSearchOpen: (v) => set({ searchOpen: v }),
    }),
    {
      name: 'quest-store-app',
    }
  )
);
