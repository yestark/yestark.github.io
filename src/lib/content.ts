import { getCollection, type CollectionEntry } from 'astro:content';
import type { Language } from '../i18n/types';
import { entryPath } from './routes';
import { normalizeTagSlug, type TagSummary } from './tags';

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

export function buildContentPaths<T extends LocalizedEntry>(entries: readonly T[], language: Language) {
  return sortPublishedEntries(entries)
    .filter((entry) => entry.data.language === language)
    .map((entry) => ({ params: { id: entry.id }, props: { entry } }));
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

export async function getPublishedArticles(language?: Language): Promise<CollectionEntry<'articles'>[]> {
  const entries = sortPublishedEntries(await getCollection('articles'));
  return language ? entries.filter((entry) => entry.data.language === language) : entries;
}

export async function getPublishedProjects(language?: Language): Promise<CollectionEntry<'projects'>[]> {
  const entries = sortPublishedEntries(await getCollection('projects'));
  return language ? entries.filter((entry) => entry.data.language === language) : entries;
}

interface ArticleArchiveSource extends LocalizedEntry {
  data: LocalizedEntry['data'] & {
    title: string;
    description: string;
    tags: string[];
  };
}

interface ProjectArchiveSource extends LocalizedEntry {
  data: LocalizedEntry['data'] & {
    title: string;
    summary: string;
    tags: string[];
  };
}

export interface ArchiveEntry {
  id: string;
  type: 'article' | 'project';
  title: string;
  summary: string;
  publishedAt: Date;
  language: Language;
  tags: string[];
  href: string;
}

export function buildArchiveEntries(
  articles: readonly ArticleArchiveSource[],
  projects: readonly ProjectArchiveSource[],
  language: Language,
): ArchiveEntry[] {
  const articleEntries = sortPublishedEntries(articles).map((entry) => ({
    id: entry.id,
    type: 'article' as const,
    title: entry.data.title,
    summary: entry.data.description,
    publishedAt: entry.data.publishedAt,
    language: entry.data.language,
    tags: [...entry.data.tags],
    href: entryPath('articles', entry),
  }));
  const projectEntries = sortPublishedEntries(projects).map((entry) => ({
    id: entry.id,
    type: 'project' as const,
    title: entry.data.title,
    summary: entry.data.summary,
    publishedAt: entry.data.publishedAt,
    language: entry.data.language,
    tags: [...entry.data.tags],
    href: entryPath('projects', entry),
  }));

  return [...articleEntries, ...projectEntries]
    .filter((entry) => entry.language === language)
    .toSorted((left, right) => right.publishedAt.valueOf() - left.publishedAt.valueOf());
}

export async function getArchiveEntries(language: Language): Promise<ArchiveEntry[]> {
  const [articles, projects] = await Promise.all([
    getPublishedArticles(),
    getPublishedProjects(),
  ]);
  return buildArchiveEntries(articles, projects, language);
}

function uppercaseScore(value: string): number {
  return value.match(/\p{Uppercase_Letter}/gu)?.length ?? 0;
}

export function collectTags(entries: readonly { tags: readonly string[] }[]): TagSummary[] {
  const tags = new Map<string, TagSummary>();

  for (const entry of entries) {
    const seen = new Set<string>();
    for (const name of entry.tags) {
      const slug = normalizeTagSlug(name);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      const current = tags.get(slug);
      if (!current) {
        tags.set(slug, { name: name.trim(), slug, count: 1 });
        continue;
      }
      current.count += 1;
      if (uppercaseScore(name) > uppercaseScore(current.name)) current.name = name.trim();
    }
  }

  return [...tags.values()].toSorted(
    (left, right) => right.count - left.count || left.name.localeCompare(right.name),
  );
}
