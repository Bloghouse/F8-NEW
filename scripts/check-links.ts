/**
 * Verifica links internos do site (após build)
 * Extrai hrefs dos HTML e confere se o destino existe em dist/
 * Uso: bun run scripts/check-links.ts [caminho-dist]
 * Ex: bun run scripts/check-links.ts                    → f8/dist
 *     bun run scripts/check-links.ts sites/marketing    → sites/marketing/dist
 */
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');

function getDistPath(): string {
  const arg = process.argv[2]?.trim();
  if (!arg) return join(ROOT, 'dist');
  const base = join(ROOT, arg.replace(/\/dist$/, ''));
  return arg.endsWith('/dist') ? join(ROOT, arg) : join(base, 'dist');
}

function* walkHtml(dir: string, base = dir): Generator<string> {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walkHtml(full, base);
    else if (e.name.endsWith('.html')) yield full.replace(base + '/', '').replace(/\/index\.html$/, '/').replace(/\.html$/, '') || '/';
  }
}

function getInternalLinks(html: string, basePath: string): string[] {
  const links = new Set<string>();
  const baseDir = basePath === '/' ? '/' : basePath.replace(/\/?$/, '/');
  const re = /<a[^>]+href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    let href = m[1].trim().replace(/#.*$/, '').replace(/\?.*$/, '');
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) continue;
    if (href.startsWith('/')) href = href.slice(1);
    else href = (baseDir + href).replace(/\/+/g, '/').replace(/^\//, '');
    const path = '/' + href.replace(/\/$/, '');
    if (path !== '/' && !path.startsWith('/reference')) links.add(path);
  }
  return Array.from(links);
}

function pathToFile(distDir: string, path: string): string {
  const p = path.replace(/^\//, '').replace(/\/$/, '');
  if (!p) return join(distDir, 'index.html');
  if (/\.(jpg|jpeg|png|gif|webp|svg|ico|css|js|xml|txt)$/i.test(p)) return join(distDir, p);
  return join(distDir, p, 'index.html');
}

export async function runCheckLinks(distDir?: string): Promise<{ ok: boolean; broken: { url: string; from: string }[] }> {
  const DIST = distDir || getDistPath();
  const broken: { url: string; from: string }[] = [];
  const checked = new Set<string>();

  if (!existsSync(DIST)) {
    return { ok: false, broken: [{ url: 'dist/', from: 'Build não encontrado. Rode: bun run build' }] };
  }

  const htmlFiles: string[] = [];
  function collect(dir: string) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) collect(full);
      else if (e.name.endsWith('.html')) htmlFiles.push(full);
    }
  }
  collect(DIST);

  for (const file of htmlFiles) {
    const rel = file.replace(DIST + '/', '').replace(/\/index\.html$/, '/').replace(/\.html$/, '') || '/';
    const pagePath = '/' + (rel === '/' ? '' : rel).replace(/\/$/, '');
    const html = readFileSync(file, 'utf-8');
    const links = getInternalLinks(html, pagePath);

    for (const link of links) {
      if (checked.has(link)) continue;
      checked.add(link);
      const targetFile = pathToFile(DIST, link);
      if (!existsSync(targetFile)) {
        broken.push({ url: link, from: pagePath || '/' });
      }
    }
  }

  return { ok: broken.length === 0, broken };
}

if (import.meta.main) {
  const distPath = getDistPath();
  runCheckLinks(distPath).then((r) => {
    if (r.ok) {
      console.log('\x1b[32m✓ Todos os links internos OK\x1b[0m');
    } else {
      console.error('\x1b[31m✖ Links quebrados:\x1b[0m');
      r.broken.forEach((b) => console.error(`  ${b.url} (de ${b.from})`));
      process.exit(1);
    }
  });
}
