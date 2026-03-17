import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/login',
          '/registrati',
          '/profilo',
          '/ordini',
          '/checkout',
          '/preferiti',
          '/riordina',
          '/recupera-password',
          '/reset-password',
          '/ricerca-cartucce',
        ],
      },
    ],
    sitemap: 'https://milanooffreservizi-ecommerce.it/sitemap.xml',
    host: 'https://milanooffreservizi-ecommerce.it',
  };
}
