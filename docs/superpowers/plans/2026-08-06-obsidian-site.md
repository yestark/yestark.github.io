# Obsidian Site and Content Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the live site's light Creative Studio shell with the approved Obsidian Tech theme and add Articles, Archive, and Tag discovery while preserving bilingual static publishing.

**Architecture:** Keep Astro static output and native CSS. Move public site copy into schema-checked JSON content, rename the empty `thoughts` collection to `articles`, and centralize route and tag normalization helpers. Generate Archive and Tag pages at build time; use a tiny progressive-enhancement script only for Archive query-parameter filters.

**Tech Stack:** Node.js 24, Astro 7, TypeScript 6, Astro Content Collections, native CSS, Vitest 4, Playwright 1.62, GitHub Pages.

## Global Constraints

- Top-level navigation is exactly Home, Articles, Projects, Archive, and About; Contact remains auxiliary.
- Chinese is the default language; article and project English translations are optional.
- Page order remains Header → Hero → Articles → Projects → Contact → Mini About → Footer.
- Use `#070806`, `#10110F`, `#15140F`, `#E8B84F`, `#F7D985`, `#F6F1E8`, and `#9D9B94` as the approved core palette.
- Do not invent articles, projects, experience, or personal claims.
- Tags are shared by Articles and Projects and use Unicode-safe normalized slugs.
- Preserve `https://starkye.com`, `public/CNAME`, RSS, sitemap, GitHub Pages, and HTTPS behavior.
- All animations stop under `prefers-reduced-motion: reduce`; keyboard focus and text contrast meet WCAG AA.
- Do not add a frontend framework, Tailwind, database, public admin API, or third-party hosted font.

## File Structure

- `src/content-contracts.ts`: shared Zod schemas and exported content types for Astro and Stark Studio.
- `src/content/site/{zh,en}.json`: editable public copy for Home, About, Contact, and footer.
- `src/lib/site-content.ts`: typed access to the singleton site-copy entries.
- `src/lib/tags.ts`: Tag normalization, aggregation, lookup, and paths.
- `src/lib/content.ts`: public Article/Project queries, translations, archive entries.
- `src/lib/routes.ts`: localized static, entry, archive, and tag routes.
- `src/components/common/{ArticleCard,ProjectCard,TagList,EmptyState}.astro`: reusable discovery surfaces.
- `src/components/archive/ArchiveList.astro`: semantic unified timeline and progressive filter controls.
- `src/pages/{articles,archive,tags}/**`: Chinese routes; mirrored under `src/pages/en/`.
- `src/pages/thoughts/**`: compatibility pages redirecting to Articles.
- `src/styles/global.css` plus scoped component styles: Obsidian design tokens and component visuals.
- `tests/unit/{content,routes,tags,site-content}.test.ts`: deterministic library coverage.
- `tests/dist/{artifacts,article-details,tag-pages}.test.ts`: generated artifact contracts.
- `tests/e2e/{home,shell,articles,archive,tags,responsive,accessibility}.spec.ts`: browser behavior.

---

### Task 1: Shared Content Contracts and Editable Site Copy

**Files:**
- Create: `src/content-contracts.ts`
- Create: `src/content/site/zh.json`
- Create: `src/content/site/en.json`
- Create: `src/lib/site-content.ts`
- Modify: `src/content.config.ts`
- Modify: `src/i18n/translations.ts`
- Test: `tests/unit/site-content.test.ts`

**Interfaces:**
- Produces: `articleSchema`, `projectSchema`, `siteCopySchema`, `SiteCopy`, and `getSiteCopy(language: Language): Promise<SiteCopy>`.
- Consumes: existing `Language` and current bilingual copy.

- [ ] **Step 1: Write the failing site-copy test**

```ts
import { describe, expect, it } from 'vitest';
import { siteCopySchema } from '../../src/content-contracts';
import zh from '../../src/content/site/zh.json';
import en from '../../src/content/site/en.json';

describe('site copy', () => {
  it('keeps complete bilingual public copy in schema-checked data', () => {
    expect(siteCopySchema.parse(zh).hero.title).toContain('AI');
    expect(siteCopySchema.parse(en).contact.email).toBe('yehanchen714@gmail.com');
  });
});
```

