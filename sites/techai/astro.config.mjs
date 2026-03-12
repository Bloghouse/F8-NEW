import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
export default defineConfig({
  output: 'static',
  site: 'https://techai.vercel.app',
  integrations: [tailwind({ applyBaseStyles: false })],
});
