import { describe, expect, it } from 'vitest';
import { siteCopySchema } from '../../src/content-contracts';
import en from '../../src/content/site/en.json';
import zh from '../../src/content/site/zh.json';

describe('site copy', () => {
  it('keeps complete bilingual public copy in schema-checked data', () => {
    expect(siteCopySchema.parse(zh).hero.title).toContain('AI');
    expect(siteCopySchema.parse(en).contact.email).toBe('yehanchen714@gmail.com');
  });
});
