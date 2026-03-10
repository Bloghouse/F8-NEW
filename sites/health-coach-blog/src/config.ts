/**
 * Configuração central do site PBN 8links
 * Personalize: nome, nicho, meta tags, redes sociais
 * Atualizado: verificação de links integrada ao build
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
    { label: 'Galeria', href: '/galeria' },
    { label: 'Médicos', href: '/medicos' },
    { label: 'Blog', href: '/blog' },
    { label: 'Preços', href: '/precos' },
    { label: 'FAQ', href: '/faqs' },
    { label: 'Agendar', href: '/agendar' },
    { label: 'Contato', href: '/contato' },
  ],
} as const;

export default siteConfig;
export const SITE_CONFIG = siteConfig;
