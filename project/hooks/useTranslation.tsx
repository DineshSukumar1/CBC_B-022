import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en } from '@/translations/en';
import { kn } from '@/translations/kn';

type Language = 'en' | 'kn';

interface TranslationContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType>({
  language: 'en',
  toggleLanguage: () => {},
  t: (key: string) => key,
});

interface TranslationProviderProps {
  children: ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [language, setLanguage] = useState<Language>('en');
  
  useEffect(() => {
    // Load saved language preference
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('language');
        if (savedLanguage === 'en' || savedLanguage === 'kn') {
          setLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    };
    
    loadLanguage();
  }, []);
  
  const toggleLanguage = async () => {
    const newLanguage = language === 'en' ? 'kn' : 'en';
    setLanguage(newLanguage);
    
    try {
      await AsyncStorage.setItem('language', newLanguage);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };
  
  const t = (key: string): string => {
    const translations = language === 'en' ? en : kn;
    return translations[key] || key;
  };
  
  return (
    <TranslationContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export const useTranslation = () => useContext(TranslationContext);