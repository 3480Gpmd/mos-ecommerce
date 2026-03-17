import type { Metadata } from 'next';
import { DM_Sans, Syne } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/session-provider';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  display: 'swap',
});

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  display: 'swap',
});

const siteUrl = 'https://milanooffreservizi-ecommerce.it';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Milano Offre Servizi - Forniture Ufficio, Caffè, Acqua',
    template: '%s | Milano Offre Servizi',
  },
  description: 'E-commerce B2B/B2C per forniture ufficio, caffè e acqua. Consegna rapida a Milano e provincia. Oltre 25.000 prodotti a prezzi competitivi.',
  keywords: 'forniture ufficio Milano, caffè, acqua, cancelleria, consumabili, e-commerce B2B, B2C, consegna rapida',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: 'add-your-google-site-verification-code-here',
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: siteUrl,
    siteName: 'Milano Offre Servizi',
    title: 'Milano Offre Servizi - Forniture Ufficio, Caffè, Acqua',
    description: 'E-commerce B2B/B2C per forniture ufficio, caffè e acqua. Consegna rapida a Milano e provincia.',
    images: [
      {
        url: '/logo-light.png',
        width: 1200,
        height: 630,
        alt: 'Milano Offre Servizi - Logo',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Milano Offre Servizi',
    description: 'E-commerce B2B/B2C per forniture ufficio, caffè e acqua',
    images: ['/logo-light.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Milano Offre Servizi',
    url: siteUrl,
    logo: `${siteUrl}/logo-light.png`,
    description: 'E-commerce B2B/B2C per forniture ufficio, caffè e acqua',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: '+39-02-6473060',
      email: 'info@milanooffreservizi.it',
      areaServed: 'IT',
      availableLanguage: 'it',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Via Romolo Bitti, 28',
      addressLocality: 'Milano',
      postalCode: '20125',
      addressCountry: 'IT',
    },
  };

  return (
    <html lang="it" className={`${dmSans.variable} ${syne.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="font-sans antialiased bg-white text-gray-900">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
