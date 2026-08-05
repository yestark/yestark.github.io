import en from '../content/site/en.json';
import zh from '../content/site/zh.json';

const compatibilityDictionary = (copy: typeof zh | typeof en, language: 'zh' | 'en') => ({
  ...copy,
  nav: language === 'zh'
    ? { home: '首页', articles: '文章', projects: '项目', archive: '归档', about: '关于我', contact: '联系', thoughts: '想法' }
    : { home: 'Home', articles: 'Articles', projects: 'Projects', archive: 'Archive', about: 'About', contact: 'Contact', thoughts: 'Thoughts' },
  hero: { ...copy.hero, thoughtsCta: copy.hero.articlesCta },
  thoughts: copy.articles,
  contact: { ...copy.contact, email: copy.contact.emailLabel },
});

export const translations = {
  zh: compatibilityDictionary(zh, 'zh'),
  en: compatibilityDictionary(en, 'en'),
};
