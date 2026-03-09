# Boilerplate 8links - Sites PBN em Astro

Template Astro para criar sites PBN compatíveis com a plataforma 8links. Estrutura de blog com Content Collections, pronto para deploy na Vercel.

## Estrutura

```
f8/
├── public/
├── src/
│   ├── components/      # Header, Footer, PostCard
│   ├── config.ts        # Configuração do site (nome, nicho, meta)
│   ├── content/
│   │   └── config.ts    # Schema dos posts (compatível com bridge 8links)
│   ├── layouts/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── blog/
│   │   ├── sobre.astro
│   │   └── contato.astro
│   └── styles/
├── astro.config.mjs
├── vercel.json          # Deploy Vercel
└── package.json
```

## Início rápido

```bash
cd f8
bun install   # ou npm install
bun run dev   # ou npm run dev
```

Acesse http://localhost:4321

## Personalização

1. **src/config.ts** - Nome do site, descrição, nicho, URL, redes sociais
2. **src/content/posts/** - Adicione posts em Markdown (a bridge 8links faz push aqui)
3. **src/styles/global.css** - Cores e tipografia
4. **tailwind.config.mjs** - Tema Tailwind

## Schema dos posts (frontmatter)

Compatível com o formato que a bridge 8links envia:

```yaml
---
title: Título do post
description: Descrição para SEO (opcional)
pubDate: 2025-03-07
draft: false
image: /caminho/imagem.jpg
tags: [tag1, tag2]
---

Conteúdo em Markdown...
```

O slug é gerado automaticamente a partir do nome do arquivo (ex: `meu-post.md` → `/blog/meu-post`).

## Deploy na Vercel

1. Conecte o repositório à Vercel
2. O `vercel.json` já está configurado para sites estáticos
3. Deploy automático a cada push na branch principal

```bash
bun run build   # Testar build localmente
```

## Conexão com 8links

Para conectar este site à 8links como site da rede (PBN):

1. Faça deploy do site (Vercel ou Cloudflare Pages)
2. Crie um repositório no GitHub com o código
3. Na 8links, adicione o site em **Sites da Rede** com:
   - **domain**: seu domínio (ex: meu-site.vercel.app)
   - **api_url**: URL da bridge 8links (ex: https://bridge.8links.io/wp-json)
   - **username**: owner/repo (ex: seu-usuario/meu-pbn)
   - **application_password**: Token do GitHub com permissão no repositório
   - **primary_niche**, **secondary_niche**, **tertiary_niche**: Nichos do site
   - **da**: Domain Authority

A bridge recebe os posts da 8links e faz push no Git. O deploy é disparado automaticamente.

## Captura de referência (screenshots)

A página inicial permite capturar screenshots de qualquer site para usar como referência na construção do template.

**Como usar:**
1. Em um terminal: `bun run capture-server` (ou `bun run capture-api`)
2. Em outro: `bun run dev`
3. Acesse http://localhost:4321, cole a URL e clique em Capturar
4. As imagens são salvas em `public/reference/`

**Requisito:** Bun (`bun install` na raiz) e Puppeteer (Chromium incluído — nada mais a instalar)

## Scripts

| Comando | Descrição |
|---------|-----------|
| `bun run dev` | Servidor de desenvolvimento |
| `bun run dev:full` | Dev + servidor de captura juntos |
| `bun run capture-server` | Servidor de captura (porta 3001) |
| `bun run build` | Build para produção |
| `bun run preview` | Preview do build |

**Se a porta 3001 estiver em uso:** `lsof -ti:3001 | xargs kill -9`
