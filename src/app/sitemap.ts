import type { MetadataRoute } from 'next';
import { db } from '@/db';
import { servicePages } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function getActiveProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/products?limit=50000&active=true`, {
      next: { revalidate: 3600 }, // revalidate every hour
    } as any);

    if (!res.ok) {
      console.warn('Failed to fetch products for sitemap');
      return [];
    }

    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return [];
  }
}

async function getActiveServicePages() {
  try {
    const pages = await db
      .select()
      .from(servicePages)
      .where(eq(servicePages.isActive, true));
    return pages || [];
  } catch (error) {
    console.error('Error fetching service pages for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://milanooffreservizi-ecommerce.it';
  const today = new Date().toISOString().split('T')[0];

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: today,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/catalogo`,
      lastModified: today,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/chi-siamo`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contatti`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/aziende`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/condizioni-vendita`,
      lastModified: today,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/consegna-pagamento`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: today,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: today,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // Service pages - fetched from database
  const servicePageRecords = await getActiveServicePages();
  const servicePagesEntry: MetadataRoute.Sitemap = servicePageRecords.map((page: any) => ({
    url: `${baseUrl}/servizi/${page.slug}`,
    lastModified: page.updatedAt ? new Date(page.updatedAt).toISOString().split('T')[0] : today,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Product pages
  const products = await getActiveProducts();
  const productPages: MetadataRoute.Sitemap = products.map((product: any) => ({
    url: `${baseUrl}/prodotto/${product.code}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt).toISOString().split('T')[0] : today,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...servicePagesEntry, ...productPages];
}
