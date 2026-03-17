'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, TrendingUp, DollarSign, Hash, Calendar } from 'lucide-react';

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  ordersThisMonth: number;
  ordersByStatus: { status: string; count: number }[];
  ordersByPaymentMethod: { paymentMethod: string | null; count: number }[];
  monthlyTrend: { month: string; totalOrders: number; totalRevenue: number }[];
  topCustomers: {
    customerId: number;
    customerName: string | null;
    customerEmail: string | null;
    totalSpent: number;
    orderCount: number;
  }[];
}

const statusColors: Record<string, string> = {
  nuovo: 'bg-blue-100 text-blue-700',
  confermato: 'bg-green-100 text-green-700',
  in_preparazione: 'bg-yellow-100 text-yellow-700',
  spedito: 'bg-purple-100 text-purple-700',
  consegnato: 'bg-emerald-100 text-emerald-700',
  annullato: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  nuovo: 'Nuovo',
  confermato: 'Confermato',
  in_preparazione: 'In Preparazione',
  spedito: 'Spedito',
  consegnato: 'Consegnato',
  annullato: 'Annullato',
};

const paymentLabels: Record<string, string> = {
  paypal: 'PayPal',
  teamsystem: 'TeamSystem',
  bonifico: 'Bonifico',
};

export default function OrdiniStatsPage() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/admin/stats/orders?period=${period}`;
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await fetch(url);
      if (res.ok) setStats(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [period, startDate, endDate]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const maxRevenue = stats?.monthlyTrend
    ? Math.max(...stats.monthlyTrend.map((m) => m.totalRevenue), 1)
    : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/statistiche" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <ShoppingCart className="w-6 h-6 text-navy" />
          <h1 className="font-heading text-2xl text-navy">Statistiche Ordini</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-3 items-end">
        <div className="flex-1">
          <label className="text-sm text-gray-500 block mb-1">Periodo preimpostato</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full"
          >
            <option value="month">Mese corrente</option>
            <option value="quarter">Ultimo trimestre</option>
            <option value="year">Anno corrente</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-sm text-gray-500 block mb-1">Data inizio (personalizzato)</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full"
          />
        </div>
        <div className="flex-1">
          <label className="text-sm text-gray-500 block mb-1">Data fine (personalizzato)</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full"
          />
        </div>
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
                  <Hash className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Totale Ordini</span>
              </div>
              <p className="text-3xl font-heading text-navy">{stats.totalOrders}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Fatturato</span>
              </div>
              <p className="text-3xl font-heading text-navy">{formatCurrency(stats.totalRevenue)}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Media Ordine</span>
              </div>
              <p className="text-3xl font-heading text-navy">{formatCurrency(stats.avgOrderValue)}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm text-gray-500">Ordini Mese</span>
              </div>
              <p className="text-3xl font-heading text-navy">{stats.ordersThisMonth}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Orders by status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-heading text-lg text-navy mb-4">Per Stato</h2>
              <div className="space-y-3">
                {stats.ordersByStatus.map((s) => {
                  const pct = stats.totalOrders > 0 ? (s.count / stats.totalOrders) * 100 : 0;
                  return (
                    <div key={s.status} className="flex items-center gap-3">
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${statusColors[s.status] || 'bg-gray-100 text-gray-600'} w-32 text-center`}>
                        {statusLabels[s.status] || s.status}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-navy rounded-full h-2 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{s.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Orders by payment method */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-heading text-lg text-navy mb-4">Per Metodo di Pagamento</h2>
              <div className="space-y-3">
                {stats.ordersByPaymentMethod.map((p) => {
                  const pct = stats.totalOrders > 0 ? (p.count / stats.totalOrders) * 100 : 0;
                  return (
                    <div key={p.paymentMethod || 'n/a'} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-32">
                        {p.paymentMethod ? (paymentLabels[p.paymentMethod] || p.paymentMethod) : 'N/D'}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 rounded-full h-2 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{p.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Monthly trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-heading text-lg text-navy mb-4">Andamento Mensile (Ultimi 12 Mesi)</h2>
            {stats.monthlyTrend.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Nessun dato disponibile</p>
            ) : (
              <div className="space-y-2">
                {stats.monthlyTrend.map((m) => (
                  <div key={m.month} className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 w-20 font-mono">{m.month}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 relative">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-navy rounded-full h-4 transition-all"
                        style={{ width: `${(m.totalRevenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-24 text-right">{formatCurrency(m.totalRevenue)}</span>
                    <span className="text-xs text-gray-400 w-16 text-right">{m.totalOrders} ord.</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top customers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-heading text-lg text-navy">Top 10 Clienti per Fatturato</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 w-8">#</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Nome</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Email</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Ordini</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Totale Speso</th>
                </tr>
              </thead>
              <tbody>
                {stats.topCustomers.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Nessun dato</td></tr>
                ) : (
                  stats.topCustomers.map((customer, i) => (
                    <tr key={`${customer.customerId}-${i}`} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-6 py-3 text-sm text-gray-400 font-mono">{i + 1}</td>
                      <td className="px-6 py-3 text-sm text-gray-700 font-medium">{customer.customerName || '-'}</td>
                      <td className="px-6 py-3 text-sm text-gray-600 font-mono text-xs">{customer.customerEmail || '-'}</td>
                      <td className="px-6 py-3 text-sm text-gray-600 text-right">{customer.orderCount}</td>
                      <td className="px-6 py-3 text-sm text-navy font-semibold text-right">{formatCurrency(customer.totalSpent)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-400">Errore nel caricamento delle statistiche</div>
      )}
    </div>
  );
}
