import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
export default defineConfig({
  output: 'static',
  site: 'https://marketing.vercel.app',
  integrations: [tailwind({ applyBaseStyles: false })],
});
