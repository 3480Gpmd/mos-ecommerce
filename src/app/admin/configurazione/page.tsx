'use client';

import Link from 'next/link';
import {
  Building2, CreditCard, Truck, PackageOpen, MapPin, Ruler, BarChart3, FileSignature, ArrowLeft,
} from 'lucide-react';

const cards = [
  {
    href: '/admin/configurazione/azienda',
    icon: Building2,
    title: 'Dati Aziendali',
    description: 'Ragione sociale, P.IVA, coordinate bancarie e contatti.',
    color: 'text-blue',
    bg: 'bg-blue/5',
  },
  {
    href: '/admin/configurazione/pagamenti',
    icon: CreditCard,
    title: 'Modalit\u00e0 di Pagamento',
    description: 'Configura i metodi di pagamento disponibili per i clienti.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    href: '/admin/configurazione/spedizioni',
    icon: Truck,
    title: 'Spese di Trasporto',
    description: 'Regole di calcolo delle spese di spedizione per importo e peso.',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    href: '/admin/configurazione/supplementi',
    icon: PackageOpen,
    title: 'Supplementi Ingombranti',
    description: 'Sovrapprezzi per prodotti ingombranti o di grandi dimensioni.',
    color: 'text-red',
    bg: 'bg-red/5',
  },
  {
    href: '/admin/configurazione/destinazioni',
    icon: MapPin,
    title: 'Zone di Spedizione',
    description: 'Gestisci le zone geografiche e i costi aggiuntivi per provincia.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    href: '/admin/configurazione/unita',
    icon: Ruler,
    title: 'Unit\u00e0 di Vendita',
    description: 'Unit\u00e0 di misura disponibili per i prodotti (PZ, KG, LT, ecc.).',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    href: '/admin/configurazione/scalare',
    icon: BarChart3,
    title: 'Prezzi a Volume',
    description: 'Sconti progressivi in base alla quantit\u00e0 ordinata.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    href: '/admin/configurazione/contratti',
    icon: FileSignature,
    title: 'Contratti',
    description: 'Contratti commerciali personalizzati per cliente.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
];

export default function ConfigurazionePage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <Link
          href="/admin/impostazioni"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <h1 className="font-heading text-2xl font-bold text-navy">Configurazione</h1>
      </div>
      <p className="text-gray-500 text-sm mb-6 ml-11">
        Gestisci tutti i parametri operativi del tuo e-commerce.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue/20 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${card.bg} flex-shrink-0`}>
                <card.icon size={22} className={card.color} />
              </div>
              <div>
                <h3 className={`font-heading font-bold text-lg ${card.color} group-hover:underline mb-1`}>
                  {card.title}
                </h3>
                <p className="text-sm text-gray-500">{card.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
