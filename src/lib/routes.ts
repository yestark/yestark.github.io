import type { Language, StaticPage } from '../i18n/types';

const segments: Record<StaticPage, string> = {
  home: '',
  about: 'about',
  articles: 'articles',
  archive: 'archive',
  projects: 'projects',
  contact: 'contact',
};

export function localizedPath(page: StaticPage, language: Language): string {
  const prefix = language === 'en' ? '/en' : '';
  const segment = segments[page];
  return segment ? `${prefix}/${segment}/` : `${prefix || ''}/`;
}

export type ContentSection = 'articles' | 'projects';

export function entryPath(
  section: ContentSection,
  entry: { id: string; data: { language: Language } },
): string {
  const prefix = entry.data.language === 'en' ? '/en' : '';
  return `${prefix}/${section}/${entry.id}/`;
}
