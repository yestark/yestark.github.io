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
