import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
export default defineConfig({
  output: 'static',
  site: 'https://health-coach-blog.vercel.app',
  integrations: [tailwind({ applyBaseStyles: false })],
});
