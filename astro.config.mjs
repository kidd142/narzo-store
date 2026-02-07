import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://narzo.store',
  output: 'server',
  adapter: cloudflare({
    mode: 'directory',
    functionPerRoute: true
  }),
  integrations: [tailwind()],
  i18n: {
    defaultLocale: 'id',
    locales: ['id', 'en'],
    routing: { prefixDefaultLocale: false }
  }
});