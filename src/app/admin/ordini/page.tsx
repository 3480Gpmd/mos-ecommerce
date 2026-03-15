'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Package, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Save, FileDown, FileSpreadsheet, ShoppingBag, TrendingUp, CalendarDays,
} from 'lucide-react';

interface OrderRow {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string | null;
  customerEmail: string | null;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  subtotal: string;
  vatAmount: string;
  shippingCost: string;
  total: string;
  easyfattExported: boolean;
  createdAt: string;
  itemCount: number;
}

interface OrderDetail {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string | null;
  customerEmail: string | null;
  customerVat: string | null;
  customerFiscal: string | null;
  shippingAddress: string | null;
  shippingPostcode: string | null;
  shippingCity: string | null;
  shippingProvince: string | null;
  subtotal: string;
  vatAmount: string;
  shippingCost: string;
  total: string;
  paymentMethod: string | null;
  paymentStatus: string;
  paymentRef: string | null;
  status: string;
  notes: string | null;
  adminNotes: string | null;
  easyfattExported: boolean;
  easyfattDate: string | null;
  crmOrderId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: number | null;
  productCode: string;
  productName: string;
  productBrand: string | null;
  unit: string | null;
  qty: number;
  priceUnit: string;
  discountPct: string;
  vatPct: string;
  lineTotal: string;
}

interface OrderCustomer {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  customerType: string;
  vatNumber: string | null;
  fiscalCode: string | null;
  sdiCode: string | null;
  pecEmail: string | null;
  phone: string | null;
  address: string | null;
  postcode: string | null;
  city: string | null;
  province: string | null;
  priceList: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Stats {
  totalOrders: number;
  totalRevenue: string;
  todayOrders: number;
  todayRevenue: string;
}

const statusOptions = ['nuovo', 'confermato', 'in_preparazione', 'spedito', 'consegnato', 'annullato'];

const statusLabels: Record<string, string> = {
  nuovo: 'Nuovo',
  confermato: 'Confermato',
  in_preparazione: 'In preparazione',
  spedito: 'Spedito',
  consegnato: 'Consegnato',
  annullato: 'Annullato',
};

const statusColors: Record<string, string> = {
  nuovo: 'bg-blue-100 text-blue-800',
  confermato: 'bg-indigo-100 text-indigo-800',
  in_preparazione: 'bg-yellow-100 text-yellow-800',
  spedito: 'bg-purple-100 text-purple-800',
  consegnato: 'bg-green-100 text-green-800',
  annullato: 'bg-red-100 text-red-800',
};

const paymentMethodLabels: Record<string, string> = {
  paypal: 'PayPal',
  teamsystem: 'TeamSystem',
  bonifico: 'Bonifico',
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });

