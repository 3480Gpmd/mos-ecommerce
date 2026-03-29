'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search, Plus, Trash2, X, ChevronDown, ChevronUp, Edit2, Mail, Phone,
} from 'lucide-react';

interface Supplier {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function FornitorPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });

  // Expanded row
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Supplier>>({});
  const [saving, setSaving] = useState(false);

  // New supplier modal
  const [showNew, setShowNew] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    isDefault: false,
    isActive: true,
  });
  const [creating, setCreating] = useState(false);

  const fetchSuppliers = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    params.set('page', String(page));
    params.set('limit', '50');

    try {
      const res = await fetch(`/api/admin/suppliers?${params}`);
      const data = await res.json();
      setSuppliers(data.suppliers || []);
      setPagination({
        page,
        limit: 50,
        total: data.pagination?.total || 0,
        totalPages: Math.ceil((data.pagination?.total || 0) / 50),
      });
    } catch (err) {
      console.error('Errore caricamento fornitori:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchSuppliers(1); }, [fetchSuppliers]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleExpand = (supplier: Supplier) => {
    if (expandedId === supplier.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(supplier.id);
    setEditData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      notes: supplier.notes,
      isDefault: supplier.isDefault,
      isActive: supplier.isActive,
    });
  };

  const handleSave = async () => {
    if (!expandedId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/suppliers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: expandedId, ...editData }),
      });
      if (res.ok) {
        const { supplier: updated } = await res.json();
        setSuppliers((prev) => prev.map((s) => s.id === expandedId ? updated : s));
        setExpandedId(null);
      }
    } catch (err) {
      console.error('Errore salvataggio:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newSupplier.name || !newSupplier.email) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplier),
      });
      if (res.ok) {
        setShowNew(false);
        setNewSupplier({ name: '', email: '', phone: '', notes: '', isDefault: false, isActive: true });
        fetchSuppliers(1);
      }
    } catch (err) {
      console.error('Errore creazione:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questo fornitore?')) return;
    try {
      const res = await fetch('/api/admin/suppliers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setSuppliers((prev) => prev.filter((s) => s.id !== id));
        if (expandedId === id) setExpandedId(null);
      }
    } catch (err) {
      console.error('Errore eliminazione:', err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">
          Fornitori
          {!loading && <span className="text-base font-normal text-gray-500 ml-2">({pagination.total.toLocaleString('it-IT')})</span>}
        </h1>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-blue text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-blue-light transition-colors"
        >
          <Plus size={16} />
          Nuovo fornitore
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cerca per nome, email..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent"
          />
        </div>
      </div>

      {/* Suppliers table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Caricamento...</div>
        ) : suppliers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nessun fornitore trovato
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-3 py-3 w-8"></th>
                    <th className="px-3 py-3 text-left">Nome</th>
                    <th className="px-3 py-3 text-left">Email</th>
                    <th className="px-3 py-3 text-left">Telefono</th>
                    <th className="px-3 py-3 text-center">Predefinito</th>
                    <th className="px-3 py-3 text-center">Attivo</th>
                    <th className="px-3 py-3 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {suppliers.map((s) => (
                    <>
                      <tr
                        key={s.id}
                        onClick={() => handleExpand(s)}
                        className={`cursor-pointer transition-colors ${
                          expandedId === s.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-3 py-3 text-gray-400">
                          {expandedId === s.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </td>
                        <td className="px-3 py-3 font-medium text-navy">{s.name}</td>
                        <td className="px-3 py-3 text-gray-600 text-xs flex items-center gap-1">
                          {s.email && <Mail size={14} />}
                          {s.email || '-'}
                        </td>
                        <td className="px-3 py-3 text-gray-600 text-xs flex items-center gap-1">
                          {s.phone && <Phone size={14} />}
                          {s.phone || '-'}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            s.isDefault ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {s.isDefault ? 'Si' : 'No'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            s.isActive ? 'bg-green-100 text-green-800' : 'bg-red/10 text-red'
                          }`}>
                            {s.isActive ? 'Attivo' : 'Inattivo'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(s.id);
                            }}
                            className="text-red hover:text-red-dark transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>

                      {expandedId === s.id && (
                        <tr key={`edit-${s.id}`}>
                          <td colSpan={7} className="bg-gray-50 border-b">
                            <div className="p-6 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Nome *</label>
                                  <input
                                    type="text"
                                    value={String(editData.name || '')}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Email</label>
                                  <input
                                    type="email"
                                    value={String(editData.email || '')}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Telefono</label>
                                  <input
                                    type="tel"
                                    value={String(editData.phone || '')}
                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Note</label>
                                <textarea
                                  value={String(editData.notes || '')}
                                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                  rows={3}
                                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light resize-none"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={editData.isDefault ?? false}
                                    onChange={(e) => setEditData({ ...editData, isDefault: e.target.checked })}
                                    className="rounded border-gray-300"
                                  />
                                  Fornitore predefinito
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={editData.isActive ?? true}
                                    onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                                    className="rounded border-gray-300"
                                  />
                                  Attivo
                                </label>
                              </div>

                              <div className="flex items-center gap-2 pt-2">
                                <button
                                  onClick={handleSave}
                                  disabled={saving}
                                  className="flex items-center gap-1 px-4 py-2 bg-blue text-white text-sm font-bold rounded-lg hover:bg-blue-light disabled:opacity-50 transition-colors"
                                >
                                  <Edit2 size={14} />
                                  {saving ? 'Salvataggio...' : 'Salva modifiche'}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Pagina {pagination.page} di {pagination.totalPages}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* New supplier modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg">Nuovo fornitore</h2>
              <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Nome *</label>
                <input
                  type="text"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Email *</label>
                <input
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Telefono</label>
                <input
                  type="tel"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Note</label>
                <textarea
                  value={newSupplier.notes}
                  onChange={(e) => setNewSupplier({ ...newSupplier, notes: e.target.value })}
                  rows={2}
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newSupplier.isDefault}
                    onChange={(e) => setNewSupplier({ ...newSupplier, isDefault: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  Fornitore predefinito
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newSupplier.isActive}
                    onChange={(e) => setNewSupplier({ ...newSupplier, isActive: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  Attivo
                </label>
              </div>
              <button
                onClick={handleCreate}
                disabled={!newSupplier.name || !newSupplier.email || creating}
                className="w-full flex items-center justify-center gap-2 bg-blue text-white font-bold py-2.5 rounded-lg hover:bg-blue-light disabled:opacity-50 transition-colors"
              >
                <Plus size={16} />
                {creating ? 'Creazione...' : 'Crea fornitore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
