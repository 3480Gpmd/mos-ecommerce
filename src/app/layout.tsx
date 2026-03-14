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

export const metadata: Metadata = {
  title: 'Milano Offre Servizi - Forniture Ufficio, Caffè, Acqua',
  description: 'E-commerce B2B/B2C per forniture ufficio, caffè e acqua. Consegna rapida a Milano e provincia.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={`${dmSans.variable} ${syne.variable}`}>
      <body className="font-sans antialiased bg-white text-gray-900">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
