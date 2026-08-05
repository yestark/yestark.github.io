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

  it('publishes the crawler policy with its canonical sitemap', () => {
    expect(readFileSync(join(dist, 'robots.txt'), 'utf8')).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://starkye.com/sitemap-index.xml\n',
    );
  });

  it('emits canonical URLs and no broken internal links', () => {
    for (const file of htmlFiles(dist)) {
      const html = readFileSync(file, 'utf8');
      if (!file.endsWith('404.html')) expect(html).toMatch(/<link rel="canonical" href="https:\/\/starkye\.com\//);
      for (const match of html.matchAll(/href="([^"]+)"/g)) {
        const href = match[1];
        if (href === undefined) throw new Error(`Unable to read internal link in ${file}`);
        if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) continue;
        const pathname = new URL(href, 'https://starkye.com').pathname;
        expect(existsSync(outputFor(pathname)), `${file} -> ${href}`).toBe(true);
      }
    }
  });
});
