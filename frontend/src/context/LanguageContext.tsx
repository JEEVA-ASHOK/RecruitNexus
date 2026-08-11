import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 'English' | 'Tamil' | 'Hindi' | 'Kannada' | 'Malayalam' | 'Japanese';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'English',
  setLanguage: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('portalLang') as SupportedLanguage;
    return saved || 'English';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    localStorage.setItem('portalLang', lang);
    setLanguageState(lang);
    window.dispatchEvent(new Event('language-changed'));
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = (localStorage.getItem('portalLang') as SupportedLanguage) || 'English';
      setLanguageState(saved);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('language-changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('language-changed', handleStorageChange);
    };
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
