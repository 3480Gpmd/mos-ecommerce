'use client';

import { useEffect, useState, useCallback } from 'react';
import { Gift, Plus, Pencil, Trash2, X, Check, Search, Package, Euro, Tag, ArrowUpRight } from 'lucide-react';

interface GiftRuleData {
  id: number;
  name: string;
  triggerType: string;
  triggerValue: string | null;
  triggerProductId: number | null;
  triggerCategoryId: number | null;
  giftProductId: number;
  giftQty: number;
  minOrderAmount: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  giftProductName: string | null;
  giftProductCode: string | null;
  giftProductPrice: string | null;
  triggerProductName: string | null;
  triggerProductCode: string | null;
  triggerProductPrice: string | null;
}

interface ProductOption {
  id: number;
  code: string;
  name: string;
  priceNet: string;
  imageUrl: string | null;
}

const emptyForm = {
  name: '',
  triggerType: 'amount',
  triggerValue: '',
  triggerProductId: '',
  triggerCategoryId: '',
  giftProductId: '',
  giftQty: '1',
  minOrderAmount: '',
  startDate: '',
  endDate: '',
  isActive: true,
};

function formatDate(d: string | null) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatEur(v: string | number | null) {
  if (v === null || v === undefined) return '-';
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(v));
}

function toInputDate(d: string | null) {
  if (!d) return '';
  return new Date(d).toISOString().split('T')[0];
}

const triggerTypeLabels: Record<string, string> = {
  amount: 'Importo ordine',
  product: 'Prodotto acquistato',
  category: 'Categoria',
};

const triggerTypeColors: Record<string, string> = {
  amount: 'bg-green-100 text-green-800',
  product: 'bg-blue-100 text-blue-800',
  category: 'bg-purple-100 text-purple-800',
};

