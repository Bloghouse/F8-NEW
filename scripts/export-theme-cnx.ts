/**
 * export-theme-cnx.ts
 *
 * Exporta um site F8 (sites/[slug]/) como pacote de tema CNX.
 * Mapeia o conteúdo dos .astro dinamicamente e gera:
 * - singletons YAML (src/content/singletons/[themeId]/)
 * - tema (src/themes/[themeId]/)
 * - INSTRUCOES.md para importação no CNX
 *
 * Uso: bun run scripts/export-theme-cnx.ts [slug]
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  cpSync,
} from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const SITES_DIR = join(ROOT, 'sites');

/** Extrai textos e imagens de conteúdo HTML/Astro */
function extractFromHtml(html: string): { texts: string[]; images: string[] } {
  const texts: string[] = [];
  const images: string[] = [];

  // Textos em tags (h1, h2, h3, h4, p, span, a, li)
  const textRegex = /<(?:h[1-6]|p|span|a|li|td|th)[^>]*>([^<]+)</gi;
  let m: RegExpExecArray | null;
  while ((m = textRegex.exec(html))) {
    const t = m[1].trim();
    if (t && t.length > 2 && !t.startsWith('{')) texts.push(t);
  }

  // src de imagens
  const imgRegex = /(?:src|href)=["']([^"']+\.(?:jpg|jpeg|png|gif|webp|svg))["']/gi;
  while ((m = imgRegex.exec(html))) {
    const s = m[1].trim();
    if (s && !s.startsWith('data:')) images.push(s);
  }

  return { texts, images };
}

/** Extrai blocos de uma página .astro (ignora frontmatter) */
function parseAstroFile(content: string): { frontmatter: string; html: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (match) {
    return { frontmatter: match[1], html: match[2] };
  }
  return { frontmatter: '', html: content };
}

/** Nome do singleton a partir da rota (index -> home, sobre -> about, etc) */
function routeToSingleton(route: string): string {
  const map: Record<string, string> = {
    index: 'home',
    sobre: 'about',
    contato: 'contact',
    servicos: 'services',
    blog: 'blog',
  };
  const base = route.replace(/\.astro$/, '').replace(/\/index$/, '').split('/')[0] || 'home';
  if (base.includes('[')) return ''; // rotas dinâmicas não geram singleton
  return map[base] || base;
}

/** Gera YAML básico a partir de conteúdos extraídos */
function buildSingletonYaml(pageName: string, texts: string[], images: string[]): string {
  const lines: string[] = [];

  if (texts.length > 0) {
    lines.push(`heroTitle: "${(texts[0] || '').replace(/"/g, '\\"')}"`);
    if (texts.length > 1) {
      lines.push(`heroSubtitle: "${(texts[1] || '').replace(/"/g, '\\"')}"`);
    }
    if (texts.length > 2) {
      lines.push(`content: |
  ${texts.slice(2, 5).join('\n  ')}`);
    }
  }

  if (images.length > 0) {
    lines.push(`heroImage: "${images[0]}"`);
  }

  return lines.length > 0 ? lines.join('\n') : `# Conteúdo extraído de ${pageName}\n# Edite os campos abaixo`;
}

/** Schema 8links para home: Hero, About, Features (compatível com CNX HomeEditor8links) */
function buildHomeYaml8links(texts: string[], images: string[], html: string): string {
  const esc = (s: string) => `"${(s || '').replace(/"/g, '\\"')}"`;
  const lines: string[] = [];
  lines.push('# Schema 8links — Home (mapeado do F8)');
  lines.push('');
  lines.push('# Hero');
  lines.push(`heroTitle: ${esc(texts[0] || 'Bem-vindo')}`);
  lines.push(`heroSubtitle: ${esc(texts[1] || '')}`);
  lines.push(`heroCtaText: ${esc(texts[2]?.includes('Conheça') ? texts[2] : 'Conheça o que fazemos')}`);
  lines.push('heroCtaUrl: "/sobre"');
  lines.push(`heroImage: ${esc(images[0] || '')}`);
  lines.push('');
  lines.push('# About');
  lines.push(`aboutParagraph: ${esc(texts[3] || texts[4] || '')}`);
  lines.push('aboutStatNumber: "10M+"');
  lines.push('aboutStatLabel: "Captados para clientes"');
  lines.push(`aboutImage: ${esc(images[1] || images[0] || '')}`);
  const quoteMatch = html.match(/O progresso verdadeiro[^<]+/);
  lines.push(`aboutQuote: ${esc(quoteMatch ? quoteMatch[0].trim() : '')}`);
  lines.push('aboutBlocks:');
  lines.push('  - icon: "⚡"');
  lines.push('    title: "Conteúdo Criativo & Design"');
  lines.push('    description: "Desenvolvemos conteúdo e identidades visuais que conectam marcas e audiências."');
  lines.push('  - icon: "📊"');
  lines.push('    title: "Estratégia & Consultoria"');
  lines.push('    description: "Consultoria especializada para alavancar seus resultados no digital."');
  lines.push('aboutCtaText: "Saiba mais sobre nós"');
  lines.push('aboutCtaUrl: "/sobre"');
  lines.push('');
  lines.push('# Features');
  lines.push('featuresBadge: "Nossos diferenciais"');
  lines.push('featuresTitle: "Transformando negócios em"');
  lines.push('featuresHighlight: "histórias de sucesso digital"');
  const featureTitles = ['Estratégia de Marca', 'Web Design', 'Marketing Digital', 'Criação de Conteúdo', 'Automação de E-mail'];
  lines.push('features:');
  featureTitles.forEach((t) => lines.push(`  - title: ${esc(t)}`));
  return lines.join('\n');
}

