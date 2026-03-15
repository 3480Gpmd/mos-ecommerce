'use client';

import { useEffect, useState, useCallback } from 'react';
import { Sparkles, Search, X, Check, Pencil, Trash2 } from 'lucide-react';

interface PromoProduct {
  id: number;
  code: string;
  name: string;
  brand: string | null;
  isPromo: boolean;
  promoStartDate: string | null;
  promoEndDate: string | null;
  isNew: boolean;
  newUntilDate: string | null;
}

interface SearchProduct {
  id: number;
  code: string;
  name: string;
  brand: string | null;
}

function formatDate(d: string | null) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function toInputDate(d: string | null) {
  if (!d) return '';
  return new Date(d).toISOString().split('T')[0];
}

export default function PromoNovitaPage() {
  const [promoProducts, setPromoProducts] = useState<PromoProduct[]>([]);
  const [newProducts, setNewProducts] = useState<PromoProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  // Inline edit states
  const [editingPromoId, setEditingPromoId] = useState<number | null>(null);
  const [promoForm, setPromoForm] = useState({ promoStartDate: '', promoEndDate: '' });
  const [editingNewId, setEditingNewId] = useState<number | null>(null);
  const [newForm, setNewForm] = useState({ newUntilDate: '' });

  // Add new promo/new product states
  const [addingPromo, setAddingPromo] = useState<number | null>(null);
  const [addPromoForm, setAddPromoForm] = useState({ promoStartDate: '', promoEndDate: '' });
  const [addingNew, setAddingNew] = useState<number | null>(null);
  const [addNewForm, setAddNewForm] = useState({ newUntilDate: '' });

  const fetchProducts = useCallback(async () => {
    try {
      const [promoRes, newRes] = await Promise.all([
        fetch('/api/products?promo=true&limit=100'),
        fetch('/api/products?isNew=true&limit=100'),
      ]);
      const promoData = await promoRes.json();
      const newData = await newRes.json();
      setPromoProducts((promoData.products || []).filter((p: PromoProduct) => p.isPromo));
      setNewProducts((newData.products || []).filter((p: PromoProduct) => p.isNew));
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
      setSearchResults(data.products || []);
    } catch {
      setError('Errore nella ricerca');
    } finally {
      setSearching(false);
    }
  };

  const updateProduct = async (id: number, data: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Errore nell\'aggiornamento');
        return false;
      }
      return true;
    } catch {
      setError('Errore di rete');
      return false;
    }
  };

  const setAsPromo = async (productId: number) => {
    if (!addPromoForm.promoStartDate || !addPromoForm.promoEndDate) {
      setError('Date inizio e fine promo obbligatorie');
      return;
    }
    const ok = await updateProduct(productId, {
      isPromo: true,
      promoStartDate: addPromoForm.promoStartDate,
      promoEndDate: addPromoForm.promoEndDate,
    });
    if (ok) {
      setAddingPromo(null);
      setAddPromoForm({ promoStartDate: '', promoEndDate: '' });
      fetchProducts();
    }
  };

  const setAsNew = async (productId: number) => {
    if (!addNewForm.newUntilDate) {
      setError('Data fine novit\u00e0 obbligatoria');
      return;
    }
    const ok = await updateProduct(productId, {
      isNew: true,
      newUntilDate: addNewForm.newUntilDate,
    });
    if (ok) {
      setAddingNew(null);
      setAddNewForm({ newUntilDate: '' });
      fetchProducts();
    }
  };

  const updatePromo = async (productId: number) => {
    const ok = await updateProduct(productId, {
      promoStartDate: promoForm.promoStartDate || null,
      promoEndDate: promoForm.promoEndDate || null,
    });
    if (ok) {
      setEditingPromoId(null);
      fetchProducts();
    }
  };

  const removePromo = async (productId: number) => {
    const ok = await updateProduct(productId, { isPromo: false, promoStartDate: null, promoEndDate: null });
    if (ok) fetchProducts();
  };

  const updateNew = async (productId: number) => {
    const ok = await updateProduct(productId, {
      newUntilDate: newForm.newUntilDate || null,
    });
    if (ok) {
      setEditingNewId(null);
      fetchProducts();
    }
  };

  const removeNew = async (productId: number) => {
    const ok = await updateProduct(productId, { isNew: false, newUntilDate: null });
    if (ok) fetchProducts();
  };

  if (loading) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-bold mb-6">Promo e Novit&agrave;</h1>
        <div className="p-8 text-center text-gray-500">Caricamento...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-1">Promo e Novit&agrave;</h1>
      <p className="text-gray-500 text-sm mb-6">
        Gestisci date promo e flag novit&agrave; sui prodotti.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline">Chiudi</button>
        </div>
      )}

      {/* Ricerca prodotti */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="font-heading font-bold text-navy mb-3">Cerca prodotto</h2>
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
          <div className="mt-3 border border-gray-200 rounded-lg divide-y max-h-80 overflow-y-auto">
            {searchResults.map((p) => (
              <div key={p.id} className="px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-sm font-medium text-navy">{p.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{p.code}</span>
                    {p.brand && <span className="text-xs text-gray-400 ml-1">({p.brand})</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {/* Set as promo */}
                  {addingPromo === p.id ? (
                    <div className="flex items-center gap-1 bg-purple-50 rounded-lg px-2 py-1">
                      <input
                        type="date"
                        value={addPromoForm.promoStartDate}
                        onChange={(e) => setAddPromoForm({ ...addPromoForm, promoStartDate: e.target.value })}
                        className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none"
                        placeholder="Inizio"
                      />
                      <input
                        type="date"
                        value={addPromoForm.promoEndDate}
                        onChange={(e) => setAddPromoForm({ ...addPromoForm, promoEndDate: e.target.value })}
                        className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none"
                        placeholder="Fine"
                      />
                      <button onClick={() => setAsPromo(p.id)} className="p-1 rounded bg-purple-600 text-white hover:bg-purple-700"><Check size={12} /></button>
                      <button onClick={() => setAddingPromo(null)} className="p-1 rounded hover:bg-gray-200 text-gray-400"><X size={12} /></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingPromo(p.id); setAddPromoForm({ promoStartDate: '', promoEndDate: '' }); }}
                      className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 font-medium"
                    >
                      Imposta Promo
                    </button>
                  )}
                  {/* Set as new */}
                  {addingNew === p.id ? (
                    <div className="flex items-center gap-1 bg-green-50 rounded-lg px-2 py-1">
                      <input
                        type="date"
                        value={addNewForm.newUntilDate}
                        onChange={(e) => setAddNewForm({ newUntilDate: e.target.value })}
                        className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none"
                        placeholder="Fino a"
                      />
                      <button onClick={() => setAsNew(p.id)} className="p-1 rounded bg-green-600 text-white hover:bg-green-700"><Check size={12} /></button>
                      <button onClick={() => setAddingNew(null)} className="p-1 rounded hover:bg-gray-200 text-gray-400"><X size={12} /></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingNew(p.id); setAddNewForm({ newUntilDate: '' }); }}
                      className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 font-medium"
                    >
                      Imposta Novit&agrave;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prodotti in Promo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <Sparkles size={18} className="text-purple-600" />
          <h2 className="font-heading font-bold text-navy">Prodotti in Promo ({promoProducts.length})</h2>
        </div>
        {promoProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Prodotto</th>
                  <th className="px-5 py-3 text-left">Codice</th>
                  <th className="px-5 py-3 text-left">Inizio promo</th>
                  <th className="px-5 py-3 text-left">Fine promo</th>
                  <th className="px-5 py-3 text-center">Stato</th>
                  <th className="px-5 py-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {promoProducts.map((p) => {
                  const now = new Date();
                  const start = p.promoStartDate ? new Date(p.promoStartDate) : null;
                  const end = p.promoEndDate ? new Date(p.promoEndDate) : null;
                  const isActive = start && end ? start <= now && end >= now : true;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-navy truncate max-w-[250px]">{p.name}</td>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{p.code}</td>
                      <td className="px-5 py-3 text-gray-600">
                        {editingPromoId === p.id ? (
                          <input
                            type="date"
                            value={promoForm.promoStartDate}
                            onChange={(e) => setPromoForm({ ...promoForm, promoStartDate: e.target.value })}
                            className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none"
                          />
                        ) : (
                          formatDate(p.promoStartDate)
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {editingPromoId === p.id ? (
                          <input
                            type="date"
                            value={promoForm.promoEndDate}
                            onChange={(e) => setPromoForm({ ...promoForm, promoEndDate: e.target.value })}
                            className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none"
                          />
                        ) : (
                          formatDate(p.promoEndDate)
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {isActive ? 'Attiva' : 'Scaduta'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {editingPromoId === p.id ? (
                            <>
                              <button onClick={() => updatePromo(p.id)} className="p-1.5 rounded-lg bg-blue text-white hover:bg-blue-light"><Check size={14} /></button>
                              <button onClick={() => setEditingPromoId(null)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400"><X size={14} /></button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => { setEditingPromoId(p.id); setPromoForm({ promoStartDate: toInputDate(p.promoStartDate), promoEndDate: toInputDate(p.promoEndDate) }); }}
                                className="p-1.5 rounded-lg hover:bg-blue/10 text-gray-400 hover:text-blue transition-colors"
                                title="Modifica date"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => removePromo(p.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red transition-colors"
                                title="Rimuovi promo"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">Nessun prodotto in promo.</div>
        )}
      </div>

      {/* Prodotti Novit&agrave; */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <Sparkles size={18} className="text-green-600" />
          <h2 className="font-heading font-bold text-navy">Novit&agrave; ({newProducts.length})</h2>
        </div>
        {newProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Prodotto</th>
                  <th className="px-5 py-3 text-left">Codice</th>
                  <th className="px-5 py-3 text-left">Novit&agrave; fino a</th>
                  <th className="px-5 py-3 text-center">Stato</th>
                  <th className="px-5 py-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {newProducts.map((p) => {
                  const until = p.newUntilDate ? new Date(p.newUntilDate) : null;
                  const isActive = until ? until >= new Date() : true;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-navy truncate max-w-[250px]">{p.name}</td>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{p.code}</td>
                      <td className="px-5 py-3 text-gray-600">
                        {editingNewId === p.id ? (
                          <input
                            type="date"
                            value={newForm.newUntilDate}
                            onChange={(e) => setNewForm({ newUntilDate: e.target.value })}
                            className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none"
                          />
                        ) : (
                          formatDate(p.newUntilDate)
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {isActive ? 'Attivo' : 'Scaduto'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {editingNewId === p.id ? (
                            <>
                              <button onClick={() => updateNew(p.id)} className="p-1.5 rounded-lg bg-blue text-white hover:bg-blue-light"><Check size={14} /></button>
                              <button onClick={() => setEditingNewId(null)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400"><X size={14} /></button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => { setEditingNewId(p.id); setNewForm({ newUntilDate: toInputDate(p.newUntilDate) }); }}
                                className="p-1.5 rounded-lg hover:bg-blue/10 text-gray-400 hover:text-blue transition-colors"
                                title="Modifica data"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => removeNew(p.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red transition-colors"
                                title="Rimuovi novit\u00e0"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">Nessun prodotto contrassegnato come novit&agrave;.</div>
        )}
      </div>
    </div>
  );
}
