// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import th from './th/common.json';
import en from './en/common.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    th: { translation: th },
  },
  lng: 'th',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
