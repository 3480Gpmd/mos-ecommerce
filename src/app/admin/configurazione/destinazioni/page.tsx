'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Save, Trash2, Edit2, ToggleLeft, ToggleRight, ArrowLeft, MapPin, X } from 'lucide-react';
import Link from 'next/link';

interface ShippingZone {
  id: number;
  name: string;
  provinces: string;
  extraCost: string;
  isActive: boolean;
}

const emptyForm = { name: '', provinces: '', extraCost: '', isActive: true };

const fmtCurrency = (v: string | number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(typeof v === 'string' ? parseFloat(v) : v);

export default function DestinazioniPage() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchZones = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/config/zones');
      const data = await res.json();
      setZones(data.zones || []);
    } catch {
      console.error('Errore caricamento');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const handleCreate = async () => {
    if (!form.name || !form.provinces) return;
    try {
      const res = await fetch('/api/admin/config/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          provinces: form.provinces,
          extraCost: form.extraCost || '0',
          isActive: form.isActive,
        }),
      });
      if (res.ok) {
        setShowNew(false);
        setForm(emptyForm);
        fetchZones();
      }
    } catch {
      console.error('Errore creazione');
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      const res = await fetch('/api/admin/config/zones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          name: form.name,
          provinces: form.provinces,
          extraCost: form.extraCost || '0',
          isActive: form.isActive,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        setForm(emptyForm);
        fetchZones();
      }
    } catch {
      console.error('Errore aggiornamento');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questa zona di spedizione?')) return;
    try {
      const res = await fetch(`/api/admin/config/zones?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchZones();
    } catch {
      console.error('Errore eliminazione');
    }
  };

  const handleToggle = async (z: ShippingZone) => {
    try {
      await fetch('/api/admin/config/zones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: z.id, isActive: !z.isActive }),
      });
      fetchZones();
    } catch {
      console.error('Errore toggle');
    }
  };

  const startEdit = (z: ShippingZone) => {
    setEditingId(z.id);
    setShowNew(false);
    setForm({
      name: z.name,
      provinces: z.provinces,
      extraCost: z.extraCost,
      isActive: z.isActive,
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
        <h1 className="font-heading text-2xl font-bold mb-6 text-navy">Zone di Spedizione</h1>
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
            <MapPin size={22} className="text-purple-600" />
            <h1 className="font-heading text-2xl font-bold text-navy">Zone di Spedizione</h1>
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
              {editingId ? 'Modifica zona' : 'Nuova zona di spedizione'}
            </h3>
            <button onClick={cancelEdit} className="p-1 hover:bg-gray-100 rounded">
              <X size={18} className="text-gray-400" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Nome zona</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="es. Isole"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Province (separate da virgola)</label>
              <input
                type="text"
                value={form.provinces}
                onChange={(e) => setForm({ ...form, provinces: e.target.value })}
                placeholder="es. PA,CT,ME,AG,CL,EN,RG,SR,TP"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Costo aggiuntivo</label>
              <input
                type="number"
                step="0.01"
                value={form.extraCost}
                onChange={(e) => setForm({ ...form, extraCost: e.target.value })}
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
        {zones.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Nome</th>
                <th className="px-5 py-3 text-left">Province</th>
                <th className="px-5 py-3 text-right">Costo aggiuntivo</th>
                <th className="px-5 py-3 text-center">Attivo</th>
                <th className="px-5 py-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {zones.map((z) => (
                <tr key={z.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-navy">{z.name}</td>
                  <td className="px-5 py-3 text-gray-600">
                    <div className="flex flex-wrap gap-1">
                      {z.provinces.split(',').map((p) => (
                        <span
                          key={p.trim()}
                          className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono"
                        >
                          {p.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-medium">{fmtCurrency(z.extraCost)}</td>
                  <td className="px-5 py-3 text-center">
                    <button onClick={() => handleToggle(z)} className="inline-flex">
                      {z.isActive ? (
                        <ToggleRight size={22} className="text-green-600" />
                      ) : (
                        <ToggleLeft size={22} className="text-gray-300" />
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(z)} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Modifica">
                        <Edit2 size={15} className="text-gray-500" />
                      </button>
                      <button onClick={() => handleDelete(z.id)} className="p-1.5 rounded hover:bg-red-50 transition-colors" title="Elimina">
                        <Trash2 size={15} className="text-red" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">Nessuna zona di spedizione configurata</div>
        )}
      </div>
    </div>
  );
}
