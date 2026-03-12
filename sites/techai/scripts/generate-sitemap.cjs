/**
 * Gera sitemap-index.xml e sitemap-0.xml após o build.
 * Alternativa ao @astrojs/sitemap (bug de compatibilidade).
 * Roda como: node scripts/generate-sitemap.cjs
 */
const fs = require('fs');
const path = require('path');

const DIST = path.join(process.cwd(), 'dist');
const SITE = 'https://techai.vercel.app';

function collectRoutes(dir, base = '', routes = []) {
  if (!fs.existsSync(dir)) return routes;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    const rel = path.join(base, e.name);
    if (e.isDirectory()) {
      const idx = path.join(full, 'index.html');
      if (fs.existsSync(idx)) routes.push(rel === '' ? '/' : '/' + rel + '/');
      collectRoutes(full, rel, routes);
    } else if (e.name === 'index.html' && base) {
      routes.push('/' + base.replace(/\\/g, '/') + '/');
    }
  }
  return routes;
}

function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const routes = [...new Set(collectRoutes(DIST).filter((r) => !r.startsWith('/reference') && r !== '/404/'))];
const urls = routes.map((r) => {
  const loc = SITE + (r === '/' ? '/' : r);
  return `  <url><loc>${escapeXml(loc)}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
});

const sitemap0 = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${SITE}/sitemap-0.xml</loc></sitemap>
</sitemapindex>`;

fs.writeFileSync(path.join(DIST, 'sitemap-0.xml'), sitemap0);
fs.writeFileSync(path.join(DIST, 'sitemap-index.xml'), sitemapIndex);
console.log('\x1b[32m✓ Sitemap gerado: sitemap-index.xml, sitemap-0.xml\x1b[0m');