- [ ] **Step 2: Run the test and verify the missing-contract failure**

Run: `npm run test:unit -- tests/unit/site-content.test.ts`

Expected: FAIL because `src/content-contracts.ts` and the JSON files do not exist.

- [ ] **Step 3: Add exact schemas and migrate copy**

```ts
import { z } from 'astro/zod';

export const sharedEntryFields = {
  title: z.string().min(1), publishedAt: z.coerce.date(), tags: z.array(z.string()).default([]),
  language: z.enum(['zh', 'en']), draft: z.boolean().default(false),
  translationKey: z.string().min(1).optional(), cover: z.string().min(1).optional(),
};
export const articleSchema = z.object({ ...sharedEntryFields, description: z.string().min(1), updatedAt: z.coerce.date().optional() });
export const projectSchema = z.object({ ...sharedEntryFields, summary: z.string().min(1), featured: z.boolean().default(false), links: z.array(z.object({ label: z.string().min(1), url: z.string().url() })).default([]) });
export const siteCopySchema = z.object({ locale: z.string(), hero: z.object({ status: z.string(), intro: z.string(), title: z.string(), body: z.string(), articlesCta: z.string(), aboutCta: z.string() }), articles: z.object({ eyebrow: z.string(), title: z.string(), emptyTitle: z.string(), emptyBody: z.string(), all: z.string() }), projects: z.object({ eyebrow: z.string(), title: z.string(), emptyTitle: z.string(), emptyBody: z.string(), all: z.string() }), contact: z.object({ eyebrow: z.string(), title: z.string(), body: z.string(), email: z.string().email(), copy: z.string(), copied: z.string(), copyFailed: z.string() }), about: z.object({ eyebrow: z.string(), title: z.string(), body: z.string(), link: z.string(), sections: z.record(z.string(), z.object({ title: z.string(), body: z.string(), items: z.array(z.string()).optional() })) }), footer: z.string() });
export type SiteCopy = z.infer<typeof siteCopySchema>;
```

Use the current truthful Chinese and English copy verbatim in the two JSON files. Define a `site` collection in `src/content.config.ts` with a JSON glob and `siteCopySchema`; replace duplicate schemas with `articleSchema` and `projectSchema`.

- [ ] **Step 4: Make the test pass and type-check**

Run: `npm run test:unit -- tests/unit/site-content.test.ts && npm run check`

Expected: PASS; Astro recognizes `articles`, `projects`, and `site` collection types.

- [ ] **Step 5: Commit the content contracts**

```bash
git add src/content-contracts.ts src/content.config.ts src/content/site src/lib/site-content.ts src/i18n/translations.ts tests/unit/site-content.test.ts
git commit -m "refactor: centralize editable site content"
```

### Task 2: Route and Tag Utilities

**Files:**
- Create: `src/lib/tags.ts`
- Modify: `src/i18n/types.ts`
- Modify: `src/config/site.ts`
- Modify: `src/lib/routes.ts`
- Test: `tests/unit/routes.test.ts`
- Test: `tests/unit/tags.test.ts`

**Interfaces:**
- Produces: `StaticPage = 'home' | 'articles' | 'projects' | 'archive' | 'about' | 'contact'`, `normalizeTagSlug(tag: string): string`, `tagPath(tag, language): string`, and `entryPath('articles' | 'projects', entry)`.
- Consumes: `Language` and the approved five-item navigation.

- [ ] **Step 1: Write failing route and Unicode Tag tests**

```ts
expect(localizedPath('articles', 'zh')).toBe('/articles/');
expect(localizedPath('archive', 'en')).toBe('/en/archive/');
expect(entryPath('articles', { id: 'hello', data: { language: 'zh' } })).toBe('/articles/hello/');
expect(normalizeTagSlug('  Full Stack  ')).toBe('full-stack');
expect(normalizeTagSlug('个人想法')).toBe('个人想法');
expect(tagPath('AI', 'en')).toBe('/en/tags/ai/');
```

- [ ] **Step 2: Run focused tests and verify old route failures**

Run: `npm run test:unit -- tests/unit/routes.test.ts tests/unit/tags.test.ts`

