import { createContext, useContext, useState, type ReactNode } from 'react';

interface AlternateUrl {
  ro: string;
  en: string;
}

interface PageAlternateContextValue {
  alternateUrl: AlternateUrl | null;
  setAlternateUrl: (url: AlternateUrl | null) => void;
}

const PageAlternateContext = createContext<PageAlternateContextValue>({
  alternateUrl: null,
  setAlternateUrl: () => {},
});

export function PageAlternateProvider({ children }: { children: ReactNode }) {
  const [alternateUrl, setAlternateUrl] = useState<AlternateUrl | null>(null);

  return (
    <PageAlternateContext.Provider value={{ alternateUrl, setAlternateUrl }}>
      {children}
    </PageAlternateContext.Provider>
  );
}

export function usePageAlternate(): PageAlternateContextValue {
  return useContext(PageAlternateContext);
}
