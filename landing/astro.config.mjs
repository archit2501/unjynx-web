import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://archit2501.github.io',
  base: '/unjynx-web',
  integrations: [tailwind(), sitemap()],
  output: 'static',
});
