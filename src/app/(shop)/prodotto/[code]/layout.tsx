import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface ProductLayoutProps {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}

async function getProductMetadata(code: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/products/${code}`, {
      next: { revalidate: 3600 }, // revalidate every hour
    } as any);

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('Failed to fetch product metadata:', error);
    return null;
  }
}

export async function generateMetadata(
  { params }: ProductLayoutProps,
): Promise<Metadata> {
  const { code } = await params;
  const product = await getProductMetadata(code);

  if (!product || product.error) {
    notFound();
  }

  const siteUrl = 'https://milanooffreservizi-ecommerce.it';
  const productUrl = `${siteUrl}/prodotto/${code}`;
  const priceNet = parseFloat(String(product.priceNet));
  const vatRate = parseFloat(String(product.vatCode));
  const displayPrice = priceNet * (1 + vatRate / 100);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} - ${product.brand || 'Milano Offre Servizi'}`,
    image: product.imageUrl || `${siteUrl}/logo-light.png`,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Milano Offre Servizi',
    },
    manufacturer: {
      '@type': 'Organization',
      name: product.brand || 'Milano Offre Servizi',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'EUR',
      price: displayPrice.toFixed(2),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: (product.stockAvailable ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Milano Offre Servizi',
        url: siteUrl,
      },
    },
  };

  return {
    title: `${product.name} | Milano Offre Servizi`,
    description: product.description
      ? product.description.substring(0, 160)
      : `Acquista ${product.name}${product.brand ? ` ${product.brand}` : ''} online. Consegna rapida a Milano. Prezzo: ${displayPrice.toFixed(2)} €`,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      url: productUrl,
      title: `${product.name} | Milano Offre Servizi`,
      description: product.description
        ? product.description.substring(0, 160)
        : `Acquista ${product.name}${product.brand ? ` ${product.brand}` : ''} online`,
      images: product.imageUrl ? [
        {
          url: product.imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ] : undefined,
    } as any,
  };
}

export default async function ProductLayout({ children, params }: ProductLayoutProps) {
  const { code } = await params;
  const product = await getProductMetadata(code);

  if (!product || product.error) {
    notFound();
  }

  const siteUrl = 'https://milanooffreservizi-ecommerce.it';
  const productUrl = `${siteUrl}/prodotto/${code}`;
  const priceNet = parseFloat(String(product.priceNet));
  const vatRate = parseFloat(String(product.vatCode));
  const displayPrice = priceNet * (1 + vatRate / 100);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} - ${product.brand || 'Milano Offre Servizi'}`,
    image: product.imageUrl || `${siteUrl}/logo-light.png`,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Milano Offre Servizi',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'EUR',
      price: displayPrice.toFixed(2),
      availability: (product.stockAvailable ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Milano Offre Servizi',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {children}
    </>
  );
}
