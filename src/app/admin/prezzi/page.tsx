'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  CheckCircle,
  XCircle,
  Percent,
  ListOrdered,
  BadgePercent,
  Loader2,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────

interface PriceList {
  id: number;
  code: string;
  name: string;
  description: string | null;
  discountPct: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

interface CategoryMarkup {
  id: number;
  priceListId: number;
  groupId: number | null;
  categoryId: number | null;
  subcategoryId: number | null;
  markupPct: string;
  discountPct: string;
  createdAt: string;
}

interface SpecialDiscount {
  id: number;
  name: string;
  type: string;
  productId: number | null;
  groupId: number | null;
  categoryId: number | null;
  customerId: number | null;
  priceListId: number | null;
  discountPct: string;
  fixedPrice: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
}

interface Group {
  id: number;
  code: string;
  name: string;
}

interface Category {
  id: number;
  code: string;
  name: string;
  groupId: number;
}

interface Subcategory {
  id: number;
  code: string;
  name: string;
  categoryId: number;
}

type Tab = 'listini' | 'ricarichi' | 'sconti';

// ─── Component ─────────────────────────────────────────────────────

export default function PrezziPage() {
  const [activeTab, setActiveTab] = useState<Tab>('listini');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [markups, setMarkups] = useState<CategoryMarkup[]>([]);
  const [discounts, setDiscounts] = useState<SpecialDiscount[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  // Edit states
  const [editingListId, setEditingListId] = useState<number | null>(null);
  const [editListForm, setEditListForm] = useState<Partial<PriceList>>({});
  const [showNewList, setShowNewList] = useState(false);
  const [newListForm, setNewListForm] = useState({ code: '', name: '', description: '', discountPct: '0', isDefault: false, isActive: true });

  // Markups
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [editingMarkupId, setEditingMarkupId] = useState<number | null>(null);
  const [editMarkupForm, setEditMarkupForm] = useState<Partial<CategoryMarkup>>({});
  const [showNewMarkup, setShowNewMarkup] = useState(false);
  const [newMarkupForm, setNewMarkupForm] = useState({ groupId: '', categoryId: '', subcategoryId: '', markupPct: '0', discountPct: '0' });

  // Discounts
  const [editingDiscountId, setEditingDiscountId] = useState<number | null>(null);
  const [editDiscountForm, setEditDiscountForm] = useState<Partial<SpecialDiscount>>({});
  const [showNewDiscount, setShowNewDiscount] = useState(false);
  const [newDiscountForm, setNewDiscountForm] = useState({ name: '', type: 'product', discountPct: '0', fixedPrice: '', startDate: '', endDate: '', isActive: true, productId: '', groupId: '', categoryId: '', customerId: '', priceListId: '' });

  // ─── Fetch data ───────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/pricing');
      if (!res.ok) throw new Error('Errore nel caricamento');
      const data = await res.json();
      setPriceLists(data.priceLists || []);
      setMarkups(data.markups || []);
      setDiscounts(data.discounts || []);
      setGroups(data.groups || []);
      setCategories(data.categories || []);
      setSubcategories(data.subcategories || []);
      if (!selectedListId && data.priceLists?.length > 0) {
        setSelectedListId(data.priceLists[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedListId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── API helper ───────────────────────────────────────────────

  async function apiPost(action: string, data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Errore');
        return null;
      }
      const result = await res.json();
      await fetchData();
      return result;
    } catch {
      alert('Errore di rete');
      return null;
    } finally {
      setSaving(false);
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────

  function getGroupName(id: number | null) {
    if (!id) return '-';
    return groups.find((g) => g.id === id)?.name || `#${id}`;
  }

  function getCategoryName(id: number | null) {
    if (!id) return '-';
    return categories.find((c) => c.id === id)?.name || `#${id}`;
  }

  function getSubcategoryName(id: number | null) {
    if (!id) return '-';
    return subcategories.find((s) => s.id === id)?.name || `#${id}`;
  }

  function getListName(id: number | null) {
    if (!id) return '-';
    return priceLists.find((l) => l.id === id)?.name || `#${id}`;
  }

  function formatDate(d: string | null) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('it-IT');
  }

  const typeLabels: Record<string, string> = {
    product: 'Prodotto',
    category: 'Categoria',
    customer: 'Cliente',
    global: 'Globale',
  };

  // ─── Tab content: Listini ─────────────────────────────────────

  function renderListini() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-navy">Listini prezzi</h2>
          <button
            onClick={() => { setShowNewList(true); setNewListForm({ code: '', name: '', description: '', discountPct: '0', isDefault: false, isActive: true }); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue text-white rounded-lg text-sm hover:bg-blue/90 transition-colors"
          >
            <Plus size={16} /> Nuovo listino
          </button>
        </div>

        {showNewList && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="font-heading text-sm font-semibold text-navy">Nuovo listino</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none"
                placeholder="Codice (es. rivenditori)"
                value={newListForm.code}
                onChange={(e) => setNewListForm({ ...newListForm, code: e.target.value })}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none"
                placeholder="Nome"
                value={newListForm.name}
                onChange={(e) => setNewListForm({ ...newListForm, name: e.target.value })}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none"
                placeholder="Sconto globale %"
                type="number"
                step="0.01"
                value={newListForm.discountPct}
                onChange={(e) => setNewListForm({ ...newListForm, discountPct: e.target.value })}
              />
            </div>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none"
              placeholder="Descrizione"
              value={newListForm.description}
              onChange={(e) => setNewListForm({ ...newListForm, description: e.target.value })}
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={newListForm.isDefault} onChange={(e) => setNewListForm({ ...newListForm, isDefault: e.target.checked })} className="rounded" />
                Predefinito
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={newListForm.isActive} onChange={(e) => setNewListForm({ ...newListForm, isActive: e.target.checked })} className="rounded" />
                Attivo
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const result = await apiPost('create_list', newListForm);
                  if (result) setShowNewList(false);
                }}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg text-sm hover:bg-navy/90 transition-colors disabled:opacity-50"
              >
                <Save size={14} /> Salva
              </button>
              <button onClick={() => setShowNewList(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                <X size={14} /> Annulla
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {priceLists.map((list) => (
            <div key={list.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              {editingListId === list.id ? (
                <>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none"
                    placeholder="Nome"
                    value={editListForm.name ?? ''}
                    onChange={(e) => setEditListForm({ ...editListForm, name: e.target.value })}
                  />
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none"
                    placeholder="Codice"
                    value={editListForm.code ?? ''}
                    onChange={(e) => setEditListForm({ ...editListForm, code: e.target.value })}
                  />
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none"
                    placeholder="Descrizione"
                    value={editListForm.description ?? ''}
                    onChange={(e) => setEditListForm({ ...editListForm, description: e.target.value })}
                  />
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none"
                    placeholder="Sconto globale %"
                    type="number"
                    step="0.01"
                    value={editListForm.discountPct ?? '0'}
                    onChange={(e) => setEditListForm({ ...editListForm, discountPct: e.target.value })}
                  />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={editListForm.isDefault ?? false} onChange={(e) => setEditListForm({ ...editListForm, isDefault: e.target.checked })} className="rounded" />
                      Predefinito
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={editListForm.isActive ?? true} onChange={(e) => setEditListForm({ ...editListForm, isActive: e.target.checked })} className="rounded" />
                      Attivo
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await apiPost('update_list', { id: list.id, ...editListForm });
                        setEditingListId(null);
                      }}
                      disabled={saving}
                      className="flex items-center gap-2 px-3 py-1.5 bg-navy text-white rounded-lg text-sm hover:bg-navy/90 transition-colors disabled:opacity-50"
                    >
                      <Save size={14} /> Salva
                    </button>
                    <button onClick={() => setEditingListId(null)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                      <X size={14} /> Annulla
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading font-semibold text-navy">{list.name}</h3>
                      <p className="text-xs text-gray-500 font-mono">{list.code}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {list.isDefault && (
                        <span className="text-xs bg-blue/10 text-blue px-2 py-0.5 rounded-full font-medium">Predefinito</span>
                      )}
                      {list.isActive ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <XCircle size={16} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                  {list.description && (
                    <p className="text-sm text-gray-600">{list.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500">Sconto globale:</span>
                    <span className="font-semibold text-navy">{list.discountPct}%</span>
                  </div>
                  <button
                    onClick={() => { setEditingListId(list.id); setEditListForm({ name: list.name, code: list.code, description: list.description || '', discountPct: list.discountPct, isDefault: list.isDefault, isActive: list.isActive }); }}
                    className="flex items-center gap-2 text-sm text-blue hover:text-blue/80 transition-colors"
                  >
                    <Pencil size={14} /> Modifica
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {priceLists.length === 0 && !loading && (
          <p className="text-gray-500 text-sm text-center py-8">Nessun listino configurato. Crea il primo listino.</p>
        )}
      </div>
    );
  }

  // ─── Tab content: Ricarichi ───────────────────────────────────

  function renderRicarichi() {
    const filteredMarkups = markups.filter((m) => m.priceListId === selectedListId);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-heading text-lg font-semibold text-navy">Ricarichi per categoria</h2>
          <div className="flex items-center gap-3">
            <select
              value={selectedListId ?? ''}
              onChange={(e) => setSelectedListId(e.target.value ? Number(e.target.value) : null)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none"
            >
              <option value="">Seleziona listino...</option>
              {priceLists.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            {selectedListId && (
              <button
                onClick={() => { setShowNewMarkup(true); setNewMarkupForm({ groupId: '', categoryId: '', subcategoryId: '', markupPct: '0', discountPct: '0' }); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue text-white rounded-lg text-sm hover:bg-blue/90 transition-colors"
              >
                <Plus size={16} /> Nuovo ricarico
              </button>
            )}
          </div>
        </div>

        {!selectedListId && (
          <p className="text-gray-500 text-sm text-center py-8">Seleziona un listino per gestire i ricarichi per categoria.</p>
        )}

        {selectedListId && showNewMarkup && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="font-heading text-sm font-semibold text-navy">Nuovo ricarico</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={newMarkupForm.groupId}
                onChange={(e) => setNewMarkupForm({ ...newMarkupForm, groupId: e.target.value, categoryId: '', subcategoryId: '' })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none"
              >
                <option value="">Tutti i gruppi</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <select
                value={newMarkupForm.categoryId}
                onChange={(e) => setNewMarkupForm({ ...newMarkupForm, categoryId: e.target.value, subcategoryId: '' })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none"
              >
                <option value="">Tutte le categorie</option>
                {categories
                  .filter((c) => !newMarkupForm.groupId || c.groupId === Number(newMarkupForm.groupId))
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
              <select
                value={newMarkupForm.subcategoryId}
                onChange={(e) => setNewMarkupForm({ ...newMarkupForm, subcategoryId: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none"
              >
                <option value="">Tutte le sottocategorie</option>
                {subcategories
                  .filter((s) => !newMarkupForm.categoryId || s.categoryId === Number(newMarkupForm.categoryId))
                  .map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ricarico %</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none"
                  type="number"
                  step="0.01"
                  value={newMarkupForm.markupPct}
                  onChange={(e) => setNewMarkupForm({ ...newMarkupForm, markupPct: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Sconto %</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none"
                  type="number"
                  step="0.01"
                  value={newMarkupForm.discountPct}
                  onChange={(e) => setNewMarkupForm({ ...newMarkupForm, discountPct: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const result = await apiPost('create_markup', {
                    priceListId: selectedListId,
                    groupId: newMarkupForm.groupId ? Number(newMarkupForm.groupId) : null,
                    categoryId: newMarkupForm.categoryId ? Number(newMarkupForm.categoryId) : null,
                    subcategoryId: newMarkupForm.subcategoryId ? Number(newMarkupForm.subcategoryId) : null,
                    markupPct: newMarkupForm.markupPct,
                    discountPct: newMarkupForm.discountPct,
                  });
                  if (result) setShowNewMarkup(false);
                }}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg text-sm hover:bg-navy/90 transition-colors disabled:opacity-50"
              >
                <Save size={14} /> Salva
              </button>
              <button onClick={() => setShowNewMarkup(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                <X size={14} /> Annulla
              </button>
            </div>
          </div>
        )}

        {selectedListId && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Gruppo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Categoria</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Sottocategoria</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Ricarico %</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Sconto %</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarkups.map((m) => (
                  <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    {editingMarkupId === m.id ? (
                      <>
                        <td className="px-4 py-2" colSpan={3}>
                          <div className="flex gap-2">
                            <select
                              value={editMarkupForm.groupId ?? ''}
                              onChange={(e) => setEditMarkupForm({ ...editMarkupForm, groupId: e.target.value ? Number(e.target.value) : null, categoryId: null, subcategoryId: null })}
                              className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
                            >
                              <option value="">Tutti i gruppi</option>
                              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                            <select
                              value={editMarkupForm.categoryId ?? ''}
                              onChange={(e) => setEditMarkupForm({ ...editMarkupForm, categoryId: e.target.value ? Number(e.target.value) : null, subcategoryId: null })}
                              className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
                            >
                              <option value="">Tutte</option>
                              {categories.filter((c) => !editMarkupForm.groupId || c.groupId === editMarkupForm.groupId).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select
                              value={editMarkupForm.subcategoryId ?? ''}
                              onChange={(e) => setEditMarkupForm({ ...editMarkupForm, subcategoryId: e.target.value ? Number(e.target.value) : null })}
                              className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
                            >
                              <option value="">Tutte</option>
                              {subcategories.filter((s) => !editMarkupForm.categoryId || s.categoryId === editMarkupForm.categoryId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <input type="number" step="0.01" value={editMarkupForm.markupPct ?? '0'} onChange={(e) => setEditMarkupForm({ ...editMarkupForm, markupPct: e.target.value })} className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-right" />
                        </td>
                        <td className="px-4 py-2">
                          <input type="number" step="0.01" value={editMarkupForm.discountPct ?? '0'} onChange={(e) => setEditMarkupForm({ ...editMarkupForm, discountPct: e.target.value })} className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-right" />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={async () => {
                                await apiPost('update_markup', { id: m.id, ...editMarkupForm });
                                setEditingMarkupId(null);
                              }}
                              disabled={saving}
                              className="p-1.5 text-navy hover:bg-navy/10 rounded transition-colors disabled:opacity-50"
                              title="Salva"
                            >
                              <Save size={14} />
                            </button>
                            <button onClick={() => setEditingMarkupId(null)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition-colors" title="Annulla">
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">{getGroupName(m.groupId)}</td>
                        <td className="px-4 py-3">{getCategoryName(m.categoryId)}</td>
                        <td className="px-4 py-3">{getSubcategoryName(m.subcategoryId)}</td>
                        <td className="px-4 py-3 text-right font-medium">{m.markupPct}%</td>
                        <td className="px-4 py-3 text-right font-medium">{m.discountPct}%</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => { setEditingMarkupId(m.id); setEditMarkupForm({ groupId: m.groupId, categoryId: m.categoryId, subcategoryId: m.subcategoryId, markupPct: m.markupPct, discountPct: m.discountPct }); }}
                              className="p-1.5 text-blue hover:bg-blue/10 rounded transition-colors"
                              title="Modifica"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Eliminare questo ricarico?')) {
                                  await apiPost('delete_markup', { id: m.id });
                                }
                              }}
                              className="p-1.5 text-red hover:bg-red/10 rounded transition-colors"
                              title="Elimina"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {filteredMarkups.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-8 text-sm">
                      Nessun ricarico configurato per questo listino.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ─── Tab content: Sconti speciali ─────────────────────────────

  function renderSconti() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-navy">Sconti speciali</h2>
          <button
            onClick={() => { setShowNewDiscount(true); setNewDiscountForm({ name: '', type: 'product', discountPct: '0', fixedPrice: '', startDate: '', endDate: '', isActive: true, productId: '', groupId: '', categoryId: '', customerId: '', priceListId: '' }); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue text-white rounded-lg text-sm hover:bg-blue/90 transition-colors"
          >
            <Plus size={16} /> Nuovo sconto
          </button>
        </div>

        {showNewDiscount && renderDiscountForm(newDiscountForm, setNewDiscountForm, async () => {
          const payload: Record<string, unknown> = {
            name: newDiscountForm.name,
            type: newDiscountForm.type,
            discountPct: newDiscountForm.discountPct,
            fixedPrice: newDiscountForm.fixedPrice || null,
            startDate: newDiscountForm.startDate || null,
            endDate: newDiscountForm.endDate || null,
            isActive: newDiscountForm.isActive,
            productId: newDiscountForm.productId ? Number(newDiscountForm.productId) : null,
            groupId: newDiscountForm.groupId ? Number(newDiscountForm.groupId) : null,
            categoryId: newDiscountForm.categoryId ? Number(newDiscountForm.categoryId) : null,
            customerId: newDiscountForm.customerId ? Number(newDiscountForm.customerId) : null,
            priceListId: newDiscountForm.priceListId ? Number(newDiscountForm.priceListId) : null,
          };
          const result = await apiPost('create_discount', payload);
          if (result) setShowNewDiscount(false);
        }, () => setShowNewDiscount(false))}

        <div className="space-y-3">
          {discounts.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-5">
              {editingDiscountId === d.id ? (
                renderDiscountForm(editDiscountForm as unknown as typeof newDiscountForm, (v: unknown) => setEditDiscountForm(typeof v === 'function' ? (v as (prev: Partial<SpecialDiscount>) => Partial<SpecialDiscount>)(editDiscountForm) : v as Partial<SpecialDiscount>), async () => {
                  const payload: Record<string, unknown> = {
                    id: d.id,
                    name: editDiscountForm.name,
                    type: editDiscountForm.type,
                    discountPct: editDiscountForm.discountPct,
                    fixedPrice: (editDiscountForm as Record<string, unknown>).fixedPrice || null,
                    startDate: editDiscountForm.startDate || null,
                    endDate: editDiscountForm.endDate || null,
                    isActive: editDiscountForm.isActive,
                    productId: (editDiscountForm as Record<string, unknown>).productId ? Number((editDiscountForm as Record<string, unknown>).productId) : null,
                    groupId: (editDiscountForm as Record<string, unknown>).groupId ? Number((editDiscountForm as Record<string, unknown>).groupId) : null,
                    categoryId: (editDiscountForm as Record<string, unknown>).categoryId ? Number((editDiscountForm as Record<string, unknown>).categoryId) : null,
                    customerId: (editDiscountForm as Record<string, unknown>).customerId ? Number((editDiscountForm as Record<string, unknown>).customerId) : null,
                    priceListId: (editDiscountForm as Record<string, unknown>).priceListId ? Number((editDiscountForm as Record<string, unknown>).priceListId) : null,
                  };
                  await apiPost('update_discount', payload);
                  setEditingDiscountId(null);
                }, () => setEditingDiscountId(null))
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-semibold text-navy">{d.name}</h3>
                      {d.isActive ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Attivo</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Disattivato</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                      <span>Tipo: <strong>{typeLabels[d.type] || d.type}</strong></span>
                      <span>Sconto: <strong>{d.discountPct}%</strong></span>
                      {d.fixedPrice && <span>Prezzo fisso: <strong>{d.fixedPrice}</strong></span>}
                      {d.priceListId && <span>Listino: <strong>{getListName(d.priceListId)}</strong></span>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      {d.productId && <span>Prodotto #{d.productId}</span>}
                      {d.groupId && <span>Gruppo: {getGroupName(d.groupId)}</span>}
                      {d.categoryId && <span>Categoria: {getCategoryName(d.categoryId)}</span>}
                      {d.customerId && <span>Cliente #{d.customerId}</span>}
                      <span>Dal: {formatDate(d.startDate)}</span>
                      <span>Al: {formatDate(d.endDate)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingDiscountId(d.id);
                        setEditDiscountForm({
                          name: d.name,
                          type: d.type,
                          discountPct: d.discountPct,
                          fixedPrice: d.fixedPrice,
                          startDate: d.startDate ? d.startDate.substring(0, 10) : '',
                          endDate: d.endDate ? d.endDate.substring(0, 10) : '',
                          isActive: d.isActive,
                          productId: d.productId,
                          groupId: d.groupId,
                          categoryId: d.categoryId,
                          customerId: d.customerId,
                          priceListId: d.priceListId,
                        } as Partial<SpecialDiscount>);
                      }}
                      className="p-2 text-blue hover:bg-blue/10 rounded-lg transition-colors"
                      title="Modifica"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Eliminare questo sconto?')) {
                          await apiPost('delete_discount', { id: d.id });
                        }
                      }}
                      className="p-2 text-red hover:bg-red/10 rounded-lg transition-colors"
                      title="Elimina"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {discounts.length === 0 && !loading && (
          <p className="text-gray-500 text-sm text-center py-8">Nessuno sconto speciale configurato.</p>
        )}
      </div>
    );
  }

  // ─── Discount form (shared) ───────────────────────────────────

  type DiscountFormState = typeof newDiscountForm;

  function renderDiscountForm(
    form: DiscountFormState,
    setForm: React.Dispatch<React.SetStateAction<DiscountFormState>> | ((v: DiscountFormState | ((prev: DiscountFormState) => DiscountFormState)) => void),
    onSave: () => void,
    onCancel: () => void,
  ) {
    const update = (patch: Partial<DiscountFormState>) => {
      if (typeof setForm === 'function') {
        (setForm as (v: DiscountFormState) => void)({ ...form, ...patch });
      }
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nome</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none"
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Tipo</label>
            <select
              value={form.type}
              onChange={(e) => update({ type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none"
            >
              <option value="product">Prodotto</option>
              <option value="category">Categoria</option>
              <option value="customer">Cliente</option>
              <option value="global">Globale</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Listino (opzionale)</label>
            <select
              value={form.priceListId}
              onChange={(e) => update({ priceListId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none"
            >
              <option value="">Nessuno</option>
              {priceLists.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sconto %</label>
            <input type="number" step="0.01" value={form.discountPct} onChange={(e) => update({ discountPct: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Prezzo fisso</label>
            <input type="number" step="0.01" value={form.fixedPrice} onChange={(e) => update({ fixedPrice: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none" placeholder="Opzionale" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Data inizio</label>
            <input type="date" value={form.startDate} onChange={(e) => update({ startDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Data fine</label>
            <input type="date" value={form.endDate} onChange={(e) => update({ endDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {form.type === 'product' && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">ID Prodotto</label>
              <input type="number" value={form.productId} onChange={(e) => update({ productId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none" />
            </div>
          )}
          {form.type === 'category' && (
            <>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Gruppo</label>
                <select value={form.groupId} onChange={(e) => update({ groupId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none">
                  <option value="">Nessuno</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Categoria</label>
                <select value={form.categoryId} onChange={(e) => update({ categoryId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none">
                  <option value="">Nessuna</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </>
          )}
          {form.type === 'customer' && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">ID Cliente</label>
              <input type="number" value={form.customerId} onChange={(e) => update({ customerId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue/30 focus:border-blue outline-none" />
            </div>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => update({ isActive: e.target.checked })} className="rounded" />
          Attivo
        </label>
        <div className="flex gap-2">
          <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg text-sm hover:bg-navy/90 transition-colors disabled:opacity-50">
            <Save size={14} /> Salva
          </button>
          <button onClick={onCancel} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors">
            <X size={14} /> Annulla
          </button>
        </div>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────

  const tabs: { key: Tab; label: string; icon: typeof Tag }[] = [
    { key: 'listini', label: 'Listini', icon: ListOrdered },
    { key: 'ricarichi', label: 'Ricarichi per categoria', icon: Percent },
    { key: 'sconti', label: 'Sconti speciali', icon: BadgePercent },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-navy/10 rounded-xl">
          <Tag size={22} className="text-navy" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">Gestione prezzi</h1>
          <p className="text-sm text-gray-500">Listini, ricarichi e sconti speciali</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-navy text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-navy" />
          <span className="ml-3 text-gray-500">Caricamento...</span>
        </div>
      ) : (
        <>
          {activeTab === 'listini' && renderListini()}
          {activeTab === 'ricarichi' && renderRicarichi()}
          {activeTab === 'sconti' && renderSconti()}
        </>
      )}
    </div>
  );
}
