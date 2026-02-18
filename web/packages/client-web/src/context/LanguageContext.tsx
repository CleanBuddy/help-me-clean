import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { detectLanguageFromPath, type SupportedLanguage } from '@/i18n/routes';

interface LanguageContextValue {
  lang: SupportedLanguage;
}

const LanguageContext = createContext<LanguageContextValue>({ lang: 'ro' });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();

  const lang = detectLanguageFromPath(pathname);

  useEffect(() => {
    if (i18n.language !== lang) {
      void i18n.changeLanguage(lang);
    }
    document.documentElement.lang = lang;
  }, [lang, i18n]);

  return (
    <LanguageContext.Provider value={{ lang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

// Re-export the type for convenience
export type { SupportedLanguage };
