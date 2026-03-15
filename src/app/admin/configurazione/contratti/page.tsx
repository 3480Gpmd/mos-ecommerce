'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, FileText, Search } from 'lucide-react';

interface Contract {
  id: number;
  customerId: number;
  customerName: string | null;
  customerEmail: string;
  firstName: string | null;
  lastName: string | null;
  priceListId: number | null;
  priceListName: string | null;
  discountPct: string;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

interface PriceList {
  id: number;
  code: string;
  name: string;
}

interface CustomerResult {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
}

export default function ContrattiPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<CustomerResult[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResult | null>(null);
  const [form, setForm] = useState({
    customerId: 0,
    priceListId: '',
    discountPct: '',
    startDate: '',
    endDate: '',
    notes: '',
    isActive: true,
  });
  const [error, setError] = useState('');

  const fetchContracts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/contracts');
      if (res.ok) setContracts(await res.json());
    } catch {
      setError('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  useEffect(() => {
    // Fetch price lists for dropdown
    fetch('/api/admin/config/units') // This would ideally be a price lists endpoint
      .catch(() => {});
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('it-IT');
  };

  const getCustomerLabel = (c: Contract) => {
    if (c.customerName) return c.customerName;
    const parts = [c.firstName, c.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : c.customerEmail;
  };

  const handleSave = async () => {
    setError('');
    const customerId = editingId
      ? form.customerId
      : selectedCustomer?.id;

    if (!customerId) {
      setError('Seleziona un cliente');
      return;
    }

    const method = editingId ? 'PUT' : 'POST';
    const body = {
      ...(editingId ? { id: editingId } : {}),
      customerId,
      priceListId: form.priceListId ? parseInt(form.priceListId) : null,
      discountPct: form.discountPct || '0',
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      notes: form.notes || null,
      isActive: form.isActive,
    };

    const res = await fetch('/api/admin/contracts', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setEditingId(null);
      setShowNew(false);
      setSelectedCustomer(null);
      setForm({ customerId: 0, priceListId: '', discountPct: '', startDate: '', endDate: '', notes: '', isActive: true });
      fetchContracts();
    } else {
      const data = await res.json();
      setError(data.error || 'Errore nel salvataggio');
    }
  };

  const handleEdit = (contract: Contract) => {
    setEditingId(contract.id);
    setShowNew(false);
    setForm({
      customerId: contract.customerId,
      priceListId: contract.priceListId ? String(contract.priceListId) : '',
      discountPct: contract.discountPct || '',
      startDate: contract.startDate ? contract.startDate.split('T')[0] : '',
      endDate: contract.endDate ? contract.endDate.split('T')[0] : '',
      notes: contract.notes || '',
      isActive: contract.isActive,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questo contratto?')) return;
    const res = await fetch(`/api/admin/contracts?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchContracts();
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowNew(false);
    setSelectedCustomer(null);
    setForm({ customerId: 0, priceListId: '', discountPct: '', startDate: '', endDate: '', notes: '', isActive: true });
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <FileText className="w-6 h-6 text-navy" />
          <h1 className="font-heading text-2xl text-navy">Contratti Clienti</h1>
        </div>
        <button
          onClick={() => { setShowNew(true); setEditingId(null); setForm({ customerId: 0, priceListId: '', discountPct: '', startDate: '', endDate: '', notes: '', isActive: true }); }}
          className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> Nuovo Contratto
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* New contract form */}
      {showNew && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-heading text-lg text-navy">Nuovo Contratto</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
                placeholder="Cerca cliente per nome o email..."
              />
            </div>
            {selectedCustomer && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg flex items-center justify-between text-sm">
                <span>{selectedCustomer.companyName || `${selectedCustomer.firstName} ${selectedCustomer.lastName}`} ({selectedCustomer.email})</span>
                <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Listino</label>
              <select
                value={form.priceListId}
                onChange={(e) => setForm({ ...form, priceListId: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Nessun listino</option>
                {priceLists.map((pl) => (
                  <option key={pl.id} value={pl.id}>{pl.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sconto %</label>
              <input
                type="number"
                step="0.01"
                value={form.discountPct}
                onChange={(e) => setForm({ ...form, discountPct: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Inizio</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Fine</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded"
            />
            <label className="text-sm text-gray-700">Attivo</label>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-navy text-white px-4 py-2 rounded-lg text-sm hover:bg-opacity-90 transition">
              <Save className="w-4 h-4 inline mr-1" /> Salva
            </button>
            <button onClick={handleCancel} className="text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Contracts table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Cliente</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Listino</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Sconto %</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Inizio</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Fine</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Stato</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Caricamento...</td></tr>
            ) : contracts.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Nessun contratto</td></tr>
            ) : (
              contracts.map((contract) =>
                editingId === contract.id ? (
                  <tr key={contract.id} className="border-b border-gray-50 bg-blue-50/30">
                    <td className="px-6 py-3 text-sm text-gray-700">{getCustomerLabel(contract)}</td>
                    <td className="px-6 py-3">
                      <select value={form.priceListId} onChange={(e) => setForm({ ...form, priceListId: e.target.value })}
                        className="border border-gray-200 rounded px-2 py-1 text-sm">
                        <option value="">-</option>
                        {priceLists.map((pl) => <option key={pl.id} value={pl.id}>{pl.name}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      <input type="number" step="0.01" value={form.discountPct} onChange={(e) => setForm({ ...form, discountPct: e.target.value })}
                        className="border border-gray-200 rounded px-2 py-1 text-sm w-20" />
                    </td>
                    <td className="px-6 py-3">
                      <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        className="border border-gray-200 rounded px-2 py-1 text-sm" />
                    </td>
                    <td className="px-6 py-3">
                      <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        className="border border-gray-200 rounded px-2 py-1 text-sm" />
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
                  <tr key={contract.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-3 text-sm font-medium text-navy">{getCustomerLabel(contract)}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{contract.priceListName || '-'}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{contract.discountPct}%</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{formatDate(contract.startDate)}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{formatDate(contract.endDate)}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${contract.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {contract.isActive ? 'Attivo' : 'Inattivo'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => handleEdit(contract)} className="text-gray-400 hover:text-navy mr-2"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(contract.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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
