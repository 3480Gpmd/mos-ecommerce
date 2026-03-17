'use client';

import { useEffect, useState, useCallback } from 'react';
import { ShoppingBag, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Send, Trash2, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface AbandonedCart {
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerCompany: string | null;
  itemCount: number;
  cartTotal: string;
  lastCartUpdate: string;
  emailSent: boolean;
}

interface CartItem {
  id: number;
  productCode: string;
  productName: string;
  qty: number;
  priceNet: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Stats {
  totalCarts: number;
  totalValue: string;
  emailsSentToday: number;
}

const formatDate = (d: string) => {
  const date = new Date(d);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 60) return `${diffMins}m fa`;
  if (diffHours < 24) return `${diffHours}h fa`;
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatCurrency = (n: string | number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(
    typeof n === 'string' ? parseFloat(n) : n
  );

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, totalPages: 0 });
  const [stats, setStats] = useState<Stats>({ totalCarts: 0, totalValue: '0', emailsSentToday: 0 });

  // Expanded row state
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [cartDetails, setCartDetails] = useState<CartItem[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Action states
  const [sendingEmail, setSendingEmail] = useState<number | null>(null);
  const [clearing, setClearing] = useState<number | null>(null);

  const fetchCarts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '25');
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/abandoned-carts?${params}`);
      const data = await res.json();
      setCarts(data.carts || []);
      setPagination(data.pagination || { page: 1, limit: 25, total: 0, totalPages: 0 });

      // Calculate stats
      const totalValue = (data.carts || []).reduce((sum: number, c: AbandonedCart) => sum + parseFloat(c.cartTotal), 0);
      setStats({
        totalCarts: data.pagination?.total || 0,
        totalValue: totalValue.toString(),
        emailsSentToday: (data.carts || []).filter((c: AbandonedCart) => c.emailSent).length,
      });
    } catch {
      console.error('Errore nel caricamento carrelli abbandonati');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCarts(1);
  }, [fetchCarts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleExpand = async (customerId: number) => {
    if (expandedId === customerId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(customerId);
    setDetailsLoading(true);
    setCartDetails([]);

    try {
      // In a real app, you'd fetch this from the API
      // For now, we'll just use empty details
      setCartDetails([]);
    } catch {
      console.error('Errore nel caricamento dettagli carrello');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSendEmail = async (customerId: number) => {
    setSendingEmail(customerId);
    try {
      const res = await fetch('/api/admin/abandoned-carts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });

      if (res.ok) {
        setCarts((prev) =>
          prev.map((c) => (c.customerId === customerId ? { ...c, emailSent: true } : c))
        );
      }
    } catch {
      console.error('Errore nell\'invio email');
    } finally {
      setSendingEmail(null);
    }
  };

  const handleClearCart = async (customerId: number) => {
    setClearing(customerId);
    try {
      const res = await fetch('/api/admin/abandoned-carts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });

      if (res.ok) {
        setCarts((prev) => prev.filter((c) => c.customerId !== customerId));
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      }
    } catch {
      console.error('Errore nell\'eliminazione carrello');
    } finally {
      setClearing(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">
          Carrelli Abbandonati
          {!loading && <span className="text-base font-normal text-gray-500 ml-2">({pagination.total})</span>}
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red/10 rounded-lg">
              <AlertCircle size={20} className="text-red" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Carrelli abbandonati</p>
              <p className="text-2xl font-bold text-navy">{stats.totalCarts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <ShoppingBag size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Valore totale</p>
              <p className="text-2xl font-bold text-navy">{formatCurrency(stats.totalValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CheckCircle2 size={20} className="text-blue" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Email inviate oggi</p>
              <p className="text-2xl font-bold text-navy">{stats.emailsSentToday}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca per nome, email, azienda..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Caricamento...</div>
        ) : carts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
            {search ? 'Nessun carrello trovato per la ricerca' : 'Nessun carrello abbandonato'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left w-8"></th>
                    <th className="px-4 py-3 text-left">Cliente</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-center">Articoli</th>
                    <th className="px-4 py-3 text-right">Totale</th>
                    <th className="px-4 py-3 text-left">Ultimo aggiornamento</th>
                    <th className="px-4 py-3 text-center">Promemoria inviato</th>
                    <th className="px-4 py-3 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {carts.map((cart) => (
                    <tr
                      key={cart.customerId}
                      onClick={() => handleExpand(cart.customerId)}
                      className={`cursor-pointer transition-colors ${
                        expandedId === cart.customerId ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-400">
                        {expandedId === cart.customerId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </td>
                      <td className="px-4 py-3 font-medium text-navy">{cart.customerName}</td>
                      <td className="px-4 py-3 text-gray-600">{cart.customerEmail}</td>
                      <td className="px-4 py-3 text-center font-medium text-navy">{cart.itemCount}</td>
                      <td className="px-4 py-3 text-right font-medium text-navy">{formatCurrency(cart.cartTotal)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-orange" />
                          {formatDate(cart.lastCartUpdate)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        {cart.emailSent ? (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">
                            <CheckCircle2 size={12} className="inline mr-1" />
                            Sì
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSendEmail(cart.customerId)}
                            disabled={sendingEmail === cart.customerId || cart.emailSent}
                            className="flex items-center gap-1 px-2 py-1.5 bg-blue text-white text-xs font-bold rounded-lg hover:bg-blue-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Invia promemoria email"
                          >
                            <Send size={12} />
                            {sendingEmail === cart.customerId ? '...' : 'Promemoria'}
                          </button>
                          <button
                            onClick={() => handleClearCart(cart.customerId)}
                            disabled={clearing === cart.customerId}
                            className="flex items-center gap-1 px-2 py-1.5 bg-red/10 text-red text-xs font-bold rounded-lg hover:bg-red/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Svuota carrello"
                          >
                            <Trash2 size={12} />
                            {clearing === cart.customerId ? '...' : 'Svuota'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Pagina {pagination.page} di {pagination.totalPages} &middot; {pagination.total} carrelli totali
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fetchCarts(pagination.page - 1)}
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
                        onClick={() => fetchCarts(pageNum)}
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
                    onClick={() => fetchCarts(pagination.page + 1)}
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
