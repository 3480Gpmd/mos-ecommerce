'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, MessageSquare } from 'lucide-react';

interface UserMessage {
  id: number;
  title: string;
  content: string;
  type: string;
  targetType: string;
  targetId: number | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  banner: 'Banner',
  popup: 'Popup',
  email: 'Email',
};

const targetLabels: Record<string, string> = {
  all: 'Tutti',
  category: 'Categoria',
  customer: 'Cliente',
};

export default function ComunicazioniPage() {
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'banner',
    targetType: 'all',
    targetId: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });
  const [error, setError] = useState('');

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/messages');
      if (res.ok) setMessages(await res.json());
    } catch {
      setError('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('it-IT');
  };

  const resetForm = () => ({
    title: '',
    content: '',
    type: 'banner',
    targetType: 'all',
    targetId: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const handleSave = async () => {
    setError('');
    if (!form.title || !form.content) {
      setError('Titolo e contenuto sono obbligatori');
      return;
    }

    const method = editingId ? 'PUT' : 'POST';
    const body = {
      ...(editingId ? { id: editingId } : {}),
      title: form.title,
      content: form.content,
      type: form.type,
      targetType: form.targetType,
      targetId: form.targetId ? parseInt(form.targetId) : null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      isActive: form.isActive,
    };

    const res = await fetch('/api/admin/messages', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setEditingId(null);
      setShowNew(false);
      setForm(resetForm());
      fetchMessages();
    } else {
      const data = await res.json();
      setError(data.error || 'Errore nel salvataggio');
    }
  };

  const handleEdit = (msg: UserMessage) => {
    setEditingId(msg.id);
    setShowNew(true);
    setForm({
      title: msg.title,
      content: msg.content,
      type: msg.type,
      targetType: msg.targetType,
      targetId: msg.targetId ? String(msg.targetId) : '',
      startDate: msg.startDate ? msg.startDate.split('T')[0] : '',
      endDate: msg.endDate ? msg.endDate.split('T')[0] : '',
      isActive: msg.isActive,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questo messaggio?')) return;
    const res = await fetch(`/api/admin/messages?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchMessages();
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowNew(false);
    setForm(resetForm());
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <MessageSquare className="w-6 h-6 text-navy" />
          <h1 className="font-heading text-2xl text-navy">Comunicazioni</h1>
        </div>
        <button
          onClick={() => { setShowNew(true); setEditingId(null); setForm(resetForm()); }}
          className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> Nuovo Messaggio
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Form */}
      {showNew && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-heading text-lg text-navy">
            {editingId ? 'Modifica Messaggio' : 'Nuovo Messaggio'}
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titolo</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Titolo del messaggio"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenuto</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              rows={4}
              placeholder="Contenuto del messaggio (supporta HTML)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="banner">Banner</option>
                <option value="popup">Popup</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destinatario</label>
              <select
                value={form.targetType}
                onChange={(e) => setForm({ ...form, targetType: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Tutti</option>
                <option value="category">Categoria</option>
                <option value="customer">Cliente specifico</option>
              </select>
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

          {form.targetType !== 'all' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Destinatario</label>
              <input
                type="number"
                value={form.targetId}
                onChange={(e) => setForm({ ...form, targetId: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="ID categoria o cliente"
              />
            </div>
          )}

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

      {/* Messages table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Titolo</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Tipo</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Destinatario</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Inizio</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Fine</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Stato</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Caricamento...</td></tr>
            ) : messages.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Nessun messaggio</td></tr>
            ) : (
              messages.map((msg) => (
                <tr key={msg.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-3 text-sm font-medium text-navy">{msg.title}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                      msg.type === 'banner' ? 'bg-blue-100 text-blue-700' :
                      msg.type === 'popup' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {typeLabels[msg.type] || msg.type}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">{targetLabels[msg.targetType] || msg.targetType}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{formatDate(msg.startDate)}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{formatDate(msg.endDate)}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${msg.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {msg.isActive ? 'Attivo' : 'Inattivo'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => handleEdit(msg)} className="text-gray-400 hover:text-navy mr-2">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(msg.id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
