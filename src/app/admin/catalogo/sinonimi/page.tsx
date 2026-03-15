'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, BookOpen } from 'lucide-react';

interface Synonym {
  id: number;
  term: string;
  synonyms: string;
  isActive: boolean;
  createdAt: string;
}

export default function SinonimiPage() {
  const [synonyms, setSynonyms] = useState<Synonym[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ term: '', synonyms: '', isActive: true });
  const [error, setError] = useState('');

  const fetchSynonyms = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/catalog/synonyms');
      if (res.ok) setSynonyms(await res.json());
    } catch {
      setError('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSynonyms(); }, [fetchSynonyms]);

  const handleSave = async () => {
    setError('');
    if (!form.term || !form.synonyms) {
      setError('Termine e sinonimi sono obbligatori');
      return;
    }

    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { id: editingId, ...form } : form;

    const res = await fetch('/api/admin/catalog/synonyms', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setEditingId(null);
      setShowNew(false);
      setForm({ term: '', synonyms: '', isActive: true });
      fetchSynonyms();
    } else {
      const data = await res.json();
      setError(data.error || 'Errore nel salvataggio');
    }
  };

  const handleEdit = (synonym: Synonym) => {
    setEditingId(synonym.id);
    setForm({ term: synonym.term, synonyms: synonym.synonyms, isActive: synonym.isActive });
    setShowNew(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questo sinonimo?')) return;
    const res = await fetch(`/api/admin/catalog/synonyms?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchSynonyms();
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowNew(false);
    setForm({ term: '', synonyms: '', isActive: true });
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <BookOpen className="w-6 h-6 text-navy" />
          <h1 className="font-heading text-2xl text-navy">Sinonimi di Ricerca</h1>
        </div>
        <button
          onClick={() => { setShowNew(true); setEditingId(null); setForm({ term: '', synonyms: '', isActive: true }); }}
          className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> Nuovo Sinonimo
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Termine</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Sinonimi</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Attivo</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {showNew && (
              <tr className="border-b border-gray-50 bg-blue-50/30">
                <td className="px-6 py-3">
                  <input type="text" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })}
                    className="border border-gray-200 rounded px-2 py-1 text-sm w-40" placeholder="caffè" />
                </td>
                <td className="px-6 py-3">
                  <input type="text" value={form.synonyms} onChange={(e) => setForm({ ...form, synonyms: e.target.value })}
                    className="border border-gray-200 rounded px-2 py-1 text-sm w-full" placeholder="caffe, coffee, espresso" />
                </td>
                <td className="px-6 py-3">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
                </td>
                <td className="px-6 py-3 text-right">
                  <button onClick={handleSave} className="text-green-600 hover:text-green-800 mr-2"><Save className="w-4 h-4" /></button>
                  <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                </td>
              </tr>
            )}
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Caricamento...</td></tr>
            ) : synonyms.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Nessun sinonimo configurato</td></tr>
            ) : (
              synonyms.map((synonym) =>
                editingId === synonym.id ? (
                  <tr key={synonym.id} className="border-b border-gray-50 bg-blue-50/30">
                    <td className="px-6 py-3">
                      <input type="text" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })}
                        className="border border-gray-200 rounded px-2 py-1 text-sm w-40" />
                    </td>
                    <td className="px-6 py-3">
                      <input type="text" value={form.synonyms} onChange={(e) => setForm({ ...form, synonyms: e.target.value })}
                        className="border border-gray-200 rounded px-2 py-1 text-sm w-full" />
                    </td>
                    <td className="px-6 py-3">
                      <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={handleSave} className="text-green-600 hover:text-green-800 mr-2"><Save className="w-4 h-4" /></button>
                      <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ) : (
                  <tr key={synonym.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-3 text-sm font-medium text-navy">{synonym.term}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      <div className="flex flex-wrap gap-1">
                        {synonym.synonyms.split(',').map((s, i) => (
                          <span key={i} className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${synonym.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {synonym.isActive ? 'Attivo' : 'Inattivo'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => handleEdit(synonym)} className="text-gray-400 hover:text-navy mr-2"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(synonym.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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
