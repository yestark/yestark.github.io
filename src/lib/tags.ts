import type { Language } from '../i18n/types';

export interface TagSummary {
  name: string;
  slug: string;
  count: number;
}

export function normalizeTagSlug(tag: string): string {
  return tag
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('en-US')
    .replace(/\s+/gu, '-')
    .replace(/[^\p{Letter}\p{Number}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function tagPath(tag: string, language: Language): string {
  const prefix = language === 'en' ? '/en' : '';
  return `${prefix}/tags/${encodeURIComponent(normalizeTagSlug(tag))}/`;
}
