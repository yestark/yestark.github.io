import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const dist = join(process.cwd(), 'dist');
const siteUrl = 'https://starkye.com';
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

function urlForOutput(file: string): string {
  const outputPath = relative(dist, file).replaceAll('\\', '/');
  if (outputPath === 'index.html') return `${siteUrl}/`;
  if (outputPath.endsWith('/index.html')) return `${siteUrl}/${outputPath.slice(0, -'index.html'.length)}`;
  return `${siteUrl}/${outputPath}`;
}

function attributes(element: string): Record<string, string> {
  return Object.fromEntries(
    [...element.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value]),
  );
}

function links(html: string): Record<string, string>[] {
  return [...html.matchAll(/<link\b[^>]*>/gi)].map(([element]) => attributes(element));
}

function required(value: string | undefined, context: string): string {
  if (value === undefined) throw new Error(`Unable to read ${context}`);
  return value;
}

function locations(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, location]) => required(location, 'sitemap location'));
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

  it('emits exact canonical URLs, reciprocal alternates, and no broken internal links', () => {
    for (const file of htmlFiles(dist)) {
      const html = readFileSync(file, 'utf8');
      const documentLinks = links(html);
      const canonicalHrefs = documentLinks
        .filter((link) => link.rel === 'canonical')
        .map((link) => link.href);
      const canonical = urlForOutput(file);

      if (file === join(dist, '404.html')) {
        expect(canonicalHrefs, `${file} canonical`).toEqual([]);
      } else {
        expect(canonicalHrefs, `${file} canonical`).toEqual([canonical]);
      }

      const language = attributes(html.match(/<html\b[^>]*>/i)?.[0] ?? '').lang;
      for (const alternate of documentLinks.filter((link) => link.rel === 'alternate' && link.hreflang)) {
        const alternateHref = required(alternate.href, `${file} alternate href`);
        const alternateUrl = new URL(alternateHref, siteUrl);
        expect(alternateUrl.origin, `${file} alternate origin`).toBe(siteUrl);
        const target = outputFor(alternateUrl.pathname);
        expect(existsSync(target), `${file} -> ${alternateHref}`).toBe(true);

        const reciprocal = links(readFileSync(target, 'utf8')).find(
          (link) => link.rel === 'alternate' && link.hreflang === language
            && link.href !== undefined && new URL(link.href, siteUrl).href === canonical,
        );
        expect(reciprocal, `${target} -> ${canonical}`).toBeDefined();
      }

      for (const match of html.matchAll(/href="([^"]+)"/g)) {
        const href = match[1];
        if (href === undefined) throw new Error(`Unable to read internal link in ${file}`);
        if (href.startsWith('#') || href.startsWith('mailto:')) continue;
        const url = new URL(href, siteUrl);
        if (url.origin !== siteUrl) continue;
        expect(existsSync(outputFor(url.pathname)), `${file} -> ${href}`).toBe(true);
      }
    }
  });

  it('publishes canonical sitemap locations that resolve to generated output', () => {
    const sitemapIndex = join(dist, 'sitemap-index.xml');
    const sitemapFiles = existsSync(sitemapIndex) ? [] : readdirSync(dist)
        .filter((name) => /^sitemap-\d+\.xml$/.test(name))
        .map((name) => join(dist, name));

    if (existsSync(sitemapIndex)) {
      for (const location of locations(readFileSync(sitemapIndex, 'utf8'))) {
        const url = new URL(location);
        expect(url.origin, `${sitemapIndex} location origin`).toBe(siteUrl);
        sitemapFiles.push(outputFor(url.pathname));
      }
    }

    expect(sitemapFiles.length).toBeGreaterThan(0);
    for (const sitemap of sitemapFiles) {
      expect(existsSync(sitemap), sitemap).toBe(true);
      for (const location of locations(readFileSync(sitemap, 'utf8'))) {
        const url = new URL(location);
        expect(url.origin, `${sitemap} location origin`).toBe(siteUrl);
        expect(existsSync(outputFor(url.pathname)), `${sitemap} -> ${location}`).toBe(true);
      }
    }
  });
});
