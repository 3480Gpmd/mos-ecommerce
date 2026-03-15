'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Save, Trash2, Edit2, ToggleLeft, ToggleRight, ArrowLeft, PackageOpen, X } from 'lucide-react';
import Link from 'next/link';

interface BulkySurcharge {
  id: number;
  name: string;
  categoryId: number | null;
  productId: number | null;
  minQty: number;
  surcharge: string;
  isActive: boolean;
}

const emptyForm = {
  name: '', categoryId: '', productId: '', minQty: 1, surcharge: '', isActive: true,
};

const fmtCurrency = (v: string | number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(typeof v === 'string' ? parseFloat(v) : v);

export default function SupplementiPage() {
  const [surcharges, setSurcharges] = useState<BulkySurcharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchSurcharges = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/config/surcharges');
      const data = await res.json();
      setSurcharges(data.surcharges || []);
    } catch {
      console.error('Errore caricamento');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurcharges();
  }, [fetchSurcharges]);

  const handleCreate = async () => {
    if (!form.name || !form.surcharge) return;
    try {
      const res = await fetch('/api/admin/config/surcharges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          categoryId: form.categoryId ? parseInt(form.categoryId) : null,
          productId: form.productId ? parseInt(form.productId) : null,
          minQty: form.minQty,
          surcharge: form.surcharge,
          isActive: form.isActive,
        }),
      });
      if (res.ok) {
        setShowNew(false);
        setForm(emptyForm);
        fetchSurcharges();
      }
    } catch {
      console.error('Errore creazione');
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      const res = await fetch('/api/admin/config/surcharges', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          name: form.name,
          categoryId: form.categoryId ? parseInt(form.categoryId) : null,
          productId: form.productId ? parseInt(form.productId) : null,
          minQty: form.minQty,
          surcharge: form.surcharge,
          isActive: form.isActive,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        setForm(emptyForm);
        fetchSurcharges();
      }
    } catch {
      console.error('Errore aggiornamento');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questo supplemento?')) return;
    try {
      const res = await fetch(`/api/admin/config/surcharges?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchSurcharges();
    } catch {
      console.error('Errore eliminazione');
    }
  };

  const handleToggle = async (s: BulkySurcharge) => {
    try {
      await fetch('/api/admin/config/surcharges', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id, isActive: !s.isActive }),
      });
      fetchSurcharges();
    } catch {
      console.error('Errore toggle');
    }
  };

  const startEdit = (s: BulkySurcharge) => {
    setEditingId(s.id);
    setShowNew(false);
    setForm({
      name: s.name,
      categoryId: s.categoryId ? String(s.categoryId) : '',
      productId: s.productId ? String(s.productId) : '',
      minQty: s.minQty,
      surcharge: s.surcharge,
      isActive: s.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowNew(false);
    setForm(emptyForm);
  };

  if (loading) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-bold mb-6 text-navy">Supplementi Ingombranti</h1>
        <div className="p-8 text-center text-gray-500">Caricamento...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/configurazione" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
          <div className="flex items-center gap-2">
            <PackageOpen size={22} className="text-red" />
            <h1 className="font-heading text-2xl font-bold text-navy">Supplementi Ingombranti</h1>
          </div>
        </div>
        <button
          onClick={() => { setShowNew(true); setEditingId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-blue text-white hover:bg-blue-light transition-colors"
        >
          <Plus size={16} />
          Aggiungi
        </button>
      </div>

      {/* Inline form */}
      {(showNew || editingId) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-navy">
              {editingId ? 'Modifica supplemento' : 'Nuovo supplemento'}
            </h3>
            <button onClick={cancelEdit} className="p-1 hover:bg-gray-100 rounded">
              <X size={18} className="text-gray-400" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Nome</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="es. Boccioni 18L"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">ID Categoria</label>
              <input
                type="number"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                placeholder="opzionale"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">ID Prodotto</label>
              <input
                type="number"
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                placeholder="opzionale"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Quantit&agrave; min.</label>
              <input
                type="number"
                value={form.minQty}
                onChange={(e) => setForm({ ...form, minQty: parseInt(e.target.value) || 1 })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Supplemento</label>
              <input
                type="number"
                step="0.01"
                value={form.surcharge}
                onChange={(e) => setForm({ ...form, surcharge: e.target.value })}
                placeholder="0.00"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={editingId ? handleUpdate : handleCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-blue text-white hover:bg-blue-light transition-colors"
            >
              <Save size={16} />
              {editingId ? 'Aggiorna' : 'Salva'}
            </button>
            <button onClick={cancelEdit} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors">
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {surcharges.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Nome</th>
                  <th className="px-5 py-3 text-center">Categoria</th>
                  <th className="px-5 py-3 text-center">Prodotto</th>
                  <th className="px-5 py-3 text-center">Qt&agrave; min.</th>
                  <th className="px-5 py-3 text-right">Supplemento</th>
                  <th className="px-5 py-3 text-center">Attivo</th>
                  <th className="px-5 py-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {surcharges.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-navy">{s.name}</td>
                    <td className="px-5 py-3 text-center text-gray-500">{s.categoryId ?? '-'}</td>
                    <td className="px-5 py-3 text-center text-gray-500">{s.productId ?? '-'}</td>
                    <td className="px-5 py-3 text-center text-gray-500">{s.minQty}</td>
                    <td className="px-5 py-3 text-right font-medium">{fmtCurrency(s.surcharge)}</td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => handleToggle(s)} className="inline-flex">
                        {s.isActive ? (
                          <ToggleRight size={22} className="text-green-600" />
                        ) : (
                          <ToggleLeft size={22} className="text-gray-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(s)} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Modifica">
                          <Edit2 size={15} className="text-gray-500" />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded hover:bg-red-50 transition-colors" title="Elimina">
                          <Trash2 size={15} className="text-red" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">Nessun supplemento configurato</div>
        )}
      </div>
    </div>
  );
}
