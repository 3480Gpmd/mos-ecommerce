'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Users, Tag, Percent, Loader2 } from 'lucide-react';

interface ExportCard {
  title: string;
  description: string;
  endpoint: string;
  filename: string;
  icon: typeof Users;
  color: string;
}

const exports: ExportCard[] = [
  {
    title: 'Anagrafica Clienti',
    description: 'Esporta tutti i clienti con dati anagrafici, contatti, partita IVA, codice fiscale e listino assegnato.',
    endpoint: '/api/admin/exports/customers',
    filename: 'anagrafica_clienti.xlsx',
    icon: Users,
    color: 'text-blue-600 bg-blue-50',
  },
  {
    title: 'Listini Vendita',
    description: 'Esporta i prodotti con prezzi pubblici, prezzi netti, IVA, listino e sconto applicato.',
    endpoint: '/api/admin/exports/pricelists',
    filename: 'listini_vendita.xlsx',
    icon: Tag,
    color: 'text-green-600 bg-green-50',
  },
  {
    title: 'Prodotti in Promozione',
    description: 'Esporta i prodotti in promozione con prezzi promo, date, vetrina e superprezzo.',
    endpoint: '/api/admin/exports/promo',
    filename: 'prodotti_promo.xlsx',
    icon: Percent,
    color: 'text-orange-600 bg-orange-50',
  },
];

export default function EsportazioniPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (exp: ExportCard) => {
    setDownloading(exp.endpoint);
    try {
      const res = await fetch(exp.endpoint);
      if (!res.ok) {
        alert('Errore durante il download');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exp.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Errore durante il download');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Download className="w-6 h-6 text-navy" />
        <h1 className="font-heading text-2xl text-navy">Esportazioni</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exports.map((exp) => (
          <div
            key={exp.endpoint}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col"
          >
            <div className={`w-12 h-12 rounded-lg ${exp.color} flex items-center justify-center mb-4`}>
              <exp.icon className="w-6 h-6" />
            </div>
            <h2 className="font-heading text-lg text-navy">{exp.title}</h2>
            <p className="text-sm text-gray-500 mt-2 flex-1">{exp.description}</p>
            <button
              onClick={() => handleDownload(exp)}
              disabled={downloading === exp.endpoint}
              className="mt-4 flex items-center justify-center gap-2 bg-navy text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
            >
              {downloading === exp.endpoint ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Download in corso...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Scarica XLSX
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
