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
