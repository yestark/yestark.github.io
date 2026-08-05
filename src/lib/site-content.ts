import { getEntry } from 'astro:content';
import type { Language } from '../i18n/types';
import type { SiteCopy } from '../content-contracts';

export async function getSiteCopy(language: Language): Promise<SiteCopy> {
  const entry = await getEntry('site', language);
  if (!entry) throw new Error(`Missing site copy for ${language}`);
  return entry.data;
}