Expected: FAIL because `articles`, `archive`, and Tag helpers do not exist.

- [ ] **Step 3: Implement deterministic paths and Tag normalization**

```ts
export function normalizeTagSlug(tag: string): string {
  return tag.normalize('NFKC').trim().toLocaleLowerCase('en-US')
    .replace(/\s+/gu, '-')
    .replace(/[^\p{Letter}\p{Number}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function tagPath(tag: string, language: Language): string {
  const prefix = language === 'en' ? '/en' : '';
  return `${prefix}/tags/${encodeURIComponent(normalizeTagSlug(tag))}/`;
}
```

Set `siteConfig.navigation` to `['home', 'articles', 'projects', 'archive', 'about']`; keep Contact outside this array.

- [ ] **Step 4: Run tests and static checking**

Run: `npm run test:unit -- tests/unit/routes.test.ts tests/unit/tags.test.ts && npm run check`

Expected: PASS with five navigation destinations and Unicode Tag paths.

- [ ] **Step 5: Commit the routing contract**

```bash
git add src/i18n/types.ts src/config/site.ts src/lib/routes.ts src/lib/tags.ts tests/unit/routes.test.ts tests/unit/tags.test.ts
git commit -m "feat: add article archive and tag routes"
```

### Task 3: Rename the Article Collection and Build Unified Discovery Queries

**Files:**
- Move: `src/content/thoughts/.gitkeep` → `src/content/articles/.gitkeep`
- Modify: `src/lib/content.ts`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/en/index.astro`
- Modify: `src/pages/rss.xml.ts`
- Test: `tests/unit/content.test.ts`

**Interfaces:**
- Produces: `getPublishedArticles(language?)`, `ArchiveEntry`, `getArchiveEntries(language)`, `collectTags(entries)`, and `findTranslation` for either collection.
- Consumes: shared content schemas, Tag normalization, `entryPath('articles', entry)`.

- [ ] **Step 1: Write failing unified-content tests**

```ts
const archive = buildArchiveEntries(articleEntries, projectEntries, 'zh');
expect(archive.map(({ type, id }) => `${type}:${id}`)).toEqual(['project:new-project', 'article:older']);
expect(collectTags(archive)).toEqual([{ name: 'AI', slug: 'ai', count: 2 }]);
```

- [ ] **Step 2: Run the tests and verify missing exports**

Run: `npm run test:unit -- tests/unit/content.test.ts`

Expected: FAIL because the Article and Archive interfaces do not exist.

- [ ] **Step 3: Implement collection queries without mutating inputs**

```ts
export type ArchiveEntry = {
  id: string; type: 'article' | 'project'; title: string; summary: string;
  publishedAt: Date; language: Language; tags: string[]; href: string;
};

