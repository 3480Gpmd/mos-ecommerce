'use client';

import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Eye, Package, BarChart3 } from 'lucide-react';

const stats = [
  {
    title: 'Statistiche Ordini',
    description: 'Totale ordini, fatturato, media ordine, andamento mensile e distribuzione per stato e metodo di pagamento.',
    href: '/admin/statistiche/ordini',
    icon: ShoppingCart,
    color: 'text-blue-600 bg-blue-50',
  },
  {
    title: 'Statistiche Accessi',
    description: 'Visualizzazioni totali, visitatori unici, pagine più visitate e andamento giornaliero.',
    href: '/admin/statistiche/accessi',
    icon: Eye,
    color: 'text-green-600 bg-green-50',
  },
  {
    title: 'Prodotti Più Visti',
    description: 'Classifica dei 50 prodotti più visualizzati con filtro per periodo.',
    href: '/admin/statistiche/prodotti',
    icon: Package,
    color: 'text-purple-600 bg-purple-50',
  },
];

export default function StatistichePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <BarChart3 className="w-6 h-6 text-navy" />
        <h1 className="font-heading text-2xl text-navy">Statistiche</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.href}
            href={stat.href}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition group"
          >
            <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <h2 className="font-heading text-lg text-navy group-hover:text-blue-700 transition">{stat.title}</h2>
            <p className="text-sm text-gray-500 mt-2">{stat.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
