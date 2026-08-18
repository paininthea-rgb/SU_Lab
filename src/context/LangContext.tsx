'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Lang, translations, type TranslationDict } from '@/lib/i18n';

interface LangContextType {
  lang: Lang;
  t: TranslationDict;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const toggleLang = useCallback(() => setLang((current) => (current === 'en' ? 'vi' : 'en')), []);
  const value = useMemo<LangContextType>(() => ({ lang, t: translations[lang], toggleLang }), [lang, toggleLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const context = useContext(LangContext);

  if (!context) {
    throw new Error('useLang must be used within a LangProvider');
  }

  return context;
}
