/**
 * Script para baixar imagens em referências já capturadas
 * Uso: bun run scripts/download-images.ts [slug]
 * Se slug não for informado, processa todas as pastas em public/reference/
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REFERENCE_BASE = join(__dirname, '..', 'public', 'reference');

function extractImageUrls(html: string, baseUrl: string): string[] {
  const base = new URL(baseUrl);
  const origin = base.origin;
  const basePath = base.pathname.replace(/\/[^/]*$/, '/');
  const seen = new Set<string>();

  function resolve(href: string): string | null {
    if (!href || href.startsWith('data:') || href.startsWith('blob:')) return null;
    try {
      const u = new URL(href, origin + basePath);
      return u.href;
    } catch {
      return null;
    }
  }

  const imgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRegex.exec(html))) {
    const url = resolve(m[1].replace(/&quot;/g, '"').trim());
    if (url) seen.add(url);
  }

  const bgRegex = /background-image\s*:\s*url\s*\(\s*["']?([^"')]+)["']?\s*\)/gi;
  while ((m = bgRegex.exec(html))) {
    const url = resolve(m[1].replace(/&quot;/g, '"').trim());
    if (url) seen.add(url);
  }

  return Array.from(seen);
}

async function downloadImage(
  imageUrl: string,
  imagesDir: string,
  index: number
): Promise<{ file: string; url: string } | null> {
  try {
    const res = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      redirect: 'follow',
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    let ext = '.png';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = '.jpg';
    else if (contentType.includes('gif')) ext = '.gif';
    else if (contentType.includes('webp')) ext = '.webp';
    else if (contentType.includes('svg')) ext = '.svg';
    else {
      const u = new URL(imageUrl);
      const pathExt = extname(u.pathname);
      if (pathExt) ext = pathExt;
    }
    const filename = `img-${String(index).padStart(3, '0')}${ext}`;
    const buffer = await res.arrayBuffer();
    writeFileSync(join(imagesDir, filename), new Uint8Array(buffer));
    return { file: filename, url: imageUrl };
  } catch {
    return null;
  }
}

function inferBaseUrl(slug: string): string {
  if (slug.startsWith('demos-medcity-')) {
    const page = slug.replace('demos-medcity-', '');
    return `https://7oroof.com/demos/medcity/${page}`;
  }
  return `https://example.com/${slug.replace(/-/g, '/')}`;
}

async function processSlug(slug: string) {
  const pageDir = join(REFERENCE_BASE, slug);
  const pagePath = join(pageDir, 'page.html');
  if (!existsSync(pagePath)) {
    console.log(`\x1b[33m⚠ ${slug}: page.html não encontrado\x1b[0m`);
    return;
  }
  const html = readFileSync(pagePath, 'utf-8');
  const baseUrl = inferBaseUrl(slug);
  const imageUrls = extractImageUrls(html, baseUrl);
  if (imageUrls.length === 0) {
    console.log(`\x1b[33m⚠ ${slug}: nenhuma imagem encontrada no HTML\x1b[0m`);
    return;
  }
  const imagesDir = join(pageDir, 'images');
  mkdirSync(imagesDir, { recursive: true });
  const manifest: { file: string; url: string }[] = [];
  console.log(`  Baixando ${imageUrls.length} imagem(ns)...`);
  for (let i = 0; i < imageUrls.length; i++) {
    const result = await downloadImage(imageUrls[i], imagesDir, i + 1);
    if (result) {
      manifest.push(result);
    }
  }
  if (manifest.length > 0) {
    writeFileSync(join(pageDir, 'images.json'), JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`  \x1b[32m✓ ${manifest.length} imagem(ns) salva(s)\x1b[0m`);
  }
}

async function main() {
  const slug = process.argv[2];
  if (slug) {
    console.log(`\nProcessando ${slug}...`);
    await processSlug(slug);
  } else {
    const dirs = readdirSync(REFERENCE_BASE).filter((d) => {
      const full = join(REFERENCE_BASE, d);
      return existsSync(join(full, 'page.html'));
    });
    console.log(`\nProcessando ${dirs.length} referência(s)...`);
    for (const d of dirs) {
      console.log(`\n${d}:`);
      await processSlug(d);
    }
  }
  console.log('\n');
}

main().catch((e) => {
  console.error('\x1b[31m✖ Erro:\x1b[0m', e);
  process.exit(1);
});
