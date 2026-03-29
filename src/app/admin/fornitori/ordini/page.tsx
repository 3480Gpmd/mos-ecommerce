'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search, Eye, RotateCcw, TrendingUp, AlertCircle, CheckCircle, XCircle,
} from 'lucide-react';

interface SupplierOrder {
  id: number;
  orderNumber: string;
  supplierId: number;
  supplierName: string;
  deliveryType: 'drop_ship' | 'sede_mos';
  emailStatus: 'pending' | 'sent' | 'failed';
  emailSentAt: string | null;
  emailError: string | null;
  createdAt: string;
  itemCount: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const deliveryTypeLabel = (type: string): string => {
  const labels: { [key: string]: string } = {
    drop_ship: 'DROP SHIP',
    sede_mos: 'SEDE MOS',
  };
  return labels[type] || type;
};

const deliveryTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    drop_ship: 'bg-green-100 text-green-800',
    sede_mos: 'bg-blue-100 text-blue-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

const emailStatusLabel = (status: string): string => {
  const labels: { [key: string]: string } = {
    pending: 'In sospeso',
    sent: 'Inviato',
    failed: 'Errore',
  };
  return labels[status] || status;
};

const emailStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    pending: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

export default function FornitorOrdiniPage() {
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [filterDelivery, setFilterDelivery] = useState('');
  const [filterEmailStatus, setFilterEmailStatus] = useState('');
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [resending, setResending] = useState<number | null>(null);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (filterDelivery) params.set('deliveryType', filterDelivery);
    if (filterEmailStatus) params.set('emailStatus', filterEmailStatus);
    params.set('page', String(page));
    params.set('limit', '50');

    try {
      const res = await fetch(`/api/admin/supplier-orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setPagination({
        page,
        limit: 50,
        total: data.pagination?.total || 0,
        totalPages: Math.ceil((data.pagination?.total || 0) / 50),
      });
    } catch (err) {
      console.error('Errore caricamento ordini fornitore:', err);
    } finally {
      setLoading(false);
    }
  }, [search, filterDelivery, filterEmailStatus]);

  useEffect(() => { fetchOrders(1); }, [fetchOrders]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleResendEmail = async (id: number) => {
    setResending(id);
    try {
      const res = await fetch('/api/admin/supplier-orders/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierOrderId: id }),
      });
      if (res.ok) {
        fetchOrders(pagination.page);
      }
    } catch (err) {
      console.error('Errore invio email:', err);
    } finally {
      setResending(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">
          Ordini Fornitori
          {!loading && <span className="text-base font-normal text-gray-500 ml-2">({pagination.total.toLocaleString('it-IT')})</span>}
        </h1>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cerca ordine, fornitore..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent"
          />
        </div>
        <select
          value={filterDelivery}
          onChange={(e) => {
            setFilterDelivery(e.target.value);
            fetchOrders(1);
          }}
          className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent"
        >
          <option value="">Tutti i tipi consegna</option>
          <option value="drop_ship">DROP SHIP</option>
          <option value="sede_mos">SEDE MOS</option>
        </select>
        <select
          value={filterEmailStatus}
          onChange={(e) => {
            setFilterEmailStatus(e.target.value);
            fetchOrders(1);
          }}
          className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent"
        >
          <option value="">Tutti gli stati email</option>
          <option value="pending">In sospeso</option>
          <option value="sent">Inviato</option>
          <option value="failed">Errore</option>
        </select>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Caricamento...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nessun ordine fornitore trovato
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Ordine</th>
                  <th className="px-4 py-3 text-left">Fornitore</th>
                  <th className="px-4 py-3 text-left">Tipo Consegna</th>
                  <th className="px-4 py-3 text-left">Stato Email</th>
                  <th className="px-4 py-3 text-center">Articoli</th>
                  <th className="px-4 py-3 text-left">Data</th>
                  <th className="px-4 py-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-navy">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-600 font-medium">{order.supplierName}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${deliveryTypeColor(order.deliveryType)}`}>
                        {deliveryTypeLabel(order.deliveryType)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {order.emailStatus === 'sent' && <CheckCircle size={14} className="text-green-600" />}
                        {order.emailStatus === 'failed' && <XCircle size={14} className="text-red" />}
                        {order.emailStatus === 'pending' && <AlertCircle size={14} className="text-yellow-600" />}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${emailStatusColor(order.emailStatus)}`}>
                          {emailStatusLabel(order.emailStatus)}
                        </span>
                      </div>
                      {order.emailStatus === 'failed' && order.emailError && (
                        <p className="text-xs text-red mt-1">{order.emailError}</p>
                      )}
                      {order.emailSentAt && (
                        <p className="text-xs text-gray-500 mt-1">{formatDate(order.emailSentAt)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{order.itemCount}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.emailStatus === 'failed' && (
                          <button
                            onClick={() => handleResendEmail(order.id)}
                            disabled={resending === order.id}
                            className="text-orange-600 hover:text-orange-700 transition-colors disabled:opacity-50"
                            title="Reinvia email"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                        <button
                          className="text-blue hover:text-blue-light transition-colors"
                          title="Visualizza dettagli"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white rounded-b-xl">
          <p className="text-sm text-gray-500">
            Pagina {pagination.page} di {pagination.totalPages}
          </p>
        </div>
      )}
    </div>
  );
}
