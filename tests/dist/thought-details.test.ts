import { execFileSync } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const projectRoot = new URL('../../', import.meta.url);
const thoughtsDirectory = new URL('../../src/content/thoughts/', import.meta.url);
const dataStore = new URL('../../node_modules/.astro/data-store.json', import.meta.url);
const fixtureIds = ['unpaired-detail-test', 'paired-detail-test', 'paired-detail-test-en'];
let originalDataStore: string | undefined;

const fixtures: Record<string, string> = {
  'unpaired-detail-test': `---
title: Unpaired detail test
description: A temporary test-only unpaired thought.
publishedAt: 2026-08-06
tags: [test]
language: zh
draft: false
---

Temporary fixture content.
`,
  'paired-detail-test': `---
title: Paired detail test
description: A temporary test-only paired thought.
publishedAt: 2026-08-06
tags: [test]
language: zh
translationKey: paired-detail-test
draft: false
---

Temporary fixture content.
`,
  'paired-detail-test-en': `---
title: Paired detail test in English
description: A temporary test-only paired thought in English.
publishedAt: 2026-08-06
tags: [test]
language: en
translationKey: paired-detail-test
draft: false
---

Temporary fixture content.
`,
};

beforeAll(async () => {
  originalDataStore = await readFile(dataStore, 'utf8').catch(() => undefined);
  await mkdir(thoughtsDirectory, { recursive: true });
  await Promise.all(
    Object.entries(fixtures).map(([id, source]) => writeFile(new URL(`${id}.md`, thoughtsDirectory), source)),
  );
  execFileSync(process.execPath, ['./node_modules/astro/bin/astro.mjs', 'build'], {
    cwd: projectRoot,
    stdio: 'pipe',
  });
});

afterAll(async () => {
  await Promise.all(fixtureIds.map((id) => rm(new URL(`${id}.md`, thoughtsDirectory), { force: true })));
  if (originalDataStore === undefined) {
    await rm(dataStore, { force: true });
  } else {
    await writeFile(dataStore, originalDataStore);
  }
  execFileSync(process.execPath, ['./node_modules/astro/bin/astro.mjs', 'build'], {
    cwd: projectRoot,
    stdio: 'pipe',
  });
});

describe('Thought detail translation metadata', () => {
  it('omits the translation metadata and switch for an unpaired thought', async () => {
    const html = await readFile(new URL('../../dist/thoughts/unpaired-detail-test/index.html', import.meta.url), 'utf8');

    expect(html).not.toContain('hreflang="en"');
    expect(html).not.toContain('class="language-switch"');
  });

  it('keeps the translated detail route for a published pair', async () => {
    const html = await readFile(new URL('../../dist/thoughts/paired-detail-test/index.html', import.meta.url), 'utf8');

    expect(html).toContain('hreflang="en" href="https://starkye.com/en/thoughts/paired-detail-test-en/"');
    expect(html).toContain('class="language-switch" href="/en/thoughts/paired-detail-test-en/"');
  });
});
