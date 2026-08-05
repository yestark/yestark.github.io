# Stark Studio Local Publishing Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a localhost-only Markdown studio with live preview, Tag assistance, editable site copy, safe asset import, and one-click Git publication, launched by a black-gold macOS app icon.

**Architecture:** A Node.js 24 HTTP server owns a strict repository API and serves a Vite-built vanilla TypeScript UI. CodeMirror edits Markdown while forms manage validated metadata; the server writes only allowlisted content paths using atomic replacement. Publishing runs deterministic preflight commands, stages an exact file list, commits, and pushes `HEAD:main`; a lightweight macOS App Bundle starts or reuses the local process.

**Tech Stack:** Node.js 24, TypeScript 6, native `node:http`, Vite, CodeMirror 6, `gray-matter`, `marked`, Astro shared schemas, Vitest, Playwright, Git, macOS App Bundle and `.icns`.

## Global Constraints

- Studio binds only to `127.0.0.1` on a random available port.
- Every write request requires a random session token and a matching local `Origin`.
- File access is limited to `src/content/articles`, `src/content/projects`, `src/content/site`, and `public/uploads`.
- Markdown remains the source of truth; do not introduce a database or proprietary document format.
- Chinese is the default authoring language; English article/project content is optional.
- Existing Tags autocomplete; new Tags are allowed and show their normalized route before save.
- Publishing targets remote `main`, never force-pushes, never auto-resolves conflicts, and never stages unrelated files.
- Failed save, validation, build, commit, or push operations preserve recoverable local content.
- The launcher installs to `~/Applications/Stark Studio.app` and uses the approved gold-orbit `SY` icon.
- The implementation must not read browser credentials, GitHub tokens, or unrelated user files.

## File Structure

- `studio/shared/contracts.ts`: request/response DTOs shared by server and UI.
- `studio/content/{paths,repository,frontmatter,assets}.ts`: allowlisted path resolution, Markdown/JSON IO, atomic writes, and images.
- `studio/server/{index,session,router,responses}.ts`: loopback server, session security, endpoints, and static UI.
- `studio/publish/{git,preflight,publish,sync}.ts`: command execution, exact staging, commits, push, and recovery snapshots.
- `studio/ui/{index.html,main.ts,styles.css}`: shell and navigation.
- `studio/ui/components/{dashboard,editor,metadata,preview,site-form,status}.ts`: focused views.
- `studio/vite.config.ts`: browser bundle to `studio/dist`.
- `studio/launcher/{install,run,icon.svg}.ts|svg`: App Bundle and icon generation.
- `tests/studio/unit/**`: path, schema, repository, assets, session, Git planning tests.
- `tests/studio/integration/**`: server and temporary-repository publish tests.
- `tests/studio/e2e/**`: browser authoring flows.

---

### Task 1: Studio Build, Scripts, and Shared DTOs

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `tsconfig.json`
- Modify: `vitest.config.ts`
- Create: `studio/vite.config.ts`
- Create: `studio/shared/contracts.ts`
- Create: `studio/ui/index.html`
- Create: `studio/ui/main.ts`
- Create: `studio/ui/styles.css`
- Test: `tests/studio/unit/contracts.test.ts`

**Interfaces:**
- Produces: `ContentType`, `ContentSummary`, `ContentDocument`, `SiteCopyDocument`, `StudioStatus`, `ApiError`, `SaveContentRequest`, and browser/server build scripts.
- Consumes: website `Language`, shared content schemas, Node.js 24.

- [ ] **Step 1: Write failing DTO validation tests**

```ts
import { describe, expect, it } from 'vitest';
import { saveContentRequestSchema } from '../../../studio/shared/contracts';

it('requires a known type, normalized id, metadata, and Markdown body', () => {
  expect(saveContentRequestSchema.safeParse({ type: 'article', id: '../escape', metadata: {}, body: '' }).success).toBe(false);
  expect(saveContentRequestSchema.safeParse({ type: 'article', id: 'first-note', metadata: { title: 'First', language: 'zh', publishedAt: '2026-08-06', tags: ['AI'], draft: true, description: 'Summary' }, body: '# Hello' }).success).toBe(true);
});
```

