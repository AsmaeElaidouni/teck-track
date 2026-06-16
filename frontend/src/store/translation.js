import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { locales, supportedLangs } from '../i18n';

const localeTags = { fr: 'fr-FR', en: 'en-GB', ar: 'ar-MA' };

export const useTranslationStore = defineStore('translation', () => {
  const stored = localStorage.getItem('lang') || 'fr';
  const currentLang = ref(supportedLangs.includes(stored) ? stored : 'fr');

  const activeLocale = computed(() => locales[currentLang.value] ?? locales.fr);
  const localeTag = computed(() => localeTags[currentLang.value] || 'fr-FR');

  const setLanguage = (lang) => {
    if (!supportedLangs.includes(lang)) return;
    currentLang.value = lang;
    localStorage.setItem('lang', lang);

    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = lang;
    }
  };

  const resolve = (obj, keys) => {
    let result = obj;
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        return undefined;
      }
    }
    return typeof result === 'string' ? result : undefined;
  };

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let text =
      resolve(activeLocale.value, keys) ??
      resolve(locales.fr, keys) ??
      key;

    Object.entries(params).forEach(([k, v]) => {
      text = text.replaceAll(`{${k}}`, String(v));
    });
    return text;
  };

  const formatDate = (date, options = { day: '2-digit', month: 'short' }) =>
    new Date(date).toLocaleDateString(localeTag.value, options);

  const label = (group, value) => {
    if (!value) return '';
    return t(`${group}.${value}`) || value;
  };

  setLanguage(currentLang.value);

  return {
    currentLang,
    activeLocale,
    localeTag,
    setLanguage,
    t,
    label,
    formatDate,
  };
});
