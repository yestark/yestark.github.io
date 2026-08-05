import { describe, expect, it } from 'vitest';
import { findTranslation, sortPublishedEntries } from '../../src/lib/content';

const entries = [
  { id: 'older', data: { language: 'zh' as const, translationKey: 'one', draft: false, publishedAt: new Date('2026-01-01') } },
  { id: 'newer', data: { language: 'en' as const, translationKey: 'one', draft: false, publishedAt: new Date('2026-02-01') } },
  { id: 'draft', data: { language: 'zh' as const, draft: true, publishedAt: new Date('2026-03-01') } },
];

describe('sortPublishedEntries', () => {
  it('removes drafts and sorts newest first', () => {
    expect(sortPublishedEntries(entries).map((entry) => entry.id)).toEqual(['newer', 'older']);
  });
});

describe('findTranslation', () => {
  it('returns the matching translation only when translationKey exists', () => {
    expect(findTranslation(entries, entries[0]!, 'en')?.id).toBe('newer');
    expect(findTranslation(entries, entries[2]!, 'en')).toBeUndefined();
  });
});
