// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync, readdirSync } from 'node:fs';

// [PLACEHOLDER] Replace with the live domain (also update src/data/site.ts and public/robots.txt).
const SITE_URL = 'https://www.rrlawassociates.com';

// Build a lastmod map from the `updated:` field of Markdown content.
const lastmod = {};
for (const [dir, base] of [['practice-areas', '/practice-areas/'], ['guides', '/guides/']]) {
  for (const file of readdirSync(`./src/content/${dir}`)) {
    const m = readFileSync(`./src/content/${dir}/${file}`, 'utf8').match(/^updated:\s*(\S+)/m);
    if (m) lastmod[`${SITE_URL}${base}${file.replace(/\.md$/, '')}/`] = new Date(m[1]).toISOString();
  }
}
const buildDate = new Date().toISOString();

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  prefetch: false,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      i18n: { defaultLocale: 'en', locales: { en: 'en-PK', ur: 'ur-PK' } },
      serialize(item) {
        item.lastmod = lastmod[item.url] ?? buildDate;
        return item;
      },
    }),
  ],
});
