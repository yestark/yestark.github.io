import { getCollection, type CollectionEntry } from 'astro:content';
import type { Language } from '../i18n/types';

export interface LocalizedEntry {
  id: string;
  data: {
    language: Language;
    translationKey?: string | undefined;
    draft: boolean;
    publishedAt: Date;
  };
}

export function sortPublishedEntries<T extends LocalizedEntry>(entries: readonly T[]): T[] {
  return entries
    .filter((entry) => !entry.data.draft)
    .toSorted((left, right) => right.data.publishedAt.valueOf() - left.data.publishedAt.valueOf());
}

export function findTranslation<T extends LocalizedEntry>(
  entries: readonly T[],
  entry: T,
  targetLanguage: Language,
): T | undefined {
  if (!entry.data.translationKey) return undefined;
  return entries.find(
    (candidate) =>
      candidate.data.translationKey === entry.data.translationKey &&
      candidate.data.language === targetLanguage &&
      !candidate.data.draft,
  );
}

export async function getPublishedThoughts(language?: Language): Promise<CollectionEntry<'thoughts'>[]> {
  const entries = sortPublishedEntries(await getCollection('thoughts'));
  return language ? entries.filter((entry) => entry.data.language === language) : entries;
}

export async function getPublishedProjects(language?: Language): Promise<CollectionEntry<'projects'>[]> {
  const entries = sortPublishedEntries(await getCollection('projects'));
  return language ? entries.filter((entry) => entry.data.language === language) : entries;
}
