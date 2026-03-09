// Configuração do Astro para sites PBN 8links
// Deploy: Vercel (site estático - vercel.json na raiz)
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  site: 'https://exemplo.vercel.app',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
});