- [ ] **Step 2: Run the test and verify missing Studio modules**

Run: `npm run test:unit -- tests/studio/unit/contracts.test.ts`

Expected: FAIL because Studio contracts and dependencies are absent.

- [ ] **Step 3: Add exact dependencies, scripts, DTOs, and UI entry**

Add runtime dependencies `codemirror`, `@codemirror/lang-markdown`, `gray-matter`, `marked`, `sharp`, and `zod`; add development dependencies `tsx` and `vite`.

```json
{
  "studio": "npm run studio:build && tsx studio/server/index.ts",
  "studio:build": "vite build --config studio/vite.config.ts",
  "studio:test": "vitest run tests/studio",
  "studio:install-app": "tsx studio/launcher/install.ts"
}
```

Define DTO schemas with Zod. `ContentType` is exactly `'article' | 'project'`; IDs match `/^[\p{Letter}\p{Number}][\p{Letter}\p{Number}-]*$/u`; response errors use `{ code: string; message: string; details?: unknown }`.

- [ ] **Step 4: Build the empty Studio shell and run the contract test**

Run: `npm run studio:build && npm run test:unit -- tests/studio/unit/contracts.test.ts && npm run check`

Expected: Vite writes `studio/dist`; DTO test and project check pass.

- [ ] **Step 5: Commit Studio scaffolding**

```bash
git add package.json package-lock.json tsconfig.json vitest.config.ts studio tests/studio/unit/contracts.test.ts
git commit -m "chore: scaffold Stark Studio"
```

### Task 2: Allowlisted Content Repository and Atomic Saving

**Files:**
- Create: `studio/content/paths.ts`
- Create: `studio/content/frontmatter.ts`
- Create: `studio/content/repository.ts`
- Test: `tests/studio/unit/paths.test.ts`
- Test: `tests/studio/unit/repository.test.ts`

**Interfaces:**
- Produces: `createContentPaths(root): ContentPaths`, `ContentRepository.list(type)`, `.read(type,id)`, `.save(document)`, `.readSite(language)`, `.saveSite(language,copy)`, and `.listTags()`.
- Consumes: shared site schemas, Tag normalization, Studio DTOs.

- [ ] **Step 1: Write failing traversal and round-trip tests**

```ts
expect(() => paths.contentFile('article', '../secrets')).toThrow('Invalid content id');
await repository.save(articleDocument);
expect(await repository.read('article', 'first-note')).toEqual(articleDocument);
expect((await repository.listTags()).find((tag) => tag.slug === 'ai')?.count).toBe(1);
```

Use `mkdtemp()` and a fixture repository; assert no `.tmp-*` file remains after save.

- [ ] **Step 2: Run the tests and verify missing repository failures**

Run: `npm run test:unit -- tests/studio/unit/paths.test.ts tests/studio/unit/repository.test.ts`

Expected: FAIL because allowlisted paths and repository are undefined.

- [ ] **Step 3: Implement normalized frontmatter and atomic writes**

```ts
async function atomicWrite(path: string, contents: string): Promise<void> {
  const temporary = `${path}.tmp-${randomUUID()}`;
  await writeFile(temporary, contents, { encoding: 'utf8', flag: 'wx' });
  await rename(temporary, path);
}
```

Resolve each candidate with `resolve(root, allowedDirectory, filename)` and verify it starts with the resolved allowed directory plus `sep`. Parse Markdown with `gray-matter`, validate metadata using shared schemas, serialize frontmatter in stable field order, and aggregate Tags using `normalizeTagSlug`.

- [ ] **Step 4: Run repository tests and inject a simulated write failure**

Run: `npm run test:unit -- tests/studio/unit/paths.test.ts tests/studio/unit/repository.test.ts`

Expected: PASS; original file remains readable when the temporary-write test throws.

- [ ] **Step 5: Commit the content repository**

