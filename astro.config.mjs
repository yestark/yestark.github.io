import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://starkye.com',
  build: { format: 'directory' },
  integrations: [sitemap()],
});
