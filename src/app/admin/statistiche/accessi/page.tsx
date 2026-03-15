'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, Users, FileText } from 'lucide-react';

interface AccessStats {
  totalViews: number;
  uniqueVisitors: number;
  topPages: { path: string; views: number }[];
  dailyTrend: { date: string; views: number; uniqueVisitors: number }[];
}

export default function AccessiStatsPage() {
  const [stats, setStats] = useState<AccessStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/stats/access');
        if (res.ok) setStats(await res.json());
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
  };

  const maxViews = stats?.dailyTrend
    ? Math.max(...stats.dailyTrend.map((d) => d.views), 1)
    : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/statistiche" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Eye className="w-6 h-6 text-navy" />
        <h1 className="font-heading text-2xl text-navy">Statistiche Accessi</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Caricamento statistiche...</div>
      ) : stats ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Visualizzazioni Totali</span>
              </div>
              <p className="text-3xl font-heading text-navy">{stats.totalViews.toLocaleString('it-IT')}</p>
              <p className="text-xs text-gray-400 mt-1">Ultimi 30 giorni</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Visitatori Unici</span>
              </div>
              <p className="text-3xl font-heading text-navy">{stats.uniqueVisitors.toLocaleString('it-IT')}</p>
              <p className="text-xs text-gray-400 mt-1">Ultimi 30 giorni</p>
            </div>
          </div>

          {/* Top pages */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-navy" />
              <h2 className="font-heading text-lg text-navy">Pagine Più Visitate</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2 text-sm font-medium text-gray-500">Pagina</th>
                  <th className="text-right pb-2 text-sm font-medium text-gray-500">Visite</th>
                </tr>
              </thead>
              <tbody>
                {stats.topPages.length === 0 ? (
                  <tr><td colSpan={2} className="py-4 text-center text-gray-400 text-sm">Nessun dato</td></tr>
                ) : (
                  stats.topPages.map((page, i) => (
                    <tr key={page.path} className="border-b border-gray-50">
                      <td className="py-2 text-sm">
                        <span className="text-gray-400 mr-2">{i + 1}.</span>
                        <span className="text-gray-700 font-mono text-xs">{page.path}</span>
                      </td>
                      <td className="py-2 text-sm text-right text-gray-600">{page.views.toLocaleString('it-IT')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Daily trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-heading text-lg text-navy mb-4">Andamento Giornaliero (30 giorni)</h2>
            {stats.dailyTrend.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Nessun dato disponibile</p>
            ) : (
              <div className="space-y-1">
                {stats.dailyTrend.map((d) => (
                  <div key={d.date} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-12 font-mono">{formatDate(d.date)}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 rounded-full h-3 transition-all"
                        style={{ width: `${(d.views / maxViews) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">{d.views} visite</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-400">Errore nel caricamento</div>
      )}
    </div>
  );
}
