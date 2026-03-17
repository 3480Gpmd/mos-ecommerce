import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CatalogoContent } from './catalogo-content';

export const metadata: Metadata = {
  title: 'Catalogo Prodotti | Milano Offre Servizi',
  description: 'Catalogo completo di oltre 25.000 prodotti: forniture ufficio, caffè, acqua e bevande. Prezzi competitivi e consegna rapida a Milano.',
  keywords: 'catalogo prodotti, forniture ufficio, caffè online, acqua, bevande, prezzi',
  alternates: {
    canonical: 'https://milanooffreservizi-ecommerce.it/catalogo',
  },
  openGraph: {
    type: 'website',
    url: 'https://milanooffreservizi-ecommerce.it/catalogo',
    title: 'Catalogo Prodotti | Milano Offre Servizi',
    description: 'Catalogo completo di oltre 25.000 prodotti: forniture ufficio, caffè, acqua e bevande',
    siteName: 'Milano Offre Servizi',
  },
};

export default function CatalogoPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({length: 12}).map((_, i) => <div key={i} className="bg-gray-100 rounded-xl animate-pulse aspect-[3/4]" />)}</div></div>}>
      <CatalogoContent />
    </Suspense>
  );
}
