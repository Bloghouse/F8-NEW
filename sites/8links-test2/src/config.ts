/**
 * Configuração central do site 8links-test2
 * Agência digital - Início, Sobre, Projetos, Serviços, Contato.
 */

export const siteConfig = {
  name: '8links',
  description: 'Agência digital especializada em marketing, design e desenvolvimento web',
  url: 'https://8links-test2.vercel.app',
  phone: '+55 11 99999-0000',
  email: 'contato@8links.com.br',
  social: {
    twitter: '#',
    facebook: '#',
    instagram: '#',
    linkedin: '#',
  },
  nav: [
    { href: '/', label: 'Início' },
    { href: '/sobre', label: 'Sobre' },
    { href: '/projetos', label: 'Projetos' },
    {
      label: 'Serviços',
      children: [
        { href: '/servicos', label: 'Nossos Serviços' },
        { href: '/servicos/consultoria', label: 'Consultoria' },
      ],
    },
  ],
  footerNav: [
    { href: '/', label: 'Início' },
    { href: '/sobre', label: 'Sobre' },
    { href: '/projetos', label: 'Projetos' },
    { href: '/servicos', label: 'Serviços' },
  ],
} as const;
