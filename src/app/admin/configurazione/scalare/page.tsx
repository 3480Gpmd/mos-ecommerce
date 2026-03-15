'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, Search, Layers } from 'lucide-react';

interface VolumeTier {
  id: number;
  productId: number;
  minQty: number;
  maxQty: number | null;
  discountPct: string | null;
  priceOverride: string | null;
}

interface ProductResult {
  id: number;
  code: string;
  name: string;
  priceNet: string;
}

export default function ScalarePage() {
  const [tiers, setTiers] = useState<VolumeTier[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ minQty: '', maxQty: '', discountPct: '', priceOverride: '' });
  const [error, setError] = useState('');

  const fetchTiers = useCallback(async (productId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/catalog/volume-pricing?productId=${productId}`);
      if (res.ok) setTiers(await res.json());
    } catch {
      setError('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/admin/catalog/volume-pricing?search=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          // Use a general product search endpoint if available, otherwise search locally
        }
      } catch { /* ignore */ }
      setSearching(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const searchProducts = async () => {
    if (!searchQuery || searchQuery.length < 2) return;
    setSearching(true);
    try {
      // Search products via a general endpoint
      const res = await fetch(`/api/admin/catalog/volume-pricing?searchProducts=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      }
    } catch { /* ignore */ }
    setSearching(false);
  };

  const selectProduct = (product: ProductResult) => {
    setSelectedProduct(product);
    setSearchQuery('');
    setSearchResults([]);
    fetchTiers(product.id);
  };

  const handleSave = async () => {
    setError('');
    if (!form.minQty) {
      setError('Quantità minima obbligatoria');
      return;
    }
    if (!selectedProduct) return;

    const method = editingId ? 'PUT' : 'POST';
    const body = editingId
      ? {
          id: editingId,
          minQty: parseInt(form.minQty),
          maxQty: form.maxQty ? parseInt(form.maxQty) : null,
          discountPct: form.discountPct || null,
          priceOverride: form.priceOverride || null,
        }
      : {
          productId: selectedProduct.id,
          minQty: parseInt(form.minQty),
          maxQty: form.maxQty ? parseInt(form.maxQty) : null,
          discountPct: form.discountPct || null,
          priceOverride: form.priceOverride || null,
        };

    const res = await fetch('/api/admin/catalog/volume-pricing', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setEditingId(null);
      setShowNew(false);
      setForm({ minQty: '', maxQty: '', discountPct: '', priceOverride: '' });
      fetchTiers(selectedProduct.id);
    } else {
      const data = await res.json();
      setError(data.error || 'Errore nel salvataggio');
    }
  };

  const handleEdit = (tier: VolumeTier) => {
    setEditingId(tier.id);
    setForm({
      minQty: String(tier.minQty),
      maxQty: tier.maxQty ? String(tier.maxQty) : '',
      discountPct: tier.discountPct || '',
      priceOverride: tier.priceOverride || '',
    });
    setShowNew(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questo scaglione?')) return;
    const res = await fetch(`/api/admin/catalog/volume-pricing?id=${id}`, { method: 'DELETE' });
    if (res.ok && selectedProduct) fetchTiers(selectedProduct.id);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowNew(false);
    setForm({ minQty: '', maxQty: '', discountPct: '', priceOverride: '' });
    setError('');
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(parseFloat(value));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Layers className="w-6 h-6 text-navy" />
        <h1 className="font-heading text-2xl text-navy">Prezzi a Volume (Scalare)</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Product search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Cerca Prodotto</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchProducts()}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
            placeholder="Cerca per codice o nome prodotto..."
          />
        </div>
        {searching && <p className="text-sm text-gray-400 mt-2">Ricerca in corso...</p>}
        {searchResults.length > 0 && (
          <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
            {searchResults.map((p) => (
              <button
                key={p.id}
                onClick={() => selectProduct(p)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0"
              >
                <span className="font-mono text-navy">{p.code}</span>
                <span className="ml-2 text-gray-600">{p.name}</span>
                <span className="ml-2 text-gray-400">{formatCurrency(p.priceNet)}</span>
              </button>
            ))}
          </div>
        )}

        {selectedProduct && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-mono text-sm font-medium text-navy">{selectedProduct.code}</span>
              <span className="ml-2 text-sm text-gray-700">{selectedProduct.name}</span>
              <span className="ml-2 text-sm text-gray-500">{formatCurrency(selectedProduct.priceNet)}</span>
            </div>
            <button onClick={() => { setSelectedProduct(null); setTiers([]); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Volume tiers table */}
      {selectedProduct && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-heading text-lg text-navy">Scaglioni di Prezzo</h2>
            <button
              onClick={() => { setShowNew(true); setEditingId(null); setForm({ minQty: '', maxQty: '', discountPct: '', priceOverride: '' }); }}
              className="flex items-center gap-2 bg-navy text-white px-3 py-1.5 rounded-lg text-sm hover:bg-opacity-90 transition"
            >
              <Plus className="w-4 h-4" /> Aggiungi Scaglione
            </button>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Qtà Min</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Qtà Max</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Sconto %</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Prezzo Fisso</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {showNew && (
                <tr className="border-b border-gray-50 bg-blue-50/30">
                  <td className="px-6 py-3">
                    <input type="number" value={form.minQty} onChange={(e) => setForm({ ...form, minQty: e.target.value })}
                      className="border border-gray-200 rounded px-2 py-1 text-sm w-20" placeholder="1" />
                  </td>
                  <td className="px-6 py-3">
                    <input type="number" value={form.maxQty} onChange={(e) => setForm({ ...form, maxQty: e.target.value })}
                      className="border border-gray-200 rounded px-2 py-1 text-sm w-20" placeholder="-" />
                  </td>
                  <td className="px-6 py-3">
                    <input type="number" step="0.01" value={form.discountPct} onChange={(e) => setForm({ ...form, discountPct: e.target.value })}
                      className="border border-gray-200 rounded px-2 py-1 text-sm w-20" placeholder="0" />
                  </td>
                  <td className="px-6 py-3">
                    <input type="number" step="0.01" value={form.priceOverride} onChange={(e) => setForm({ ...form, priceOverride: e.target.value })}
                      className="border border-gray-200 rounded px-2 py-1 text-sm w-24" placeholder="-" />
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={handleSave} className="text-green-600 hover:text-green-800 mr-2"><Save className="w-4 h-4" /></button>
                    <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                  </td>
                </tr>
              )}
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Caricamento...</td></tr>
              ) : tiers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Nessuno scaglione configurato</td></tr>
              ) : (
                tiers.map((tier) =>
                  editingId === tier.id ? (
                    <tr key={tier.id} className="border-b border-gray-50 bg-blue-50/30">
                      <td className="px-6 py-3">
                        <input type="number" value={form.minQty} onChange={(e) => setForm({ ...form, minQty: e.target.value })}
                          className="border border-gray-200 rounded px-2 py-1 text-sm w-20" />
                      </td>
                      <td className="px-6 py-3">
                        <input type="number" value={form.maxQty} onChange={(e) => setForm({ ...form, maxQty: e.target.value })}
                          className="border border-gray-200 rounded px-2 py-1 text-sm w-20" />
                      </td>
                      <td className="px-6 py-3">
                        <input type="number" step="0.01" value={form.discountPct} onChange={(e) => setForm({ ...form, discountPct: e.target.value })}
                          className="border border-gray-200 rounded px-2 py-1 text-sm w-20" />
                      </td>
                      <td className="px-6 py-3">
                        <input type="number" step="0.01" value={form.priceOverride} onChange={(e) => setForm({ ...form, priceOverride: e.target.value })}
                          className="border border-gray-200 rounded px-2 py-1 text-sm w-24" />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button onClick={handleSave} className="text-green-600 hover:text-green-800 mr-2"><Save className="w-4 h-4" /></button>
                        <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={tier.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-6 py-3 text-sm text-gray-700">{tier.minQty}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{tier.maxQty ?? '-'}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{tier.discountPct ? `${tier.discountPct}%` : '-'}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{formatCurrency(tier.priceOverride)}</td>
                      <td className="px-6 py-3 text-right">
                        <button onClick={() => handleEdit(tier)} className="text-gray-400 hover:text-navy mr-2"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(tier.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