export default function OmaggiPage() {
  const [rules, setRules] = useState<GiftRuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Product search state
  const [giftSearch, setGiftSearch] = useState('');
  const [giftResults, setGiftResults] = useState<ProductOption[]>([]);
  const [giftSearching, setGiftSearching] = useState(false);
  const [selectedGiftProduct, setSelectedGiftProduct] = useState<ProductOption | null>(null);
  const [showGiftDropdown, setShowGiftDropdown] = useState(false);

  const [triggerSearch, setTriggerSearch] = useState('');
  const [triggerResults, setTriggerResults] = useState<ProductOption[]>([]);
  const [triggerSearching, setTriggerSearching] = useState(false);
  const [selectedTriggerProduct, setSelectedTriggerProduct] = useState<ProductOption | null>(null);
  const [showTriggerDropdown, setShowTriggerDropdown] = useState(false);

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/admin/promotions/gifts');
      const data = await res.json();
      setRules(data.giftRules || []);
    } catch {
      setError('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRules(); }, []);

  // Product search with debounce
  const searchProducts = useCallback(async (query: string, setter: (r: ProductOption[]) => void, loadingSetter: (b: boolean) => void) => {
    if (query.length < 2) { setter([]); return; }
    loadingSetter(true);
    try {
      const res = await fetch(`/api/admin/products?q=${encodeURIComponent(query)}&limit=8`);
      const data = await res.json();
      setter((data.products || []).map((p: Record<string, unknown>) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        priceNet: p.priceNet,
        imageUrl: p.imageUrl,
      })));
    } catch { setter([]); }
    finally { loadingSetter(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchProducts(giftSearch, setGiftResults, setGiftSearching), 300);
    return () => clearTimeout(t);
  }, [giftSearch, searchProducts]);

  useEffect(() => {
    const t = setTimeout(() => searchProducts(triggerSearch, setTriggerResults, setTriggerSearching), 300);
    return () => clearTimeout(t);
  }, [triggerSearch, searchProducts]);

  const handleSubmit = async () => {
    if (!form.name || !form.giftProductId) {
      setError('Nome e prodotto omaggio obbligatori');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...form } : form;
      const res = await fetch('/api/admin/promotions/gifts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Errore nel salvataggio');
        return;
      }
      resetForm();
      fetchRules();
    } catch {
      setError('Errore di rete');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setSelectedGiftProduct(null);
    setSelectedTriggerProduct(null);
    setGiftSearch('');
    setTriggerSearch('');
    setError('');
  };

  const handleEdit = (r: GiftRuleData) => {
    setForm({
      name: r.name,
      triggerType: r.triggerType,
      triggerValue: r.triggerValue || '',
      triggerProductId: r.triggerProductId ? String(r.triggerProductId) : '',
      triggerCategoryId: r.triggerCategoryId ? String(r.triggerCategoryId) : '',
      giftProductId: String(r.giftProductId),
      giftQty: String(r.giftQty),
      minOrderAmount: r.minOrderAmount || '',
      startDate: toInputDate(r.startDate),
      endDate: toInputDate(r.endDate),
      isActive: r.isActive,
    });
    if (r.giftProductName) {
      setSelectedGiftProduct({ id: r.giftProductId, code: r.giftProductCode || '', name: r.giftProductName, priceNet: r.giftProductPrice || '0', imageUrl: null });
    }
    if (r.triggerProductId && r.triggerProductName) {
      setSelectedTriggerProduct({ id: r.triggerProductId, code: r.triggerProductCode || '', name: r.triggerProductName, priceNet: r.triggerProductPrice || '0', imageUrl: null });
    }
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questa regola omaggio?')) return;
    try {
      await fetch(`/api/admin/promotions/gifts?id=${id}`, { method: 'DELETE' });
      fetchRules();
    } catch {
      setError("Errore nell'eliminazione");
    }
  };

  const handleToggle = async (r: GiftRuleData) => {
    try {
      await fetch('/api/admin/promotions/gifts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: r.id, isActive: !r.isActive }),
      });
      fetchRules();
    } catch { /* ignore */ }
  };

  // Group rules by trigger type for visual display
  const amountRules = rules.filter(r => r.triggerType === 'amount').sort((a, b) => Number(a.triggerValue || 0) - Number(b.triggerValue || 0));
  const productRules = rules.filter(r => r.triggerType === 'product');
  const categoryRules = rules.filter(r => r.triggerType === 'category');
  const activeCount = rules.filter(r => r.isActive).length;

  if (loading) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-bold mb-6">Prodotti in Omaggio</h1>
        <div className="p-8 text-center text-gray-500">Caricamento...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Prodotti in Omaggio</h1>
          <p className="text-gray-500 text-sm mt-1">
            Configura omaggi automatici in base a importo ordine, prodotto acquistato o categoria.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); setSelectedGiftProduct(null); setSelectedTriggerProduct(null); }}
            className="flex items-center gap-2 bg-blue text-white font-bold px-4 py-2.5 rounded-lg hover:bg-blue-light transition-colors text-sm"
          >
            <Plus size={16} />
            Nuova Regola
          </button>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><Gift size={20} className="text-green-600" /></div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Regole totali</p>
              <p className="text-xl font-bold text-navy">{rules.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Check size={20} className="text-blue" /></div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Attive</p>
              <p className="text-xl font-bold text-navy">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg"><Euro size={20} className="text-purple-600" /></div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Soglie importo</p>
              <p className="text-xl font-bold text-navy">{amountRules.length}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline">Chiudi</button>
        </div>
      )}

      {/* Soglie importo - visual tiers */}
      {amountRules.length > 0 && !showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="font-heading font-bold text-navy mb-4 flex items-center gap-2">
            <ArrowUpRight size={18} className="text-green-600" />
            Soglie Omaggio per Importo Ordine
          </h2>
          <div className="flex flex-wrap gap-3">
            {amountRules.map((r) => (
              <div
                key={r.id}
                className={`relative border-2 rounded-xl p-4 min-w-[200px] flex-1 max-w-[280px] transition-all ${
                  r.isActive ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                  Ordine da {formatEur(r.triggerValue)}
                </div>
                <div className="font-bold text-navy text-sm mb-2 truncate">
                  {r.giftProductName || `Prodotto #${r.giftProductId}`}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Qtà: {r.giftQty}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    r.isActive ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {r.isActive ? 'Attiva' : 'Off'}
                  </span>
                </div>
                {r.startDate && (
                  <div className="text-xs text-gray-400 mt-1">
                    {formatDate(r.startDate)} → {formatDate(r.endDate)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-heading font-bold text-navy mb-4">
            {editingId ? 'Modifica Regola Omaggio' : 'Nuova Regola Omaggio'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Nome */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Nome regola</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                placeholder="Es. Omaggio sopra 100 euro"
              />
            </div>

            {/* Tipo trigger */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Tipo condizione</label>
              <select
                value={form.triggerType}
                onChange={(e) => setForm({ ...form, triggerType: e.target.value, triggerValue: '', triggerProductId: '', triggerCategoryId: '' })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              >
                <option value="amount">Importo ordine raggiunto</option>
                <option value="product">Acquisto di un prodotto specifico</option>
                <option value="category">Acquisto da una categoria</option>
              </select>
            </div>

            {/* Trigger value based on type */}
            {form.triggerType === 'amount' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Soglia importo (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.triggerValue}
                  onChange={(e) => setForm({ ...form, triggerValue: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                  placeholder="Es. 100.00"
                />
              </div>
            )}

            {form.triggerType === 'product' && (
              <div className="relative">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Prodotto trigger</label>
                {selectedTriggerProduct ? (
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-blue-50">
                    <Package size={14} className="text-blue shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-navy truncate block">{selectedTriggerProduct.name}</span>
                      <span className="text-xs text-gray-500">{selectedTriggerProduct.code} · <span className="font-semibold text-blue">{formatEur(selectedTriggerProduct.priceNet)}</span></span>
                    </div>
                    <button onClick={() => { setSelectedTriggerProduct(null); setForm({ ...form, triggerProductId: '' }); setTriggerSearch(''); }} className="text-gray-400 hover:text-red">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={triggerSearch}
                        onChange={(e) => { setTriggerSearch(e.target.value); setShowTriggerDropdown(true); }}
                        onFocus={() => setShowTriggerDropdown(true)}
                        className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                        placeholder="Cerca prodotto..."
                      />
                    </div>
                    {showTriggerDropdown && triggerResults.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {triggerResults.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedTriggerProduct(p);
                              setForm({ ...form, triggerProductId: String(p.id) });
                              setShowTriggerDropdown(false);
                              setTriggerSearch('');
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b border-gray-50 last:border-0"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-navy truncate">{p.name}</span>
                              <span className="font-bold text-blue whitespace-nowrap">{formatEur(p.priceNet)}</span>
                            </div>
                            <div className="text-xs text-gray-400">{p.code}</div>
                          </button>
                        ))}
                      </div>
                    )}
                    {triggerSearching && <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg p-3 text-xs text-gray-500">Ricerca...</div>}
                  </>
                )}
              </div>
            )}

            {form.triggerType === 'category' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">ID categoria</label>
                <input
                  type="number"
                  value={form.triggerCategoryId}
                  onChange={(e) => setForm({ ...form, triggerCategoryId: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                  placeholder="ID categoria"
                />
              </div>
            )}

            {/* Prodotto omaggio - SEARCH */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                <Gift size={12} className="inline mr-1" />
                Prodotto omaggio
              </label>
              {selectedGiftProduct ? (
                <div className="flex items-center gap-2 border-2 border-green-300 rounded-lg px-3 py-2 bg-green-50">
                  <Gift size={14} className="text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-navy truncate block">{selectedGiftProduct.name}</span>
                    <span className="text-xs text-gray-500">{selectedGiftProduct.code} · <span className="font-semibold text-green-700">{formatEur(selectedGiftProduct.priceNet)}</span></span>
                  </div>
                  <button onClick={() => { setSelectedGiftProduct(null); setForm({ ...form, giftProductId: '' }); setGiftSearch(''); }} className="text-gray-400 hover:text-red">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={giftSearch}
                      onChange={(e) => { setGiftSearch(e.target.value); setShowGiftDropdown(true); }}
                      onFocus={() => setShowGiftDropdown(true)}
                      className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                      placeholder="Cerca prodotto omaggio..."
                    />
                  </div>
                  {showGiftDropdown && giftResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {giftResults.map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedGiftProduct(p);
                            setForm({ ...form, giftProductId: String(p.id) });
                            setShowGiftDropdown(false);
                            setGiftSearch('');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-green-50 text-sm border-b border-gray-50 last:border-0"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-navy truncate">{p.name}</span>
                            <span className="font-bold text-green-700 whitespace-nowrap">{formatEur(p.priceNet)}</span>
                          </div>
                          <div className="text-xs text-gray-400">{p.code}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {giftSearching && <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg p-3 text-xs text-gray-500">Ricerca...</div>}
                </>
              )}
            </div>

            {/* Quantità */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Quantità omaggio</label>
              <input
                type="number"
                min="1"
                value={form.giftQty}
                onChange={(e) => setForm({ ...form, giftQty: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              />
            </div>

            {/* Ordine minimo */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Ordine minimo (€)</label>
              <input
                type="number"
                step="0.01"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                placeholder="Opzionale"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Data inizio</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Data fine</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              />
            </div>

            {/* Attiva */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-gray-300 w-4 h-4"
                />
                <span className="text-sm text-gray-700">Regola attiva</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
            >
              <Check size={16} />
              {saving ? 'Salvataggio...' : editingId ? 'Aggiorna regola' : 'Crea regola omaggio'}
            </button>
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Tabella regole */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <Gift size={18} className="text-green-600" />
          <h2 className="font-heading font-bold text-navy">Tutte le regole ({rules.length})</h2>
        </div>
        {rules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Nome</th>
                  <th className="px-5 py-3 text-left">Condizione</th>
                  <th className="px-5 py-3 text-left">Prodotto omaggio</th>
                  <th className="px-5 py-3 text-center">Qtà</th>
                  <th className="px-5 py-3 text-right">Min. ordine</th>
                  <th className="px-5 py-3 text-left">Validità</th>
                  <th className="px-5 py-3 text-center">Stato</th>
                  <th className="px-5 py-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rules.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-navy">{r.name}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${triggerTypeColors[r.triggerType] || 'bg-gray-100 text-gray-700'}`}>
                        {triggerTypeLabels[r.triggerType] || r.triggerType}
                      </span>
                      {r.triggerType === 'amount' && r.triggerValue && (
                        <span className="ml-2 text-sm font-medium text-green-700">{formatEur(r.triggerValue)}</span>
                      )}
                      {r.triggerType === 'product' && r.triggerProductName && (
                        <span className="ml-2 text-xs text-gray-600">{r.triggerProductName}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Gift size={14} className="text-green-500 shrink-0" />
                        <span className="text-gray-700 truncate max-w-[180px]">
                          {r.giftProductName || `ID: ${r.giftProductId}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center font-bold">{r.giftQty}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{formatEur(r.minOrderAmount)}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {r.startDate ? `${formatDate(r.startDate)} → ${formatDate(r.endDate)}` : 'Sempre'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => handleToggle(r)}
                        className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                          r.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {r.isActive ? 'Attiva' : 'Off'}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(r)}
                          className="p-1.5 rounded-lg hover:bg-blue/10 text-gray-400 hover:text-blue transition-colors"
                          title="Modifica"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red transition-colors"
                          title="Elimina"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Gift size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Nessuna regola omaggio configurata</p>
            <p className="text-sm mt-1">Crea la prima regola per offrire omaggi ai clienti in base all&#39;importo dell&#39;ordine.</p>
          </div>
        )}
      </div>
    </div>
  );
}
