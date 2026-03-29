import type { Metadata } from 'next';
import AcquaBevandContent from './content';

export const metadata: Metadata = {
  title: 'Acqua & Bevande - Milano Offre Servizi',
  description:
    'Dispenser di acqua, boccioni, bevande fredde e bibite. Soluzioni aziendali con consegna programmata. Rete idrica e boccioni disponibili.',
  openGraph: {
    title: 'Acqua & Bevande - Milano Offre Servizi',
    description: 'Dispenser di acqua, boccioni e bevande fredde per ufficio e aziende.',
    url: 'https://milanooffreservizi-ecommerce.it/servizi/acqua-bevande',
  },
};

export default function AcquaBevandePage() {
  return <AcquaBevandContent />;
}
