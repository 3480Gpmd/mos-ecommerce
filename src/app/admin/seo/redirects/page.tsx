'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus, Trash2, Save, ArrowLeft, X,
} from 'lucide-react';

interface Redirect {
  id: string;
  fromUrl: string;
  toUrl: string;
  createdAt: string;
}

export default function RedirectsPage() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newRedirect, setNewRedirect] = useState({ fromUrl: '', toUrl: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRedirects();
  }, []);

  const fetchRedirects = async () => {
    try {
      const res = await fetch('/api/admin/seo/redirects');
      if (res.ok) {
        const data = await res.json();
        setRedirects(data.redirects || []);
      }
    } catch (err) {
      console.error('Error fetching redirects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newRedirect.fromUrl || !newRedirect.toUrl) {
      alert('Compilare tutti i campi');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/seo/redirects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRedirect),
      });
      if (res.ok) {
        const data = await res.json();
        setRedirects([...redirects, data.redirect]);
        setNewRedirect({ fromUrl: '', toUrl: '' });
        setShowNew(false);
      }
    } catch (err) {
      console.error('Error adding redirect:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questo redirect?')) return;
    try {
      const res = await fetch('/api/admin/seo/redirects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setRedirects((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error('Error deleting redirect:', err);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/seo"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <h1 className="font-heading text-2xl font-bold text-navy">Redirect 301</h1>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg">Reindirizzamenti permanenti</h2>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 bg-blue text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-light transition-colors"
          >
            <Plus size={14} />
            Nuovo redirect
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Caricamento...</div>
        ) : redirects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nessun redirect configurato
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Da URL</th>
                  <th className="px-5 py-3 text-left">A URL</th>
                  <th className="px-5 py-3 text-left">Data creazione</th>
                  <th className="px-5 py-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {redirects.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs text-navy break-all">{r.fromUrl}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-600 break-all">{r.toUrl}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {new Date(r.createdAt).toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-2 text-red hover:bg-red/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New redirect modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg">Nuovo redirect 301</h2>
              <button
                onClick={() => setShowNew(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Da URL *</label>
                <input
                  type="text"
                  value={newRedirect.fromUrl}
                  onChange={(e) => setNewRedirect({ ...newRedirect, fromUrl: e.target.value })}
                  placeholder="/old-page"
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                />
                <p className="text-xs text-gray-500 mt-1">Percorso relativo (es: /old-page o /categorie/vecchia-categoria)</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">A URL *</label>
                <input
                  type="text"
                  value={newRedirect.toUrl}
                  onChange={(e) => setNewRedirect({ ...newRedirect, toUrl: e.target.value })}
                  placeholder="/new-page o https://example.com/new-page"
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                />
                <p className="text-xs text-gray-500 mt-1">Percorso relativo o URL assoluto</p>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowNew(false)}
                  className="flex-1 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue text-white font-bold rounded-lg hover:bg-blue-light disabled:opacity-50 transition-colors"
                >
                  <Save size={14} />
                  Crea redirect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
