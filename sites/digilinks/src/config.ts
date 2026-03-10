/**
 * Configuração central do site Digilinks
 * Contém dados do site, navegação e rotas para agência digital.
 */

export const siteConfig = {
  name: 'Digilinks',
  description: 'Agência digital especializada em marketing, design e desenvolvimento web',
  url: 'https://digilinks.vercel.app',
  phone: '+55 11 99999-0000',
  email: 'contato@digilinks.com.br',
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
        { href: '/servicos/marketing-digital', label: 'Marketing Digital' },
      ],
    },
    { href: '/projetos', label: 'Projetos' },
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
