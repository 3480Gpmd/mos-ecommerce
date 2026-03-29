'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search, Plus, Trash2, X, ChevronDown, ChevronUp, Edit2, Tag,
} from 'lucide-react';

interface VariantProduct {
  variantLabel: string;
  colorHex: string | null;
  sortOrder: number;
  productCode: string;
  productName: string;
}

interface VariantGroup {
  id: number;
  name: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  products: VariantProduct[];
  _count: {
    products: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const typeLabel = (type: string): string => {
  const labels: { [key: string]: string } = {
    color: 'Colore',
    size: 'Taglia',
    model: 'Modello',
    other: 'Altro',
  };
  return labels[type] || type;
};

const typeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    color: 'bg-red-100 text-red-800',
    size: 'bg-blue-100 text-blue-800',
    model: 'bg-purple-100 text-purple-800',
    other: 'bg-gray-100 text-gray-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export default function VariantiPage() {
  const [groups, setGroups] = useState<VariantGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });

  // Expanded row
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<VariantGroup>>({});
  const [saving, setSaving] = useState(false);

  // New group modal
  const [showNew, setShowNew] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    type: 'color',
    isActive: true,
  });
  const [creating, setCreating] = useState(false);

  // Add product to variant form
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: number; code: string; name: string }>>([]);
  const [searching, setSearching] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [newVariantProduct, setNewVariantProduct] = useState({
    variantLabel: '',
    colorHex: '',
    sortOrder: 0,
  });

  const fetchGroups = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    params.set('page', String(page));
    params.set('limit', '50');

    try {
      const res = await fetch(`/api/admin/product-variants?${params}`);
      const data = await res.json();
      setGroups(data.groups || []);
      setPagination({
        page,
        limit: 50,
        total: data.pagination?.total || 0,
        totalPages: Math.ceil((data.pagination?.total || 0) / 50),
      });
    } catch (err) {
      console.error('Errore caricamento varianti:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchGroups(1); }, [fetchGroups]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Product search
  const handleSearchProducts = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/admin/products?q=${encodeURIComponent(q)}&limit=10`);
      const data = await res.json();
      setSearchResults((data.products || []).map((p: any) => ({ id: p.id, code: p.code, name: p.name })));
    } catch (err) {
      console.error('Errore ricerca prodotti:', err);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearchProducts(productSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch, handleSearchProducts]);

  const handleExpand = (group: VariantGroup) => {
    if (expandedId === group.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(group.id);
    setEditData({
      name: group.name,
      type: group.type,
      isActive: group.isActive,
      products: group.products,
    });
  };

  const handleSave = async () => {
    if (!expandedId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/product-variants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: expandedId, ...editData }),
      });
      if (res.ok) {
        const { group: updated } = await res.json();
        setGroups((prev) => prev.map((g) => g.id === expandedId ? updated : g));
        setExpandedId(null);
      }
    } catch (err) {
      console.error('Errore salvataggio:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newGroup.name) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/product-variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup),
      });
      if (res.ok) {
        setShowNew(false);
        setNewGroup({ name: '', type: 'color', isActive: true });
        fetchGroups(1);
      }
    } catch (err) {
      console.error('Errore creazione:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questo gruppo di varianti?')) return;
    try {
      const res = await fetch('/api/admin/product-variants', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setGroups((prev) => prev.filter((g) => g.id !== id));
        if (expandedId === id) setExpandedId(null);
      }
    } catch (err) {
      console.error('Errore eliminazione:', err);
    }
  };

  const handleRemoveVariantProduct = (groupId: number, variantLabel: string) => {
    if (!confirm('Rimuovere questa variante?')) return;
    // This would require a separate API endpoint
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">
          Varianti Prodotto
          {!loading && <span className="text-base font-normal text-gray-500 ml-2">({pagination.total.toLocaleString('it-IT')})</span>}
        </h1>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-blue text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-blue-light transition-colors"
        >
          <Plus size={16} />
          Nuovo gruppo
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cerca variante..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent"
          />
        </div>
      </div>

      {/* Groups table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Caricamento...</div>
        ) : groups.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nessun gruppo di varianti trovato
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-3 py-3 w-8"></th>
                    <th className="px-3 py-3 text-left">Nome</th>
                    <th className="px-3 py-3 text-left">Tipo</th>
                    <th className="px-3 py-3 text-center">Prodotti</th>
                    <th className="px-3 py-3 text-center">Attivo</th>
                    <th className="px-3 py-3 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {groups.map((g) => (
                    <>
                      <tr
                        key={g.id}
                        onClick={() => handleExpand(g)}
                        className={`cursor-pointer transition-colors ${
                          expandedId === g.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-3 py-3 text-gray-400">
                          {expandedId === g.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </td>
                        <td className="px-3 py-3 font-medium text-navy">{g.name}</td>
                        <td className="px-3 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor(g.type)}`}>
                            {typeLabel(g.type)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-gray-600">{g._count.products}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            g.isActive ? 'bg-green-100 text-green-800' : 'bg-red/10 text-red'
                          }`}>
                            {g.isActive ? 'Attivo' : 'Inattivo'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(g.id);
                            }}
                            className="text-red hover:text-red-dark transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>

                      {expandedId === g.id && (
                        <tr key={`edit-${g.id}`}>
                          <td colSpan={6} className="bg-gray-50 border-b">
                            <div className="p-6 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Nome *</label>
                                  <input
                                    type="text"
                                    value={String(editData.name || '')}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Tipo *</label>
                                  <select
                                    value={String(editData.type || 'color')}
                                    onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                  >
                                    <option value="color">Colore</option>
                                    <option value="size">Taglia</option>
                                    <option value="model">Modello</option>
                                    <option value="other">Altro</option>
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={editData.isActive ?? true}
                                    onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                                    className="rounded border-gray-300"
                                  />
                                  Attivo
                                </label>
                              </div>

                              {/* Variant products */}
                              <div className="border-t pt-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="font-medium text-gray-700">Prodotti in questa variante</h3>
                                  <button
                                    onClick={() => {
                                      setSelectedGroupId(g.id);
                                      setShowAddProduct(true);
                                    }}
                                    className="text-xs bg-blue text-white px-3 py-1.5 rounded flex items-center gap-1 hover:bg-blue-light transition-colors"
                                  >
                                    <Plus size={12} />
                                    Aggiungi
                                  </button>
                                </div>

                                {editData.products && editData.products.length > 0 ? (
                                  <div className="space-y-2">
                                    {editData.products
                                      .sort((a, b) => a.sortOrder - b.sortOrder)
                                      .map((vp, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                                          <div className="flex items-center gap-3 flex-1">
                                            {vp.colorHex && editData.type === 'color' && (
                                              <div
                                                className="w-6 h-6 rounded-full border border-gray-300"
                                                style={{ backgroundColor: vp.colorHex }}
                                              />
                                            )}
                                            <div>
                                              <p className="font-medium text-sm">{vp.variantLabel}</p>
                                              <p className="text-xs text-gray-500">{vp.productCode} - {vp.productName}</p>
                                            </div>
                                          </div>
                                          <span className="text-xs text-gray-500">Ordine: {vp.sortOrder}</span>
                                        </div>
                                      ))}
                                  </div>
                                ) : (
                                  <div className="p-3 bg-gray-50 text-center text-gray-500 text-xs rounded-lg">
                                    Nessun prodotto aggiunto
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 pt-2">
                                <button
                                  onClick={handleSave}
                                  disabled={saving}
                                  className="flex items-center gap-1 px-4 py-2 bg-blue text-white text-sm font-bold rounded-lg hover:bg-blue-light disabled:opacity-50 transition-colors"
                                >
                                  <Edit2 size={14} />
                                  {saving ? 'Salvataggio...' : 'Salva modifiche'}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Pagina {pagination.page} di {pagination.totalPages}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* New group modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg">Nuovo gruppo di varianti</h2>
              <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Nome *</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Tipo *</label>
                <select
                  value={newGroup.type}
                  onChange={(e) => setNewGroup({ ...newGroup, type: e.target.value })}
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                >
                  <option value="color">Colore</option>
                  <option value="size">Taglia</option>
                  <option value="model">Modello</option>
                  <option value="other">Altro</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newGroup.isActive}
                    onChange={(e) => setNewGroup({ ...newGroup, isActive: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  Attivo
                </label>
              </div>
              <button
                onClick={handleCreate}
                disabled={!newGroup.name || creating}
                className="w-full flex items-center justify-center gap-2 bg-blue text-white font-bold py-2.5 rounded-lg hover:bg-blue-light disabled:opacity-50 transition-colors"
              >
                <Plus size={16} />
                {creating ? 'Creazione...' : 'Crea gruppo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add product to variant modal */}
      {showAddProduct && selectedGroupId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg">Aggiungi prodotto a variante</h2>
              <button onClick={() => setShowAddProduct(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-2">Prodotto</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Cerca prodotto..."
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-light"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                    {searchResults.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setProductSearch(`${p.code} - ${p.name}`)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <div className="font-medium text-sm">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.code}</div>
                      </button>
                    ))}
                  </div>
                )}
                {searching && <p className="text-xs text-gray-500 mt-1">Ricerca...</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Etichetta variante</label>
                <input
                  type="text"
                  value={newVariantProduct.variantLabel}
                  onChange={(e) => setNewVariantProduct({ ...newVariantProduct, variantLabel: e.target.value })}
                  placeholder="Es. Rosso, Blu, M, L..."
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                />
              </div>

              {groups.find(g => g.id === selectedGroupId)?.type === 'color' && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Colore (hex)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newVariantProduct.colorHex}
                      onChange={(e) => setNewVariantProduct({ ...newVariantProduct, colorHex: e.target.value })}
                      placeholder="#FF0000"
                      className="flex-1 text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                    />
                    <input
                      type="color"
                      value={newVariantProduct.colorHex || '#000000'}
                      onChange={(e) => setNewVariantProduct({ ...newVariantProduct, colorHex: e.target.value })}
                      className="w-12 h-10 border rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Ordine</label>
                <input
                  type="number"
                  value={newVariantProduct.sortOrder}
                  onChange={(e) => setNewVariantProduct({ ...newVariantProduct, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                />
              </div>

              <button
                onClick={() => {
                  // Call API to add product to variant
                  setShowAddProduct(false);
                  setProductSearch('');
                  setNewVariantProduct({ variantLabel: '', colorHex: '', sortOrder: 0 });
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue text-white font-bold py-2.5 rounded-lg hover:bg-blue-light transition-colors"
              >
                <Plus size={16} />
                Aggiungi prodotto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
