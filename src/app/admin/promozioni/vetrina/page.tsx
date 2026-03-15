'use client';

import { useEffect, useState, useCallback } from 'react';
import { Star, Search, X, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

interface FeaturedProduct {
  id: number;
  code: string;
  name: string;
  brand: string | null;
  priceNet: string;
  pricePublic: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  featuredSort: number;
}

interface SearchProduct {
  id: number;
  code: string;
  name: string;
  brand: string | null;
  priceNet: string;
}

function formatEur(v: string | number | null) {
  if (v === null || v === undefined) return '-';
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(v));
}

export default function VetrinaPage() {
  const [featured, setFeatured] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const fetchFeatured = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/promotions/featured');
      const data = await res.json();
      setFeatured(data.products || []);
    } catch {
      setError('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeatured(); }, [fetchFeatured]);

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery)}&limit=10`);
      const data = await res.json();
      const products = data.products || [];
      const featuredIds = new Set(featured.map((f) => f.id));
      setSearchResults(products.filter((p: SearchProduct) => !featuredIds.has(p.id)));
    } catch {
      setError('Errore nella ricerca');
    } finally {
      setSearching(false);
    }
  };

  const addToFeatured = async (productId: number) => {
    try {
      const maxSort = featured.length > 0 ? Math.max(...featured.map((f) => f.featuredSort)) : 0;
      await fetch('/api/admin/promotions/featured', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, isFeatured: true, featuredSort: maxSort + 1 }),
      });
      setSearchResults((prev) => prev.filter((p) => p.id !== productId));
      fetchFeatured();
    } catch {
      setError('Errore nell\'aggiunta');
    }
  };

  const removeFromFeatured = async (productId: number) => {
    try {
      await fetch('/api/admin/promotions/featured', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, isFeatured: false, featuredSort: 0 }),
      });
      fetchFeatured();
    } catch {
      setError('Errore nella rimozione');
    }
  };

  const updateSort = async (productId: number, newSort: number) => {
    try {
      await fetch('/api/admin/promotions/featured', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, featuredSort: newSort }),
      });
      fetchFeatured();
    } catch {
      setError('Errore nell\'aggiornamento ordine');
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const current = featured[index];
    const prev = featured[index - 1];
    updateSort(current.id, prev.featuredSort);
    updateSort(prev.id, current.featuredSort);
  };

  const moveDown = (index: number) => {
    if (index === featured.length - 1) return;
    const current = featured[index];
    const next = featured[index + 1];
    updateSort(current.id, next.featuredSort);
    updateSort(next.id, current.featuredSort);
  };

  if (loading) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-bold mb-6">Prodotti in Vetrina</h1>
        <div className="p-8 text-center text-gray-500">Caricamento...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-1">Prodotti in Vetrina</h1>
      <p className="text-gray-500 text-sm mb-6">
        Seleziona i prodotti da mostrare in evidenza nella homepage. Ordina trascinando o con le frecce.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Ricerca prodotti */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="font-heading font-bold text-navy mb-3">Aggiungi prodotto in vetrina</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Cerca per nome, codice o brand..."
              className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-light"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || searchQuery.length < 2}
            className="bg-blue text-white font-bold px-4 py-2.5 rounded-lg hover:bg-blue-light transition-colors text-sm disabled:opacity-50"
          >
            {searching ? 'Cerco...' : 'Cerca'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-3 border border-gray-200 rounded-lg divide-y max-h-60 overflow-y-auto">
            {searchResults.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50">
                <div>
                  <span className="text-sm font-medium text-navy">{p.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{p.code}</span>
                  {p.brand && <span className="text-xs text-gray-400 ml-2">({p.brand})</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{formatEur(p.priceNet)}</span>
                  <button
                    onClick={() => addToFeatured(p.id)}
                    className="text-xs bg-blue text-white px-3 py-1.5 rounded-lg hover:bg-blue-light font-medium"
                  >
                    Aggiungi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista prodotti in vetrina */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <Star size={18} className="text-yellow-500" />
          <h2 className="font-heading font-bold text-navy">In Vetrina ({featured.length})</h2>
        </div>
        {featured.length > 0 ? (
          <div className="divide-y">
            {featured.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 text-gray-400"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => moveDown(i)}
                    disabled={i === featured.length - 1}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 text-gray-400"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
                <span className="text-xs text-gray-400 w-6 text-center font-mono">{i + 1}</span>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-contain rounded border border-gray-100" />
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">N/A</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.code} {p.brand && `- ${p.brand}`}</p>
                </div>
                <span className="text-sm font-medium text-gray-700">{formatEur(p.priceNet)}</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={p.featuredSort}
                    onChange={(e) => updateSort(p.id, parseInt(e.target.value) || 0)}
                    className="w-16 text-xs border border-gray-200 rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-blue-light"
                    title="Ordine"
                  />
                  <button
                    onClick={() => removeFromFeatured(p.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red transition-colors"
                    title="Rimuovi dalla vetrina"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Nessun prodotto in vetrina. Usa la ricerca qui sopra per aggiungerne.
          </div>
        )}
      </div>
    </div>
  );
}
