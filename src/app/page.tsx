import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HomeClient } from '@/components/home-client';

export const metadata: Metadata = {
  title: 'MOS — Forniture Ufficio, Caffè, Acqua | Milano',
  description: 'E-commerce B2B/B2C per forniture ufficio, caffè e acqua. Consegna rapida a Milano e provincia. Oltre 25.000 prodotti a prezzi competitivi. Preventivi personalizzati per aziende.',
  keywords: 'forniture ufficio Milano, caffè online, acqua boccioni, consegna rapida, e-commerce, B2B, B2C',
  alternates: { canonical: 'https://milanooffreservizi-ecommerce.it' },
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <HomeClient />
      </main>
      <Footer />
    </div>
  );
}
