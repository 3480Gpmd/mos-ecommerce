'use client';

import { useState } from 'react';
import { Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ImportResult {
  totalRows: number;
  productsNew: number;
  productsUpdated: number;
  productsDeactivated: number;
  errors: number;
  errorLog: string[];
  durationMs: number;
}

export default function AdminImportPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const [csvPath, setCsvPath] = useState(process.env.NEXT_PUBLIC_APP_URL ? '' : './listino_completo.csv');

  const handleImport = async () => {
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const res = await fetch('/api/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: csvPath || undefined }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Errore durante l\'import');
      }
    } catch {
      setError('Errore di rete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Import CSV Listino</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="font-bold mb-4">Importa listino fornitore</h2>
        <p className="text-sm text-gray-500 mb-4">
          Importa il file CSV del fornitore (eSell Pegasus, separatore ;, encoding latin-1).
          I prodotti manuali (caffè/acqua) non verranno mai sovrascritti.
        </p>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={csvPath}
            onChange={(e) => setCsvPath(e.target.value)}
            placeholder="Percorso file CSV (default: ./listino_completo.csv)"
            className="flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue"
          />
          <button
            onClick={handleImport}
            disabled={loading}
            className="bg-blue text-white font-bold px-6 py-2.5 rounded-lg hover:bg-blue-light transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Importando...
              </>
            ) : (
              <>
                <Upload size={18} /> Avvia import
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red/10 border border-red/20 rounded-lg p-4 flex items-center gap-3">
            <XCircle size={20} className="text-red" />
            <p className="text-sm text-red">{error}</p>
          </div>
        )}
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle size={24} className="text-green-600" />
            <h2 className="font-bold text-lg text-green-800">Import completato</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{result.totalRows.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Righe totali</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{result.productsNew}</p>
              <p className="text-xs text-gray-500">Nuovi</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{result.productsUpdated.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Aggiornati</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-orange-700">{result.productsDeactivated}</p>
              <p className="text-xs text-gray-500">Disattivati</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-700">{result.errors}</p>
              <p className="text-xs text-gray-500">Errori</p>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Durata: {(result.durationMs / 1000).toFixed(1)}s
          </p>

          {result.errorLog.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold text-sm mb-2">Log errori:</h3>
              <pre className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 max-h-60 overflow-auto">
                {result.errorLog.join('\n')}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
