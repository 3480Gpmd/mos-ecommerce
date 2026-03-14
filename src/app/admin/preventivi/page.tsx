'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileText, Search, ChevronDown, ChevronUp, Save, Building2, Mail, Phone, MessageSquare } from 'lucide-react';

interface QuoteRow {
  id: number;
  companyName: string | null;
  contactName: string;
  email: string;
  phone: string | null;
  message: string | null;
  interests: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  nuovo: 'Nuovo',
  contattato: 'Contattato',
  preventivo_inviato: 'Preventivo inviato',
  chiuso: 'Chiuso',
};

const statusColors: Record<string, string> = {
  nuovo: 'bg-blue-100 text-blue-800',
  contattato: 'bg-yellow-100 text-yellow-800',
  preventivo_inviato: 'bg-purple-100 text-purple-800',
  chiuso: 'bg-green-100 text-green-800',
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function AdminPreventiviPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      const res = await fetch(`/api/admin/quotes?${params}`);
      const data = await res.json();
      setQuotes(data.quotes || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  const handleExpand = (q: QuoteRow) => {
    if (expandedId === q.id) { setExpandedId(null); return; }
    setExpandedId(q.id);
    setEditStatus(q.status);
    setEditNotes(q.adminNotes || '');
  };

  const handleSave = async (id: number) => {
    setSaving(true);
    try {
      await fetch('/api/admin/quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: editStatus, adminNotes: editNotes }),
      });
      setQuotes((prev) => prev.map((q) =>
        q.id === id ? { ...q, status: editStatus, adminNotes: editNotes } : q
      ));
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const newCount = quotes.filter((q) => q.status === 'nuovo').length;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-1 flex items-center gap-2">
        <FileText size={24} className="text-blue" />
        Richieste Preventivo
        {newCount > 0 && (
          <span className="text-sm bg-red text-white px-2 py-0.5 rounded-full font-bold">{newCount} nuov{newCount === 1 ? 'a' : 'e'}</span>
        )}
      </h1>
      <p className="text-gray-500 text-sm mb-6">Gestisci le richieste di preventivo ricevute dal sito.</p>

      {/* Filtro */}
      <div className="flex items-center gap-3 mb-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
        >
          <option value="">Tutti gli stati</option>
          {Object.entries(statusLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Caricamento...</div>
        ) : quotes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            Nessuna richiesta di preventivo
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left w-8"></th>
                <th className="px-4 py-3 text-left">Contatto</th>
                <th className="px-4 py-3 text-left">Azienda</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Interessi</th>
                <th className="px-4 py-3 text-left">Stato</th>
                <th className="px-4 py-3 text-left">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {quotes.map((q) => (
                <>
                  <tr
                    key={q.id}
                    onClick={() => handleExpand(q)}
                    className={`cursor-pointer transition-colors ${expandedId === q.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-3 text-gray-400">
                      {expandedId === q.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </td>
                    <td className="px-4 py-3 font-medium text-navy">{q.contactName}</td>
                    <td className="px-4 py-3 text-gray-600">{q.companyName || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{q.email}</td>
                    <td className="px-4 py-3">
                      {q.interests ? (
                        <div className="flex flex-wrap gap-1">
                          {q.interests.split(',').map((i, idx) => (
                            <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{i.trim()}</span>
                          ))}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[q.status] || 'bg-gray-100'}`}>
                        {statusLabels[q.status] || q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(q.createdAt)}</td>
                  </tr>

                  {expandedId === q.id && (
                    <tr key={`detail-${q.id}`}>
                      <td colSpan={7} className="bg-gray-50 border-b">
                        <div className="p-6 space-y-4">
                          {/* Info contatto */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 size={16} className="text-gray-400" />
                              <span className="font-medium">{q.companyName || 'Non specificata'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Mail size={16} className="text-gray-400" />
                              <a href={`mailto:${q.email}`} className="text-blue hover:underline">{q.email}</a>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone size={16} className="text-gray-400" />
                              <span>{q.phone || 'Non specificato'}</span>
                            </div>
                          </div>

                          {/* Messaggio */}
                          {q.message && (
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 text-xs text-gray-500 uppercase font-medium mb-1">
                                <MessageSquare size={14} /> Messaggio
                              </div>
                              <p className="text-sm text-gray-700">{q.message}</p>
                            </div>
                          )}

                          {/* Azioni */}
                          <div className="flex flex-wrap items-end gap-4">
                            <div>
                              <label className="text-xs text-gray-500 font-medium block mb-1">Stato</label>
                              <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                              >
                                {Object.entries(statusLabels).map(([k, v]) => (
                                  <option key={k} value={k}>{v}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                              <label className="text-xs text-gray-500 font-medium block mb-1">Note admin</label>
                              <input
                                type="text"
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                placeholder="Note interne..."
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                              />
                            </div>
                            <button
                              onClick={() => handleSave(q.id)}
                              disabled={saving}
                              className="flex items-center gap-1 px-4 py-2 bg-blue text-white text-sm font-bold rounded-lg hover:bg-blue-light disabled:opacity-50 transition-colors"
                            >
                              <Save size={14} />
                              {saving ? 'Salvataggio...' : 'Salva'}
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
        )}
      </div>
    </div>
  );
}
