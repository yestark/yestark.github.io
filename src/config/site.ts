import type { Language, StaticPage } from '../i18n/types';

export const siteConfig = {
  name: 'Stark Ye',
  monogram: 'SY',
  email: 'yehanchen714@gmail.com',
  siteUrl: 'https://starkye.com',
  defaultLanguage: 'zh' as Language,
  languages: ['zh', 'en'] as const,
  navigation: ['home', 'articles', 'projects', 'archive', 'about'] as StaticPage[],
} as const;