```bash
git add studio/content tests/studio/unit/paths.test.ts tests/studio/unit/repository.test.ts
git commit -m "feat: add safe Studio content repository"
```

### Task 3: Authenticated Loopback Server and Content API

**Files:**
- Create: `studio/server/session.ts`
- Create: `studio/server/responses.ts`
- Create: `studio/server/router.ts`
- Create: `studio/server/index.ts`
- Test: `tests/studio/unit/session.test.ts`
- Test: `tests/studio/integration/server.test.ts`

**Interfaces:**
- Produces: `startStudioServer({ root, openBrowser }): Promise<{ origin, token, close }>` and authenticated endpoints `/api/status`, `/api/content`, `/api/content/:type/:id`, `/api/site/:language`, `/api/tags`.
- Consumes: `ContentRepository`, Studio DTOs, built UI under `studio/dist`.

- [ ] **Step 1: Write failing origin, token, and API tests**

```ts
expect((await fetch(`${origin}/api/status`)).status).toBe(401);
expect((await fetch(`${origin}/api/status?token=${token}`, { headers: { Origin: origin } })).status).toBe(200);
expect((await fetch(`${origin}/api/content/article/../secret?token=${token}`, { headers: { Origin: origin } })).status).toBe(404);
```

Also bind a test server and assert its address is `127.0.0.1` rather than `0.0.0.0`.

- [ ] **Step 2: Run server tests and verify missing endpoints**

Run: `npm run studio:test -- tests/studio/unit/session.test.ts tests/studio/integration/server.test.ts`

Expected: FAIL because the server does not exist.

- [ ] **Step 3: Implement loopback-only routing and security headers**

