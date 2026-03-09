/**
 * Configuração central do site PBN 8links
 * Personalize aqui: nome, nicho, meta tags, redes sociais
 */

export const siteConfig = {
  name: 'Meu Site',
  siteName: 'Meu Site',
  description: 'Conteúdo de qualidade sobre o seu nicho',
  siteDescription: 'Conteúdo de qualidade sobre o seu nicho',
  url: 'https://meu-site.vercel.app',
  author: 'Autor do Site',
  primaryNiche: 'Tecnologia',
  secondaryNiche: '',
  tertiaryNiche: '',
  social: {
    twitter: '',
    linkedin: '',
    github: '',
  },
  nav: [
    { label: 'Início', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'Sobre', href: '/sobre' },
    { label: 'Contato', href: '/contato' },
  ],
} as const;

export default siteConfig;

export const SITE_CONFIG = siteConfig;
