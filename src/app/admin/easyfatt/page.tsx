'use client';

import { FileText } from 'lucide-react';
import Link from 'next/link';

export default function AdminEasyfattPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Export Easyfatt</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText size={24} className="text-blue" />
          <h2 className="font-bold">Esporta ordini per Easyfatt</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Seleziona gli ordini dalla pagina{' '}
          <Link href="/admin/ordini" className="text-blue hover:underline">Gestione Ordini</Link>{' '}
          e usa il pulsante &quot;Export Easyfatt&quot; per scaricare il file XML.
        </p>
        <div className="bg-blue/5 border border-blue/20 rounded-lg p-4">
          <h3 className="font-bold text-sm mb-2">Come importare in Easyfatt:</h3>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Apri Danea Easyfatt</li>
            <li>Vai su Strumenti → E-commerce → Scarica ordini</li>
            <li>Seleziona &quot;Importa da file&quot;</li>
            <li>Seleziona il file XML scaricato</li>
            <li>Conferma l&apos;importazione</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
