import en from '../content/site/en.json';
import zh from '../content/site/zh.json';

const compatibilityDictionary = (copy: typeof zh | typeof en, language: 'zh' | 'en') => ({
  ...copy,
  nav: language === 'zh'
    ? { home: '首页', about: '关于', thoughts: '想法', projects: '项目', contact: '联系' }
    : { home: 'Home', about: 'About', thoughts: 'Thoughts', projects: 'Projects', contact: 'Contact' },
  hero: { ...copy.hero, thoughtsCta: copy.hero.articlesCta },
  thoughts: copy.articles,
  contact: { ...copy.contact, email: copy.contact.emailLabel },
});

export const translations = {
  zh: compatibilityDictionary(zh, 'zh'),
  en: compatibilityDictionary(en, 'en'),
};
