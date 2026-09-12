import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { i18n, Language } from '../lib/i18n';

const FESC_RED = '#e30513';

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<Language>(i18n.getCurrentLanguage());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setCurrentLang(e.detail);
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  const handleLanguageChange = (lang: Language) => {
    i18n.setLanguage(lang);
    setCurrentLang(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded transition-colors"
        title={i18n.t('language.select')}
      >
        <Globe className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700 uppercase">
          {currentLang}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer clic fuera */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
            <button
              onClick={() => handleLanguageChange('es')}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between ${
                currentLang === 'es' ? 'bg-red-50' : ''
              }`}
            >
              <span className="text-sm font-medium text-gray-700">
                {i18n.t('language.spanish')}
              </span>
              {currentLang === 'es' && (
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: FESC_RED }} />
              )}
            </button>
            
            <button
              onClick={() => handleLanguageChange('en')}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between ${
                currentLang === 'en' ? 'bg-red-50' : ''
              }`}
            >
              <span className="text-sm font-medium text-gray-700">
                {i18n.t('language.english')}
              </span>
              {currentLang === 'en' && (
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: FESC_RED }} />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
