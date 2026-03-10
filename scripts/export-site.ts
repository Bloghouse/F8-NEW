/**
 * Exporta o site demo para pasta standalone (Git-ready, deploy Vercel)
 * Uso: bun run scripts/export-site.ts [nome-projeto]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, cpSync, readdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const SITES_DIR = join(ROOT, 'sites');

const DEMO_PAGES = [
  'inicio', 'sobre', 'contato', 'blog', 'agendar', 'galeria', 'faqs', 'precos',
  'medicos', 'servicos'
];

async function exportSite(projectName: string) {
  const name = projectName || `site-${Date.now()}`;
  const outDir = join(SITES_DIR, name);

  if (existsSync(outDir)) {
    console.error(`\x1b[31m✖ Pasta já existe: sites/${name}\x1b[0m`);
    process.exit(1);
  }

  mkdirSync(outDir, { recursive: true });
  mkdirSync(join(outDir, 'src'), { recursive: true });
  mkdirSync(join(outDir, 'src/pages'), { recursive: true });
  mkdirSync(join(outDir, 'src/pages/blog'), { recursive: true });
  mkdirSync(join(outDir, 'src/pages/medicos'), { recursive: true });
  mkdirSync(join(outDir, 'src/pages/servicos'), { recursive: true });
  mkdirSync(join(outDir, 'src/components'), { recursive: true });
  mkdirSync(join(outDir, 'src/components/medcity'), { recursive: true });
  mkdirSync(join(outDir, 'src/layouts'), { recursive: true });
  mkdirSync(join(outDir, 'src/styles'), { recursive: true });
  mkdirSync(join(outDir, 'src/content'), { recursive: true });
  mkdirSync(join(outDir, 'src/content/posts'), { recursive: true });
  mkdirSync(join(outDir, 'public'), { recursive: true });

  // Copiar páginas demo (excluir index.astro do wizard)
  const pagesToCopy = [
    'inicio', 'sobre', 'contato', 'agendar', 'galeria', 'faqs', 'precos',
    'blog/index', 'blog/[...slug]',
    'medicos/index', 'medicos/dr-1', 'medicos/dr-2', 'medicos/equipe', 'medicos/moderno', 'medicos/agenda',
    'servicos/index', 'servicos/consultoria'
  ];
  for (const p of pagesToCopy) {
    const src = join(ROOT, 'src/pages', `${p}.astro`);
    const dst = join(outDir, 'src/pages', `${p}.astro`);
    if (existsSync(src)) {
      mkdirSync(dirname(dst), { recursive: true });
      cpSync(src, dst);
    }
  }

  // index.astro = home no domínio raiz (/). inicio.astro = redirect para /
  const inicioSrc = join(ROOT, 'src/pages/inicio.astro');
  const indexPath = join(outDir, 'src/pages/index.astro');
  const inicioPath = join(outDir, 'src/pages/inicio.astro');
  if (existsSync(inicioSrc)) {
    const inicioContent = readFileSync(inicioSrc, 'utf-8');
    writeFileSync(indexPath, inicioContent.replace(/(["'])\/inicio\1/g, '$1/$1'), 'utf-8');
    writeFileSync(inicioPath, `---
export const prerender = true;
---
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0;url=/" />
  <link rel="canonical" href="/" />
  <title>Redirecionando...</title>
</head>
<body><p>Redirecionando para <a href="/">início</a>...</p></body>
</html>
`, 'utf-8');
  } else {
    writeFileSync(indexPath, `---
export const prerender = true;
---
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="canonical" href="/" />
  <title>Bem-vindo</title>
</head>
<body class="bg-[#0f0f0f] text-white min-h-screen flex items-center justify-center p-8">
  <div class="text-center"><h1 class="text-2xl font-bold">Bem-vindo</h1></div>
</body>
</html>
`, 'utf-8');
  }

  cpSync(join(ROOT, 'src/layouts/BaseLayout.astro'), join(outDir, 'src/layouts/BaseLayout.astro'));
  cpSync(join(ROOT, 'src/components/Header.astro'), join(outDir, 'src/components/Header.astro'));
  cpSync(join(ROOT, 'src/components/Footer.astro'), join(outDir, 'src/components/Footer.astro'));
  cpSync(join(ROOT, 'src/components/PostCard.astro'), join(outDir, 'src/components/PostCard.astro'));
  cpSync(join(ROOT, 'src/config.ts'), join(outDir, 'src/config.ts'));
  cpSync(join(ROOT, 'src/content/config.ts'), join(outDir, 'src/content/config.ts'));
  cpSync(join(ROOT, 'src/styles/global.css'), join(outDir, 'src/styles/global.css'));
  cpSync(join(ROOT, 'src/env.d.ts'), join(outDir, 'src/env.d.ts'));

  const medcityDir = join(ROOT, 'src/components/medcity');
  if (existsSync(medcityDir)) {
    for (const f of ['Hero', 'Services', 'Emergency', 'Clinics', 'Values', 'Doctors', 'Process', 'Testimonials', 'Appointment', 'Cta', 'Blog'].map(n => `${n}.astro`)) {
      const src = join(medcityDir, f);
      if (existsSync(src)) cpSync(src, join(outDir, 'src/components/medcity', f));
    }
  }

  const libDir = join(ROOT, 'src/lib');
  if (existsSync(libDir)) cpSync(libDir, join(outDir, 'src/lib'), { recursive: true });

  // Content posts
  const postsDir = join(ROOT, 'src/content/posts');
  if (existsSync(postsDir)) {
    for (const f of ['exemplo-post.md', 'saude-mental-dicas.md', 'duvidas-mascara.md', 'comer-saudavel-home-office.md']) {
      const src = join(postsDir, f);
      if (existsSync(src)) cpSync(src, join(outDir, 'src/content/posts', f));
    }
  }

  // public (inclui reference - site exportado precisa das imagens)
  cpSync(join(ROOT, 'public'), join(outDir, 'public'), { recursive: true });

  // Esvazia reference no workspace - pronto para próxima captura
  const refDir = join(ROOT, 'public', 'reference');
  if (existsSync(refDir)) {
    for (const entry of readdirSync(refDir)) {
      rmSync(join(refDir, entry), { recursive: true });
    }
    console.log('  \x1b[32m✓\x1b[0m Pasta reference esvaziada (pronta para próximo projeto)');
  }

  mkdirSync(join(outDir, 'scripts'), { recursive: true });
  const checkLinksScript = readFileSync(join(ROOT, 'scripts', 'check-links-standalone.cjs'), 'utf-8');
  writeFileSync(join(outDir, 'scripts', 'check-links-standalone.cjs'), checkLinksScript, 'utf-8');

  // package.json (limpo)
  const pkg = {
    name: name.replace(/[^a-z0-9-]/gi, '-').toLowerCase(),
    type: 'module',
    scripts: { dev: 'astro dev', build: 'astro build && node scripts/check-links-standalone.cjs', preview: 'astro preview' },
    dependencies: { astro: '^4.16.0' },
    devDependencies: { '@astrojs/tailwind': '^5.1.0', '@tailwindcss/typography': '^0.5.16', tailwindcss: '^3.4.17', typescript: '^5.6.0' },
  };
  writeFileSync(join(outDir, 'package.json'), JSON.stringify(pkg, null, 2));

  // astro.config
  const siteUrl = `https://${name.replace(/[^a-z0-9-]/gi, '-')}.vercel.app`;
  writeFileSync(join(outDir, 'astro.config.mjs'), `import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
export default defineConfig({
  output: 'static',
  site: '${siteUrl}',
  integrations: [tailwind({ applyBaseStyles: false })],
});
`, 'utf-8');

  cpSync(join(ROOT, 'tailwind.config.mjs'), join(outDir, 'tailwind.config.mjs'));
  cpSync(join(ROOT, 'tsconfig.json'), join(outDir, 'tsconfig.json'));

  writeFileSync(join(outDir, '.gitignore'), `node_modules
dist
.astro
.env
.env.*
.DS_Store
`, 'utf-8');

  writeFileSync(join(outDir, 'vercel.json'), JSON.stringify({
    buildCommand: 'astro build',
    outputDirectory: 'dist',
    framework: 'astro',
  }, null, 2));

  const slug = name.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  const projectJson = {
    name: slug,
    displayName: name,
    slug,
    createdAt: new Date().toISOString(),
    status: 'exported',
  };
  writeFileSync(join(outDir, 'project.json'), JSON.stringify(projectJson, null, 2));

  // git init para deploy
  try {
    const { execSync } = await import('child_process');
    execSync('git init', { cwd: outDir, stdio: 'ignore' });
  } catch (_) {}
  console.log(`\n\x1b[32m✓ Site exportado em sites/${name}\x1b[0m`);
  console.log(`  cd sites/${name} && bun install && bun run build`);
  console.log(`  git add . && git commit -m "Site inicial" && git push\n`);
}

const name = process.argv[2] || '';
await exportSite(name);
