import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { siteCopySchema } from '../../src/content-contracts';
import en from '../../src/content/site/en.json';
import zh from '../../src/content/site/zh.json';

describe('site copy', () => {
  it('keeps complete bilingual public copy in schema-checked data', () => {
    expect(siteCopySchema.parse(zh).hero.title).toContain('AI');
    expect(siteCopySchema.parse(en).contact.email).toBe('yehanchen714@gmail.com');
    expect(zh.contact.email).toBe(en.contact.email);
    expect(Object.keys(zh.about.sections)).toEqual([
      'background', 'focus', 'capabilities', 'principle', 'status',
    ]);
  });

  it('keeps public-facing pages and shell components on the editable site JSON source', () => {
    const sourceFiles = [
      'src/layouts/BaseLayout.astro',
      'src/components/common/CopyEmail.astro',
      'src/components/shell/Header.astro',
      'src/components/shell/Footer.astro',
      'src/pages/about.astro',
      'src/pages/en/about.astro',
      'src/pages/contact.astro',
      'src/pages/en/contact.astro',
      'src/pages/projects/index.astro',
      'src/pages/en/projects/index.astro',
    ];

    for (const file of sourceFiles) {
      expect(readFileSync(join(process.cwd(), file), 'utf8'), file).not.toContain('translations');
    }
  });
});
