/**
 * Configuração central do site TechAI
 * Contém dados do site, navegação e rotas para agência de IA/tecnologia.
 */

export const siteConfig = {
  name: 'TechAI',
  description: 'Agência especializada em soluções de IA e tecnologia',
  url: 'https://techai.vercel.app',
  phone: '+55 21 99521-1289',
  whatsappMessage: 'Olá! Gostaria de saber mais sobre os serviços de SEO da TechAI.',
  email: 'contato@techai.com.br',
  social: {
    twitter: '#',
    facebook: '#',
    instagram: '#',
    linkedin: '#',
  },
  nav: [
    { href: '/', label: 'Início' },
    { href: '/sobre', label: 'Sobre' },
    {
      label: 'Serviços',
      children: [
        { href: '/servicos', label: 'Nossos Serviços' },
        { href: '/integracoes', label: 'Integrações' },
      ],
    },
    {
      label: 'Projetos',
      children: [
        { href: '/projetos', label: 'Projetos' },
        { href: '/projetos/cartao-visual', label: 'Detalhes Projeto' },
      ],
    },
    {
      label: 'Equipe',
      children: [
        { href: '/equipe', label: 'Nossa Equipe' },
        { href: '/equipe/wade-warren', label: 'Detalhes Membro' },
      ],
    },
    { href: '/blog', label: 'Blog' },
    { href: '/contato', label: 'Contato' },
  ],
  footerNav: [
    { href: '/', label: 'Início' },
    { href: '/sobre', label: 'Sobre' },
    { href: '/servicos', label: 'Serviços' },
    { href: '/projetos', label: 'Projetos' },
    { href: '/blog', label: 'Blog' },
    { href: '/contato', label: 'Contato' },
    { href: '/depoimentos', label: 'Depoimentos' },
    { href: '/precos', label: 'Preços' },
    { href: '/faq', label: 'FAQ' },
  ],
} as const;
