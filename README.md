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
description: "用于列表与搜索摘要的一句话"
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
