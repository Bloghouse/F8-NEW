/**
 * Utilitário para caminhos de imagens das referências Medcity
 * Mapeia slug da referência para path /reference/{slug}/images/img-XXX.ext
 */
export const refImg = (slug: string, file: string) => `/reference/${slug}/images/${file}`;

/** Slugs das referências conforme estrutura em public/reference/ */
export const REF = {
  doctorsSingleDoctor2: 'demos-medcity-doctors-single-doctor2.html',
  doctorsSingleDoctor1: 'demos-medcity-doctors-single-doctor1.html',
  doctorsGrid: 'demos-medcity-doctors-grid.html',
  doctorsModern: 'demos-medcity-doctors-modern.html',
  doctorsStandard: 'demos-medcity-doctors-standard.html',
  doctorsTimetable: 'demos-medcity-doctors-timetable.html',
  gallery: 'demos-medcity-gallery.html',
  faqs: 'demos-medcity-faqs.html',
  pricing: 'demos-medcity-pricing.html',
  servicesSingle: 'demos-medcity-services-single.html',
  services: 'demos-medcity-services.html',
  aboutUs: 'demos-medcity-about-us.html',
  appointment: 'demos-medcity-appointment.html',
} as const;
