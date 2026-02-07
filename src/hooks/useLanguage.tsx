import { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '@/types/data';
import { getTranslation } from '@/data/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  
  const t = (key: string) => getTranslation(key, language);
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const languageOptions: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'EN', native: 'English' },
  { code: 'hi', label: 'HI', native: 'हिंदी' },
  { code: 'te', label: 'TE', native: 'తెలుగు' },
  { code: 'ta', label: 'TA', native: 'தமிழ்' },
];
