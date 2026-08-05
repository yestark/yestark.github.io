import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { articleSchema, projectSchema, siteCopySchema } from './content-contracts';

const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.md' }),
  schema: articleSchema,
});

const thoughts = defineCollection({
  loader: glob({ base: './src/content/thoughts', pattern: '**/*.md' }),
  schema: articleSchema,
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: projectSchema,
});

const site = defineCollection({
  loader: glob({ base: './src/content/site', pattern: '**/*.json' }),
  schema: siteCopySchema,
});

export const collections = { articles, thoughts, projects, site };
