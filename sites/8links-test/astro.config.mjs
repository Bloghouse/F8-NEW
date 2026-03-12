import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
export default defineConfig({
  output: 'static',
  site: 'https://8links-test.vercel.app',
  integrations: [tailwind({ applyBaseStyles: false })],
});
