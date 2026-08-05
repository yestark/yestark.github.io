import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
const projectFiles = ['astro.config.mjs', 'package.json', 'package-lock.json', 'public', 'src', 'tsconfig.json'];
let temporaryProject: string;

async function linkDependencies(): Promise<void> {
  const source = join(projectRoot, 'node_modules');
  const destination = join(temporaryProject, 'node_modules');
  await mkdir(destination);
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (entry.name === '.astro' || entry.name === '.vite') continue;
    await symlink(join(source, entry.name), join(destination, entry.name));
  }
}

async function output(relativePath: string): Promise<string> {
  return readFile(join(temporaryProject, 'dist', relativePath), 'utf8');
}

beforeAll(async () => {
  temporaryProject = await mkdtemp(join(tmpdir(), 'stark-ye-tag-fixtures-'));
  await Promise.all(projectFiles.map((path) => cp(join(projectRoot, path), join(temporaryProject, path), { recursive: true })));
  await linkDependencies();
  await writeFile(join(temporaryProject, 'src/content/articles/tagged-article.md'), `---
title: Tagged article
description: Article found through AI.
publishedAt: 2026-08-05
tags: [AI]
language: zh
draft: false
---
Fixture.
`);
  await writeFile(join(temporaryProject, 'src/content/projects/tagged-project.md'), `---
title: Tagged project
summary: Project found through AI.
publishedAt: 2026-08-06
tags: [ai, Full Stack]
language: zh
featured: true
draft: false
---
Fixture.
`);
  execFileSync(process.execPath, [join(projectRoot, 'node_modules/astro/bin/astro.mjs'), 'build'], {
    cwd: temporaryProject,
    stdio: 'pipe',
  });
});

afterAll(async () => {
  if (temporaryProject) await rm(temporaryProject, { recursive: true, force: true });
});

describe('Tag and Archive artifacts', () => {
  it('publishes a Tag detail page containing Articles and Projects', async () => {
    const html = await output('tags/ai/index.html');
    expect(html).toContain('AI');
    expect(html).toContain('/articles/tagged-article/');
    expect(html).toContain('/projects/tagged-project/');
  });

  it('adds normalized type and Tag data to the unified Archive', async () => {
    const html = await output('archive/index.html');
    expect(html).toContain('data-type="article"');
    expect(html).toContain('data-type="project"');
    expect(html).toContain('data-tags="ai,full-stack"');
  });
});
