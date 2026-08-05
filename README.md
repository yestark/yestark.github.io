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

## Publish an Article

Add `src/content/articles/<slug>.md`:

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

Every Tag becomes a discovery link automatically. Published Tags are listed at `/tags/` and `/en/tags/`; each Tag page combines matching Articles and Projects. The Archive can also be filtered by content type and Tag with shareable URL parameters.

## Publish a Project

Add `src/content/projects/<slug>.md` with `title`, `summary`, `publishedAt`, `tags`, `language`, `featured`, `draft`, optional `translationKey`, and optional `links` entries containing `label` and `url`.

## Languages

Common bilingual page copy is maintained in `src/content/site/zh.json` and `src/content/site/en.json`. Articles and Projects are published in their authored language. Matching `translationKey` values connect Chinese and English versions.

## Deployment

The site deploys to GitHub Pages with `public/CNAME` set to `starkye.com`. Do not remove that file.
