'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Save, Star } from 'lucide-react';

interface RelevanceItem {
  id: number;
  code: string;
  name: string;
  brand?: string;
  relevanceScore: number;
}

type TabType = 'products' | 'groups' | 'categories';

export default function RilevanzaPage() {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [items, setItems] = useState<RelevanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingScores, setEditingScores] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState('');

  const tabLabels: Record<TabType, string> = {
    products: 'Prodotti',
    groups: 'Settori',
    categories: 'Famiglie',
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/catalog/relevance?type=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
        const scores: Record<number, number> = {};
        data.forEach((item: RelevanceItem) => { scores[item.id] = item.relevanceScore; });
        setEditingScores(scores);
      }
    } catch {
      setError('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSaveScore = async (id: number) => {
    setSaving(id);
    setError('');

    const res = await fetch('/api/admin/catalog/relevance', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        type: activeTab,
        relevanceScore: editingScores[id] ?? 0,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Errore nel salvataggio');
    }
    setSaving(null);
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.code.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Star className="w-6 h-6 text-navy" />
        <h1 className="font-heading text-2xl text-navy">Punteggio Rilevanza</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(Object.keys(tabLabels) as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-white text-navy shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
          placeholder="Cerca per codice o nome..."
        />
      </div>

      {/* Items table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Codice</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Nome</th>
              {activeTab === 'products' && (
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Brand</th>
              )}
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Punteggio (0-100)</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Salva</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Caricamento...</td></tr>
            ) : filteredItems.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Nessun elemento con punteggio di rilevanza</td></tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-3 text-sm font-mono text-navy">{item.code}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{item.name}</td>
                  {activeTab === 'products' && (
                    <td className="px-6 py-3 text-sm text-gray-500">{item.brand || '-'}</td>
                  )}
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editingScores[item.id] ?? 0}
                        onChange={(e) => setEditingScores({ ...editingScores, [item.id]: parseInt(e.target.value) })}
                        className="w-32"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingScores[item.id] ?? 0}
                        onChange={(e) => setEditingScores({ ...editingScores, [item.id]: parseInt(e.target.value) || 0 })}
                        className="border border-gray-200 rounded px-2 py-1 text-sm w-16 text-center"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleSaveScore(item.id)}
                      disabled={saving === item.id}
                      className="text-navy hover:text-blue-700 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
