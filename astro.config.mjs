// Configuração do Astro para sites PBN 8links - Template Porto Marketing
// Deploy: Vercel (site estático)
// Sitemap: @astrojs/sitemap compatível com Astro 5+; sitemap manual em public/ se necessário
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  site: 'https://meu-site.vercel.app',
  integrations: [tailwind({ applyBaseStyles: false })],
  vite: {
    server: {
      proxy: {
        '/api': { target: 'http://localhost:3001', changeOrigin: true },
        '/preview': { target: 'http://localhost:3001', changeOrigin: true },
      },
      watch: {
        // Ignorar sites/ para evitar restart quando prepare-site cria novo projeto
        ignored: ['**/sites/**', '**/node_modules/**'],
      },
    },
  },
});
