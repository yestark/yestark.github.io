import type { Language, StaticPage } from '../i18n/types';

export const siteConfig = {
  name: 'Stark Ye',
  monogram: 'SY',
  siteUrl: 'https://starkye.com',
  defaultLanguage: 'zh' as Language,
  languages: ['zh', 'en'] as const,
  navigation: ['home', 'articles', 'projects', 'archive', 'about'] as StaticPage[],
} as const;

export const navigationLabels: Record<Language, Record<StaticPage, string>> = {
  zh: {
    home: '首页',
    articles: '文章',
    projects: '项目',
    archive: '归档',
    about: '关于我',
    contact: '联系',
  },
  en: {
    home: 'Home',
    articles: 'Articles',
    projects: 'Projects',
    archive: 'Archive',
    about: 'About',
    contact: 'Contact',
  },
};
