/**
 * Configuração central do site PBN 8links - Template Porto Marketing
 * Nav agrupada para UX: máximo 5-7 itens no header, resto no dropdown "Mais"
 * Última alteração: teste de deploy via hub
 */
export const siteConfig = {
  name: 'Meu Site',
  siteName: 'Meu Site',
  description: 'Marketing digital e estratégias inovadoras. Impulsionamos marcas além das expectativas.',
  siteDescription: 'Marketing digital e estratégias inovadoras. Impulsionamos marcas além das expectativas.',
  url: 'https://meu-site.vercel.app',
  author: 'Meu Site',
  primaryNiche: 'Marketing Digital',
  aboutDescription: 'Estratégias inovadoras para crescimento sustentável.',
  contactEmail: 'contato@meusite.com',
  /** Menu principal - prioriza Início, Sobre, Serviços, Cases, Contato (≤7 itens) */
  nav: [
    { label: 'Início', href: '/inicio' },
    { label: 'Sobre', href: '/sobre' },
    { label: 'Serviços', href: '/servicos' },
    { label: 'Processo', href: '/processo' },
    { label: 'Cases', href: '/cases' },
    { label: 'Contato', href: '/contato' },
  ],
  /** Itens secundários - rodapé ou dropdown "Mais" */
  navSecondary: [
    { label: 'Equipe', href: '/equipe' },
    { label: 'Portfolio', href: '/portfolio' },
  ],
} as const;

export default siteConfig;
export const SITE_CONFIG = siteConfig;