/** Lista todos os .astro em src/pages (recursivo) */
function listAstroPages(siteDir: string): { path: string; route: string }[] {
  const pagesDir = join(siteDir, 'src', 'pages');
  if (!existsSync(pagesDir)) return [];

  const result: { path: string; route: string }[] = [];

  function walk(dir: string, base = '') {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const rel = base ? `${base}/${e.name}` : e.name;
      if (e.isDirectory()) {
        walk(join(dir, e.name), rel);
      } else if (e.name.endsWith('.astro')) {
        result.push({
          path: join(dir, e.name),
          route: rel.replace(/\.astro$/, '').replace(/\/index$/, '') || 'index',
        });
      }
    }
  }

  walk(pagesDir);
  return result;
}

export async function exportThemeAsCnx(slug: string): Promise<{ buffer: Buffer }> {
  const siteDir = join(SITES_DIR, slug);
  if (!existsSync(siteDir)) {
    throw new Error(`Site não encontrado: sites/${slug}`);
  }

  const themeId = slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  const outDir = join(ROOT, '.export-theme-temp', themeId);
  if (existsSync(outDir)) {
    const { rmSync } = await import('fs');
    rmSync(outDir, { recursive: true });
  }

  mkdirSync(join(outDir, 'src', 'content', 'singletons', themeId), { recursive: true });
  mkdirSync(join(outDir, 'src', 'themes', themeId), { recursive: true });
  mkdirSync(join(outDir, 'src', 'themes', themeId, 'components'), { recursive: true });

  const pages = listAstroPages(siteDir);

  for (const { path: astroPath, route } of pages) {
    const singletonName = routeToSingleton(route);
    if (!singletonName) continue;

    const content = readFileSync(astroPath, 'utf-8');
    const { html } = parseAstroFile(content);
    const { texts, images } = extractFromHtml(html);

    const yamlContent =
      singletonName === 'home'
        ? buildHomeYaml8links(texts, images, html)
        : buildSingletonYaml(route, texts, images);

    const yamlPath = join(outDir, 'src', 'content', 'singletons', themeId, `${singletonName}.yaml`);
    writeFileSync(yamlPath, yamlContent, 'utf-8');
  }

  // menu e footer placeholder (CNX espera esses singletons)
  const singletonsDir = join(outDir, 'src', 'content', 'singletons', themeId);
  if (!existsSync(join(singletonsDir, 'menu.yaml'))) {
    writeFileSync(join(singletonsDir, 'menu.yaml'), 'logoText: "Site"\nitems:\n  - label: Início\n    url: /\n  - label: Contato\n    url: /contato\n', 'utf-8');
  }
  if (!existsSync(join(singletonsDir, 'footer.yaml'))) {
    writeFileSync(join(singletonsDir, 'footer.yaml'), 'copyright: "© Todos os direitos reservados."\nlinks: []\n', 'utf-8');
  }

  // Copiar Header/Footer se existirem
  const componentsDir = join(siteDir, 'src', 'components');
  if (existsSync(componentsDir)) {
    for (const name of ['Header.astro', 'Footer.astro']) {
      const src = join(componentsDir, name);
      if (existsSync(src)) {
        const dst = join(outDir, 'src', 'themes', themeId, 'components', name);
        mkdirSync(dirname(dst), { recursive: true });
        cpSync(src, dst);
      }
    }
  }

  // Copiar Home.astro (index) adaptado para CNX — BaseLayout → MainLayout
  const indexPath = join(siteDir, 'src', 'pages', 'index.astro');
  if (existsSync(indexPath)) {
    let homeContent = readFileSync(indexPath, 'utf-8');
    homeContent = homeContent
      .replace(/import\s+BaseLayout\s+from\s+['"]\.\.\/layouts\/BaseLayout\.astro['"];?/g, "import MainLayout from '../../layouts/MainLayout.astro';")
      .replace(/<BaseLayout\s/g, '<MainLayout ')
      .replace(/<\/BaseLayout>/g, '</MainLayout>');
    const homeDst = join(outDir, 'src', 'themes', themeId, 'Home.astro');
    mkdirSync(dirname(homeDst), { recursive: true });
    writeFileSync(homeDst, homeContent, 'utf-8');
  }

  // theme manifest (extrair primaryColor do site se possível, senão padrão)
  const themeYaml = `name: ${slug}
slug: ${themeId}
primaryColor: "#D9F45F"
secondaryColor: "#0f0f0f"
borderRadius: "0.5rem"
layout: classic
`;
  mkdirSync(join(outDir, 'src', 'content', 'themes'), { recursive: true });
  writeFileSync(
    join(outDir, 'src', 'content', 'themes', `${themeId}.yaml`),
    themeYaml,
    'utf-8'
  );

  // INSTRUCOES.md
  const instrucoes = `# Tema ${themeId} — Importação no CNX

## Estrutura do pacote

- \`src/content/singletons/${themeId}/\` — arquivos YAML com conteúdo editável
- \`src/content/themes/${themeId}.yaml\` — definição do tema
- \`src/themes/${themeId}/\` — componentes (Header, Footer, etc.)

## Como importar

1. Copie a pasta \`src/content/singletons/${themeId}\` para \`cnx/src/content/singletons/${themeId}\`
2. Copie \`src/content/themes/${themeId}.yaml\` para \`cnx/src/content/themes/\`
3. Copie \`src/themes/${themeId}\` para \`cnx/src/themes/${themeId}\`
4. Em \`cnx/src/content/singletons/settings.yaml\`, defina \`activeTheme: ${themeId}\`
5. Rode \`bun run build\` no CNX
`;
  writeFileSync(join(outDir, 'INSTRUCOES.md'), instrucoes, 'utf-8');

  // Copiar public/reference para o pacote (imagens)
  const refSrc = join(siteDir, 'public', 'reference');
  if (existsSync(refSrc)) {
    const refDst = join(outDir, 'public', 'reference');
    mkdirSync(refDst, { recursive: true });
    cpSync(refSrc, refDst, { recursive: true });
  }

  // Criar zip: registrar listeners ANTES de finalize() para evitar Promise pendente
  const chunks: Buffer[] = [];
  const { Writable } = await import('stream');

  const collector = new Writable({
    write(chunk: Buffer, _enc, cb) {
      chunks.push(chunk);
      cb();
    },
  });

  try {
    const archiver = (await import('archiver')).default;
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(collector);

    function addDirToArchive(dirPath: string, archivePath = '') {
      const entries = readdirSync(dirPath, { withFileTypes: true });
      for (const e of entries) {
        const full = join(dirPath, e.name);
        const rel = archivePath ? `${archivePath}/${e.name}` : e.name;
        if (e.isDirectory()) {
          addDirToArchive(full, rel);
        } else {
          archive.file(full, { name: rel });
        }
      }
    }

    addDirToArchive(outDir);

    const done = new Promise<void>((resolve, reject) => {
      collector.once('finish', resolve);
      collector.once('error', reject);
      archive.once('error', reject);
    });
    archive.finalize();
    await done;

    return { buffer: Buffer.concat(chunks) };
  } catch (err) {
    // Fallback: criar tarball
    const { execSync } = await import('child_process');
    mkdirSync(join(ROOT, '.export-theme-temp'), { recursive: true });
    const tarPath = join(ROOT, '.export-theme-temp', `tema-${slug}.tar.gz`);
    execSync(`tar -czf "${tarPath}" -C "${outDir}" .`, { stdio: 'ignore' });
    return { buffer: readFileSync(tarPath) };
  }
}

// CLI: rodar quando executado diretamente
const slugArg = process.argv[2]?.trim();
if (slugArg) {
  exportThemeAsCnx(slugArg)
    .then(({ buffer }) => {
      const outFile = join(ROOT, `tema-${slugArg}.zip`);
      writeFileSync(outFile, buffer);
      console.log(`\x1b[32m✓\x1b[0m Tema exportado em ${outFile}`);
    })
    .catch((e) => {
      console.error('\x1b[31m✖ Erro:\x1b[0m', (e as Error).message);
      process.exit(1);
    });
}
