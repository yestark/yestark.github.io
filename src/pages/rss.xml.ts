import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { siteConfig } from '../config/site';
import { getPublishedArticles } from '../lib/content';
import { entryPath } from '../lib/routes';

export async function GET(context: APIContext) {
  const entries = await getPublishedArticles();
  return rss({
    title: 'Stark Ye — Articles',
    description: 'Articles on AI, software, and ideas worth keeping.',
    site: context.site ?? siteConfig.siteUrl,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.publishedAt,
      link: entryPath('articles', entry),
      categories: entry.data.tags,
    })),
  });
}
