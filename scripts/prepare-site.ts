/**
 * Prepara o scaffold de um novo site em sites/[nome]
 * - Cria estrutura mínima (package.json, astro.config, src/, public/)
 * - Copia referências de f8/public/reference para sites/[nome]/public/reference
 * - Chamado quando o usuário inicia criação no wizard
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, cpSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const SITES_DIR = join(ROOT, 'sites');
const REFERENCE_BASE = join(ROOT, 'public', 'reference');

async function prepareSite(projectName: string): Promise<{ success: boolean; path?: string; error?: string }> {
  const name = projectName?.trim().replace(/[^a-z0-9-]/gi, '-').toLowerCase() || `site-${Date.now()}`;
  const outDir = join(SITES_DIR, name);

  if (existsSync(outDir)) {
    const refDir = join(REFERENCE_BASE);
    if (existsSync(refDir)) {
      const refDest = join(outDir, 'public', 'reference');
      mkdirSync(refDest, { recursive: true });
      for (const entry of readdirSync(refDir)) {
        cpSync(join(refDir, entry), join(refDest, entry), { recursive: true });
      }
    }
    return { success: true, path: `sites/${name}` };
  }

  mkdirSync(outDir, { recursive: true });
  mkdirSync(join(outDir, 'src'), { recursive: true });
  mkdirSync(join(outDir, 'src/pages'), { recursive: true });
  mkdirSync(join(outDir, 'src/components'), { recursive: true });
  mkdirSync(join(outDir, 'src/layouts'), { recursive: true });
  mkdirSync(join(outDir, 'src/styles'), { recursive: true });
  mkdirSync(join(outDir, 'src/content'), { recursive: true });
  mkdirSync(join(outDir, 'src/content/posts'), { recursive: true });
  mkdirSync(join(outDir, 'public'), { recursive: true });

  if (existsSync(REFERENCE_BASE)) {
    const refDest = join(outDir, 'public', 'reference');
    mkdirSync(refDest, { recursive: true });
    for (const entry of readdirSync(REFERENCE_BASE)) {
      cpSync(join(REFERENCE_BASE, entry), join(refDest, entry), { recursive: true });
    }
  }

  mkdirSync(join(outDir, 'scripts'), { recursive: true });
  const checkLinksScript = readFileSync(join(ROOT, 'scripts', 'check-links-standalone.cjs'), 'utf-8');
  writeFileSync(join(outDir, 'scripts', 'check-links-standalone.cjs'), checkLinksScript, 'utf-8');

  const pkg = {
    name: name.replace(/[^a-z0-9-]/gi, '-').toLowerCase(),
    type: 'module' as const,
    scripts: { dev: 'astro dev', build: 'astro build && node scripts/check-links-standalone.cjs', preview: 'astro preview' },
    dependencies: { astro: '^4.16.0' },
    devDependencies: { '@astrojs/tailwind': '^5.1.0', '@tailwindcss/typography': '^0.5.16', tailwindcss: '^3.4.17', typescript: '^5.6.0' },
  };
  writeFileSync(join(outDir, 'package.json'), JSON.stringify(pkg, null, 2));

  const siteUrl = `https://${name}.vercel.app`;
  writeFileSync(join(outDir, 'astro.config.mjs'), `import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
export default defineConfig({
  output: 'static',
  site: '${siteUrl}',
  integrations: [tailwind({ applyBaseStyles: false })],
});
`, 'utf-8');

  writeFileSync(join(outDir, 'tsconfig.json'), JSON.stringify({
    extends: 'astro/tsconfigs/strict',
    compilerOptions: { moduleResolution: 'bundler' },
  }, null, 2));

  writeFileSync(join(outDir, 'tailwind.config.mjs'), `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: { extend: {} },
  plugins: [require('@tailwindcss/typography')],
};
`, 'utf-8');

  writeFileSync(join(outDir, '.gitignore'), `node_modules
dist
.astro
.env
.env.*
.DS_Store
`, 'utf-8');

  writeFileSync(join(outDir, 'src/env.d.ts'), '/// <reference types="astro/client" />', 'utf-8');

  writeFileSync(join(outDir, 'src/pages/index.astro'), `---
/**
 * Página inicial - domínio raiz (/)
 * Padrão: home sempre na URL base, sem /inicio
 */
import '../styles/global.css';
---
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Seu site está sendo criado." />
  <link rel="canonical" href="/" />
  <title>Bem-vindo</title>
</head>
<body class="bg-[var(--color-bg)] text-white min-h-screen flex items-center justify-center p-8">
  <div class="text-center max-w-md">
    <h1 class="text-2xl font-bold mb-4">Bem-vindo ao seu site</h1>
    <p class="text-white/70">Use o wizard ou os prompts para adicionar conteúdo. A página inicial fica no domínio raiz (<code class="bg-white/10 px-1 rounded">/</code>).</p>
  </div>
</body>
</html>
`, 'utf-8');

  const defaultCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg: #0f0f0f;
  --color-accent: #6b39f4;
}
`;
  writeFileSync(join(outDir, 'src/styles/global.css'), defaultCss, 'utf-8');

  const slug = name.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  writeFileSync(join(outDir, 'project.json'), JSON.stringify({
    name: slug,
    displayName: name,
    slug,
    createdAt: new Date().toISOString(),
    status: 'prepared',
  }, null, 2));

  try {
    const { execSync } = await import('child_process');
    execSync('git init', { cwd: outDir, stdio: 'ignore' });
  } catch (_) {}

  return { success: true, path: `sites/${name}` };
}

const name = process.argv[2] || '';
const result = await prepareSite(name);
if (!result.success) {
  console.error(result.error);
  process.exit(1);
}
console.log(`\x1b[32m✓\x1b[0m Site preparado em ${result.path}`);
