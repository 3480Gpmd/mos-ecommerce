import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/session-provider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap',
});

const siteUrl = 'https://milanooffreservizi-ecommerce.it';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MOS — Forniture Ufficio, Caffè, Acqua | Milano',
    template: '%s | MOS Milano Offre Servizi',
  },
  description: 'E-commerce B2B/B2C per forniture ufficio, caffè e acqua. Consegna rapida a Milano e provincia. Oltre 25.000 prodotti a prezzi competitivi.',
  keywords: 'forniture ufficio Milano, caffè, acqua, cancelleria, consumabili, e-commerce B2B, B2C, consegna rapida',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: 'add-your-google-site-verification-code-here',
  },
  alternates: { canonical: siteUrl },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: siteUrl,
    siteName: 'MOS Milano Offre Servizi',
    title: 'MOS — Forniture Ufficio, Caffè, Acqua | Milano',
    description: 'E-commerce B2B/B2C per forniture ufficio, caffè e acqua. Consegna rapida a Milano e provincia.',
    images: [{ url: '/logo-light.png', width: 1200, height: 630, alt: 'MOS Milano Offre Servizi', type: 'image/png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MOS Milano Offre Servizi',
    description: 'E-commerce B2B/B2C per forniture ufficio, caffè e acqua',
    images: ['/logo-light.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
    <html lang="it" className={`${inter.variable} ${spaceGrotesk.variable}`}>
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
