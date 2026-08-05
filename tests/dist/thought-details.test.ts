import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
const projectFiles = ['astro.config.mjs', 'package.json', 'package-lock.json', 'public', 'src', 'tsconfig.json'];
let temporaryProject: string;

const articleFixtures: Record<string, string> = {
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

const projectFixtures: Record<string, string> = {
  'unpaired-project-test-en': `---
title: Unpaired project test in English
summary: A temporary test-only unpaired project.
publishedAt: 2026-08-06
tags: [test]
language: en
featured: false
draft: false
---

Temporary fixture content.
`,
  'paired-project-test': `---
title: Paired project test
summary: A temporary test-only paired project.
publishedAt: 2026-08-06
tags: [test]
language: zh
featured: false
translationKey: paired-project-test
draft: false
---

Temporary fixture content.
`,
  'paired-project-test-en': `---
title: Paired project test in English
summary: A temporary test-only paired project in English.
publishedAt: 2026-08-06
tags: [test]
language: en
featured: false
translationKey: paired-project-test
draft: false
---

Temporary fixture content.
`,
};

async function linkDependencies(): Promise<void> {
  const source = join(projectRoot, 'node_modules');
  const destination = join(temporaryProject, 'node_modules');
  await mkdir(destination);

  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (entry.name === '.astro' || entry.name === '.vite') continue;
    await symlink(join(source, entry.name), join(destination, entry.name));
  }
}

async function writeFixtures(directory: 'articles' | 'projects', fixtures: Record<string, string>): Promise<void> {
  const destination = join(temporaryProject, 'src', 'content', directory);
  await Promise.all(
    Object.entries(fixtures).map(([id, source]) => writeFile(join(destination, `${id}.md`), source)),
  );
}

async function output(relativePath: string): Promise<string> {
  return readFile(join(temporaryProject, 'dist', relativePath), 'utf8');
}

beforeAll(async () => {
  temporaryProject = await mkdtemp(join(tmpdir(), 'stark-ye-detail-fixtures-'));
  await Promise.all(
    projectFiles.map((path) => cp(join(projectRoot, path), join(temporaryProject, path), { recursive: true })),
  );
  await linkDependencies();
  await writeFixtures('articles', articleFixtures);
  await writeFixtures('projects', projectFixtures);

  execFileSync(process.execPath, [join(projectRoot, 'node_modules/astro/bin/astro.mjs'), 'build'], {
    cwd: temporaryProject,
    stdio: 'pipe',
  });
});

afterAll(async () => {
  if (temporaryProject) await rm(temporaryProject, { recursive: true, force: true });
});

describe('detail language navigation and metadata', () => {
  it('sends an unpaired Article switch to the collection without claiming an SEO translation', async () => {
    const html = await output('articles/unpaired-detail-test/index.html');

    expect(html).not.toContain('<link rel="alternate" hreflang="en"');
    expect(html).toContain('class="language-switch" href="/en/articles/"');
    expect(html).toContain('内容语言：中文');
    expect(html).toContain('href="/tags/test/"');
  });

  it('links a published Article pair directly with reciprocal SEO alternates', async () => {
    const chinese = await output('articles/paired-detail-test/index.html');
    const english = await output('en/articles/paired-detail-test-en/index.html');

    expect(chinese).toContain('hreflang="en" href="https://starkye.com/en/articles/paired-detail-test-en/"');
    expect(chinese).toContain('class="language-switch" href="/en/articles/paired-detail-test-en/"');
    expect(english).toContain('hreflang="zh-CN" href="https://starkye.com/articles/paired-detail-test/"');
    expect(english).toContain('class="language-switch" href="/articles/paired-detail-test/"');
    expect(english).toContain('Content language: English');
  });

  it('emits explicit legacy redirects for published Article ids', async () => {
    const html = await output('thoughts/paired-detail-test/index.html');
    expect(html).toContain('http-equiv="refresh"');
    expect(html).toContain('/articles/paired-detail-test/');
  });

  it('sends an unpaired Project switch to the collection without claiming an SEO translation', async () => {
    const html = await output('en/projects/unpaired-project-test-en/index.html');

    expect(html).not.toContain('<link rel="alternate" hreflang="zh-CN"');
    expect(html).toContain('class="language-switch" href="/projects/"');
    expect(html).toContain('Content language: English');
  });

  it('links a published Project pair directly with reciprocal SEO alternates', async () => {
    const chinese = await output('projects/paired-project-test/index.html');
    const english = await output('en/projects/paired-project-test-en/index.html');

    expect(chinese).toContain('hreflang="en" href="https://starkye.com/en/projects/paired-project-test-en/"');
    expect(chinese).toContain('class="language-switch" href="/en/projects/paired-project-test-en/"');
    expect(english).toContain('hreflang="zh-CN" href="https://starkye.com/projects/paired-project-test/"');
    expect(english).toContain('class="language-switch" href="/projects/paired-project-test/"');
  });
});
