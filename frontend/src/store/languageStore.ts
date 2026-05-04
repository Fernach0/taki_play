import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UILang } from '@/lib/i18n';

interface LanguageStore {
  lang: UILang;
  setLang: (l: UILang) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      lang: 'es',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'taki-lang' }
  )
);
