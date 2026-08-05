# Stark Ye Personal Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify a bilingual Astro personal website for Stark Ye that publishes local Markdown through GitHub Actions to GitHub Pages at `starkye.com`.

**Architecture:** Astro generates a fully static site from focused page components, centralized bilingual copy, and typed Thoughts and Projects content collections. Unit tests cover routing and content helpers, Playwright covers rendered behavior and accessibility, and artifact tests gate GitHub Pages deployment.

**Tech Stack:** Node.js 24 LTS, npm, Astro, TypeScript, native scoped CSS, Astro Content Collections, Vitest, Playwright, GitHub Actions, GitHub Pages

## Global Constraints

- Use Node.js 24 LTS; `.nvmrc` is `24` and `package.json` requires `>=24 <25`.
- Use `Stark Ye` as the public name, `SY` as the monogram, and `yehanchen714@gmail.com` as the only public contact.
- Use `https://starkye.com` as the canonical site URL and store `starkye.com` in `public/CNAME`.
- Use native CSS and Astro component-scoped styles; do not add Tailwind or a client UI framework.
- Default to Chinese. Home, About, Thoughts index, Projects index, and Contact must have `/en/` counterparts.
- Store Thoughts and Projects as local Markdown content collections; do not add a CMS, database, API, form, comments, search, or analytics.
- Do not migrate the old Hexo `hello-world` post or create fictional public articles/projects.
- Keep `/Users/hanchenye/blog/blog/` unchanged.
- Homepage order is Header → Hero → Thoughts → Projects → Contact → Mini About → Footer.
- Mini About stays at the bottom and remains visually smaller than the content sections.
- Base colors are page `#F5F8FF`, text `#101727`, and accent `#4E5CF6`.
- A failed check or build must prevent deployment.

---

## Planned File Structure

```text
.
├── .github/workflows/deploy.yml       # Verify, build, and deploy GitHub Pages
├── .gitignore                         # Generated files and visual companion output
├── .nvmrc                             # Node 24 pin
├── README.md                          # Local development and content authoring
├── astro.config.mjs                   # Canonical URL, sitemap, directory output
├── package.json                       # npm scripts and dependency boundary
├── playwright.config.ts               # Production-preview browser tests
├── tsconfig.json                      # Astro strict TypeScript settings
├── vitest.config.ts                   # Unit-test configuration
├── public/
│   ├── CNAME                          # starkye.com
│   ├── favicon.svg                    # SY brand mark
│   └── robots.txt                     # Crawler policy and sitemap URL
├── src/
│   ├── components/
│   │   ├── common/                    # EmptyState and CopyEmail
│   │   ├── home/                      # Hero, previews, ContactCTA, MiniAbout
│   │   └── shell/                     # Header, LanguageSwitch, Footer
│   ├── config/site.ts                 # Identity, URL, email, navigation keys
│   ├── content/
│   │   ├── projects/.gitkeep          # Empty until real projects are ready
│   │   └── thoughts/.gitkeep          # Empty until real posts are ready
│   ├── content.config.ts              # Zod schemas and glob loaders
│   ├── i18n/
│   │   ├── translations.ts            # Exact Chinese and English UI copy
│   │   └── types.ts                   # Language and translation types
│   ├── layouts/
│   │   ├── BaseLayout.astro           # Document shell and metadata
│   │   └── ContentLayout.astro        # Markdown article/project typography
│   ├── lib/
│   │   ├── content.ts                 # Published-entry queries and translations
│   │   └── routes.ts                  # Localized and content URL generation
│   ├── pages/
│   │   ├── en/                        # English common pages and content routes
│   │   ├── projects/                  # Chinese project index/detail
│   │   ├── thoughts/                  # Chinese thought index/detail
│   │   ├── 404.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── index.astro
│   │   └── rss.xml.ts
│   └── styles/global.css              # Tokens, reset, typography, utilities
└── tests/
    ├── dist/artifacts.test.ts         # Built-output and link checks
    ├── e2e/                           # Route, behavior, responsive, a11y tests
    └── unit/                          # Route and content helper tests
```

File boundaries are intentional: configuration owns stable identity data; translations own copy; `lib` owns pure URL/content logic; components only render passed data; pages only query and compose.

---

### Task 1: Bootstrap the Astro Toolchain

**Files:**
- Create: `.gitignore`
- Create: `.nvmrc`
- Create: `package.json`
- Create: `package-lock.json` (generated by npm)
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/env.d.ts`
- Create: `src/pages/index.astro`
- Create: `tests/e2e/bootstrap.spec.ts`

**Interfaces:**
- Consumes: Node.js 24.11.1 or another Node.js 24 LTS release.
- Produces: npm scripts `dev`, `build`, `preview`, `check`, `test:unit`, `test:e2e`, `test:dist`, and `verify`; Astro site URL `https://starkye.com`.

- [ ] **Step 1: Add the repository and runtime configuration**

Create `.gitignore`:

```gitignore
node_modules/
dist/
.astro/
.DS_Store
.superpowers/
playwright-report/
test-results/
coverage/
```

Create `.nvmrc`:

```text
24
```

Create `package.json`:

```json
{
  "name": "stark-ye-personal-website",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=24 <25"
  },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test:unit": "vitest run tests/unit",
    "test:e2e": "npm run build && playwright test",
    "test:dist": "npm run build && vitest run tests/dist",
    "verify": "npm run check && npm run test:unit && npm run test:dist && npm run test:e2e"
  }
}
```

- [ ] **Step 2: Install the verified static-site and test dependencies**

Run:

```bash
npm install astro@latest @astrojs/check@latest @astrojs/rss@latest @astrojs/sitemap@latest typescript@latest
npm install --save-dev vitest@latest @playwright/test@latest @axe-core/playwright@latest @types/node@latest
npx playwright install chromium
```

Expected: `package-lock.json` is created; npm exits successfully; Chromium is installed for Playwright.

- [ ] **Step 3: Add strict Astro, Vitest, and Playwright configuration**

Create `astro.config.mjs`:

```js
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://starkye.com',
  build: { format: 'directory' },
  integrations: [sitemap()],
});
```

Create `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strictest",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

Create `src/env.d.ts`:

```ts
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
```

Create `vitest.config.ts`:

```ts
/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'node',
    passWithNoTests: false,
  },
});
```

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4321',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 4: Write the failing browser smoke test**

Create `tests/e2e/bootstrap.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('serves the Stark Ye homepage in Chinese', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Stark Ye/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByText(/Stark Ye/).first()).toBeVisible();
});
```

- [ ] **Step 5: Run the smoke test and confirm it fails**

Run:

```bash
npm run test:e2e -- tests/e2e/bootstrap.spec.ts
```

Expected: FAIL because the homepage has not been implemented.

- [ ] **Step 6: Add the smallest branded homepage shell**

Create `src/pages/index.astro`:

```astro
---
const title = 'Stark Ye — AI & Full-stack Builder';
---

<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title}</title>
  </head>
  <body>
    <main><h1>Stark Ye</h1></main>
  </body>
</html>
```

- [ ] **Step 7: Verify the foundation**

Run:

```bash
npm run check
npm run test:e2e -- tests/e2e/bootstrap.spec.ts
```

Expected: both commands PASS.

- [ ] **Step 8: Commit the foundation**

```bash
git add .gitignore .nvmrc package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts playwright.config.ts src/env.d.ts src/pages/index.astro tests/e2e/bootstrap.spec.ts
git commit -m "chore: bootstrap Astro personal site"
```

---

### Task 2: Add Site Configuration, Localization, and Content Contracts

**Files:**
- Create: `src/config/site.ts`
- Create: `src/i18n/types.ts`
- Create: `src/i18n/translations.ts`
- Create: `src/lib/routes.ts`
- Create: `src/lib/content.ts`
- Create: `src/content.config.ts`
- Create: `src/content/thoughts/.gitkeep`
- Create: `src/content/projects/.gitkeep`
- Create: `tests/unit/routes.test.ts`
- Create: `tests/unit/content.test.ts`

**Interfaces:**
- Consumes: Astro Content Collections and canonical URL from Task 1.
- Produces: `Language`, `StaticPage`, `LocalizedEntry`, `localizedPath()`, `entryPath()`, `findTranslation()`, `getPublishedThoughts()`, and `getPublishedProjects()`.

- [ ] **Step 1: Write failing route and translation tests**

Create `tests/unit/routes.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { entryPath, localizedPath } from '../../src/lib/routes';

describe('localizedPath', () => {
  it('uses root routes for Chinese and /en routes for English', () => {
    expect(localizedPath('home', 'zh')).toBe('/');
    expect(localizedPath('about', 'zh')).toBe('/about/');
    expect(localizedPath('about', 'en')).toBe('/en/about/');
    expect(localizedPath('thoughts', 'en')).toBe('/en/thoughts/');
  });
});