const formatCurrency = (n: string | number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(
    typeof n === 'string' ? parseFloat(n) : n
  );

export default function AdminOrdiniPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, totalPages: 0 });
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: '0', todayOrders: 0, todayRevenue: '0' });

  // Selection for Easyfatt export
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Expanded row
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderCustomer, setOrderCustomer] = useState<OrderCustomer | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Inline editing
  const [editStatus, setEditStatus] = useState('');
  const [editAdminNotes, setEditAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '25');
      if (filterStatus) params.set('status', filterStatus);
      if (search) params.set('search', search);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setPagination(data.pagination || { page: 1, limit: 25, total: 0, totalPages: 0 });
      if (data.stats) setStats(data.stats);
    } catch {
      console.error('Errore nel caricamento ordini');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search, dateFrom, dateTo]);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleExpand = async (orderId: number) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(orderId);
    setDetailLoading(true);
    setOrderDetail(null);

    try {
      const res = await fetch(`/api/admin/orders?id=${orderId}`);
      const data = await res.json();
      setOrderDetail(data.order);
      setOrderItems(data.items || []);
      setOrderCustomer(data.customer);
      setEditStatus(data.order?.status || '');
      setEditAdminNotes(data.order?.adminNotes || '');
    } catch {
      console.error('Errore nel caricamento dettaglio');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSaveOrder = async () => {
    if (!orderDetail) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderDetail.id,
          status: editStatus,
          adminNotes: editAdminNotes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrderDetail(data.order);
        // Update row in list
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderDetail.id ? { ...o, status: editStatus } : o
          )
        );
      }
    } catch {
      console.error('Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleExportEasyfatt = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch('/api/easyfatt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: selectedIds }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `easyfatt-export-${new Date().toISOString().split('T')[0]}.xml`;
        a.click();
        URL.revokeObjectURL(url);
        setSelectedIds([]);
        fetchOrders(pagination.page);
      }
    } catch {
      console.error('Errore export');
    }
  };

  const handleExportEasyfattXlsx = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch('/api/easyfatt/xlsx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: selectedIds }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `easyfatt-import-${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        setSelectedIds([]);
        fetchOrders(pagination.page);
      }
    } catch {
      console.error('Errore export XLSX');
    }
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Gestione Ordini</h1>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package size={20} className="text-blue" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Ordini totali</p>
              <p className="text-xl font-bold text-navy">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Fatturato totale</p>
              <p className="text-xl font-bold text-navy">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <ShoppingBag size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Ordini oggi</p>
              <p className="text-xl font-bold text-navy">{stats.todayOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <CalendarDays size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Fatturato oggi</p>
              <p className="text-xl font-bold text-navy">{formatCurrency(stats.todayRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca ordine, cliente..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-light"
        >
          <option value="">Tutti gli stati</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-light"
          placeholder="Da"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-light"
          placeholder="A"
        />
        {selectedIds.length > 0 && (
          <>
            <button
              onClick={handleExportEasyfatt}
              className="flex items-center gap-2 bg-green-600 text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileDown size={16} />
              XML ({selectedIds.length})
            </button>
            <button
              onClick={handleExportEasyfattXlsx}
              className="flex items-center gap-2 bg-emerald-600 text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <FileSpreadsheet size={16} />
              Excel Easyfatt ({selectedIds.length})
            </button>
          </>
        )}
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Caricamento...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            {search || filterStatus ? 'Nessun ordine trovato per i filtri applicati' : 'Nessun ordine presente'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === orders.length && orders.length > 0}
                        onChange={() =>
                          setSelectedIds(
                            selectedIds.length === orders.length ? [] : orders.map((o) => o.id)
                          )
                        }
                      />
                    </th>
                    <th className="px-4 py-3 w-8"></th>
                    <th className="px-4 py-3 text-left">N. Ordine</th>
                    <th className="px-4 py-3 text-left">Cliente</th>
                    <th className="px-4 py-3 text-left">Data</th>
                    <th className="px-4 py-3 text-right">Totale</th>
                    <th className="px-4 py-3 text-left">Stato</th>
                    <th className="px-4 py-3 text-left">Pagamento</th>
                    <th className="px-4 py-3 text-center">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <>
                      <tr
                        key={order.id}
                        className={`transition-colors ${
                          expandedId === order.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(order.id)}
                            onChange={() => toggleSelect(order.id)}
                          />
                        </td>
                        <td
                          className="px-4 py-3 text-gray-400 cursor-pointer"
                          onClick={() => handleExpand(order.id)}
                        >
                          {expandedId === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </td>
                        <td
                          className="px-4 py-3 font-medium font-mono text-navy cursor-pointer"
                          onClick={() => handleExpand(order.id)}
                        >
                          {order.orderNumber}
                        </td>
                        <td
                          className="px-4 py-3 text-gray-600 cursor-pointer"
                          onClick={() => handleExpand(order.id)}
                        >
                          {order.customerName || order.customerEmail || '-'}
                        </td>
                        <td
                          className="px-4 py-3 text-gray-500 cursor-pointer"
                          onClick={() => handleExpand(order.id)}
                        >
                          {formatDate(order.createdAt)}
                        </td>
                        <td
                          className="px-4 py-3 text-right font-medium cursor-pointer"
                          onClick={() => handleExpand(order.id)}
                        >
                          {formatCurrency(order.total)}
                        </td>
                        <td
                          className="px-4 py-3 cursor-pointer"
                          onClick={() => handleExpand(order.id)}
                        >
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                            {statusLabels[order.status] || order.status}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 cursor-pointer"
                          onClick={() => handleExpand(order.id)}
                        >
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                            order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.paymentStatus === 'paid' ? 'Pagato' : order.paymentStatus === 'failed' ? 'Fallito' : 'In attesa'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs ${order.easyfattExported ? 'text-green-600 font-bold' : 'text-gray-300'}`}>
                            EF {order.easyfattExported ? 'Si' : 'No'}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded detail */}
                      {expandedId === order.id && (
                        <tr key={`detail-${order.id}`}>
                          <td colSpan={9} className="bg-gray-50 border-b">
                            {detailLoading ? (
                              <div className="p-6 text-center text-gray-500">Caricamento dettagli ordine...</div>
                            ) : orderDetail ? (
                              <div className="p-6 space-y-6">
                                {/* Order items table */}
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                  <h3 className="font-heading font-bold text-navy mb-3">Righe ordine</h3>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead className="text-xs text-gray-500 uppercase border-b">
                                        <tr>
                                          <th className="py-2 text-left">Prodotto</th>
                                          <th className="py-2 text-left">Cod.</th>
                                          <th className="py-2 text-right">Qtà</th>
                                          <th className="py-2 text-right">Prezzo unit.</th>
                                          <th className="py-2 text-right">Sconto</th>
                                          <th className="py-2 text-right">IVA</th>
                                          <th className="py-2 text-right">Totale riga</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y">
                                        {orderItems.map((item) => (
                                          <tr key={item.id}>
                                            <td className="py-2">
                                              <div className="font-medium text-navy">{item.productName}</div>
                                              {item.productBrand && (
                                                <div className="text-xs text-gray-400">{item.productBrand}</div>
                                              )}
                                            </td>
                                            <td className="py-2 font-mono text-xs text-gray-500">{item.productCode}</td>
                                            <td className="py-2 text-right font-medium">{item.qty} {item.unit || 'PZ'}</td>
                                            <td className="py-2 text-right">{formatCurrency(item.priceUnit)}</td>
                                            <td className="py-2 text-right">
                                              {parseFloat(item.discountPct) > 0 ? `${item.discountPct}%` : '-'}
                                            </td>
                                            <td className="py-2 text-right text-gray-500">{item.vatPct}%</td>
                                            <td className="py-2 text-right font-medium">{formatCurrency(item.lineTotal)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot className="border-t-2 border-gray-200">
                                        <tr>
                                          <td colSpan={6} className="py-2 text-right text-gray-500">Subtotale</td>
                                          <td className="py-2 text-right font-medium">{formatCurrency(orderDetail.subtotal)}</td>
                                        </tr>
                                        <tr>
                                          <td colSpan={6} className="py-1 text-right text-gray-500">IVA</td>
                                          <td className="py-1 text-right">{formatCurrency(orderDetail.vatAmount)}</td>
                                        </tr>
                                        <tr>
                                          <td colSpan={6} className="py-1 text-right text-gray-500">Spedizione</td>
                                          <td className="py-1 text-right">{formatCurrency(orderDetail.shippingCost || '0')}</td>
                                        </tr>
                                        <tr className="font-bold text-navy">
                                          <td colSpan={6} className="py-2 text-right">Totale</td>
                                          <td className="py-2 text-right text-lg">{formatCurrency(orderDetail.total)}</td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>

                                {/* Two columns: Customer + Payment/Status */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Customer snapshot */}
                                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                                    <h3 className="font-heading font-bold text-navy mb-3">Dati cliente</h3>
                                    {orderCustomer ? (
                                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <dt className="text-gray-500">Nome</dt>
                                        <dd className="font-medium">
                                          {orderCustomer.companyName || `${orderCustomer.firstName || ''} ${orderCustomer.lastName || ''}`.trim() || '-'}
                                        </dd>
                                        <dt className="text-gray-500">Email</dt>
                                        <dd className="font-medium">{orderCustomer.email}</dd>
                                        <dt className="text-gray-500">Telefono</dt>
                                        <dd className="font-medium">{orderCustomer.phone || '-'}</dd>
                                        <dt className="text-gray-500">Tipo</dt>
                                        <dd className="font-medium">{orderCustomer.customerType === 'azienda' ? 'Azienda' : 'Privato'}</dd>
                                        <dt className="text-gray-500">P.IVA</dt>
                                        <dd className="font-medium font-mono text-xs">{orderCustomer.vatNumber || '-'}</dd>
                                        <dt className="text-gray-500">Cod. fiscale</dt>
                                        <dd className="font-medium font-mono text-xs">{orderCustomer.fiscalCode || '-'}</dd>
                                        <dt className="text-gray-500">SDI / PEC</dt>
                                        <dd className="font-medium text-xs">{orderCustomer.sdiCode || '-'} / {orderCustomer.pecEmail || '-'}</dd>
                                        <dt className="text-gray-500">Listino</dt>
                                        <dd className="font-medium">{orderCustomer.priceList || 'standard'}</dd>
                                      </dl>
                                    ) : (
                                      <div className="text-sm">
                                        <p className="font-medium">{orderDetail.customerName || '-'}</p>
                                        <p className="text-gray-500">{orderDetail.customerEmail || '-'}</p>
                                        {orderDetail.customerVat && (
                                          <p className="text-xs text-gray-400 font-mono">P.IVA: {orderDetail.customerVat}</p>
                                        )}
                                      </div>
                                    )}

                                    {/* Shipping address */}
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                      <h4 className="text-sm font-bold text-gray-700 mb-1">Indirizzo spedizione</h4>
                                      <p className="text-sm text-gray-600">
                                        {orderDetail.shippingAddress || '-'}
                                        {orderDetail.shippingPostcode && `, ${orderDetail.shippingPostcode}`}
                                        {orderDetail.shippingCity && ` ${orderDetail.shippingCity}`}
                                        {orderDetail.shippingProvince && ` (${orderDetail.shippingProvince})`}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Payment & Status */}
                                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                                    <h3 className="font-heading font-bold text-navy mb-3">Pagamento e stato</h3>
                                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                                      <dt className="text-gray-500">Metodo pagamento</dt>
                                      <dd className="font-medium">{paymentMethodLabels[orderDetail.paymentMethod || ''] || orderDetail.paymentMethod || '-'}</dd>
                                      <dt className="text-gray-500">Stato pagamento</dt>
                                      <dd>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                          orderDetail.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                          orderDetail.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                                          'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {orderDetail.paymentStatus === 'paid' ? 'Pagato' : orderDetail.paymentStatus === 'failed' ? 'Fallito' : 'In attesa'}
                                        </span>
                                      </dd>
                                      <dt className="text-gray-500">Rif. pagamento</dt>
                                      <dd className="font-medium font-mono text-xs">{orderDetail.paymentRef || '-'}</dd>
                                      <dt className="text-gray-500">Easyfatt</dt>
                                      <dd className="font-medium">
                                        {orderDetail.easyfattExported ? (
                                          <span className="text-green-600">
                                            Esportato {orderDetail.easyfattDate ? `il ${formatDate(orderDetail.easyfattDate)}` : ''}
                                          </span>
                                        ) : (
                                          <span className="text-gray-400">Non esportato</span>
                                        )}
                                      </dd>
                                      {orderDetail.crmOrderId && (
                                        <>
                                          <dt className="text-gray-500">CRM ID</dt>
                                          <dd className="font-medium font-mono text-xs">{orderDetail.crmOrderId}</dd>
                                        </>
                                      )}
                                      {orderDetail.notes && (
                                        <>
                                          <dt className="text-gray-500">Note cliente</dt>
                                          <dd className="font-medium">{orderDetail.notes}</dd>
                                        </>
                                      )}
                                    </dl>

                                    {/* Editable status and notes */}
                                    <div className="border-t border-gray-100 pt-4 space-y-3">
                                      <div>
                                        <label className="text-sm text-gray-500 font-medium block mb-1">Stato ordine</label>
                                        <select
                                          value={editStatus}
                                          onChange={(e) => setEditStatus(e.target.value)}
                                          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                        >
                                          {statusOptions.map((s) => (
                                            <option key={s} value={s}>{statusLabels[s]}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div>
                                        <label className="text-sm text-gray-500 font-medium block mb-1">Note admin</label>
                                        <textarea
                                          value={editAdminNotes}
                                          onChange={(e) => setEditAdminNotes(e.target.value)}
                                          rows={3}
                                          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light resize-none"
                                          placeholder="Note interne..."
                                        />
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={handleSaveOrder}
                                          disabled={saving}
                                          className="flex items-center gap-1 px-4 py-2 bg-blue text-white text-sm font-bold rounded-lg hover:bg-blue-light disabled:opacity-50 transition-colors"
                                        >
                                          <Save size={14} />
                                          {saving ? 'Salvataggio...' : 'Salva modifiche'}
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (selectedIds.includes(orderDetail.id)) return;
                                            setSelectedIds((prev) => [...prev, orderDetail.id]);
                                          }}
                                          className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                          <FileDown size={14} />
                                          XML
                                        </button>
                                        <button
                                          onClick={async () => {
                                            const res = await fetch('/api/easyfatt/xlsx', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ orderIds: [orderDetail.id] }),
                                            });
                                            if (res.ok) {
                                              const blob = await res.blob();
                                              const url = URL.createObjectURL(blob);
                                              const a = document.createElement('a');
                                              a.href = url;
                                              a.download = `easyfatt-import-${orderDetail.orderNumber}.xlsx`;
                                              a.click();
                                              URL.revokeObjectURL(url);
                                              fetchOrders(pagination.page);
                                            }
                                          }}
                                          className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                                        >
                                          <FileSpreadsheet size={14} />
                                          Excel Easyfatt
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Pagina {pagination.page} di {pagination.totalPages} &middot; {pagination.total} ordini totali
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fetchOrders(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 4) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 3) {
                      pageNum = pagination.totalPages - 6 + i;
                    } else {
                      pageNum = pagination.page - 3 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchOrders(pageNum)}
                        className={`px-3 py-1 text-sm rounded-lg ${
                          pageNum === pagination.page
                            ? 'bg-blue text-white font-bold'
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => fetchOrders(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
