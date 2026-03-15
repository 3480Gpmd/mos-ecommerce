'use client';

import { useEffect, useState } from 'react';
import { Gift, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

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
  triggerProductName: string | null;
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

export default function OmaggiPage() {
  const [rules, setRules] = useState<GiftRuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchRules();
    } catch {
      setError('Errore di rete');
    } finally {
      setSaving(false);
    }
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
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questa regola omaggio?')) return;
    try {
      await fetch(`/api/admin/promotions/gifts?id=${id}`, { method: 'DELETE' });
      fetchRules();
    } catch {
      setError('Errore nell\'eliminazione');
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

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
          <p className="text-gray-500 text-sm mt-1">Configura regole per omaggi automatici.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
            className="flex items-center gap-2 bg-blue text-white font-bold px-4 py-2.5 rounded-lg hover:bg-blue-light transition-colors text-sm"
          >
            <Plus size={16} />
            Nuova Regola
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline">Chiudi</button>
        </div>
      )}

      {/* Form inline */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-heading font-bold text-navy mb-4">
            {editingId ? 'Modifica Regola Omaggio' : 'Nuova Regola Omaggio'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Tipo trigger</label>
              <select
                value={form.triggerType}
                onChange={(e) => setForm({ ...form, triggerType: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              >
                <option value="amount">Importo ordine</option>
                <option value="product">Prodotto acquistato</option>
                <option value="category">Categoria</option>
              </select>
            </div>
            {form.triggerType === 'amount' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Valore trigger (&euro;)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.triggerValue}
                  onChange={(e) => setForm({ ...form, triggerValue: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                  placeholder="100.00"
                />
              </div>
            )}
            {form.triggerType === 'product' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">ID prodotto trigger</label>
                <input
                  type="number"
                  value={form.triggerProductId}
                  onChange={(e) => setForm({ ...form, triggerProductId: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                  placeholder="ID prodotto"
                />
              </div>
            )}
            {form.triggerType === 'category' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">ID categoria trigger</label>
                <input
                  type="number"
                  value={form.triggerCategoryId}
                  onChange={(e) => setForm({ ...form, triggerCategoryId: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                  placeholder="ID categoria"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">ID prodotto omaggio</label>
              <input
                type="number"
                value={form.giftProductId}
                onChange={(e) => setForm({ ...form, giftProductId: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                placeholder="ID prodotto"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Quantit&agrave; omaggio</label>
              <input
                type="number"
                min="1"
                value={form.giftQty}
                onChange={(e) => setForm({ ...form, giftQty: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Ordine minimo (&euro;)</label>
              <input
                type="number"
                step="0.01"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                placeholder="Opzionale"
              />
            </div>
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
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Attiva</span>
              </label>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 bg-blue text-white font-bold px-4 py-2.5 rounded-lg hover:bg-blue-light transition-colors text-sm"
            >
              <Check size={16} />
              {saving ? 'Salvataggio...' : editingId ? 'Aggiorna' : 'Crea Regola'}
            </button>
            <button
              onClick={handleCancel}
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
          <h2 className="font-heading font-bold text-navy">Regole Omaggio ({rules.length})</h2>
        </div>
        {rules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Nome</th>
                  <th className="px-5 py-3 text-left">Trigger</th>
                  <th className="px-5 py-3 text-left">Prodotto omaggio</th>
                  <th className="px-5 py-3 text-center">Qt&agrave;</th>
                  <th className="px-5 py-3 text-right">Min. ordine</th>
                  <th className="px-5 py-3 text-left">Validit&agrave;</th>
                  <th className="px-5 py-3 text-center">Stato</th>
                  <th className="px-5 py-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rules.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-navy">{r.name}</td>
                    <td className="px-5 py-3 text-gray-600">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {triggerTypeLabels[r.triggerType] || r.triggerType}
                      </span>
                      {r.triggerType === 'amount' && r.triggerValue && (
                        <span className="ml-2 text-xs">{formatEur(r.triggerValue)}</span>
                      )}
                      {r.triggerType === 'product' && r.triggerProductName && (
                        <span className="ml-2 text-xs">{r.triggerProductName}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600 max-w-[200px] truncate">
                      {r.giftProductName || `ID: ${r.giftProductId}`}
                    </td>
                    <td className="px-5 py-3 text-center font-medium">{r.giftQty}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{formatEur(r.minOrderAmount)}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs">
                      {formatDate(r.startDate)} - {formatDate(r.endDate)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        r.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {r.isActive ? 'Attiva' : 'Inattiva'}
                      </span>
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
            Nessuna regola omaggio. Clicca &quot;Nuova Regola&quot; per crearne una.
          </div>
        )}
      </div>
    </div>
  );
}
