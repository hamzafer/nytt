// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { nyttConfig } from './nytt.config';

// https://astro.build/config
export default defineConfig({
  site: nyttConfig.siteUrl,
  base: `${nyttConfig.basePath}/`,
  output: 'static',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
});