export function buildArchiveEntries(articles, projects, language: Language): ArchiveEntry[] {
  return [...articles.map(toArticleArchiveEntry), ...projects.map(toProjectArchiveEntry)]
    .filter((entry) => entry.language === language)
    .toSorted((a, b) => b.publishedAt.valueOf() - a.publishedAt.valueOf());
}
```

Rename all `thoughts` collection types and calls to `articles`. Update RSS title, description, and links to Articles.

- [ ] **Step 4: Run unit tests and build**

Run: `npm run test:unit -- tests/unit/content.test.ts && npm run build`

Expected: PASS; build contains no public article content and RSS remains valid.

- [ ] **Step 5: Commit the collection rename**

```bash
git add src/content src/lib/content.ts src/pages/index.astro src/pages/en/index.astro src/pages/rss.xml.ts tests/unit/content.test.ts
git commit -m "refactor: rename thoughts to articles"
```

### Task 4: Obsidian Global Shell and Navigation

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/components/shell/Header.astro`
- Modify: `src/components/shell/Footer.astro`
- Modify: `src/components/shell/LanguageSwitch.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `public/favicon.svg`
- Test: `tests/e2e/shell.spec.ts`
- Test: `tests/e2e/accessibility.spec.ts`

**Interfaces:**
- Produces: global Obsidian tokens and a five-link primary navigation plus language and Contact actions.
- Consumes: `siteConfig.navigation`, localized paths, site copy, `SY` identity.

- [ ] **Step 1: Update browser tests to the approved shell**

```ts
await expect(navigation.getByRole('link', { name: '文章' })).toHaveAttribute('href', '/articles/');
await expect(navigation.getByRole('link', { name: '归档' })).toHaveAttribute('href', '/archive/');
await expect(navigation.getByRole('link', { name: '联系我' })).toHaveAttribute('href', '/#contact');
await expect(navigation.getByRole('link')).toHaveCount(7);
```

- [ ] **Step 2: Run the shell test and verify it fails against Thoughts/light styling**

Run: `npm run test:e2e -- tests/e2e/shell.spec.ts`

Expected: FAIL because Articles, Archive, and the auxiliary Contact CTA are absent.

- [ ] **Step 3: Apply the approved global tokens and shell**

```css
:root {
  color-scheme: dark;
  --color-page: #070806; --color-surface: #10110f; --color-surface-2: #15140f;
  --color-ink: #f6f1e8; --color-muted: #9d9b94;
  --color-accent: #e8b84f; --color-accent-bright: #f7d985;
  --color-line: rgb(229 184 84 / 17%); --color-accent-soft: rgb(232 184 79 / 10%);
}
```

Build the pill-shaped translucent header, visible focus states, gold Contact button, Archive/Footer links, updated RSS label, and a black-gold `SY` favicon. Keep mobile navigation operable without horizontal overflow.

- [ ] **Step 4: Run shell and accessibility tests**

Run: `npm run test:e2e -- tests/e2e/shell.spec.ts tests/e2e/accessibility.spec.ts`

Expected: PASS with no Axe violations and visible keyboard focus.

- [ ] **Step 5: Commit the Obsidian shell**

```bash
git add src/styles/global.css src/components/shell src/layouts/BaseLayout.astro public/favicon.svg tests/e2e/shell.spec.ts tests/e2e/accessibility.spec.ts
git commit -m "feat: apply Obsidian site shell"
```

### Task 5: Obsidian Homepage Components

**Files:**
- Modify: `src/components/home/Hero.astro`
- Rename: `src/components/home/ThoughtsPreview.astro` → `src/components/home/ArticlesPreview.astro`
- Modify: `src/components/home/ProjectsPreview.astro`
- Modify: `src/components/home/ContactCTA.astro`
- Modify: `src/components/home/MiniAbout.astro`
- Modify: `src/components/common/EmptyState.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/en/index.astro`
- Test: `tests/e2e/home.spec.ts`
- Test: `tests/e2e/responsive.spec.ts`

**Interfaces:**
- Produces: homepage sections with `data-section="hero|articles|projects|contact|mini-about"`.
- Consumes: `getSiteCopy`, `getPublishedArticles`, `getPublishedProjects`, and Obsidian tokens.

- [ ] **Step 1: Change homepage tests to the approved names and black-gold tokens**

```ts
expect(order).toEqual(['hero', 'articles', 'projects', 'contact', 'mini-about']);
const tokens = await page.locator('html').evaluate((node) => ({
  page: getComputedStyle(node).getPropertyValue('--color-page').trim(),
  accent: getComputedStyle(node).getPropertyValue('--color-accent').trim(),
}));
expect(tokens).toEqual({ page: '#070806', accent: '#e8b84f' });
```

- [ ] **Step 2: Run homepage tests and verify the old Thoughts/light failures**

Run: `npm run test:e2e -- tests/e2e/home.spec.ts tests/e2e/responsive.spec.ts`

Expected: FAIL for section name, copy, and approved token assertions.

- [ ] **Step 3: Implement the approved high-fidelity homepage**

Use the visual design's grid mask, gold radial glow, orbit rings, oversized Hero, focus chips, honest bordered empty states, gold Contact panel, and compact bottom About. Read all copy from `getSiteCopy(language)`. Preserve the exact section order and real email.

- [ ] **Step 4: Run homepage, responsive, and reduced-motion tests**

Run: `npm run test:e2e -- tests/e2e/home.spec.ts tests/e2e/responsive.spec.ts tests/e2e/accessibility.spec.ts`

Expected: PASS at desktop and 390×844 without horizontal overflow.

- [ ] **Step 5: Commit the homepage redesign**

```bash
git add src/components/home src/components/common/EmptyState.astro src/pages/index.astro src/pages/en/index.astro tests/e2e/home.spec.ts tests/e2e/responsive.spec.ts
git commit -m "feat: redesign homepage in Obsidian Tech"
```

### Task 6: Articles, Article Details, and Legacy Thoughts Compatibility

**Files:**
- Create: `src/components/common/ArticleCard.astro`
- Create: `src/pages/articles/index.astro`
- Create: `src/pages/articles/[...id].astro`
- Create: `src/pages/en/articles/index.astro`
- Create: `src/pages/en/articles/[...id].astro`
- Create: `src/layouts/RedirectLayout.astro`
- Modify: `src/layouts/ContentLayout.astro`
- Modify: `src/pages/thoughts/index.astro`, `src/pages/en/thoughts/index.astro`
- Modify: `src/pages/thoughts/[...id].astro`, `src/pages/en/thoughts/[...id].astro`
- Rename: `tests/dist/thought-details.test.ts` → `tests/dist/article-details.test.ts`
- Rename: `tests/e2e/thoughts.spec.ts` → `tests/e2e/articles.spec.ts`

**Interfaces:**
- Produces: bilingual Article list/detail routes, clickable Tags, and static legacy redirect pages.
- Consumes: `getPublishedArticles`, `findTranslation`, `ArticleCard`, `tagPath`.

- [ ] **Step 1: Write failing Article route and compatibility tests**

```ts
await page.goto('/articles/');
await expect(page.getByRole('heading', { level: 1, name: '最近的文章' })).toBeVisible();
await page.goto('/thoughts/');
await expect(page).toHaveURL('/articles/');
```

Fixture artifact assertions must use `/articles/<id>/`, reciprocal alternate URLs, and Tag links.

- [ ] **Step 2: Run focused tests and verify missing Article output**

Run: `npm run test:dist -- tests/dist/article-details.test.ts && npm run test:e2e -- tests/e2e/articles.spec.ts`

Expected: FAIL because `/articles/` output is absent.

- [ ] **Step 3: Build Article pages and explicit legacy redirects**

Article pages follow the current detail generation pattern but use the `articles` collection. In `ContentLayout`, render each Tag as:

```astro
<a href={tagPath(tag, props.language)}>{tag}</a>
```

`RedirectLayout.astro` accepts exact `destination`, `title`, and `language` props, sets canonical to the destination, includes `<meta http-equiv="refresh" content="0;url=<destination>">`, and renders a normal link. Legacy indexes target the Article index. Legacy dynamic pages use the public Article collection in `getStaticPaths()` and target the same localized Article ID; unknown IDs remain normal 404s.

- [ ] **Step 4: Run Article, artifact, and accessibility tests**

Run: `npm run test:dist -- tests/dist/article-details.test.ts && npm run test:e2e -- tests/e2e/articles.spec.ts tests/e2e/accessibility.spec.ts`

Expected: PASS with correct canonical, alternate, language-switch, and Tag links.

- [ ] **Step 5: Commit Articles**

```bash
git add src/components/common/ArticleCard.astro src/pages/articles src/pages/en/articles src/pages/thoughts src/pages/en/thoughts src/layouts/RedirectLayout.astro src/layouts/ContentLayout.astro tests/dist/article-details.test.ts tests/e2e/articles.spec.ts
git commit -m "feat: publish bilingual article routes"
```

### Task 7: Unified Archive and Tag Discovery

**Files:**
- Create: `src/components/archive/ArchiveList.astro`
- Create: `src/components/common/TagList.astro`
- Create: `src/pages/archive/index.astro`
- Create: `src/pages/en/archive/index.astro`
- Create: `src/pages/tags/index.astro`
- Create: `src/pages/tags/[...tag].astro`
- Create: `src/pages/en/tags/index.astro`
- Create: `src/pages/en/tags/[...tag].astro`
- Modify: `src/components/common/ArticleCard.astro`
- Modify: `src/components/common/ProjectCard.astro`
- Test: `tests/dist/tag-pages.test.ts`
- Test: `tests/e2e/archive.spec.ts`
- Test: `tests/e2e/tags.spec.ts`

**Interfaces:**
- Produces: static Tag index/detail pages and query-backed Archive filtering.
- Consumes: `getArchiveEntries`, `collectTags`, `normalizeTagSlug`, `tagPath`.

- [ ] **Step 1: Write fixture-driven failing Tag and Archive tests**

```ts
expect(await output('tags/ai/index.html')).toContain('AI');
expect(await output('tags/ai/index.html')).toContain('/articles/tagged-article/');
expect(await output('tags/ai/index.html')).toContain('/projects/tagged-project/');
```

Browser assertions load `/archive/?type=article&tag=ai`, verify only matching rows remain, reload, and verify filters persist.

- [ ] **Step 2: Run focused tests and verify missing routes**

Run: `npm run test:dist -- tests/dist/tag-pages.test.ts && npm run test:e2e -- tests/e2e/archive.spec.ts tests/e2e/tags.spec.ts`

Expected: FAIL because Archive and Tag outputs do not exist.

- [ ] **Step 3: Implement semantic static output and progressive filtering**

Render all archive items in HTML with `data-type` and `data-tags="ai,full-stack"`. A small inline module reads `URLSearchParams`, updates `hidden`, control states, result count, and the current URL via `history.replaceState`. With JavaScript disabled, controls are absent and every entry stays visible.

Use `getStaticPaths()` on Tag detail pages to emit only public Tags for the current language. Cards and detail pages link to those generated routes.

- [ ] **Step 4: Run Tag, Archive, no-JavaScript, and link tests**

Run: `npm run test:dist -- tests/dist/tag-pages.test.ts tests/dist/artifacts.test.ts && npm run test:e2e -- tests/e2e/archive.spec.ts tests/e2e/tags.spec.ts`

Expected: PASS with shareable filters and no broken Tag links.

- [ ] **Step 5: Commit discovery pages**

```bash
git add src/components/archive src/components/common src/pages/archive src/pages/en/archive src/pages/tags src/pages/en/tags tests/dist/tag-pages.test.ts tests/e2e/archive.spec.ts tests/e2e/tags.spec.ts
git commit -m "feat: add archive and tag discovery"
```

### Task 8: Remaining Pages, Metadata, and Documentation

**Files:**
- Modify: `src/pages/about.astro`, `src/pages/en/about.astro`
- Modify: `src/pages/contact.astro`, `src/pages/en/contact.astro`
- Modify: `src/pages/projects/index.astro`, `src/pages/en/projects/index.astro`
- Modify: `src/pages/projects/[...id].astro`, `src/pages/en/projects/[...id].astro`
- Modify: `src/pages/404.astro`
- Modify: `README.md`
- Modify: `tests/dist/artifacts.test.ts`
- Modify: `tests/e2e/pages.spec.ts`, `tests/e2e/projects.spec.ts`

**Interfaces:**
- Produces: consistent Obsidian visuals and editable copy across every remaining route.
- Consumes: site JSON, Tag links, new navigation, shared layouts.

- [ ] **Step 1: Update route, copy, and artifact expectations**

Required output includes `articles`, `archive`, and `tags` indexes in both languages while retaining auxiliary Contact and 404. Update browser expectations from Thoughts to Articles and assert project Tag links.

- [ ] **Step 2: Run affected suites and record the failures**

Run: `npm run test:dist -- tests/dist/artifacts.test.ts && npm run test:e2e -- tests/e2e/pages.spec.ts tests/e2e/projects.spec.ts`

Expected: FAIL on old required routes, copy sources, and light styles.

- [ ] **Step 3: Migrate pages to site JSON and Obsidian surfaces**

Keep current truthful About sections, Contact email behavior, Project empty state, SEO alternates, and localized 404 logic. Replace light card/button colors with tokens and update all Thoughts copy/links to Articles. Update README authoring paths and document Tag routes.

- [ ] **Step 4: Run the complete verification gate**

Run: `npm run verify && git diff --check`

Expected: Astro check passes; 5+ unit, fixture, and browser suites all report zero failures; no whitespace errors.

- [ ] **Step 5: Commit the completed website**

```bash
git add src README.md tests
git commit -m "feat: complete Obsidian content site"
```
