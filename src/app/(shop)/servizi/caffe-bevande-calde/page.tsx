import type { Metadata } from 'next';
import CaffeBevandeCaldeContent from './content';

export const metadata: Metadata = {
  title: 'Caffè & Bevande Calde - Milano Offre Servizi',
  description:
    'Macchine per caffè in comodato d\'uso, noleggio o acquisto. Caffè Borbone, Lavazza, Illy e altri brand premium. Cialde ESE compostabili e grani.',
  openGraph: {
    title: 'Caffè & Bevande Calde - Milano Offre Servizi',
    description: 'Macchine per caffè in comodato d\'uso, noleggio o acquisto con brand premium.',
    url: 'https://milanooffreservizi-ecommerce.it/servizi/caffe-bevande-calde',
  },
};

export default function CaffeBevandeCaldePage() {
  return <CaffeBevandeCaldeContent />;
}
