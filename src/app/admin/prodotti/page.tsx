'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Search, Package, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Save, Plus, Trash2, X, Upload,
} from 'lucide-react';
import type { Product } from '@/db/schema';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const formatCurrency = (n: string | number | null) => {
  if (n === null || n === undefined) return '-';
  const num = typeof n === 'string' ? parseFloat(n) : n;
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
};

const calcMarkup = (priceNet: string | null, pricePublic: string | null): string => {
  if (!priceNet || !pricePublic) return '-';
  const net = parseFloat(priceNet);
  const pub = parseFloat(pricePublic);
  if (net <= 0) return '-';
  const markup = ((pub - net) / net) * 100;
  return `${markup.toFixed(1)}%`;
};

const calcMargin = (priceNet: string | null, pricePublic: string | null): string => {
  if (!priceNet || !pricePublic) return '-';
  const net = parseFloat(priceNet);
  const pub = parseFloat(pricePublic);
  if (pub <= 0) return '-';
  const margin = ((pub - net) / pub) * 100;
  return `${margin.toFixed(1)}%`;
};

export default function AdminProdottiPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('');
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });

  // Expanded row
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New product modal
  const [showNew, setShowNew] = useState(false);
  const [newProduct, setNewProduct] = useState({ code: '', name: '', priceNet: '', pricePublic: '', vatCode: '22', brand: '', description: '' });

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (brandFilter) params.set('brand', brandFilter);
    params.set('page', String(page));
    params.set('limit', '50');

    try {
      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setPagination({
        page,
        limit: 50,
        total: data.pagination?.total || 0,
        totalPages: Math.ceil((data.pagination?.total || 0) / 50),
      });
    } catch {
      console.error('Errore caricamento prodotti');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, brandFilter]);

  useEffect(() => { fetchProducts(1); }, [fetchProducts]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleExpand = (product: Product) => {
    if (expandedId === product.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(product.id);
    setEditData({
      name: product.name,
      brand: product.brand,
      description: product.description,
      priceNet: product.priceNet,
      pricePublic: product.pricePublic,
      vatCode: product.vatCode,
      stockAvailable: product.stockAvailable,
      isActive: product.isActive,
      isPromo: product.isPromo,
      isFeatured: product.isFeatured,
      isSuperPrice: product.isSuperPrice,
      isNew: product.isNew,
      imageUrl: product.imageUrl,
      imageCustom: product.imageCustom,
      superPrice: product.superPrice,
      minOrderQty: product.minOrderQty,
      orderMultiple: product.orderMultiple,
      packSize: product.packSize,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !expandedId) return;
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('productId', String(expandedId));
      formData.append('file', file);

      const res = await fetch('/api/admin/products/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const { product: updated } = await res.json();
        setProducts((prev) => prev.map((p) => p.id === expandedId ? updated : p));
        setEditData((prev) => ({ ...prev, imageCustom: updated.imageCustom }));
      } else {
        console.error('Errore upload immagine');
      }
    } catch (err) {
      console.error('Errore upload immagine:', err);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!expandedId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: expandedId, ...editData }),
      });
      if (res.ok) {
        const { product: updated } = await res.json();
        setProducts((prev) => prev.map((p) => p.id === expandedId ? updated : p));
      }
    } catch {
      console.error('Errore salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newProduct.code || !newProduct.name || !newProduct.priceNet) return;
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (res.ok) {
        setShowNew(false);
        setNewProduct({ code: '', name: '', priceNet: '', pricePublic: '', vatCode: '22', brand: '', description: '' });
        fetchProducts(1);
      }
    } catch {
      console.error('Errore creazione');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questo prodotto?')) return;
    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        if (expandedId === id) setExpandedId(null);
      }
    } catch {
      console.error('Errore eliminazione');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">
          Prodotti
          {!loading && <span className="text-base font-normal text-gray-500 ml-2">({pagination.total.toLocaleString('it-IT')})</span>}
        </h1>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-blue text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-blue-light transition-colors"
        >
          <Plus size={16} />
          Nuovo prodotto
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
            placeholder="Cerca per nome, codice, marca..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            fetchProducts(1);
          }}
          className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent"
        >
          <option value="all">Tutti gli stati</option>
          <option value="active">Attivi</option>
          <option value="inactive">Inattivi</option>
        </select>
        <input
          type="text"
          value={brandFilter}
          onChange={(e) => {
            setBrandFilter(e.target.value);
            fetchProducts(1);
          }}
          placeholder="Filtra per marca..."
          className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent"
        />
      </div>

      {/* Products table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Caricamento...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            Nessun prodotto trovato
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-3 py-3 w-8"></th>
                    <th className="px-3 py-3 text-left">Codice</th>
                    <th className="px-3 py-3 text-left">Nome</th>
                    <th className="px-3 py-3 text-left">Marca</th>
                    <th className="px-3 py-3 text-right">Pr. Acquisto</th>
                    <th className="px-3 py-3 text-right">Pr. Vendita</th>
                    <th className="px-3 py-3 text-right">Ricarico</th>
                    <th className="px-3 py-3 text-right">Margine</th>
                    <th className="px-3 py-3 text-right">IVA</th>
                    <th className="px-3 py-3 text-center">Giac.</th>
                    <th className="px-3 py-3 text-center">Stato</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((p) => (
                    <>
                      <tr
                        key={p.id}
                        onClick={() => handleExpand(p)}
                        className={`cursor-pointer transition-colors ${
                          expandedId === p.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-3 py-3 text-gray-400">
                          {expandedId === p.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-navy">{p.code}</td>
                        <td className="px-3 py-3 max-w-[200px] truncate font-medium">{p.name}</td>
                        <td className="px-3 py-3 text-gray-600 text-xs">{p.brand || '-'}</td>
                        <td className="px-3 py-3 text-right text-gray-600">{formatCurrency(p.priceNet)}</td>
                        <td className="px-3 py-3 text-right font-medium text-navy">{formatCurrency(p.pricePublic)}</td>
                        <td className="px-3 py-3 text-right">
                          <span className={`text-xs font-medium ${
                            parseFloat(calcMarkup(p.priceNet, p.pricePublic)) > 0 ? 'text-green-700' : 'text-gray-400'
                          }`}>
                            {calcMarkup(p.priceNet, p.pricePublic)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <span className={`text-xs font-medium ${
                            parseFloat(calcMargin(p.priceNet, p.pricePublic)) > 0 ? 'text-blue' : 'text-gray-400'
                          }`}>
                            {calcMargin(p.priceNet, p.pricePublic)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right text-gray-500 text-xs">{p.vatCode}%</td>
                        <td className="px-3 py-3 text-center text-xs">{p.stockAvailable ?? 0}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            p.isActive ? 'bg-green-100 text-green-800' : 'bg-red/10 text-red'
                          }`}>
                            {p.isActive ? 'Attivo' : 'Inattivo'}
                          </span>
                        </td>
                      </tr>

                      {expandedId === p.id && (
                        <tr key={`edit-${p.id}`}>
                          <td colSpan={11} className="bg-gray-50 border-b">
                            <div className="p-6 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Nome</label>
                                  <input
                                    type="text"
                                    value={String(editData.name || '')}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Marca</label>
                                  <input
                                    type="text"
                                    value={String(editData.brand || '')}
                                    onChange={(e) => setEditData({ ...editData, brand: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Prezzo acquisto (netto)</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={String(editData.priceNet || '')}
                                    onChange={(e) => setEditData({ ...editData, priceNet: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Prezzo vendita (pubblico)</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={String(editData.pricePublic || '')}
                                    onChange={(e) => setEditData({ ...editData, pricePublic: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">IVA %</label>
                                  <select
                                    value={String(editData.vatCode || '22')}
                                    onChange={(e) => setEditData({ ...editData, vatCode: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                  >
                                    <option value="22">22%</option>
                                    <option value="10">10%</option>
                                    <option value="4">4%</option>
                                    <option value="0">0% (Esente)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Giacenza</label>
                                  <input
                                    type="number"
                                    value={editData.stockAvailable ?? 0}
                                    onChange={(e) => setEditData({ ...editData, stockAvailable: parseInt(e.target.value) || 0 })}
                                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                  />
                                </div>
                              </div>

                              {/* Calculated margins display */}
                              {editData.priceNet && editData.pricePublic && (
                                <div className="flex items-center gap-6 bg-white rounded-lg border border-gray-200 p-3">
                                  <div>
                                    <span className="text-xs text-gray-500">Ricarico: </span>
                                    <span className="font-bold text-green-700">
                                      {calcMarkup(String(editData.priceNet), String(editData.pricePublic))}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">Margine: </span>
                                    <span className="font-bold text-blue">
                                      {calcMargin(String(editData.priceNet), String(editData.pricePublic))}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">Guadagno: </span>
                                    <span className="font-bold text-navy">
                                      {formatCurrency(parseFloat(String(editData.pricePublic)) - parseFloat(String(editData.priceNet)))}
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Descrizione</label>
                                <textarea
                                  value={String(editData.description || '')}
                                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                  rows={3}
                                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light resize-none"
                                />
                              </div>

                              {/* Image upload section */}
                              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase block mb-2">Immagine prodotto</label>

                                  {/* Current image preview */}
                                  {(editData.imageCustom || editData.imageUrl) && (
                                    <div className="mb-3">
                                      <p className="text-xs text-gray-500 mb-2">Immagine attuale:</p>
                                      <img
                                        src={String(editData.imageCustom || editData.imageUrl)}
                                        alt="Preview"
                                        className="max-w-xs h-auto border rounded-lg"
                                      />
                                    </div>
                                  )}

                                  {/* Upload new image */}
                                  <div className="mb-3">
                                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Carica nuova immagine</label>
                                    <input
                                      ref={fileInputRef}
                                      type="file"
                                      accept="image/*"
                                      onChange={handleImageUpload}
                                      disabled={uploadingImage}
                                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                    />
                                    {uploadingImage && <p className="text-xs text-gray-500 mt-1">Upload in corso...</p>}
                                  </div>
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">URL immagine personalizzato</label>
                                  <input
                                    type="url"
                                    value={String(editData.imageCustom || '')}
                                    onChange={(e) => setEditData({ ...editData, imageCustom: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                    placeholder="https://..."
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">URL immagine (fallback)</label>
                                  <input
                                    type="url"
                                    value={String(editData.imageUrl || '')}
                                    onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                    placeholder="https://..."
                                  />
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  <label className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={editData.isActive ?? true}
                                      onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                                      className="rounded border-gray-300"
                                    />
                                    Attivo
                                  </label>
                                  <label className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={editData.isPromo ?? false}
                                      onChange={(e) => setEditData({ ...editData, isPromo: e.target.checked })}
                                      className="rounded border-gray-300"
                                    />
                                    In promozione
                                  </label>
                                  <label className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={editData.isFeatured ?? false}
                                      onChange={(e) => setEditData({ ...editData, isFeatured: e.target.checked })}
                                      className="rounded border-gray-300"
                                    />
                                    In vetrina
                                  </label>
                                  <label className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={editData.isSuperPrice ?? false}
                                      onChange={(e) => setEditData({ ...editData, isSuperPrice: e.target.checked })}
                                      className="rounded border-gray-300"
                                    />
                                    Super prezzo
                                  </label>
                                  <label className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={editData.isNew ?? false}
                                      onChange={(e) => setEditData({ ...editData, isNew: e.target.checked })}
                                      className="rounded border-gray-300"
                                    />
                                    Nuovo
                                  </label>
                                </div>

                                {editData.isSuperPrice && (
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Prezzo super *</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={String(editData.superPrice || '')}
                                      onChange={(e) => setEditData({ ...editData, superPrice: e.target.value })}
                                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                    />
                                  </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Qtà ordine minimo</label>
                                    <input
                                      type="number"
                                      value={editData.minOrderQty ?? 1}
                                      onChange={(e) => setEditData({ ...editData, minOrderQty: parseInt(e.target.value) || 1 })}
                                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Multiplo ordine</label>
                                    <input
                                      type="number"
                                      value={editData.orderMultiple ?? 1}
                                      onChange={(e) => setEditData({ ...editData, orderMultiple: parseInt(e.target.value) || 1 })}
                                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Dimensione pacco</label>
                                    <input
                                      type="number"
                                      value={editData.packSize ?? ''}
                                      onChange={(e) => setEditData({ ...editData, packSize: e.target.value ? parseInt(e.target.value) : null })}
                                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 pt-2">
                                <button
                                  onClick={handleSave}
                                  disabled={saving}
                                  className="flex items-center gap-1 px-4 py-2 bg-blue text-white text-sm font-bold rounded-lg hover:bg-blue-light disabled:opacity-50 transition-colors"
                                >
                                  <Save size={14} />
                                  {saving ? 'Salvataggio...' : 'Salva modifiche'}
                                </button>
                                {p.isManual && (
                                  <button
                                    onClick={() => handleDelete(p.id)}
                                    className="flex items-center gap-1 px-4 py-2 bg-red/10 text-red text-sm font-bold rounded-lg hover:bg-red/20 transition-colors"
                                  >
                                    <Trash2 size={14} />
                                    Elimina
                                  </button>
                                )}
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
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fetchProducts(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 7) pageNum = i + 1;
                    else if (pagination.page <= 4) pageNum = i + 1;
                    else if (pagination.page >= pagination.totalPages - 3) pageNum = pagination.totalPages - 6 + i;
                    else pageNum = pagination.page - 3 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchProducts(pageNum)}
                        className={`px-3 py-1 text-sm rounded-lg ${
                          pageNum === pagination.page ? 'bg-blue text-white font-bold' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => fetchProducts(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* New product modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg">Nuovo prodotto</h2>
              <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Codice *</label>
                  <input
                    type="text"
                    value={newProduct.code}
                    onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Marca</label>
                  <input
                    type="text"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Nome *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Prezzo acquisto *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.priceNet}
                    onChange={(e) => setNewProduct({ ...newProduct, priceNet: e.target.value })}
                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Prezzo vendita</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.pricePublic}
                    onChange={(e) => setNewProduct({ ...newProduct, pricePublic: e.target.value })}
                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">IVA %</label>
                  <select
                    value={newProduct.vatCode}
                    onChange={(e) => setNewProduct({ ...newProduct, vatCode: e.target.value })}
                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                  >
                    <option value="22">22%</option>
                    <option value="10">10%</option>
                    <option value="4">4%</option>
                    <option value="0">0%</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Descrizione</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  rows={3}
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light resize-none"
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={!newProduct.code || !newProduct.name || !newProduct.priceNet}
                className="w-full flex items-center justify-center gap-2 bg-blue text-white font-bold py-2.5 rounded-lg hover:bg-blue-light disabled:opacity-50 transition-colors"
              >
                <Plus size={16} />
                Crea prodotto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
