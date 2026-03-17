'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, AlertTriangle, TrendingUp } from 'lucide-react';

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  outOfStockCount: number;
  avgPrice: number;
  topOrderedByQty: {
    productId: number | null;
    productCode: string;
    productName: string;
    totalQty: number;
    totalRevenue: number;
  }[];
  topOrderedByRevenue: {
    productId: number | null;
    productCode: string;
    productName: string;
    totalQty: number;
    totalRevenue: number;
  }[];
  topViewed: {
    productId: number | null;
    productCode: string | null;
    productName: string | null;
    views: number;
  }[];
  neverOrdered: {
    productId: number;
    code: string;
    name: string;
    pricePublic: string | null;
    stockAvailable: number;
  }[];
  lowStock: {
    productId: number;
    code: string;
    name: string;
    stockAvailable: number;
    pricePublic: string | null;
  }[];
  categoryBreakdown: {
    categoryId: number | null;
    categoryName: string | null;
    productCount: number;
  }[];
}

const formatCurrency = (value: number | string | null) => {
  const num = typeof value === 'string' ? parseFloat(value) : value || 0;
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
};

export default function ProdottiStatsPage() {
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stats/products?period=${period}`);
      if (res.ok) setStats(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [period]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const maxQty = stats?.topOrderedByQty
    ? Math.max(...stats.topOrderedByQty.map((p) => p.totalQty), 1)
    : 1;

  const maxRevenue = stats?.topOrderedByRevenue
    ? Math.max(...stats.topOrderedByRevenue.map((p) => p.totalRevenue), 1)
    : 1;

  const maxViews = stats?.topViewed
    ? Math.max(...stats.topViewed.map((p) => p.views), 1)
    : 1;

  const maxCategoryCount = stats?.categoryBreakdown
    ? Math.max(...stats.categoryBreakdown.map((c) => c.productCount), 1)
    : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/statistiche" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Package className="w-6 h-6 text-navy" />
          <h1 className="font-heading text-2xl text-navy">Statistiche Prodotti</h1>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">Tutto</option>
          <option value="7d">Ultimi 7 giorni</option>
          <option value="30d">Ultimi 30 giorni</option>
          <option value="90d">Ultimi 90 giorni</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Caricamento statistiche...</div>
      ) : stats ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Totale Prodotti</span>
              </div>
              <p className="text-3xl font-heading text-navy">{stats.totalProducts}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Attivi</span>
              </div>
              <p className="text-3xl font-heading text-navy">{stats.activeProducts}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-sm text-gray-500">Esauriti</span>
              </div>
              <p className="text-3xl font-heading text-navy">{stats.outOfStockCount}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Prezzo Medio</span>
              </div>
              <p className="text-3xl font-heading text-navy">{formatCurrency(stats.avgPrice)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top ordered by quantity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-heading text-lg text-navy">Top 20 per Quantità Ordinata</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {stats.topOrderedByQty.length === 0 ? (
                  <p className="px-6 py-8 text-center text-gray-400 text-sm">Nessun dato</p>
                ) : (
                  stats.topOrderedByQty.map((product, i) => (
                    <div key={`${product.productId}-${i}`} className="px-6 py-3 hover:bg-gray-50/50">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono text-navy mb-1">{product.productCode}</p>
                          <p className="text-sm text-gray-700 truncate">{product.productName}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">{product.totalQty} pz</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 rounded-full h-2 transition-all"
                          style={{ width: `${(product.totalQty / maxQty) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top ordered by revenue */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-heading text-lg text-navy">Top 20 per Fatturato</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {stats.topOrderedByRevenue.length === 0 ? (
                  <p className="px-6 py-8 text-center text-gray-400 text-sm">Nessun dato</p>
                ) : (
                  stats.topOrderedByRevenue.map((product, i) => (
                    <div key={`${product.productId}-${i}`} className="px-6 py-3 hover:bg-gray-50/50">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono text-navy mb-1">{product.productCode}</p>
                          <p className="text-sm text-gray-700 truncate">{product.productName}</p>
                        </div>
                        <span className="text-sm font-semibold text-green-600 whitespace-nowrap">{formatCurrency(product.totalRevenue)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-green-500 rounded-full h-2 transition-all"
                          style={{ width: `${(product.totalRevenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Top viewed products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-heading text-lg text-navy">Top 20 Prodotti Più Visti</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {stats.topViewed.length === 0 ? (
                <p className="px-6 py-8 text-center text-gray-400 text-sm">Nessun dato</p>
              ) : (
                stats.topViewed.map((product, i) => (
                  <div key={`${product.productId}-${i}`} className="px-6 py-3 hover:bg-gray-50/50">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono text-navy mb-1">{product.productCode || '-'}</p>
                        <p className="text-sm text-gray-700 truncate">{product.productName || '-'}</p>
                      </div>
                      <span className="text-sm font-semibold text-purple-600 whitespace-nowrap">{product.views.toLocaleString('it-IT')} visite</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-purple-500 rounded-full h-2 transition-all"
                        style={{ width: `${(product.views / maxViews) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low stock products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h2 className="font-heading text-lg text-navy">Prodotti Sotto Scorta (&lt;5)</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Codice</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Nome</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lowStock.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-6 text-center text-gray-400 text-sm">Nessun prodotto sotto scorta</td></tr>
                  ) : (
                    stats.lowStock.map((product) => (
                      <tr key={product.productId} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-6 py-3 text-sm font-mono text-navy">{product.code}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">{product.name}</td>
                        <td className="px-6 py-3 text-sm text-right font-semibold text-orange-600">{product.stockAvailable}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Never ordered */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-heading text-lg text-navy">Mai Ordinati</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Codice</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Nome</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">Prezzo</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.neverOrdered.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-6 text-center text-gray-400 text-sm">Tutti i prodotti sono stati ordinati</td></tr>
                  ) : (
                    stats.neverOrdered.map((product) => (
                      <tr key={product.productId} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-6 py-3 text-sm font-mono text-navy">{product.code}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">{product.name}</td>
                        <td className="px-6 py-3 text-sm text-right text-gray-600">{formatCurrency(product.pricePublic)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-heading text-lg text-navy mb-4">Distribuzione per Categoria</h2>
            {stats.categoryBreakdown.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Nessun dato disponibile</p>
            ) : (
              <div className="space-y-3">
                {stats.categoryBreakdown.map((cat) => (
                  <div key={`${cat.categoryId}`} className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 w-40 truncate">
                      {cat.categoryName || 'Senza Categoria'}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3">
                      <div
                        className="bg-indigo-500 rounded-full h-3 transition-all"
                        style={{ width: `${(cat.productCount / maxCategoryCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{cat.productCount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-400">Errore nel caricamento delle statistiche</div>
      )}
    </div>
  );
}
