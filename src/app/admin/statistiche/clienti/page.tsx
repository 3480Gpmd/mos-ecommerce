'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, TrendingUp, ShoppingCart, AlertCircle } from 'lucide-react';

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  inactiveCustomers: number;
  avgOrderValuePerCustomer: number;
  topCustomers: {
    customerId: number;
    customerName: string | null;
    customerEmail: string | null;
    totalSpent: number;
    orderCount: number;
    lastOrder: string;
  }[];
  acquisitionTrend: {
    month: string;
    count: number;
  }[];
  spendingSegments: {
    segment: string;
    customerCount: number;
    totalSpent: number;
  }[];
  frequencySegments: {
    segment: string;
    customerCount: number;
  }[];
  abandonedCarts: {
    totalCarts: number;
    totalValue: number;
    recoveryRate: number;
  };
}

const formatCurrency = (value: number | string | null) => {
  const num = typeof value === 'string' ? parseFloat(value) : value || 0;
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
};

export default function ClientiStatsPage() {
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/stats/customers');
        if (res.ok) setStats(await res.json());
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const maxAcquisition = stats?.acquisitionTrend
    ? Math.max(...stats.acquisitionTrend.map((t) => t.count), 1)
    : 1;

  const maxSpending = stats?.spendingSegments
    ? Math.max(...stats.spendingSegments.map((s) => s.customerCount), 1)
    : 1;

  const maxFrequency = stats?.frequencySegments
    ? Math.max(...stats.frequencySegments.map((s) => s.customerCount), 1)
    : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/statistiche" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Users className="w-6 h-6 text-navy" />
        <h1 className="font-heading text-2xl text-navy">Analitiche Clienti</h1>
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
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Totale Clienti</span>
              </div>
              <p className="text-3xl font-heading text-navy">{stats.totalCustomers}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Clienti Attivi</span>
              </div>
              <p className="text-3xl font-heading text-navy">{stats.activeCustomers}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Nuovi Questo Mese</span>
              </div>
              <p className="text-3xl font-heading text-navy">{stats.newThisMonth}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm text-gray-500">Ticket Medio</span>
              </div>
              <p className="text-3xl font-heading text-navy">{formatCurrency(stats.avgOrderValuePerCustomer)}</p>
            </div>
          </div>

          {/* Top customers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-heading text-lg text-navy">Top 20 Clienti per Valore Lifetime</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 w-8">#</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Nome</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Email</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">Ordini</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">Valore Lifetime</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">Ultimo Ordine</th>
                </tr>
              </thead>
              <tbody>
                {stats.topCustomers.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-sm">Nessun dato</td></tr>
                ) : (
                  stats.topCustomers.map((customer, i) => {
                    const lastOrderDate = new Date(customer.lastOrder);
                    const formattedDate = lastOrderDate.toLocaleDateString('it-IT');
                    return (
                      <tr key={`${customer.customerId}-${i}`} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-6 py-3 text-sm text-gray-400 font-mono">{i + 1}</td>
                        <td className="px-6 py-3 text-sm text-gray-700 font-medium">{customer.customerName || '-'}</td>
                        <td className="px-6 py-3 text-sm text-gray-600 font-mono text-xs">{customer.customerEmail || '-'}</td>
                        <td className="px-6 py-3 text-sm text-gray-600 text-right">{customer.orderCount}</td>
                        <td className="px-6 py-3 text-sm text-navy font-semibold text-right">{formatCurrency(customer.totalSpent)}</td>
                        <td className="px-6 py-3 text-sm text-gray-500 text-right">{formattedDate}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Acquisition trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-heading text-lg text-navy mb-4">Trend Acquisizione Clienti (Ultimi 12 Mesi)</h2>
            {stats.acquisitionTrend.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Nessun dato disponibile</p>
            ) : (
              <div className="space-y-2">
                {stats.acquisitionTrend.map((trend) => (
                  <div key={trend.month} className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 w-20 font-mono">{trend.month}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-green-400 to-emerald-600 rounded-full h-4 transition-all"
                        style={{ width: `${(trend.count / maxAcquisition) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{trend.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending segments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-heading text-lg text-navy mb-4">Segmenti per Livello di Spesa (Mese)</h2>
              {stats.spendingSegments.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Nessun dato disponibile</p>
              ) : (
                <div className="space-y-4">
                  {stats.spendingSegments.map((seg) => (
                    <div key={seg.segment}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700 font-medium">{seg.segment}</span>
                        <span className="text-sm text-gray-600">{seg.customerCount} clienti</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-full h-3 transition-all"
                          style={{ width: `${(seg.customerCount / maxSpending) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{formatCurrency(seg.totalSpent)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Frequency segments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-heading text-lg text-navy mb-4">Segmenti per Frequenza Ordini</h2>
              {stats.frequencySegments.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Nessun dato disponibile</p>
              ) : (
                <div className="space-y-4">
                  {stats.frequencySegments.map((seg) => (
                    <div key={seg.segment}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700 font-medium">{seg.segment}</span>
                        <span className="text-sm text-gray-600">{seg.customerCount} clienti</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-full h-3 transition-all"
                          style={{ width: `${(seg.customerCount / maxFrequency) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Abandoned cart analytics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h2 className="font-heading text-lg text-navy">Analitiche Carrelli Abbandonati</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <p className="text-sm text-gray-600 mb-1">Carrelli Attivi</p>
                <p className="text-2xl font-heading text-orange-700">{stats.abandonedCarts.totalCarts}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                <p className="text-sm text-gray-600 mb-1">Valore Abbandonato</p>
                <p className="text-2xl font-heading text-red-700">{formatCurrency(stats.abandonedCarts.totalValue)}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Recovery Rate</p>
                <p className="text-2xl font-heading text-green-700">{stats.abandonedCarts.recoveryRate}%</p>
              </div>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-heading text-lg text-red-900">Clienti Inattivi</h3>
              </div>
              <p className="text-3xl font-heading text-red-700">{stats.inactiveCustomers}</p>
              <p className="text-sm text-gray-600 mt-2">Nessun ordine negli ultimi 60 giorni</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-heading text-lg text-green-900">Tasso Attivazione</h3>
              </div>
              <p className="text-3xl font-heading text-green-700">
                {stats.totalCustomers > 0 ? Math.round((stats.activeCustomers / stats.totalCustomers) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600 mt-2">Clienti con almeno un ordine</p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-400">Errore nel caricamento delle statistiche</div>
      )}
    </div>
  );
}
