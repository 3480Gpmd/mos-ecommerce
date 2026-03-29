'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus, Trash2, Eye, Search, ChevronLeft, ChevronRight,
} from 'lucide-react';

interface ServicePage {
  id: number;
  title: string;
  slug: string;
  category: string;
  isActive: boolean;
  sectionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function ServiziListPage() {
  const [pages, setPages] = useState<ServicePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 25;

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await fetch(`/api/admin/service-pages?${params}`);
      const data = await res.json();
      setPages(data.pages || []);
    } catch (err) {
      console.error('Errore caricamento pagine:', err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, page]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questa pagina di servizio?')) return;
    try {
      const res = await fetch('/api/admin/service-pages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setPages((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Errore eliminazione:', err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">
          Pagine Servizi
          {!loading && <span className="text-base font-normal text-gray-500 ml-2">({pages.length})</span>}
        </h1>
        <Link
          href="/admin/servizi/new"
          className="flex items-center gap-2 bg-blue text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-blue-light transition-colors"
        >
          <Plus size={16} />
          Nuova pagina
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cerca per titolo, slug..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent"
        >
          <option value="all">Tutte le categorie</option>
          <option value="caffe">Caffè</option>
          <option value="acqua">Acqua</option>
          <option value="ufficio">Ufficio</option>
        </select>
      </div>

      {/* Pages table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Caricamento...</div>
        ) : pages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nessuna pagina trovata
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-5 py-3 text-left">Titolo</th>
                    <th className="px-5 py-3 text-left">Slug</th>
                    <th className="px-5 py-3 text-left">Categoria</th>
                    <th className="px-5 py-3 text-center">Sezioni</th>
                    <th className="px-5 py-3 text-center">Stato</th>
                    <th className="px-5 py-3 text-left">Modificato</th>
                    <th className="px-5 py-3 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pages.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-navy">{p.title}</td>
                      <td className="px-5 py-3 text-gray-600 text-xs font-mono">/{p.slug}</td>
                      <td className="px-5 py-3 text-gray-600 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-gray-600">{p.sectionsCount}</td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            p.isActive ? 'bg-green-100 text-green-800' : 'bg-red/10 text-red'
                          }`}
                        >
                          {p.isActive ? 'Attivo' : 'Inattivo'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {new Date(p.updatedAt).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/servizi/${p.id}`}
                            className="p-2 text-blue hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifica"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-red hover:bg-red/10 rounded-lg transition-colors"
                            title="Elimina"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
