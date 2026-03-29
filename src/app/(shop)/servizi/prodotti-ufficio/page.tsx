import type { Metadata } from 'next';
import ProdottiUfficioContent from './content';

export const metadata: Metadata = {
  title: 'Prodotti Ufficio - Milano Offre Servizi',
  description:
    'Toner, cartucce, cancelleria, carta e prodotti igiene per ufficio. Catalogo di 25.000+ prodotti con consegna 24h a Milano. Prezzi competitivi per aziende e grossisti.',
  openGraph: {
    title: 'Prodotti Ufficio - Milano Offre Servizi',
    description: 'Forniture ufficio, toner, cartucce, cancelleria. 25.000+ prodotti, consegna 24h.',
    url: 'https://milanooffreservizi-ecommerce.it/servizi/prodotti-ufficio',
  },
};

export default function ProdottiUfficioPage() {
  return <ProdottiUfficioContent />;
}