Generate `randomBytes(32).toString('hex')`; accept the token from the URL query and require `Origin === origin` on `POST`, `PUT`, and `DELETE`. Return JSON with `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, and a CSP limited to `'self'`. Serve only files below `studio/dist` and reject decoded paths containing `..` or path separators.

- [ ] **Step 4: Run unit and integration tests**

Run: `npm run studio:test -- tests/studio/unit/session.test.ts tests/studio/integration/server.test.ts`

Expected: PASS for authorized CRUD and all rejected cross-origin/traversal cases.

- [ ] **Step 5: Commit the local server**

```bash
git add studio/server tests/studio/unit/session.test.ts tests/studio/integration/server.test.ts
git commit -m "feat: serve authenticated local Studio API"
```

### Task 4: Dashboard, Markdown Editor, Live Preview, and Tag Assistance

**Files:**
- Create: `studio/ui/api.ts`
- Create: `studio/ui/router.ts`
- Create: `studio/ui/components/dashboard.ts`
- Create: `studio/ui/components/editor.ts`
- Create: `studio/ui/components/metadata.ts`
- Create: `studio/ui/components/preview.ts`
- Create: `studio/ui/components/status.ts`
- Modify: `studio/ui/main.ts`
- Modify: `studio/ui/styles.css`
- Test: `tests/studio/e2e/editor.spec.ts`

**Interfaces:**
- Produces: Dashboard, Articles/Projects lists, split Markdown editor, metadata form, debounced save, live preview, Tag autocomplete.
- Consumes: authenticated API and DTOs; `marked` and CodeMirror.

- [ ] **Step 1: Write the failing authoring browser flow**

```ts
await page.getByRole('link', { name: 'Articles' }).click();
await page.getByRole('button', { name: 'New article' }).click();
await page.getByLabel('Title').fill('First AI note');
await page.getByLabel('Tags').fill('AI');
await page.getByRole('textbox', { name: 'Markdown' }).fill('# Hello');
await expect(page.getByRole('region', { name: 'Preview' })).toContainText('Hello');
await expect(page.getByText('Saved')).toBeVisible();
```

Assert the Tag option displays `AI · /tags/ai/` and a duplicate `ai` Tag is rejected.

- [ ] **Step 2: Run the Studio E2E test and verify the empty-shell failure**

Run: `npm run studio:build && npx playwright test -c studio/playwright.config.ts tests/studio/e2e/editor.spec.ts`

Expected: FAIL because authoring views are absent.

- [ ] **Step 3: Implement focused UI components**

Use CodeMirror with `markdown()` and an accessible editor label. Render preview with `marked.parse` into a sanitized element that rejects raw HTML by escaping it before Markdown parsing. Debounce saves by 600ms, flush on navigation, and expose `Saving`, `Saved`, and `Save failed` status text via `aria-live="polite"`.

The Tag input queries `/api/tags`, displays existing names/counts/routes, normalizes new values, and stores the user-visible names in metadata.

- [ ] **Step 4: Run editor E2E and UI build**

Run: `npm run studio:build && npx playwright test -c studio/playwright.config.ts tests/studio/e2e/editor.spec.ts`

Expected: PASS for new Article, preview, Tag autocomplete, duplicate rejection, and persistence after reload.

- [ ] **Step 5: Commit the editor experience**

```bash
git add studio/ui studio/playwright.config.ts tests/studio/e2e/editor.spec.ts
git commit -m "feat: add Studio Markdown authoring"
```

### Task 5: Editable Site Copy and Safe Asset Import

**Files:**
- Create: `studio/content/assets.ts`
- Create: `studio/ui/components/site-form.ts`
- Create: `studio/ui/components/asset-picker.ts`
- Modify: `studio/server/router.ts`
- Modify: `studio/ui/main.ts`
- Test: `tests/studio/unit/assets.test.ts`
- Test: `tests/studio/e2e/site-and-assets.spec.ts`

**Interfaces:**
- Produces: `importAsset({ bytes, name, mimeType, slug, date }): Promise<AssetResult>`, raw-body `POST /api/assets`, and bilingual Site form.
- Consumes: allowlisted uploads path, `siteCopySchema`, authenticated multipart-free binary upload endpoint.

- [ ] **Step 1: Write failing asset and Site form tests**

```ts
expect(await importAsset(validPng)).toMatchObject({ publicPath: '/uploads/2026/08/first-note-cover.png' });
await expect(importAsset({ ...validPng, bytes: new Uint8Array(10_000_001) })).rejects.toThrow('10 MB');
await expect(importAsset({ ...validPng, name: '../../escape.png' })).rejects.toThrow('filename');
```

Browser flow edits the Chinese Hero body, saves, reloads, and verifies the value without touching the English file.

- [ ] **Step 2: Run tests and verify missing asset/Site UI failures**

Run: `npm run studio:test -- tests/studio/unit/assets.test.ts && npx playwright test -c studio/playwright.config.ts tests/studio/e2e/site-and-assets.spec.ts`

Expected: FAIL because import and Site form are absent.

- [ ] **Step 3: Implement exact MIME, size, path, and JSON behavior**

Allow only `image/jpeg`, `image/png`, `image/webp`, and `image/avif`. Warn from 2,000,001 through 10,000,000 bytes and reject larger payloads. Normalize the basename, append an eight-character SHA-256 suffix only on collision, and atomically write under `public/uploads/YYYY/MM`.

Render zh/en Site tabs from the schema shape; save one language at a time through `PUT /api/site/:language`. Asset upload sends raw bytes to `POST /api/assets?slug=<slug>&name=<encoded-name>` with the actual MIME type in `Content-Type`; the router streams at most 10,000,001 bytes before aborting and passes the buffer to `importAsset`.

- [ ] **Step 4: Run asset, Site, and traversal tests**

Run: `npm run studio:test -- tests/studio/unit/assets.test.ts tests/studio/integration/server.test.ts && npx playwright test -c studio/playwright.config.ts tests/studio/e2e/site-and-assets.spec.ts`

Expected: PASS; invalid binary data never reaches the public directory.

- [ ] **Step 5: Commit Site and asset management**

```bash
git add studio/content/assets.ts studio/server/router.ts studio/ui tests/studio/unit/assets.test.ts tests/studio/e2e/site-and-assets.spec.ts
git commit -m "feat: manage site copy and Studio assets"
```

### Task 6: Git Preflight, Safe Sync, Commit, and Push

**Files:**
- Create: `studio/publish/git.ts`
- Create: `studio/publish/preflight.ts`
- Create: `studio/publish/sync.ts`
- Create: `studio/publish/publish.ts`
- Modify: `studio/server/router.ts`
- Create: `studio/ui/components/publish.ts`
- Test: `tests/studio/unit/preflight.test.ts`
- Test: `tests/studio/integration/publish.test.ts`
- Test: `tests/studio/e2e/publish.spec.ts`

**Interfaces:**
- Produces: `runGit(args, cwd)`, `inspectPublishState(root, managedPaths)`, `safeSync(root)`, and `publish(root, request): PublishResult`.
- Consumes: exact managed path list from repository/API, Node child-process `execFile`, project scripts.

- [ ] **Step 1: Write failing temporary-Git-repository tests**

```ts
expect(await inspectPublishState(repo, ['src/content/articles/one.md'])).toMatchObject({ canPublish: true });
await writeFile(join(repo, 'src/styles/global.css'), 'unrelated');
expect((await inspectPublishState(repo, managed)).canPublish).toBe(false);
expect(await stagedFiles(repo)).toEqual(['src/content/articles/one.md']);
```

Use a local bare repository as `origin`; assert the push updates `refs/heads/main` and no other file is committed. Simulate rejected push and verify one local commit remains for retry.

- [ ] **Step 2: Run publish tests and verify missing Git layer**

Run: `npm run studio:test -- tests/studio/unit/preflight.test.ts tests/studio/integration/publish.test.ts`

Expected: FAIL because publish interfaces are absent.

- [ ] **Step 3: Implement command arrays, recovery snapshots, and exact staging**

```ts
export async function runGit(args: string[], cwd: string): Promise<string> {
  const { stdout } = await execFileAsync('git', args, { cwd, encoding: 'utf8' });
  return stdout.trim();
}
```

Fetch `origin main`; block on changes outside allowlisted managed paths. For safe sync, copy managed files to `.stark-studio/recovery/<ISO timestamp>/`, record hashes of their `HEAD` bases, restore tracked managed paths to `HEAD`, move untracked managed files into recovery, run `git merge --ff-only origin/main`, and compare each new base hash with the recorded base before reapplying. If a target changed on both sides, stop before overwriting and retain recovery; otherwise atomically restore the Studio version.

Run `npm run check`, `npm run test:unit`, and `npm run build`. Stage only `git add -- <exact managed paths>`, commit with the specified content message, then `git push origin HEAD:main`. Never use `--force`.

- [ ] **Step 4: Run unit, integration, and UI publish tests**

Run: `npm run studio:test -- tests/studio/unit/preflight.test.ts tests/studio/integration/publish.test.ts && npx playwright test -c studio/playwright.config.ts tests/studio/e2e/publish.spec.ts`

Expected: PASS for success, unrelated-file block, remote-ahead recovery, build failure, rejected push, and retry.

- [ ] **Step 5: Commit one-click publishing**

```bash
git add studio/publish studio/server/router.ts studio/ui/components/publish.ts tests/studio/unit/preflight.test.ts tests/studio/integration/publish.test.ts tests/studio/e2e/publish.spec.ts
git commit -m "feat: add safe one-click publishing"
```

### Task 7: Gold-Orbit macOS App Launcher

**Files:**
- Create: `studio/launcher/icon.svg`
- Create: `studio/launcher/iconset.ts`
- Create: `studio/launcher/install.ts`
- Create: `studio/launcher/run.sh`
- Modify: `.gitignore`
- Test: `tests/studio/unit/launcher.test.ts`

**Interfaces:**
- Produces: `npm run studio:install-app` and `~/Applications/Stark Studio.app` with `Contents/Info.plist`, `Contents/MacOS/Stark Studio`, and `Contents/Resources/StarkStudio.icns`.
- Consumes: approved gold-orbit SVG, absolute repository path, `npm run studio`.

- [ ] **Step 1: Write failing bundle-layout and icon tests**

```ts
await installLauncher({ projectRoot, destination });
expect(await fileExists(join(destination, 'Contents/Info.plist'))).toBe(true);
expect(await mode(join(destination, 'Contents/MacOS/Stark Studio')) & 0o111).not.toBe(0);
expect(await fileExists(join(destination, 'Contents/Resources/StarkStudio.icns'))).toBe(true);
```

Test against a temporary destination, never the real `~/Applications`.

- [ ] **Step 2: Run launcher tests and verify missing installer failure**

Run: `npm run studio:test -- tests/studio/unit/launcher.test.ts`

Expected: FAIL because installer and assets do not exist.

- [ ] **Step 3: Implement a lightweight App Bundle**

Use the approved 1024×1024 gold-orbit SVG as the source. Render PNG sizes 16, 32, 64, 128, 256, 512, and 1024 with `sharp` into an `.iconset`, call `/usr/bin/iconutil -c icns`, and copy the result into the bundle. `Info.plist` sets `CFBundleName`, `CFBundleDisplayName`, `CFBundleIdentifier=com.starkye.studio`, `CFBundleExecutable=Stark Studio`, and `CFBundleIconFile=StarkStudio`.

The executable changes to the recorded repository path and runs the configured Node.js 24 command without opening Terminal. If the server lock reports an existing instance, it opens that URL instead.

- [ ] **Step 4: Run tests and install the real user app**

Run: `npm run studio:test -- tests/studio/unit/launcher.test.ts && npm run studio:install-app`

Expected: tests pass and `~/Applications/Stark Studio.app` exists with the gold-orbit icon. This real installation is an external filesystem action and requires the user's already granted task authorization plus environment approval.

- [ ] **Step 5: Commit the launcher**

```bash
git add studio/launcher .gitignore tests/studio/unit/launcher.test.ts
git commit -m "feat: install Stark Studio macOS launcher"
```

### Task 8: Documentation, CI Contract, and Full Verification

**Files:**
- Modify: `README.md`
- Create: `docs/STARK-STUDIO.md`
- Modify: `.github/workflows/deploy.yml`
- Modify: `package.json`
- Test: `tests/studio/integration/ci-contract.test.ts` plus all Studio and website suites

**Interfaces:**
- Produces: documented install/write/publish/recover workflow and CI coverage.
- Consumes: completed site and Studio.

- [ ] **Step 1: Add a failing CI and documentation contract test**

```ts
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const workflow = await readFile('.github/workflows/deploy.yml', 'utf8');
expect(packageJson.scripts.verify).toContain('studio:verify');
expect(workflow).toContain('npm run studio:verify');
expect(await readFile('docs/STARK-STUDIO.md', 'utf8')).toContain('安全同步');
```

- [ ] **Step 2: Run the contract test and verify missing integration**

Run: `npm run studio:test -- tests/studio/integration/ci-contract.test.ts`

Expected: FAIL because `studio:verify`, the workflow step, and `docs/STARK-STUDIO.md` do not exist.

- [ ] **Step 3: Document exact user workflows and CI commands**

Document:

```bash
npm ci
npm run studio:install-app
npm run studio
npm run studio:test
npm run verify
```

Include Dashboard, Markdown, bilingual content, Tags, images, drafts, publish, safe sync, recovery directory, launcher reinstall, and uninstall instructions. Add `studio:verify` as `npm run studio:build && npm run studio:test`, include it in the root `verify` script, and run it in CI before Pages build.

- [ ] **Step 4: Run the complete repository gate and visual smoke test**

Run: `npm run studio:build && npm run studio:test && npm run verify && git diff --check`

Expected: all Studio and website checks pass; no untracked generated build/app artifacts remain; the local launcher opens the Studio dashboard; `starkye.com` build output remains deployable.

- [ ] **Step 5: Commit the completed Studio**

```bash
git add README.md docs/STARK-STUDIO.md .github/workflows/deploy.yml package.json package-lock.json tests studio
git commit -m "docs: complete Stark Studio workflow"
```
