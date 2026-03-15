'use client';

import { useEffect, useState, useCallback } from 'react';
import { Zap, Search, X, Pencil, Trash2, Check } from 'lucide-react';

interface SuperPriceProduct {
  id: number;
  code: string;
  name: string;
  brand: string | null;
  priceNet: string;
  pricePublic: string | null;
  superPrice: string | null;
  imageUrl: string | null;
  isSuperPrice: boolean;
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

export default function SuperPrezzoPage() {
  const [products, setProducts] = useState<SuperPriceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addPrice, setAddPrice] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/promotions/superprice');
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      setError('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery)}&limit=10`);
      const data = await res.json();
      const all = data.products || [];
      const existingIds = new Set(products.map((p) => p.id));
      setSearchResults(all.filter((p: SearchProduct) => !existingIds.has(p.id)));
    } catch {
      setError('Errore nella ricerca');
    } finally {
      setSearching(false);
    }
  };

  const addSuperPrice = async (productId: number) => {
    if (!addPrice) {
      setError('Inserisci il super prezzo');
      return;
    }
    try {
      await fetch('/api/admin/promotions/superprice', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, isSuperPrice: true, superPrice: addPrice }),
      });
      setSearchResults((prev) => prev.filter((p) => p.id !== productId));
      setAddingId(null);
      setAddPrice('');
      fetchProducts();
    } catch {
      setError('Errore nell\'impostazione');
    }
  };

  const updateSuperPrice = async (productId: number) => {
    if (!editPrice) return;
    try {
      await fetch('/api/admin/promotions/superprice', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, superPrice: editPrice }),
      });
      setEditingId(null);
      setEditPrice('');
      fetchProducts();
    } catch {
      setError('Errore nell\'aggiornamento');
    }
  };

  const removeSuperPrice = async (productId: number) => {
    try {
      await fetch('/api/admin/promotions/superprice', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, isSuperPrice: false, superPrice: null }),
      });
      fetchProducts();
    } catch {
      setError('Errore nella rimozione');
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-bold mb-6">Prodotti SuperPrezzo</h1>
        <div className="p-8 text-center text-gray-500">Caricamento...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-1">Prodotti SuperPrezzo</h1>
      <p className="text-gray-500 text-sm mb-6">
        Imposta prezzi speciali promozionali sui prodotti selezionati.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline">Chiudi</button>
        </div>
      )}

      {/* Ricerca */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="font-heading font-bold text-navy mb-3">Aggiungi prodotto SuperPrezzo</h2>
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
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{formatEur(p.priceNet)}</span>
                  {addingId === p.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={addPrice}
                        onChange={(e) => setAddPrice(e.target.value)}
                        placeholder="Super prezzo"
                        className="w-24 text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-light"
                        autoFocus
                      />
                      <button
                        onClick={() => addSuperPrice(p.id)}
                        className="p-1.5 rounded bg-blue text-white hover:bg-blue-light"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => { setAddingId(null); setAddPrice(''); }}
                        className="p-1.5 rounded hover:bg-gray-200 text-gray-400"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingId(p.id); setAddPrice(''); }}
                      className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 font-medium"
                    >
                      Imposta
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista prodotti SuperPrezzo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <Zap size={18} className="text-orange-500" />
          <h2 className="font-heading font-bold text-navy">SuperPrezzo ({products.length})</h2>
        </div>
        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Prodotto</th>
                  <th className="px-5 py-3 text-left">Codice</th>
                  <th className="px-5 py-3 text-right">Prezzo netto</th>
                  <th className="px-5 py-3 text-right">Super Prezzo</th>
                  <th className="px-5 py-3 text-center">Sconto</th>
                  <th className="px-5 py-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => {
                  const discount = p.superPrice && p.priceNet
                    ? Math.round((1 - Number(p.superPrice) / Number(p.priceNet)) * 100)
                    : 0;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-8 h-8 object-contain rounded" />
                          ) : (
                            <div className="w-8 h-8 bg-gray-100 rounded" />
                          )}
                          <span className="font-medium text-navy truncate max-w-[250px]">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{p.code}</td>
                      <td className="px-5 py-3 text-right text-gray-600">{formatEur(p.priceNet)}</td>
                      <td className="px-5 py-3 text-right">
                        {editingId === p.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              step="0.01"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-24 text-xs border border-gray-200 rounded px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-blue-light"
                              autoFocus
                            />
                            <button onClick={() => updateSuperPrice(p.id)} className="p-1 rounded bg-blue text-white hover:bg-blue-light">
                              <Check size={14} />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-gray-200 text-gray-400">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="font-bold text-orange-600">{formatEur(p.superPrice)}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {discount > 0 && (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                            -{discount}%
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditingId(p.id); setEditPrice(p.superPrice || ''); }}
                            className="p-1.5 rounded-lg hover:bg-blue/10 text-gray-400 hover:text-blue transition-colors"
                            title="Modifica prezzo"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => removeSuperPrice(p.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red transition-colors"
                            title="Rimuovi SuperPrezzo"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Nessun prodotto con SuperPrezzo. Usa la ricerca qui sopra per aggiungerne.
          </div>
        )}
      </div>
    </div>
  );
}
