import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/i18n';

export const useT = () => {
  const lang = useLanguageStore((s) => s.lang);
  return translations[lang];
};
