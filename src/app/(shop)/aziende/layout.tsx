import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Soluzioni per Aziende | Milano Offre Servizi',
  description: 'Soluzioni dedicate per aziende: caffè in comodato, acqua con consegna programmata, forniture ufficio. Listini personalizzati e assistenza dedicata.',
  keywords: 'aziende Milano, caffè aziendale, acqua boccioni, forniture ufficio, preventivi personalizzati, consegna programm',
  alternates: {
    canonical: 'https://milanooffreservizi-ecommerce.it/aziende',
  },
  openGraph: {
    type: 'website',
    url: 'https://milanooffreservizi-ecommerce.it/aziende',
    title: 'Soluzioni per Aziende | Milano Offre Servizi',
    description: 'Soluzioni dedicate per aziende: caffè in comodato, acqua con consegna programmata, forniture ufficio',
    siteName: 'Milano Offre Servizi',
  },
};

export default function AziendeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
