import { describe, expect, it } from 'vitest';
import { normalizeTagSlug, tagPath } from '../../src/lib/tags';

describe('normalizeTagSlug', () => {
  it('normalizes Latin whitespace and preserves Unicode words', () => {
    expect(normalizeTagSlug('  Full Stack  ')).toBe('full-stack');
    expect(normalizeTagSlug('个人想法')).toBe('个人想法');
  });

  it('collapses punctuation and separators deterministically', () => {
    expect(normalizeTagSlug(' AI / Agents ')).toBe('ai-agents');
  });
});

describe('tagPath', () => {
  it('builds localized, URL-safe Tag routes', () => {
    expect(tagPath('AI', 'en')).toBe('/en/tags/ai/');
    expect(tagPath('个人想法', 'zh')).toBe('/tags/%E4%B8%AA%E4%BA%BA%E6%83%B3%E6%B3%95/');
  });
});
