import React, { createContext, useContext, useState } from 'react';
import { translations, regionAffiliates } from '../data/i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('nl');
  const [region, setRegion] = useState('NL');

  // Region-specific affiliates override the language default
  const base = translations[lang] || translations.nl;
  const affiliates = regionAffiliates[`${lang}-${region}`] || base.affiliates;
  const t = { ...base, affiliates };

  return (
    <LanguageContext.Provider value={{ lang, setLang, region, setRegion, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
