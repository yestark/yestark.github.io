import { z } from 'astro/zod';

export const sharedEntryFields = {
  title: z.string().min(1),
  publishedAt: z.coerce.date(),
  tags: z.array(z.string().min(1)).default([]),
  language: z.enum(['zh', 'en']),
  draft: z.boolean().default(false),
  translationKey: z.string().min(1).optional(),
  cover: z.string().min(1).optional(),
};

export const articleSchema = z.object({
  ...sharedEntryFields,
  description: z.string().min(1),
  updatedAt: z.coerce.date().optional(),
});

export const projectSchema = z.object({
  ...sharedEntryFields,
  summary: z.string().min(1),
  featured: z.boolean().default(false),
  links: z
    .array(z.object({ label: z.string().min(1), url: z.url() }))
    .default([]),
});

const aboutSectionSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  items: z.array(z.string().min(1)).optional(),
});

export const siteCopySchema = z.object({
  locale: z.string().min(1),
  hero: z.object({
    status: z.string().min(1),
    intro: z.string().min(1),
    title: z.string().min(1),
    body: z.string().min(1),
    articlesCta: z.string().min(1),
    aboutCta: z.string().min(1),
  }),
  articles: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    emptyTitle: z.string().min(1),
    emptyBody: z.string().min(1),
    all: z.string().min(1),
  }),
  projects: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    emptyTitle: z.string().min(1),
    emptyBody: z.string().min(1),
    all: z.string().min(1),
  }),
  contact: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    body: z.string().min(1),
    email: z.email(),
    emailLabel: z.string().min(1),
    copy: z.string().min(1),
    copied: z.string().min(1),
    copyFailed: z.string().min(1),
  }),
  about: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    body: z.string().min(1),
    link: z.string().min(1),
    sections: z.record(z.string(), aboutSectionSchema),
  }),
  footer: z.string().min(1),
});

export type ArticleData = z.infer<typeof articleSchema>;
export type ProjectData = z.infer<typeof projectSchema>;
export type SiteCopy = z.infer<typeof siteCopySchema>;
