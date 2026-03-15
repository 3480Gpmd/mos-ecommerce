'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, Eye } from 'lucide-react';

interface ProductViewStats {
  totalViews: number;
  topProducts: {
    productId: number;
    productCode: string | null;
    productName: string | null;
    views: number;
  }[];
  dailyTrend: { date: string; views: number }[];
}

export default function ProdottiStatsPage() {
  const [stats, setStats] = useState<ProductViewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stats/products?period=${period}`);
      if (res.ok) setStats(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [period]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const maxViews = stats?.topProducts
    ? Math.max(...stats.topProducts.map((p) => p.views), 1)
    : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/statistiche" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Package className="w-6 h-6 text-navy" />
          <h1 className="font-heading text-2xl text-navy">Prodotti Più Visti</h1>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="month">Mese corrente</option>
          <option value="quarter">Ultimo trimestre</option>
          <option value="year">Anno corrente</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Caricamento statistiche...</div>
      ) : stats ? (
        <>
          {/* Total views KPI */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-fit">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Visualizzazioni Totali</span>
            </div>
            <p className="text-3xl font-heading text-navy">{stats.totalViews.toLocaleString('it-IT')}</p>
          </div>

          {/* Top 50 products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-heading text-lg text-navy">Top 50 Prodotti</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 w-10">#</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Codice</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Nome</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Visite</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 w-48"></th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Nessun dato</td></tr>
                ) : (
                  stats.topProducts.map((product, i) => (
                    <tr key={product.productId} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-6 py-3 text-sm text-gray-400">{i + 1}</td>
                      <td className="px-6 py-3 text-sm font-mono text-navy">{product.productCode || '-'}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{product.productName || '-'}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{product.views.toLocaleString('it-IT')}</td>
                      <td className="px-6 py-3">
                        <div className="bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-purple-500 rounded-full h-2 transition-all"
                            style={{ width: `${(product.views / maxViews) * 100}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-400">Errore nel caricamento</div>
      )}
    </div>
  );
}
