'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Save, Trash2, Edit2, ToggleLeft, ToggleRight, ArrowLeft, Truck, X } from 'lucide-react';
import Link from 'next/link';

interface ShippingRule {
  id: number;
  name: string;
  minAmount: string | null;
  maxAmount: string | null;
  minWeight: string | null;
  maxWeight: string | null;
  cost: string;
  isActive: boolean;
  sortOrder: number;
}

const emptyForm = {
  name: '', minAmount: '', maxAmount: '', minWeight: '', maxWeight: '',
  cost: '', isActive: true, sortOrder: 0,
};

const fmt = (v: string | null | undefined) => {
  if (!v || v === '0') return '-';
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(parseFloat(v));
};

const fmtWeight = (v: string | null | undefined) => {
  if (!v) return '-';
  return `${parseFloat(v).toLocaleString('it-IT')} kg`;
};

export default function SpedizioniPage() {
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/config/shipping');
      const data = await res.json();
      setRules(data.rules || []);
    } catch {
      console.error('Errore caricamento');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleCreate = async () => {
    if (!form.name || !form.cost) return;
    try {
      const res = await fetch('/api/admin/config/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          minAmount: form.minAmount || '0',
          maxAmount: form.maxAmount || null,
          minWeight: form.minWeight || null,
          maxWeight: form.maxWeight || null,
        }),
      });
      if (res.ok) {
        setShowNew(false);
        setForm(emptyForm);
        fetchRules();
      }
    } catch {
      console.error('Errore creazione');
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      const res = await fetch('/api/admin/config/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          ...form,
          minAmount: form.minAmount || '0',
          maxAmount: form.maxAmount || null,
          minWeight: form.minWeight || null,
          maxWeight: form.maxWeight || null,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        setForm(emptyForm);
        fetchRules();
      }
    } catch {
      console.error('Errore aggiornamento');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questa regola di spedizione?')) return;
    try {
      const res = await fetch(`/api/admin/config/shipping?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchRules();
    } catch {
      console.error('Errore eliminazione');
    }
  };

  const handleToggle = async (r: ShippingRule) => {
    try {
      await fetch('/api/admin/config/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: r.id, isActive: !r.isActive }),
      });
      fetchRules();
    } catch {
      console.error('Errore toggle');
    }
  };

  const startEdit = (r: ShippingRule) => {
    setEditingId(r.id);
    setShowNew(false);
    setForm({
      name: r.name,
      minAmount: r.minAmount || '',
      maxAmount: r.maxAmount || '',
      minWeight: r.minWeight || '',
      maxWeight: r.maxWeight || '',
      cost: r.cost,
      isActive: r.isActive,
      sortOrder: r.sortOrder,
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
        <h1 className="font-heading text-2xl font-bold mb-6 text-navy">Spese di Trasporto</h1>
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
            <Truck size={22} className="text-orange-500" />
            <h1 className="font-heading text-2xl font-bold text-navy">Spese di Trasporto</h1>
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
              {editingId ? 'Modifica regola' : 'Nuova regola di spedizione'}
            </h3>
            <button onClick={cancelEdit} className="p-1 hover:bg-gray-100 rounded">
              <X size={18} className="text-gray-400" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Nome</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="es. Spedizione standard"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Importo min.</label>
              <input
                type="number"
                step="0.01"
                value={form.minAmount}
                onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
                placeholder="0.00"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Importo max.</label>
              <input
                type="number"
                step="0.01"
                value={form.maxAmount}
                onChange={(e) => setForm({ ...form, maxAmount: e.target.value })}
                placeholder="nessun limite"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Peso min. (kg)</label>
              <input
                type="number"
                step="0.01"
                value={form.minWeight}
                onChange={(e) => setForm({ ...form, minWeight: e.target.value })}
                placeholder="0"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Peso max. (kg)</label>
              <input
                type="number"
                step="0.01"
                value={form.maxWeight}
                onChange={(e) => setForm({ ...form, maxWeight: e.target.value })}
                placeholder="nessun limite"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Costo</label>
              <input
                type="number"
                step="0.01"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                placeholder="0.00"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Ordine</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
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
        {rules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Nome</th>
                  <th className="px-5 py-3 text-right">Importo min.</th>
                  <th className="px-5 py-3 text-right">Importo max.</th>
                  <th className="px-5 py-3 text-right">Peso min.</th>
                  <th className="px-5 py-3 text-right">Peso max.</th>
                  <th className="px-5 py-3 text-right">Costo</th>
                  <th className="px-5 py-3 text-center">Attivo</th>
                  <th className="px-5 py-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rules.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-navy">{r.name}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{fmt(r.minAmount)}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{fmt(r.maxAmount)}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{fmtWeight(r.minWeight)}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{fmtWeight(r.maxWeight)}</td>
                    <td className="px-5 py-3 text-right font-medium">{fmt(r.cost)}</td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => handleToggle(r)} className="inline-flex">
                        {r.isActive ? (
                          <ToggleRight size={22} className="text-green-600" />
                        ) : (
                          <ToggleLeft size={22} className="text-gray-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(r)} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Modifica">
                          <Edit2 size={15} className="text-gray-500" />
                        </button>
                        <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded hover:bg-red-50 transition-colors" title="Elimina">
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
          <div className="p-8 text-center text-gray-500">Nessuna regola di spedizione configurata</div>
        )}
      </div>
    </div>
  );
}