describe('entryPath', () => {
  it('places English entries below /en and Chinese entries at root', () => {
    expect(entryPath('thoughts', { id: 'hello', data: { language: 'zh' } })).toBe('/thoughts/hello/');
    expect(entryPath('projects', { id: 'agent-lab', data: { language: 'en' } })).toBe('/en/projects/agent-lab/');
  });
});
```

Create `tests/unit/content.test.ts`:

```ts
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
    expect(findTranslation(entries, entries[0], 'en')?.id).toBe('newer');
    expect(findTranslation(entries, entries[2], 'en')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the unit tests and confirm they fail**

Run:

```bash
npm run test:unit
```

Expected: FAIL because the route and content modules do not exist.

- [ ] **Step 3: Define identity, language types, and exact shared copy**

Create `src/i18n/types.ts`:

```ts
export type Language = 'zh' | 'en';
export type StaticPage = 'home' | 'about' | 'thoughts' | 'projects' | 'contact';
```

Create `src/config/site.ts`:

```ts
import type { Language, StaticPage } from '../i18n/types';

export const siteConfig = {
  name: 'Stark Ye',
  monogram: 'SY',
  email: 'yehanchen714@gmail.com',
  siteUrl: 'https://starkye.com',
  defaultLanguage: 'zh' as Language,
  languages: ['zh', 'en'] as const,
  navigation: ['home', 'about', 'thoughts', 'projects', 'contact'] as StaticPage[],
} as const;
```

Create `src/i18n/translations.ts` with these required keys and copy:

```ts
import type { Language, StaticPage } from './types';

type Dictionary = {
  locale: string;
  nav: Record<StaticPage, string>;
  hero: { status: string; intro: string; title: string; body: string; thoughtsCta: string; aboutCta: string };
  thoughts: { eyebrow: string; title: string; emptyTitle: string; emptyBody: string; all: string };
  projects: { eyebrow: string; title: string; emptyTitle: string; emptyBody: string; all: string };
  contact: { eyebrow: string; title: string; body: string; email: string; copy: string; copied: string; copyFailed: string };
  about: { eyebrow: string; title: string; body: string; link: string };
  footer: string;
};

export const translations: Record<Language, Dictionary> = {
  zh: {
    locale: 'zh-CN',
    nav: { home: '首页', about: '关于', thoughts: '想法', projects: '项目', contact: '联系' },
    hero: {
      status: '开放合作',
      intro: 'Hi, I’m Stark Ye.',
      title: 'I build useful AI experiences, end to end.',
      body: '关注 AI 与全栈产品，把新技术变成可用、可信、能够进入真实工作流的产品，也记录其中的判断与思考。',
      thoughtsCta: '阅读我的想法',
      aboutCta: '了解我',
    },
    thoughts: { eyebrow: 'Thoughts', title: '最近的想法', emptyTitle: '文章正在写作中', emptyBody: '这里将记录关于 AI、软件与个人思考的内容。', all: '查看全部' },
    projects: { eyebrow: 'Projects', title: '项目档案', emptyTitle: '正在整理代表项目', emptyBody: '真实案例准备完成后会在这里发布。', all: '查看项目' },
    contact: { eyebrow: 'Contact', title: '有值得一起构建的想法？', body: '欢迎围绕 AI、全栈产品或长期合作联系我。', email: '发邮件', copy: '复制邮箱', copied: '邮箱已复制', copyFailed: '请手动复制邮箱地址' },
    about: { eyebrow: 'About Stark Ye', title: '在技术能力和产品判断之间，做真正有用的东西。', body: 'AI 与全栈产品构建者，关注技术如何进入真实工作流。', link: '更多关于我' },
    footer: 'Built with intention',
  },
  en: {
    locale: 'en',
    nav: { home: 'Home', about: 'About', thoughts: 'Thoughts', projects: 'Projects', contact: 'Contact' },
    hero: {
      status: 'Open to collaborate',
      intro: 'Hi, I’m Stark Ye.',
      title: 'I build useful AI experiences, end to end.',
      body: 'I turn emerging technology into useful, dependable products that fit real workflows—and write about the judgment behind the work.',
      thoughtsCta: 'Read my thoughts',
      aboutCta: 'About me',
    },
    thoughts: { eyebrow: 'Thoughts', title: 'Recent thoughts', emptyTitle: 'Notes in progress', emptyBody: 'Writing about AI, software, and ideas worth keeping.', all: 'View all' },
    projects: { eyebrow: 'Projects', title: 'Selected work', emptyTitle: 'Case studies in progress', emptyBody: 'Real project stories will appear here when they are ready.', all: 'View projects' },
    contact: { eyebrow: 'Contact', title: 'Have something worth building together?', body: 'Reach out about AI, full-stack products, or long-term collaboration.', email: 'Send email', copy: 'Copy email', copied: 'Email copied', copyFailed: 'Please copy the address manually' },
    about: { eyebrow: 'About Stark Ye', title: 'Building useful things where engineering meets product judgment.', body: 'An AI and full-stack product builder focused on technology that fits real workflows.', link: 'More about me' },
    footer: 'Built with intention',
  },
};
```

- [ ] **Step 4: Implement localized route helpers**

Create `src/lib/routes.ts`:

```ts
import type { Language, StaticPage } from '../i18n/types';

const segments: Record<StaticPage, string> = {
  home: '',
  about: 'about',
  thoughts: 'thoughts',
  projects: 'projects',
  contact: 'contact',
};

export function localizedPath(page: StaticPage, language: Language): string {
  const prefix = language === 'en' ? '/en' : '';
  const segment = segments[page];
  return segment ? `${prefix}/${segment}/` : `${prefix || ''}/`;
}

export type ContentSection = 'thoughts' | 'projects';

export function entryPath(
  section: ContentSection,
  entry: { id: string; data: { language: Language } },
): string {
  const prefix = entry.data.language === 'en' ? '/en' : '';
  return `${prefix}/${section}/${entry.id}/`;
}
```

- [ ] **Step 5: Define the content collection schemas**

Create `src/content.config.ts`:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const shared = {
  title: z.string().min(1),
  publishedAt: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  language: z.enum(['zh', 'en']),
  draft: z.boolean().default(false),
  translationKey: z.string().min(1).optional(),
};

const thoughts = defineCollection({
  loader: glob({ base: './src/content/thoughts', pattern: '**/*.md' }),
  schema: z.object({
    ...shared,
    description: z.string().min(1),
    updatedAt: z.coerce.date().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: z.object({
    ...shared,
    summary: z.string().min(1),
    featured: z.boolean().default(false),
    links: z.array(z.object({ label: z.string().min(1), url: z.string().url() })).default([]),
  }),
});

export const collections = { thoughts, projects };
```

Create empty `src/content/thoughts/.gitkeep` and `src/content/projects/.gitkeep` files. They are ignored by the `**/*.md` loaders.

- [ ] **Step 6: Implement published-entry and translation helpers**

Create `src/lib/content.ts`:

```ts
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Language } from '../i18n/types';

export interface LocalizedEntry {
  id: string;
  data: {
    language: Language;
    translationKey?: string;
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
```

- [ ] **Step 7: Run schema, type, and unit verification**

Run:

```bash
npm run test:unit
npm run check
```

Expected: both commands PASS; empty content directories are accepted.

- [ ] **Step 8: Commit the data contracts**

```bash
git add src/config src/i18n src/lib src/content.config.ts src/content/thoughts/.gitkeep src/content/projects/.gitkeep tests/unit
git commit -m "feat: define localized content contracts"
```

---

### Task 3: Build the Shared Document Shell and Navigation

**Files:**
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/shell/Header.astro`
- Create: `src/components/shell/LanguageSwitch.astro`
- Create: `src/components/shell/Footer.astro`
- Modify: `src/pages/index.astro`
- Create: `src/pages/en/index.astro`
- Create: `tests/e2e/shell.spec.ts`

**Interfaces:**
- Consumes: `siteConfig`, `translations`, `localizedPath()` from Task 2.
- Produces: `BaseLayout` props `{ language, page, title, description, alternateHref? }`; consistent header/footer and language navigation for every later page.

- [ ] **Step 1: Write failing shell tests**

Create `tests/e2e/shell.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('Chinese shell exposes all primary destinations and English alternate', async ({ page }) => {
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: '主导航' });
  await expect(navigation.getByRole('link')).toHaveCount(6);
  await expect(navigation.getByRole('link', { name: '想法' })).toHaveAttribute('href', '/thoughts/');
  await expect(navigation.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/en/');
  await expect(page.locator('footer')).toContainText('Stark Ye');
});

test('English shell links back to Chinese', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('navigation', { name: 'Primary navigation' }))
    .toContainText('Thoughts');
  await expect(page.getByRole('link', { name: '中文' })).toHaveAttribute('href', '/');
});
```

- [ ] **Step 2: Run the shell tests and confirm they fail**

Run:

```bash
npm run test:e2e -- tests/e2e/shell.spec.ts
```

Expected: FAIL because shared shell components and `/en/` do not exist.

- [ ] **Step 3: Add global tokens, reset, focus, and reduced-motion rules**

Create `src/styles/global.css` with this minimum foundation:

```css
:root {
  color-scheme: light;
  --color-page: #f5f8ff;
  --color-surface: #ffffff;
  --color-ink: #101727;
  --color-muted: #667187;
  --color-line: #dfe5ef;
  --color-accent: #4e5cf6;
  --color-accent-soft: #e8ebff;
  --radius-sm: 0.625rem;
  --radius-md: 1rem;
  --radius-lg: 1.5rem;
  --content-width: 70rem;
  --reading-width: 45rem;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: var(--color-page);
  color: var(--color-ink);
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; min-width: 20rem; background: var(--color-page); }
a { color: inherit; text-decoration: none; }
button, input, textarea, select { font: inherit; }
:focus-visible { outline: 0.1875rem solid var(--color-accent); outline-offset: 0.1875rem; }
.shell { width: min(var(--content-width), calc(100% - 2rem)); margin-inline: auto; }
.eyebrow { color: var(--color-accent); font-size: 0.75rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; }
.skip-link { position: fixed; left: 1rem; top: -4rem; z-index: 100; padding: 0.75rem 1rem; background: var(--color-ink); color: white; }
.skip-link:focus { top: 1rem; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
```

Add component-specific responsive rules inside each `.astro` component rather than expanding `global.css` into a page stylesheet.

- [ ] **Step 4: Implement the language switch, header, and footer**

Create `src/components/shell/LanguageSwitch.astro`:

```astro
---
import type { Language } from '../../i18n/types';

interface Props { currentLanguage: Language; alternateHref: string }
const { currentLanguage, alternateHref } = Astro.props;
const label = currentLanguage === 'zh' ? 'English' : '中文';
---

<a class="language-switch" href={alternateHref} hreflang={currentLanguage === 'zh' ? 'en' : 'zh-CN'}>
  {label}
</a>
```

Create `src/components/shell/Header.astro`:

```astro
---
import { siteConfig } from '../../config/site';
import { translations } from '../../i18n/translations';
import type { Language, StaticPage } from '../../i18n/types';
import { localizedPath } from '../../lib/routes';
import LanguageSwitch from './LanguageSwitch.astro';

interface Props { language: Language; currentPage: StaticPage; alternateHref: string }
const { language, currentPage, alternateHref } = Astro.props;
const t = translations[language];
---

<header class="site-header">
  <div class="shell header-inner">
    <a class="monogram" href={localizedPath('home', language)} aria-label={`${siteConfig.name} home`}>{siteConfig.monogram}</a>
    <nav aria-label={language === 'zh' ? '主导航' : 'Primary navigation'}>
      <ul>
        {siteConfig.navigation.map((page) => (
          <li><a href={localizedPath(page, language)} aria-current={page === currentPage ? 'page' : undefined}>{t.nav[page]}</a></li>
        ))}
        <li><LanguageSwitch currentLanguage={language} alternateHref={alternateHref} /></li>
      </ul>
    </nav>
  </div>
</header>
```

Create `src/components/shell/Footer.astro`:

```astro
---
import { siteConfig } from '../../config/site';
import { translations } from '../../i18n/translations';
import type { Language } from '../../i18n/types';
const { language } = Astro.props as { language: Language };
---

<footer>
  <div class="shell footer-inner">
    <span>© {new Date().getFullYear()} {siteConfig.name}</span>
    <span>{translations[language].footer}</span>
  </div>
</footer>
```

Add scoped CSS so the header is transparent, the `SY` monogram is a 2.25rem dark rounded square, navigation collapses to Home/Thoughts/language on narrow screens, and the footer uses a subtle top border.

- [ ] **Step 5: Implement BaseLayout with canonical and alternate metadata**

Create `src/layouts/BaseLayout.astro`:

```astro
---
import Header from '../components/shell/Header.astro';
import Footer from '../components/shell/Footer.astro';
import { siteConfig } from '../config/site';
import { translations } from '../i18n/translations';
import type { Language, StaticPage } from '../i18n/types';
import '../styles/global.css';

interface Props {
  language: Language;
  page: StaticPage;
  title: string;
  description: string;
  alternateHref: string;
}

const { language, page, title, description, alternateHref } = Astro.props;
const canonical = new URL(Astro.url.pathname, siteConfig.siteUrl);
const alternateLanguage = language === 'zh' ? 'en' : 'zh-CN';
---

<!doctype html>
<html lang={translations[language].locale}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <meta name="description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <link rel="canonical" href={canonical} />
    <link rel="alternate" hreflang={alternateLanguage} href={new URL(alternateHref, siteConfig.siteUrl)} />
    <link rel="alternate" type="application/rss+xml" title="Stark Ye Thoughts" href="/rss.xml" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <title>{title}</title>
  </head>
  <body>
    <a class="skip-link" href="#main-content">{language === 'zh' ? '跳到主要内容' : 'Skip to content'}</a>
    <Header language={language} currentPage={page} alternateHref={alternateHref} />
    <main id="main-content" tabindex="-1"><slot /></main>
    <Footer language={language} />
  </body>
</html>
```

- [ ] **Step 6: Compose temporary Chinese and English pages through BaseLayout**

Replace `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { translations } from '../i18n/translations';
const t = translations.zh;
---
<BaseLayout language="zh" page="home" title="Stark Ye — AI 与全栈产品构建者" description={t.hero.body} alternateHref="/en/">
  <section class="shell"><h1>Stark Ye</h1></section>
</BaseLayout>
```

Create `src/pages/en/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { translations } from '../../i18n/translations';
const t = translations.en;
---
<BaseLayout language="en" page="home" title="Stark Ye — AI & Full-stack Builder" description={t.hero.body} alternateHref="/">
  <section class="shell"><h1>Stark Ye</h1></section>
</BaseLayout>
```

- [ ] **Step 7: Verify shell behavior**

Run:

```bash
npm run check
npm run test:e2e -- tests/e2e/bootstrap.spec.ts tests/e2e/shell.spec.ts
```

Expected: all checks PASS.

- [ ] **Step 8: Commit the shared shell**

```bash
git add src/styles src/layouts src/components/shell src/pages/index.astro src/pages/en/index.astro tests/e2e/shell.spec.ts
git commit -m "feat: add bilingual site shell"
```

---

### Task 4: Implement the Creative Studio Homepage

**Files:**
- Create: `src/components/common/EmptyState.astro`
- Create: `src/components/home/Hero.astro`
- Create: `src/components/home/ThoughtsPreview.astro`
- Create: `src/components/home/ProjectsPreview.astro`
- Create: `src/components/home/ContactCTA.astro`
- Create: `src/components/home/MiniAbout.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/en/index.astro`
- Create: `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: translation dictionaries, `getPublishedThoughts(language)`, and `getPublishedProjects(language)`.
- Produces: homepage sections with stable `data-section` values `hero`, `thoughts`, `projects`, `contact`, and `mini-about`.

- [ ] **Step 1: Write failing homepage structure and empty-state tests**

Create `tests/e2e/home.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

for (const route of ['/', '/en/']) {
  test(`${route} preserves the approved homepage order`, async ({ page }) => {
    await page.goto(route);
    const order = await page.locator('main [data-section]').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-section')),
    );
    expect(order).toEqual(['hero', 'thoughts', 'projects', 'contact', 'mini-about']);
  });
}

test('homepage is honest when no public content exists', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('文章正在写作中')).toBeVisible();
  await expect(page.getByText('正在整理代表项目')).toBeVisible();
  await expect(page.locator('[data-content-card]')).toHaveCount(0);
});

test('mini about remains below contact and visually compact', async ({ page }) => {
  await page.goto('/');
  const contactBox = await page.locator('[data-section="contact"]').boundingBox();
  const aboutBox = await page.locator('[data-section="mini-about"]').boundingBox();
  expect(aboutBox!.y).toBeGreaterThan(contactBox!.y);
  expect(aboutBox!.height).toBeLessThan(contactBox!.height);
});
```

- [ ] **Step 2: Run the homepage tests and confirm they fail**

Run:

```bash
npm run test:e2e -- tests/e2e/home.spec.ts
```

Expected: FAIL because the approved sections do not exist.

- [ ] **Step 3: Implement the reusable empty state and Hero**

Create `src/components/common/EmptyState.astro`:

```astro
---
interface Props { title: string; body: string; marker?: string }
const { title, body, marker = '✦' } = Astro.props;
---
<div class="empty-state" data-empty-state>
  <span aria-hidden="true">{marker}</span>
  <div><h3>{title}</h3><p>{body}</p></div>
</div>
```

Create `src/components/home/Hero.astro` with props `{ language, copy }`, `data-section="hero"`, and these elements:

```astro
---
import { translations } from '../../i18n/translations';
import type { Language } from '../../i18n/types';
import { localizedPath } from '../../lib/routes';
interface Props {
  language: Language;
  copy: typeof translations.zh.hero | typeof translations.en.hero;
}
const { language, copy } = Astro.props;
---
<section class="hero shell" data-section="hero">
  <div class="hero-glow" aria-hidden="true"></div>
  <p class="status"><span aria-hidden="true"></span>{copy.status}</p>
  <p class="intro">{copy.intro}</p>
  <h1>{copy.title}</h1>
  <p class="hero-body">{copy.body}</p>
  <div class="hero-actions">
    <a class="button primary" href={localizedPath('thoughts', language)}>{copy.thoughtsCta}</a>
    <a class="button secondary" href={localizedPath('about', language)}>{copy.aboutCta}</a>
  </div>
  <aside aria-label={language === 'zh' ? '当前关注' : 'Current focus'}>
    <span>AI-native products</span><span>Full-stack systems</span><span>Ideas worth keeping</span>
  </aside>
</section>
```

Scoped CSS must implement the approved large heading, blue-purple glow, dark primary button, and a one-column layout below 48rem.

- [ ] **Step 4: Implement Thoughts and Projects previews without fictional cards**

Create `src/components/home/ThoughtsPreview.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content';
import EmptyState from '../common/EmptyState.astro';
import { translations } from '../../i18n/translations';
import type { Language } from '../../i18n/types';
import { entryPath, localizedPath } from '../../lib/routes';
interface Props { language: Language; entries: CollectionEntry<'thoughts'>[] }
const { language, entries } = Astro.props;
const copy = translations[language].thoughts;
---
<section class="content-section shell" data-section="thoughts">
  <header><p class="eyebrow">{copy.eyebrow}</p><h2>{copy.title}</h2><a href={localizedPath('thoughts', language)}>{copy.all} →</a></header>
  {entries.length === 0 ? (
    <EmptyState title={copy.emptyTitle} body={copy.emptyBody} />
  ) : (
    <div class="card-grid">
      {entries.slice(0, 3).map((entry) => (
        <article data-content-card>
          <p><time datetime={entry.data.publishedAt.toISOString()}>{entry.data.publishedAt.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en')}</time> · {entry.data.language.toUpperCase()}</p>
          <h3><a href={entryPath('thoughts', entry)}>{entry.data.title}</a></h3>
          <p>{entry.data.description}</p>
        </article>
      ))}
    </div>
  )}
</section>
```

Create `src/components/home/ProjectsPreview.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content';
import EmptyState from '../common/EmptyState.astro';
import { translations } from '../../i18n/translations';
import type { Language } from '../../i18n/types';
import { entryPath, localizedPath } from '../../lib/routes';
interface Props { language: Language; entries: CollectionEntry<'projects'>[] }
const { language, entries } = Astro.props;
const copy = translations[language].projects;
const ordered = entries.toSorted((left, right) => Number(right.data.featured) - Number(left.data.featured));
---
<section class="content-section shell" data-section="projects">
  <header><p class="eyebrow">{copy.eyebrow}</p><h2>{copy.title}</h2><a href={localizedPath('projects', language)}>{copy.all} →</a></header>
  {ordered.length === 0 ? (
    <EmptyState title={copy.emptyTitle} body={copy.emptyBody} />
  ) : (
    <div class="card-grid">
      {ordered.slice(0, 2).map((entry) => (
        <article data-content-card>
          <p>{entry.data.featured ? 'Featured' : 'Project'} · {entry.data.language.toUpperCase()}</p>
          <h3><a href={entryPath('projects', entry)}>{entry.data.title}</a></h3>
          <p>{entry.data.summary}</p>
        </article>
      ))}
    </div>
  )}
</section>
```

Add matching scoped grid/card styles to both preview files: one column on narrow screens, two columns from 48rem, white surfaces, `1px` line borders, and rounded corners.

- [ ] **Step 5: Implement ContactCTA and compact bottom MiniAbout**

Create `src/components/home/ContactCTA.astro`:

```astro
---
import { siteConfig } from '../../config/site';
import { translations } from '../../i18n/translations';
import type { Language } from '../../i18n/types';
const { language } = Astro.props as { language: Language };
const copy = translations[language].contact;
---
<section class="contact-section shell" data-section="contact">
  <div><p class="eyebrow">{copy.eyebrow}</p><h2>{copy.title}</h2><p>{copy.body}</p></div>
  <a class="button" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
</section>
```

Create `src/components/home/MiniAbout.astro`:

```astro
---
import { siteConfig } from '../../config/site';
import { translations } from '../../i18n/translations';
import type { Language } from '../../i18n/types';
import { localizedPath } from '../../lib/routes';
const { language } = Astro.props as { language: Language };
const copy = translations[language].about;
---
<aside class="mini-about shell" data-section="mini-about">
  <span class="mini-monogram" aria-hidden="true">{siteConfig.monogram}</span>
  <div><strong>{copy.eyebrow}</strong><p>{copy.body}</p></div>
  <a href={localizedPath('about', language)}>{copy.link} →</a>
</aside>
```

Style Contact as the approved accent surface. Style Mini About with at most `1.5rem` vertical padding, a `2.5rem` monogram, no full-viewport height, and a single row that wraps cleanly on mobile.

- [ ] **Step 6: Compose both homepages from real queries**

In `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/home/Hero.astro';
import ThoughtsPreview from '../components/home/ThoughtsPreview.astro';
import ProjectsPreview from '../components/home/ProjectsPreview.astro';
import ContactCTA from '../components/home/ContactCTA.astro';
import MiniAbout from '../components/home/MiniAbout.astro';
import { translations } from '../i18n/translations';
import { getPublishedProjects, getPublishedThoughts } from '../lib/content';

const language = 'zh';
const t = translations[language];
const thoughts = (await getPublishedThoughts(language)).slice(0, 3);
const projects = (await getPublishedProjects(language)).toSorted((a, b) => Number(b.data.featured) - Number(a.data.featured)).slice(0, 2);
---
<BaseLayout language={language} page="home" title="Stark Ye — AI 与全栈产品构建者" description={t.hero.body} alternateHref="/en/">
  <Hero language={language} copy={t.hero} />
  <ThoughtsPreview language={language} entries={thoughts} />
  <ProjectsPreview language={language} entries={projects} />
  <ContactCTA language={language} />
  <MiniAbout language={language} />
</BaseLayout>
```

Replace `src/pages/en/index.astro` with:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Hero from '../../components/home/Hero.astro';
import ThoughtsPreview from '../../components/home/ThoughtsPreview.astro';
import ProjectsPreview from '../../components/home/ProjectsPreview.astro';
import ContactCTA from '../../components/home/ContactCTA.astro';
import MiniAbout from '../../components/home/MiniAbout.astro';
import { translations } from '../../i18n/translations';
import { getPublishedProjects, getPublishedThoughts } from '../../lib/content';

const language = 'en';
const t = translations[language];
const thoughts = (await getPublishedThoughts(language)).slice(0, 3);
const projects = (await getPublishedProjects(language)).toSorted((a, b) => Number(b.data.featured) - Number(a.data.featured)).slice(0, 2);
---
<BaseLayout language={language} page="home" title="Stark Ye — AI & Full-stack Builder" description={t.hero.body} alternateHref="/">
  <Hero language={language} copy={t.hero} />
  <ThoughtsPreview language={language} entries={thoughts} />
  <ProjectsPreview language={language} entries={projects} />
  <ContactCTA language={language} />
  <MiniAbout language={language} />
</BaseLayout>
```

- [ ] **Step 7: Verify the homepage**

Run:

```bash
npm run check
npm run test:e2e -- tests/e2e/bootstrap.spec.ts tests/e2e/shell.spec.ts tests/e2e/home.spec.ts
```

Expected: all checks PASS at desktop viewport.

- [ ] **Step 8: Commit the homepage**

```bash
git add src/components/common src/components/home src/pages/index.astro src/pages/en/index.astro tests/e2e/home.spec.ts
git commit -m "feat: build Creative Studio homepage"
```

---

### Task 5: Implement Markdown Thoughts, Translation Routing, and RSS

**Files:**
- Modify: `src/lib/content.ts`
- Create: `src/layouts/ContentLayout.astro`
- Create: `src/components/common/ThoughtCard.astro`
- Create: `src/pages/thoughts/index.astro`
- Create: `src/pages/thoughts/[...id].astro`
- Create: `src/pages/en/thoughts/index.astro`
- Create: `src/pages/en/thoughts/[...id].astro`
- Create: `src/pages/rss.xml.ts`
- Modify: `tests/unit/content.test.ts`
- Create: `tests/e2e/thoughts.spec.ts`

**Interfaces:**
- Consumes: Thoughts collection schema, `entryPath()`, `localizedPath()`, shared shell.
- Produces: `buildContentPaths(entries, language)`, bilingual Thoughts indexes, language-aware detail routes, and `/rss.xml`.

- [ ] **Step 1: Add failing static-path tests**

Append to `tests/unit/content.test.ts`:

```ts
import { buildContentPaths } from '../../src/lib/content';

describe('buildContentPaths', () => {
  it('returns only public entries for the requested language', () => {
    const paths = buildContentPaths(entries, 'zh');
    expect(paths).toEqual([{ params: { id: 'older' }, props: { entry: entries[0] } }]);
  });
});
```

Create `tests/e2e/thoughts.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('Chinese Thoughts index renders a truthful empty state', async ({ page }) => {
  await page.goto('/thoughts/');
  await expect(page).toHaveTitle(/想法.*Stark Ye/);
  await expect(page.getByRole('heading', { level: 1, name: '最近的想法' })).toBeVisible();
  await expect(page.getByText('文章正在写作中')).toBeVisible();
  await expect(page.locator('[data-thought-card]')).toHaveCount(0);
});

test('English Thoughts index has English chrome and no fabricated posts', async ({ page }) => {
  await page.goto('/en/thoughts/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1, name: 'Recent thoughts' })).toBeVisible();
  await expect(page.getByText('Notes in progress')).toBeVisible();
});
```

- [ ] **Step 2: Run focused tests and confirm they fail**

Run:

```bash
npm run test:unit -- tests/unit/content.test.ts
npm run test:e2e -- tests/e2e/thoughts.spec.ts
```

Expected: FAIL because `buildContentPaths` and Thoughts pages do not exist.

- [ ] **Step 3: Implement deterministic static content paths**

Add to `src/lib/content.ts`:

```ts
export function buildContentPaths<T extends LocalizedEntry>(entries: readonly T[], language: Language) {
  return sortPublishedEntries(entries)
    .filter((entry) => entry.data.language === language)
    .map((entry) => ({ params: { id: entry.id }, props: { entry } }));
}
```

- [ ] **Step 4: Add the shared Markdown content layout**

Create `src/layouts/ContentLayout.astro`:

```astro
---
import BaseLayout from './BaseLayout.astro';
import type { Language, StaticPage } from '../i18n/types';

interface Props {
  language: Language;
  page: Extract<StaticPage, 'thoughts' | 'projects'>;
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt?: Date;
  tags: string[];
  alternateHref: string;
}

const props = Astro.props;
const locale = props.language === 'zh' ? 'zh-CN' : 'en';
---

<BaseLayout language={props.language} page={props.page} title={`${props.title} — Stark Ye`} description={props.description} alternateHref={props.alternateHref}>
  <article class="content shell">
    <header>
      <p class="eyebrow">{props.page}</p>
      <h1>{props.title}</h1>
      <p>{props.description}</p>
      <time datetime={props.publishedAt.toISOString()}>{props.publishedAt.toLocaleDateString(locale)}</time>
      {props.updatedAt && <span>{props.language === 'zh' ? '更新于' : 'Updated'} {props.updatedAt.toLocaleDateString(locale)}</span>}
      <ul aria-label={props.language === 'zh' ? '标签' : 'Tags'}>{props.tags.map((tag) => <li>{tag}</li>)}</ul>
    </header>
    <div class="prose"><slot /></div>
  </article>
</BaseLayout>
```

Add scoped `.content` and `.prose` styles with a `45rem` reading width, visible heading hierarchy, code wrapping, responsive media, table overflow, and links underlined independently of color.

- [ ] **Step 5: Implement ThoughtCard and both index pages**

Create `src/components/common/ThoughtCard.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content';
import { entryPath } from '../../lib/routes';
const { entry } = Astro.props as { entry: CollectionEntry<'thoughts'> };
---
<article data-thought-card data-content-card>
  <p><time datetime={entry.data.publishedAt.toISOString()}>{entry.data.publishedAt.toLocaleDateString(entry.data.language === 'zh' ? 'zh-CN' : 'en')}</time> · {entry.data.language.toUpperCase()}</p>
  <h2><a href={entryPath('thoughts', entry)}>{entry.data.title}</a></h2>
  <p>{entry.data.description}</p>
  <ul>{entry.data.tags.map((tag) => <li>{tag}</li>)}</ul>
</article>
```

Create the Chinese index `src/pages/thoughts/index.astro`:

```astro
---
import EmptyState from '../../components/common/EmptyState.astro';
import ThoughtCard from '../../components/common/ThoughtCard.astro';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { translations } from '../../i18n/translations';
import { getPublishedThoughts } from '../../lib/content';
const language = 'zh';
const copy = translations[language].thoughts;
const entries = await getPublishedThoughts(language);
---
<BaseLayout language={language} page="thoughts" title="想法 — Stark Ye" description={copy.emptyBody} alternateHref="/en/thoughts/">
  <section class="shell page-intro"><p class="eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1></section>
  <section class="shell content-list">
    {entries.length === 0 ? <EmptyState title={copy.emptyTitle} body={copy.emptyBody} /> : entries.map((entry) => <ThoughtCard entry={entry} />)}
  </section>
</BaseLayout>
```

Create `src/pages/en/thoughts/index.astro`:

```astro
---
import EmptyState from '../../../components/common/EmptyState.astro';
import ThoughtCard from '../../../components/common/ThoughtCard.astro';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { translations } from '../../../i18n/translations';
import { getPublishedThoughts } from '../../../lib/content';
const language = 'en';
const copy = translations[language].thoughts;
const entries = await getPublishedThoughts(language);
---
<BaseLayout language={language} page="thoughts" title="Thoughts — Stark Ye" description={copy.emptyBody} alternateHref="/thoughts/">
  <section class="shell page-intro"><p class="eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1></section>
  <section class="shell content-list">
    {entries.length === 0 ? <EmptyState title={copy.emptyTitle} body={copy.emptyBody} /> : entries.map((entry) => <ThoughtCard entry={entry} />)}
  </section>
</BaseLayout>
```

- [ ] **Step 6: Implement Chinese and English Thought detail routes**

Create `src/pages/thoughts/[...id].astro`:

```astro
---
import { render, type CollectionEntry } from 'astro:content';
import ContentLayout from '../../layouts/ContentLayout.astro';
import { buildContentPaths, findTranslation, getPublishedThoughts } from '../../lib/content';
import { entryPath, localizedPath } from '../../lib/routes';

export async function getStaticPaths() {
  return buildContentPaths(await getPublishedThoughts(), 'zh');
}

const { entry } = Astro.props as { entry: CollectionEntry<'thoughts'> };
const translation = findTranslation(await getPublishedThoughts(), entry, 'en');
const alternateHref = translation ? entryPath('thoughts', translation) : localizedPath('thoughts', 'en');
const { Content } = await render(entry);
---
<ContentLayout language="zh" page="thoughts" title={entry.data.title} description={entry.data.description} publishedAt={entry.data.publishedAt} updatedAt={entry.data.updatedAt} tags={entry.data.tags} alternateHref={alternateHref}>
  <Content />
</ContentLayout>
```

Create `src/pages/en/thoughts/[...id].astro`:

```astro
---
import { render, type CollectionEntry } from 'astro:content';
import ContentLayout from '../../../layouts/ContentLayout.astro';
import { buildContentPaths, findTranslation, getPublishedThoughts } from '../../../lib/content';
import { entryPath, localizedPath } from '../../../lib/routes';

export async function getStaticPaths() {
  return buildContentPaths(await getPublishedThoughts(), 'en');
}

const { entry } = Astro.props as { entry: CollectionEntry<'thoughts'> };
const translation = findTranslation(await getPublishedThoughts(), entry, 'zh');
const alternateHref = translation ? entryPath('thoughts', translation) : localizedPath('thoughts', 'zh');
const { Content } = await render(entry);
---
<ContentLayout language="en" page="thoughts" title={entry.data.title} description={entry.data.description} publishedAt={entry.data.publishedAt} updatedAt={entry.data.updatedAt} tags={entry.data.tags} alternateHref={alternateHref}>
  <Content />
</ContentLayout>
```

- [ ] **Step 7: Generate RSS from all published Thoughts**

Create `src/pages/rss.xml.ts`:

```ts
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { siteConfig } from '../config/site';
import { getPublishedThoughts } from '../lib/content';
import { entryPath } from '../lib/routes';

export async function GET(context: APIContext) {
  const entries = await getPublishedThoughts();
  return rss({
    title: 'Stark Ye — Thoughts',
    description: 'Thoughts on AI, software, and ideas worth keeping.',
    site: context.site ?? siteConfig.siteUrl,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.publishedAt,
      link: entryPath('thoughts', entry),
      categories: entry.data.tags,
    })),
  });
}
```

- [ ] **Step 8: Verify and commit Thoughts publishing**

Run:

```bash
npm run check
npm run test:unit -- tests/unit/content.test.ts
npm run test:e2e -- tests/e2e/thoughts.spec.ts
```

Expected: all commands PASS and no Thought detail route is generated while the collection is empty.

```bash
git add src/lib/content.ts src/layouts/ContentLayout.astro src/components/common/ThoughtCard.astro src/pages/thoughts src/pages/en/thoughts src/pages/rss.xml.ts tests/unit/content.test.ts tests/e2e/thoughts.spec.ts
git commit -m "feat: add Markdown Thoughts publishing"
```

---

### Task 6: Implement Future-Ready Projects Without Fake Case Studies

**Files:**
- Create: `src/components/common/ProjectCard.astro`
- Create: `src/pages/projects/index.astro`
- Create: `src/pages/projects/[...id].astro`
- Create: `src/pages/en/projects/index.astro`
- Create: `src/pages/en/projects/[...id].astro`
- Create: `tests/e2e/projects.spec.ts`

**Interfaces:**
- Consumes: `getPublishedProjects()`, `buildContentPaths()`, `ContentLayout`, and translation route helpers.
- Produces: empty bilingual Project indexes now and static Markdown case-study routes when real entries are added.

- [ ] **Step 1: Write failing Project route and empty-state tests**

Create `tests/e2e/projects.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('Chinese Projects page keeps the public route without inventing work', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.getByRole('heading', { level: 1, name: '项目档案' })).toBeVisible();
  await expect(page.getByText('正在整理代表项目')).toBeVisible();
  await expect(page.locator('[data-project-card]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'yehanchen714@gmail.com' })).toBeVisible();
});

test('English Projects page offers collaboration instead of fake cards', async ({ page }) => {
  await page.goto('/en/projects/');
  await expect(page.getByRole('heading', { level: 1, name: 'Selected work' })).toBeVisible();
  await expect(page.getByText('Case studies in progress')).toBeVisible();
  await expect(page.locator('[data-project-card]')).toHaveCount(0);
});
```

- [ ] **Step 2: Run the Project tests and confirm they fail**

Run:

```bash
npm run test:e2e -- tests/e2e/projects.spec.ts
```

Expected: FAIL because Project pages do not exist.

- [ ] **Step 3: Implement ProjectCard**

Create `src/components/common/ProjectCard.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content';
import { entryPath } from '../../lib/routes';
const { entry } = Astro.props as { entry: CollectionEntry<'projects'> };
---
<article data-project-card data-content-card>
  <p>{entry.data.featured ? 'Featured' : 'Project'} · {entry.data.language.toUpperCase()}</p>
  <h2><a href={entryPath('projects', entry)}>{entry.data.title}</a></h2>
  <p>{entry.data.summary}</p>
  <ul>{entry.data.tags.map((tag) => <li>{tag}</li>)}</ul>
</article>
```

- [ ] **Step 4: Implement both Project indexes with a Contact fallback**

Create `src/pages/projects/index.astro`:

```astro
---
import EmptyState from '../../components/common/EmptyState.astro';
import ProjectCard from '../../components/common/ProjectCard.astro';
import ContactCTA from '../../components/home/ContactCTA.astro';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { translations } from '../../i18n/translations';
import { getPublishedProjects } from '../../lib/content';
const language = 'zh';
const copy = translations[language].projects;
const entries = await getPublishedProjects(language);
---
<BaseLayout language="zh" page="projects" title="项目 — Stark Ye" description={copy.emptyBody} alternateHref="/en/projects/">
  <section class="shell page-intro"><p class="eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1></section>
  <section class="shell content-list">
    {entries.length === 0 ? <EmptyState title={copy.emptyTitle} body={copy.emptyBody} /> : entries.map((entry) => <ProjectCard entry={entry} />)}
  </section>
  {entries.length === 0 && <ContactCTA language="zh" />}
</BaseLayout>
```

Create `src/pages/en/projects/index.astro`:

```astro
---
import EmptyState from '../../../components/common/EmptyState.astro';
import ProjectCard from '../../../components/common/ProjectCard.astro';
import ContactCTA from '../../../components/home/ContactCTA.astro';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { translations } from '../../../i18n/translations';
import { getPublishedProjects } from '../../../lib/content';
const language = 'en';
const copy = translations[language].projects;
const entries = await getPublishedProjects(language);
---
<BaseLayout language="en" page="projects" title="Projects — Stark Ye" description={copy.emptyBody} alternateHref="/projects/">
  <section class="shell page-intro"><p class="eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1></section>
  <section class="shell content-list">
    {entries.length === 0 ? <EmptyState title={copy.emptyTitle} body={copy.emptyBody} /> : entries.map((entry) => <ProjectCard entry={entry} />)}
  </section>
  {entries.length === 0 && <ContactCTA language="en" />}
</BaseLayout>
```

- [ ] **Step 5: Implement both Project detail routes**

Create `src/pages/projects/[...id].astro`:

```astro
---
import { render, type CollectionEntry } from 'astro:content';
import ContentLayout from '../../layouts/ContentLayout.astro';
import { buildContentPaths, findTranslation, getPublishedProjects } from '../../lib/content';
import { entryPath, localizedPath } from '../../lib/routes';

export async function getStaticPaths() {
  return buildContentPaths(await getPublishedProjects(), 'zh');
}
const { entry } = Astro.props as { entry: CollectionEntry<'projects'> };
const translation = findTranslation(await getPublishedProjects(), entry, 'en');
const alternateHref = translation ? entryPath('projects', translation) : localizedPath('projects', 'en');
const { Content } = await render(entry);
---
<ContentLayout language="zh" page="projects" title={entry.data.title} description={entry.data.summary} publishedAt={entry.data.publishedAt} tags={entry.data.tags} alternateHref={alternateHref}>
  <Content />
  {entry.data.links.length > 0 && <ul class="project-links">{entry.data.links.map((link) => <li><a href={link.url} rel="noreferrer">{link.label}</a></li>)}</ul>}
</ContentLayout>
```

Create `src/pages/en/projects/[...id].astro`:

```astro
---
import { render, type CollectionEntry } from 'astro:content';
import ContentLayout from '../../../layouts/ContentLayout.astro';
import { buildContentPaths, findTranslation, getPublishedProjects } from '../../../lib/content';
import { entryPath, localizedPath } from '../../../lib/routes';

export async function getStaticPaths() {
  return buildContentPaths(await getPublishedProjects(), 'en');
}
const { entry } = Astro.props as { entry: CollectionEntry<'projects'> };
const translation = findTranslation(await getPublishedProjects(), entry, 'zh');
const alternateHref = translation ? entryPath('projects', translation) : localizedPath('projects', 'zh');
const { Content } = await render(entry);
---
<ContentLayout language="en" page="projects" title={entry.data.title} description={entry.data.summary} publishedAt={entry.data.publishedAt} tags={entry.data.tags} alternateHref={alternateHref}>
  <Content />
  {entry.data.links.length > 0 && <ul class="project-links">{entry.data.links.map((link) => <li><a href={link.url} rel="noreferrer">{link.label}</a></li>)}</ul>}
</ContentLayout>
```

- [ ] **Step 6: Verify and commit Projects publishing**

Run:

```bash
npm run check
npm run test:e2e -- tests/e2e/projects.spec.ts
```

Expected: PASS; Projects routes exist, show no fake cards, and expose Contact.

```bash
git add src/components/common/ProjectCard.astro src/pages/projects src/pages/en/projects tests/e2e/projects.spec.ts
git commit -m "feat: add project case-study structure"
```

---

### Task 7: Add About, Contact, Copy Email, and Bilingual 404 Behavior

**Files:**
- Create: `src/components/common/CopyEmail.astro`
- Create: `src/pages/about.astro`
- Create: `src/pages/en/about.astro`
- Create: `src/pages/contact.astro`
- Create: `src/pages/en/contact.astro`
- Create: `src/pages/404.astro`
- Create: `tests/e2e/pages.spec.ts`

**Interfaces:**
- Consumes: shared shell, translation dictionaries, and `siteConfig.email`.
- Produces: public biography pages, direct email actions, clipboard feedback via a polite live region, and one GitHub Pages-compatible 404 file that adapts to `/en/` paths.

- [ ] **Step 1: Write failing common-page behavior tests**

Create `tests/e2e/pages.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('About stays a focused standalone page', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('真正有用');
  await expect(page.getByText('About Stark Ye', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/en/about/');
});

test('Contact exposes mailto and copies the only public email', async ({ context, page }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/contact/');
  await expect(page.getByRole('link', { name: '发邮件' })).toHaveAttribute('href', 'mailto:yehanchen714@gmail.com');
  await page.getByRole('button', { name: '复制邮箱' }).click();
  await expect(page.getByRole('status')).toHaveText('邮箱已复制');
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('yehanchen714@gmail.com');
});

test('404 chooses copy from the requested path language', async ({ page }) => {
  await page.goto('/missing-page/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('页面没有找到');
  await page.goto('/en/missing-page/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Page not found');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
```

- [ ] **Step 2: Run the page tests and confirm they fail**

Run:

```bash
npm run test:e2e -- tests/e2e/pages.spec.ts
```

Expected: FAIL because About, Contact, and branded 404 pages do not exist.

- [ ] **Step 3: Implement clipboard behavior with a no-JavaScript fallback**

Create `src/components/common/CopyEmail.astro`:

```astro
---
import { siteConfig } from '../../config/site';
import { translations } from '../../i18n/translations';
import type { Language } from '../../i18n/types';
const { language } = Astro.props as { language: Language };
const copy = translations[language].contact;
---
<div class="email-actions" data-copy-email data-email={siteConfig.email} data-success={copy.copied} data-failure={copy.copyFailed}>
  <a class="button primary" href={`mailto:${siteConfig.email}`}>{copy.email}</a>
  <button class="button secondary" type="button">{copy.copy}</button>
  <span role="status" aria-live="polite"></span>
</div>
<script>
  document.querySelectorAll<HTMLElement>('[data-copy-email]').forEach((root) => {
    const button = root.querySelector('button');
    const status = root.querySelector<HTMLElement>('[role="status"]');
    button?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(root.dataset.email ?? '');
        if (status) status.textContent = root.dataset.success ?? '';
      } catch {
        if (status) status.textContent = root.dataset.failure ?? '';
      }
    });
  });
</script>
```

The visible email address remains selectable on Contact pages even if clipboard permissions fail.

- [ ] **Step 4: Implement bilingual About pages**

Keep both pages compact while covering background, focus, capabilities, principle, and current status. Use only the approved positioning around AI applications and products, full-stack development and systems, product judgment and ideas, and openness to collaborators and technical peers; do not invent employers, degrees, years, clients, metrics, or credentials.

Create `src/pages/about.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { translations } from '../i18n/translations';
const copy = translations.zh.about;
---
<BaseLayout language="zh" page="about" title="关于 Stark Ye" description={copy.body} alternateHref="/en/about/">
  <article class="shell about-page">
    <p class="eyebrow">{copy.eyebrow}</p>
    <h1>{copy.title}</h1>
    <p>{copy.body}</p>
    <section aria-labelledby="background-title"><h2 id="background-title">经历</h2><p>我的实践围绕 AI 应用与产品、全栈开发与系统展开，也持续记录其中的产品判断和值得保留的想法。</p></section>
    <section aria-labelledby="focus-title"><h2 id="focus-title">关注方向</h2><ul><li>AI-native products</li><li>Full-stack systems</li><li>Product judgment</li><li>Independent ideas</li></ul></section>
    <section aria-labelledby="capabilities-title"><h2 id="capabilities-title">技术能力</h2><ul><li>AI 应用与产品构建</li><li>全栈开发与系统实现</li><li>从产品判断到可用体验</li></ul></section>
    <section aria-labelledby="principles-title"><h2 id="principles-title">做事原则</h2><p>从真实问题出发，保持技术判断清晰，并把想法推进到可以使用的产品。</p></section>
    <section aria-labelledby="status-title"><h2 id="status-title">当前状态</h2><p>目前欢迎与合作者和技术同行交流，尤其是围绕 AI 应用、全栈产品与值得推进的想法。</p></section>
  </article>
</BaseLayout>
```

Create `src/pages/en/about.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { translations } from '../../i18n/translations';
const copy = translations.en.about;
---
<BaseLayout language="en" page="about" title="About Stark Ye" description={copy.body} alternateHref="/about/">
  <article class="shell about-page">
    <p class="eyebrow">{copy.eyebrow}</p>
    <h1>{copy.title}</h1>
    <p>{copy.body}</p>
    <section aria-labelledby="background-title"><h2 id="background-title">Background</h2><p>My work centers on AI applications and products, full-stack development and systems, alongside the product judgment and ideas that shape them.</p></section>
    <section aria-labelledby="focus-title"><h2 id="focus-title">Focus</h2><ul><li>AI-native products</li><li>Full-stack systems</li><li>Product judgment</li><li>Independent ideas</li></ul></section>
    <section aria-labelledby="capabilities-title"><h2 id="capabilities-title">Capabilities</h2><ul><li>AI application and product development</li><li>Full-stack development and systems</li><li>Product judgment carried through to usable experiences</li></ul></section>
    <section aria-labelledby="principles-title"><h2 id="principles-title">Principle</h2><p>Start from real problems, keep the engineering judgment clear, and carry ideas through to usable products.</p></section>
    <section aria-labelledby="status-title"><h2 id="status-title">Current status</h2><p>I’m open to conversations with collaborators and technical peers around AI applications, full-stack products, and ideas worth developing.</p></section>
  </article>
</BaseLayout>
```

- [ ] **Step 5: Implement bilingual Contact pages**

Create `src/pages/contact.astro`:

```astro
---
import CopyEmail from '../components/common/CopyEmail.astro';
import { siteConfig } from '../config/site';
import { translations } from '../i18n/translations';
import BaseLayout from '../layouts/BaseLayout.astro';
const copy = translations.zh.contact;
---
<BaseLayout language="zh" page="contact" title="联系 Stark Ye" description={copy.body} alternateHref="/en/contact/">
<section class="shell contact-page">
  <p class="eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.body}</p>
  <a class="email-address" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
  <CopyEmail language="zh" />
</section>
</BaseLayout>
```

Create `src/pages/en/contact.astro`:

```astro
---
import CopyEmail from '../../components/common/CopyEmail.astro';
import { siteConfig } from '../../config/site';
import { translations } from '../../i18n/translations';
import BaseLayout from '../../layouts/BaseLayout.astro';
const copy = translations.en.contact;
---
<BaseLayout language="en" page="contact" title="Contact Stark Ye" description={copy.body} alternateHref="/contact/">
  <section class="shell contact-page">
    <p class="eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.body}</p>
    <a class="email-address" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
    <CopyEmail language="en" />
  </section>
</BaseLayout>
```

Do not add form elements to either page.

- [ ] **Step 6: Implement a single bilingual GitHub Pages 404 file**

Create `src/pages/404.astro` as a standalone document. Render both messages and choose the visible one using the runtime path:

```astro
---
import '../styles/global.css';
---
<!doctype html>
<html lang="zh-CN">
  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width" /><meta name="robots" content="noindex" /><title>404 — Stark Ye</title></head>
  <body>
    <main class="shell not-found">
      <span class="monogram">SY</span>
      <section data-language="zh"><p class="eyebrow">404</p><h1>页面没有找到</h1><p>这个地址不存在，或者内容已经移动。</p><a href="/">返回首页</a><a href="/thoughts/">查看想法</a><a href="/contact/">联系我</a></section>
      <section data-language="en" hidden><p class="eyebrow">404</p><h1>Page not found</h1><p>This address does not exist, or the content has moved.</p><a href="/en/">Home</a><a href="/en/thoughts/">Thoughts</a><a href="/en/contact/">Contact</a></section>
    </main>
    <script is:inline>
      const language = location.pathname.startsWith('/en/') ? 'en' : 'zh';
      document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
      document.querySelectorAll('[data-language]').forEach((node) => {
        node.hidden = node.getAttribute('data-language') !== language;
      });
    </script>
  </body>
</html>
```

Import global styles through a frontmatter block and add compact scoped 404 layout styles.

- [ ] **Step 7: Verify and commit common pages**

Run:

```bash
npm run check
npm run test:e2e -- tests/e2e/pages.spec.ts
```

Expected: About, Contact, clipboard behavior, and language-sensitive 404 tests PASS.

```bash
git add src/components/common/CopyEmail.astro src/pages/about.astro src/pages/en/about.astro src/pages/contact.astro src/pages/en/contact.astro src/pages/404.astro tests/e2e/pages.spec.ts
git commit -m "feat: add about contact and 404 pages"
```

---

### Task 8: Gate SEO Output and GitHub Pages Deployment

**Files:**
- Create: `public/CNAME`
- Create: `public/favicon.svg`
- Create: `public/robots.txt`
- Create: `tests/dist/artifacts.test.ts`
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: complete static route tree, `astro.config.mjs`, RSS endpoint, `package-lock.json`.
- Produces: validated `dist/`, crawler metadata, a persistent custom domain file, and a deployment workflow that cannot run before verification passes.

- [ ] **Step 1: Write failing production artifact tests**

Create `tests/dist/artifacts.test.ts`:

```ts
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

const dist = join(process.cwd(), 'dist');
const requiredRoutes = [
  'index.html', 'en/index.html', 'about/index.html', 'en/about/index.html',
  'thoughts/index.html', 'en/thoughts/index.html', 'projects/index.html',
  'en/projects/index.html', 'contact/index.html', 'en/contact/index.html', '404.html',
];

function htmlFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? htmlFiles(path) : path.endsWith('.html') ? [path] : [];
  });
}

function outputFor(pathname: string): string {
  const clean = pathname.replace(/^\//, '');
  if (pathname.endsWith('/')) return join(dist, clean, 'index.html');
  if (extname(clean)) return join(dist, clean);
  return join(dist, clean, 'index.html');
}

describe('GitHub Pages artifact', () => {
  it('contains every required route and custom domain file', () => {
    for (const route of requiredRoutes) expect(existsSync(join(dist, route)), route).toBe(true);
    expect(readFileSync(join(dist, 'CNAME'), 'utf8').trim()).toBe('starkye.com');
    expect(existsSync(join(dist, 'rss.xml'))).toBe(true);
    expect(existsSync(join(dist, 'sitemap-index.xml')) || existsSync(join(dist, 'sitemap-0.xml'))).toBe(true);
  });

  it('emits canonical URLs and no broken internal links', () => {
    for (const file of htmlFiles(dist)) {
      const html = readFileSync(file, 'utf8');
      if (!file.endsWith('404.html')) expect(html).toMatch(/<link rel="canonical" href="https:\/\/starkye\.com\//);
      for (const match of html.matchAll(/href="([^"]+)"/g)) {
        const href = match[1];
        if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) continue;
        const pathname = new URL(href, 'https://starkye.com').pathname;
        expect(existsSync(outputFor(pathname)), `${file} -> ${href}`).toBe(true);
      }
    }
  });
});
```

- [ ] **Step 2: Run artifact tests and confirm they fail**

Run:

```bash
npm run test:dist
```

Expected: FAIL because CNAME, favicon, robots, or final output requirements are missing.

- [ ] **Step 3: Add custom domain, brand favicon, and crawler policy**

Create `public/CNAME`:

```text
starkye.com
```

Create `public/robots.txt`:

```text
User-agent: *
Allow: /

Sitemap: https://starkye.com/sitemap-index.xml
```

Create `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="SY">
  <rect width="64" height="64" rx="18" fill="#101727"/>
  <text x="32" y="40" text-anchor="middle" font-family="Arial, sans-serif" font-size="23" font-weight="800" fill="#fff">SY</text>
</svg>
```

- [ ] **Step 4: Add a verify-before-deploy GitHub Actions workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run verify

  build:
    needs: verify
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
        with:
          node-version: 24

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 5: Verify the production artifact and workflow**

Run:

```bash
npm run check
npm run test:dist
```

Expected: artifact tests PASS, including canonical URLs, CNAME, RSS, sitemap, required routes, and internal links.

Inspect `.github/workflows/deploy.yml` and confirm that `build` depends on `verify`, and `deploy` depends on `build`.

- [ ] **Step 6: Commit deployment gates**

```bash
git add public/CNAME public/favicon.svg public/robots.txt tests/dist/artifacts.test.ts .github/workflows/deploy.yml
git commit -m "ci: verify and deploy GitHub Pages site"
```

Do not add a remote, push to `yestark/yestark.github.io`, change Pages settings, or change DNS in this task. Those external changes require a separate explicit deployment approval after local verification.

---

### Task 9: Complete Accessibility, Responsive QA, and Author Handoff

**Files:**
- Create: `tests/e2e/accessibility.spec.ts`
- Create: `tests/e2e/responsive.spec.ts`
- Create: `README.md`
- Modify: CSS/component files only when a test or visual check identifies a concrete defect.

**Interfaces:**
- Consumes: the complete local site and production preview.
- Produces: a keyboard-accessible, responsive, documented site with a single `npm run verify` completion gate.

- [ ] **Step 1: Write accessibility and responsive tests before polishing**

Create `tests/e2e/accessibility.spec.ts`:

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const route of ['/', '/about/', '/thoughts/', '/projects/', '/contact/', '/en/']) {
  test(`${route} has no automatically detectable accessibility violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('keyboard navigation exposes the skip link and primary navigation', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '跳到主要内容' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});

test('reduced motion removes meaningful animation duration', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const duration = await page.locator('body').evaluate((element) => parseFloat(getComputedStyle(element).animationDuration) || 0);
  expect(duration).toBeLessThanOrEqual(0.001);
});
```

Create `tests/e2e/responsive.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

for (const route of ['/', '/about/', '/thoughts/', '/projects/', '/contact/', '/en/']) {
  test(`${route} has no horizontal overflow on mobile`, async ({ page }) => {
    await page.goto(route);
    const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client);
  });
}

test('mobile homepage preserves all approved sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-section="hero"]')).toBeVisible();
  await expect(page.locator('[data-section="contact"]')).toBeVisible();
  await expect(page.locator('[data-section="mini-about"]')).toBeVisible();
});
```

- [ ] **Step 2: Run the new tests and record concrete failures**

Run:

```bash
npm run test:e2e -- tests/e2e/accessibility.spec.ts tests/e2e/responsive.spec.ts
```

Expected: any accessibility or overflow defects fail with a named route. Do not weaken assertions; fix the component causing each failure.

- [ ] **Step 3: Fix only evidenced accessibility and responsive defects**

For each failure, apply the smallest corresponding fix:

- Add missing accessible names or heading order in the owning component.
- Ensure the skip-link target has `tabindex="-1"` if Playwright shows the main element cannot receive focus.
- Replace fixed pixel widths with `min()`, `max-width`, or grid wrapping where overflow is reported.
- Preserve visible focus indicators and text contrast.
- Keep Mini About below Contact and smaller after mobile reflow.

Re-run the focused test after every fix until it passes.

- [ ] **Step 4: Write the exact local-development and Markdown author guide**

Create `README.md` with these sections and commands:

````markdown
# Stark Ye Personal Website

Astro source for [starkye.com](https://starkye.com).

## Requirements

- Node.js 24 LTS
- npm

## Local development

```bash
npm ci
npm run dev
```

## Verification

```bash
npx playwright install chromium
npm run verify
```

## Publish a Thought

Add `src/content/thoughts/<slug>.md`:

```yaml
---
title: "文章标题"
description: "用于列表、RSS 与 SEO 摘要的一句话"
publishedAt: 2026-08-06
tags: [AI, Full-stack]
language: zh
draft: false
translationKey: optional-shared-key
---
```

Write the body in Markdown. Commit and push to `main`; GitHub Actions verifies and publishes the site. Set `draft: true` to keep an entry out of routes, RSS, sitemap, and homepage previews.

## Publish a Project

Add `src/content/projects/<slug>.md` with `title`, `summary`, `publishedAt`, `tags`, `language`, `featured`, `draft`, optional `translationKey`, and optional `links` entries containing `label` and `url`.

## Languages

Common pages are maintained in `src/i18n/translations.ts`. Content is published in its authored language. Matching `translationKey` values connect Chinese and English versions.

## Deployment

The site deploys to GitHub Pages with `public/CNAME` set to `starkye.com`. Do not remove that file.
````

- [ ] **Step 5: Perform manual visual checks at representative sizes**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Inspect `/`, `/en/`, `/about/`, `/thoughts/`, `/projects/`, `/contact/`, and an invalid Chinese and English URL at 1440×900 and 390×844. Confirm:

- Creative Studio colors and hierarchy match the approved mockup.
- No fabricated public content appears.
- Homepage order is unchanged.
- About remains a compact strip at the homepage bottom.
- Header, language switch, email actions, focus state, and 404 links are usable.
- No text clipping, overlap, or horizontal scrolling occurs.

Stop the server after inspection.

- [ ] **Step 6: Run the full completion gate**

Run:

```bash
npm run verify
git diff --check
git status --short
```

Expected: all static checks, unit tests, artifact tests, browser tests, and diff checks PASS. Only intended source, test, and documentation files are modified.

- [ ] **Step 7: Commit the quality and authoring handoff**

```bash
git add README.md tests/e2e/accessibility.spec.ts tests/e2e/responsive.spec.ts src
git commit -m "test: complete site quality and authoring checks"
```

After this commit, invoke `superpowers:verification-before-completion`, then `superpowers:finishing-a-development-branch`. Ask for explicit approval before configuring the GitHub remote, pushing, changing GitHub Pages settings, or changing DNS.

---

## Execution Completion Checklist

- `npm run verify` passes on Node.js 24 LTS.
- The Git working tree contains no accidental `.DS_Store`, `.superpowers`, build, or test-report files.
- The old Hexo folder remains unchanged.
- The design completion criteria in `docs/superpowers/specs/2026-08-06-personal-website-redesign.md` are all covered.
- Deployment files are ready, but no remote or DNS mutation occurs without explicit approval.
