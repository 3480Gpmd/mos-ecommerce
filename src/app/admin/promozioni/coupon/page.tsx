'use client';

import { useEffect, useState } from 'react';
import { Tag, Plus, Pencil, Trash2, RefreshCw, X, Check } from 'lucide-react';

interface CouponData {
  id: number;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: string;
  minOrderAmount: string | null;
  maxUses: number | null;
  usedCount: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  redemptionCount: number;
}

const emptyForm = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderAmount: '',
  maxUses: '',
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

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function toInputDate(d: string | null) {
  if (!d) return '';
  return new Date(d).toISOString().split('T')[0];
}

export default function CouponPage() {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/promotions/coupons');
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch {
      setError('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async () => {
    if (!form.code || !form.discountValue) {
      setError('Codice e valore sconto obbligatori');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...form } : form;
      const res = await fetch('/api/admin/promotions/coupons', {
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
      fetchCoupons();
    } catch {
      setError('Errore di rete');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c: CouponData) => {
    setForm({
      code: c.code,
      description: c.description || '',
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || '',
      maxUses: c.maxUses ? String(c.maxUses) : '',
      startDate: toInputDate(c.startDate),
      endDate: toInputDate(c.endDate),
      isActive: c.isActive,
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questo coupon?')) return;
    try {
      await fetch(`/api/admin/promotions/coupons?id=${id}`, { method: 'DELETE' });
      fetchCoupons();
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
        <h1 className="font-heading text-2xl font-bold mb-6">Gestione Coupon</h1>
        <div className="p-8 text-center text-gray-500">Caricamento...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Gestione Coupon</h1>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
            className="flex items-center gap-2 bg-blue text-white font-bold px-4 py-2.5 rounded-lg hover:bg-blue-light transition-colors text-sm"
          >
            <Plus size={16} />
            Nuovo Coupon
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Inline form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-heading font-bold text-navy mb-4">
            {editingId ? 'Modifica Coupon' : 'Nuovo Coupon'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Codice</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                  placeholder="ES. SCONTO10"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, code: generateCode() })}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500"
                  title="Genera codice"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Descrizione</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                placeholder="Descrizione opzionale"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Tipo sconto</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              >
                <option value="percentage">Percentuale (%)</option>
                <option value="fixed">Fisso (&euro;)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Valore sconto</label>
              <input
                type="number"
                step="0.01"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                placeholder="10"
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
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Utilizzi massimi</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                placeholder="Illimitati"
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
                <span className="text-sm text-gray-700">Attivo</span>
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
              {saving ? 'Salvataggio...' : editingId ? 'Aggiorna' : 'Crea Coupon'}
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

      {/* Tabella coupon */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <Tag size={18} className="text-blue" />
          <h2 className="font-heading font-bold text-navy">Coupon ({coupons.length})</h2>
        </div>
        {coupons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Codice</th>
                  <th className="px-5 py-3 text-left">Descrizione</th>
                  <th className="px-5 py-3 text-center">Tipo</th>
                  <th className="px-5 py-3 text-right">Valore</th>
                  <th className="px-5 py-3 text-right">Min. ordine</th>
                  <th className="px-5 py-3 text-center">Utilizzi</th>
                  <th className="px-5 py-3 text-left">Validit&agrave;</th>
                  <th className="px-5 py-3 text-center">Stato</th>
                  <th className="px-5 py-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono font-bold text-navy">{c.code}</td>
                    <td className="px-5 py-3 text-gray-600 max-w-[200px] truncate">{c.description || '-'}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {c.discountType === 'percentage' ? '%' : '\u20AC'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium">
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : formatEur(c.discountValue)}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-600">{formatEur(c.minOrderAmount)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        c.maxUses && c.usedCount >= c.maxUses
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {c.usedCount}{c.maxUses ? `/${c.maxUses}` : ''}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs">
                      {formatDate(c.startDate)} - {formatDate(c.endDate)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {c.isActive ? 'Attivo' : 'Inattivo'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-1.5 rounded-lg hover:bg-blue/10 text-gray-400 hover:text-blue transition-colors"
                          title="Modifica"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
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
            Nessun coupon creato. Clicca &quot;Nuovo Coupon&quot; per iniziare.
          </div>
        )}
      </div>
    </div>
  );
}
