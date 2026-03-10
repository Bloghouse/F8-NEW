/**
 * Zera o template para novo projeto
 * Remove referências capturadas, prompts, reseta config e content
 */
import { existsSync, readdirSync, rmSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');

const DEFAULT_CONFIG = `/**
 * Configuração central do site PBN 8links
 */
export const siteConfig = {
  name: 'Meu Site',
  siteName: 'Meu Site',
  description: 'Conteúdo de qualidade sobre o seu nicho',
  siteDescription: 'Conteúdo de qualidade sobre o seu nicho',
  url: 'https://meu-site.vercel.app',
  author: 'Autor do Site',
  primaryNiche: 'Tecnologia',
  aboutDescription: 'Conteúdo de qualidade sobre o seu nicho.',
  contactEmail: '',
  nav: [
    { label: 'Início', href: '/inicio' },
    { label: 'Sobre', href: '/sobre' },
    { label: 'Serviços', href: '/servicos' },
    { label: 'Médicos', href: '/medicos' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contato', href: '/contato' },
  ],
} as const;

export default siteConfig;
export const SITE_CONFIG = siteConfig;
`;

const EXEMPLO_POST = `---
title: Bem-vindo ao seu site 8links
description: Este é um post de exemplo.
pubDate: 2025-03-07
draft: false
tags: [boas-vindas]
---

Este é um **post de exemplo** para demonstrar a estrutura do boilerplate. Adicione mais posts em \`src/content/posts/\`.
`;

function reset() {
  const refDir = join(ROOT, 'public/reference');
  if (existsSync(refDir)) {
    for (const entry of readdirSync(refDir)) {
      rmSync(join(refDir, entry), { recursive: true });
    }
    console.log('  \x1b[32m✓\x1b[0m Referências removidas');
  }

  const promptsPath = join(ROOT, 'prompts-gerados.md');
  if (existsSync(promptsPath)) {
    rmSync(promptsPath);
    console.log('  \x1b[32m✓\x1b[0m prompts-gerados.md removido');
  }

  writeFileSync(join(ROOT, 'src/config.ts'), DEFAULT_CONFIG, 'utf-8');
  console.log('  \x1b[32m✓\x1b[0m Config resetada');

  const postsDir = join(ROOT, 'src/content/posts');
  if (existsSync(postsDir)) {
    for (const f of readdirSync(postsDir)) {
      rmSync(join(postsDir, f));
    }
    writeFileSync(join(postsDir, 'exemplo-post.md'), EXEMPLO_POST, 'utf-8');
    console.log('  \x1b[32m✓\x1b[0m Posts resetados');
  }

  console.log('\n\x1b[32m✓ Template zerado. Pronto para novo projeto.\x1b[0m\n');
}

reset();
