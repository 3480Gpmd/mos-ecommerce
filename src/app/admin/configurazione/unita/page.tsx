'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, Ruler } from 'lucide-react';

interface UnitOfMeasure {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
}

export default function UnitaPage() {
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', isActive: true });
  const [error, setError] = useState('');

  const fetchUnits = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/config/units');
      if (res.ok) setUnits(await res.json());
    } catch {
      setError('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUnits(); }, [fetchUnits]);

  const handleSave = async () => {
    setError('');
    if (!form.code || !form.name) {
      setError('Codice e nome sono obbligatori');
      return;
    }

    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { id: editingId, ...form } : form;

    const res = await fetch('/api/admin/config/units', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setEditingId(null);
      setShowNew(false);
      setForm({ code: '', name: '', isActive: true });
      fetchUnits();
    } else {
      const data = await res.json();
      setError(data.error || 'Errore nel salvataggio');
    }
  };

  const handleEdit = (unit: UnitOfMeasure) => {
    setEditingId(unit.id);
    setForm({ code: unit.code, name: unit.name, isActive: unit.isActive });
    setShowNew(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questa unità di misura?')) return;
    const res = await fetch(`/api/admin/config/units?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchUnits();
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowNew(false);
    setForm({ code: '', name: '', isActive: true });
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Ruler className="w-6 h-6 text-navy" />
          <h1 className="font-heading text-2xl text-navy">Unità di Misura</h1>
        </div>
        <button
          onClick={() => { setShowNew(true); setEditingId(null); setForm({ code: '', name: '', isActive: true }); }}
          className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> Nuova Unità
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Codice</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Nome</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Attivo</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {showNew && (
              <tr className="border-b border-gray-50 bg-blue-50/30">
                <td className="px-6 py-3">
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="border border-gray-200 rounded px-2 py-1 text-sm w-24"
                    placeholder="PZ"
                  />
                </td>
                <td className="px-6 py-3">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="border border-gray-200 rounded px-2 py-1 text-sm w-48"
                    placeholder="Pezzo"
                  />
                </td>
                <td className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded"
                  />
                </td>
                <td className="px-6 py-3 text-right">
                  <button onClick={handleSave} className="text-green-600 hover:text-green-800 mr-2">
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )}
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Caricamento...</td></tr>
            ) : units.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Nessuna unità di misura</td></tr>
            ) : (
              units.map((unit) =>
                editingId === unit.id ? (
                  <tr key={unit.id} className="border-b border-gray-50 bg-blue-50/30">
                    <td className="px-6 py-3">
                      <input
                        type="text"
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                        className="border border-gray-200 rounded px-2 py-1 text-sm w-24"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="border border-gray-200 rounded px-2 py-1 text-sm w-48"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={handleSave} className="text-green-600 hover:text-green-800 mr-2">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={unit.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-3 text-sm font-mono font-medium text-navy">{unit.code}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{unit.name}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${unit.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {unit.isActive ? 'Attivo' : 'Inattivo'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => handleEdit(unit)} className="text-gray-400 hover:text-navy mr-2">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(unit.id)} className="text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
