/**
 * Servidor de captura de screenshots para templates de referência
 * Usa Puppeteer (Chromium incluído) - sem necessidade de instalação extra
 * Captura páginas viewport a viewport e salva em public/reference/
 * Uso: bun run capture-server + POST /api/capture com { "url": "https://..." }
 */
import puppeteer from 'puppeteer';
import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname =
  typeof (import.meta as unknown as { dir?: string }).dir !== 'undefined'
    ? (import.meta as unknown as { dir: string }).dir
    : dirname(fileURLToPath(import.meta.url));
const REFERENCE_DIR = join(__dirname, '..', 'public', 'reference');
const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;
const SCROLL_DELAY = 800;

function ensureReferenceDir() {
  if (!existsSync(REFERENCE_DIR)) {
    mkdirSync(REFERENCE_DIR, { recursive: true });
  }
}

function clearReferenceDir() {
  if (existsSync(REFERENCE_DIR)) {
    const files = readdirSync(REFERENCE_DIR);
    for (const file of files) {
      if (file.endsWith('.png')) {
        unlinkSync(join(REFERENCE_DIR, file));
      }
    }
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function captureUrl(url: string): Promise<string[]> {
  ensureReferenceDir();
  clearReferenceDir();

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  try {
    // load = DOM + recursos; networkidle0 é muito restritivo para sites pesados
    await page.goto(url, { waitUntil: 'load', timeout: 180000 }); // 3 minutos
  } catch (e) {
    await browser.close();
    throw new Error(`Falha ao carregar a URL: ${(e as Error).message}`);
  }

  await sleep(2000);

  const scrollHeight = await page.evaluate(() => {
    return Math.max(
      document.body?.scrollHeight ?? 0,
      document.documentElement?.scrollHeight ?? 0,
      window.innerHeight
    );
  });
  const totalViews = Math.max(1, Math.ceil(scrollHeight / VIEWPORT_HEIGHT));
  const savedFiles: string[] = [];

  for (let i = 0; i < totalViews; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * VIEWPORT_HEIGHT);
    await sleep(SCROLL_DELAY);

    const filename = `screenshot-${String(i + 1).padStart(2, '0')}.png`;
    const filepath = join(REFERENCE_DIR, filename);
    await page.screenshot({ path: filepath, fullPage: false });
    savedFiles.push(filename);
  }

  await browser.close();
  return savedFiles;
}

const CAPTURE_API_PORT = parseInt(process.env.CAPTURE_PORT ?? '3001', 10);

try {
  Bun.serve({
    port: CAPTURE_API_PORT,
    async fetch(req) {
      if (req.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      }
      if (req.method !== 'POST' || new URL(req.url).pathname !== '/api/capture') {
        return new Response(JSON.stringify({ error: 'Use POST /api/capture com { "url": "..." }' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      try {
        const body = (await req.json()) as { url?: string };
        const url = body?.url?.trim();
        if (!url) {
          return new Response(JSON.stringify({ error: 'URL é obrigatória' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          return new Response(JSON.stringify({ error: 'URL deve começar com http:// ou https://' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
        const files = await captureUrl(url);
        return new Response(JSON.stringify({ success: true, files }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      } catch (e) {
        console.error('\x1b[31m✖ Erro na captura:\x1b[0m', e);
        return new Response(JSON.stringify({ error: (e as Error).message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    },
  });
  console.log(`\n\x1b[32m✓\x1b[0m Servidor de captura rodando em http://localhost:${CAPTURE_API_PORT}`);
  console.log(`  POST /api/capture com { "url": "https://..." }\n`);
} catch (e: unknown) {
  const err = e as { code?: string };
  if (err?.code === 'EADDRINUSE') {
    console.error('\x1b[31m✖ Porta 3001 em uso.\x1b[0m Mate o processo: lsof -ti:3001 | xargs kill -9');
  } else {
    console.error('\x1b[31m✖ Erro ao iniciar servidor:\x1b[0m', e);
  }
  process.exit(1);
}
