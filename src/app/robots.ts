import type { MetadataRoute } from 'next';
import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function getCustomRobotsConfig() {
  try {
    const result = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'robots_txt_custom'));

    if (result.length > 0 && result[0].value) {
      // If custom robots.txt is set, return it as-is
      // Note: Next.js robots.ts should return MetadataRoute.Robots format
      // If you want full control, you might want to serve robots.txt separately
      return null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching custom robots config:', error);
    return null;
  }
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://milanooffreservizi-ecommerce.it';

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
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
