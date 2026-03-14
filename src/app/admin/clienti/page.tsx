'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Save, Package, ShoppingCart, TrendingUp, Phone, Mail, MapPin, StickyNote, Bell, Check, Plus } from 'lucide-react';

interface CustomerRow {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  customerType: string;
  vatNumber: string | null;
  priceList: string | null;
  isActive: boolean;
  role: string;
  phone: string | null;
  city: string | null;
  province: string | null;
  createdAt: string;
  totalOrders: number;
  totalSpent: string;
  lastOrder: string | null;
}

interface CustomerDetail {
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
  easyfattCode: string | null;
  crmId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RecentOrder {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: string;
  createdAt: string;
  itemCount: number;
}

interface TopProduct {
  productCode: string;
  productName: string;
  totalQty: number;
  totalSpent: string;
  orderCount: number;
}

interface CustomerNoteRow {
  id: number;
  customerId: number;
  content: string;
  type: string;
  reminderDate: string | null;
  isCompleted: boolean;
  createdAt: string;
}

interface PriceListOption {
  id: number;
  code: string;
  name: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

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

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });

const formatCurrency = (n: string | number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(
    typeof n === 'string' ? parseFloat(n) : n
  );

export default function AdminClientiPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, totalPages: 0 });

  // Expanded row state
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [detailStats, setDetailStats] = useState<{ totalOrders: number; totalSpent: string; lastOrder: string | null } | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [priceLists, setPriceLists] = useState<PriceListOption[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedPriceList, setSelectedPriceList] = useState('');
  const [saving, setSaving] = useState(false);

  // Note state
  const [notes, setNotes] = useState<CustomerNoteRow[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState('nota');
  const [noteReminder, setNoteReminder] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  const fetchCustomers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '25');
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/customers?${params}`);
      const data = await res.json();
      setCustomers(data.customers || []);
      setPagination(data.pagination || { page: 1, limit: 25, total: 0, totalPages: 0 });
    } catch {
      console.error('Errore nel caricamento clienti');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCustomers(1);
  }, [fetchCustomers]);

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
    setDetailLoading(true);
    setDetail(null);

    try {
      const res = await fetch(`/api/admin/customers?id=${customerId}`);
      const data = await res.json();
      setDetail(data.customer);
      setDetailStats(data.stats);
      setRecentOrders(data.recentOrders || []);
      setTopProducts(data.topProducts || []);
      setPriceLists(data.priceLists || []);
      setSelectedPriceList(data.customer?.priceList || 'standard');
      fetchNotes(customerId);
    } catch {
      console.error('Errore nel caricamento dettaglio');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSavePriceList = async () => {
    if (!detail) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: detail.id, priceList: selectedPriceList }),
      });
      if (res.ok) {
        setDetail({ ...detail, priceList: selectedPriceList });
        // Update in list
        setCustomers((prev) =>
          prev.map((c) => (c.id === detail.id ? { ...c, priceList: selectedPriceList } : c))
        );
      }
    } catch {
      console.error('Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const fetchNotes = async (customerId: number) => {
    setNotesLoading(true);
    try {
      const res = await fetch(`/api/admin/notes?customerId=${customerId}`);
      const data = await res.json();
      setNotes(data.notes || []);
    } catch { setNotes([]); }
    finally { setNotesLoading(false); }
  };

  const handleAddNote = async (customerId: number) => {
    if (!noteText.trim()) return;
    setNoteSaving(true);
    try {
      await fetch('/api/admin/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          content: noteText.trim(),
          type: noteType,
          reminderDate: noteReminder || undefined,
        }),
      });
      setNoteText('');
      setNoteReminder('');
      setNoteType('nota');
      fetchNotes(customerId);
    } catch { /* ignore */ }
    finally { setNoteSaving(false); }
  };

  const handleCompleteNote = async (noteId: number, customerId: number) => {
    await fetch('/api/admin/notes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: noteId, isCompleted: true }),
    });
    fetchNotes(customerId);
  };

  const noteTypeIcons: Record<string, React.ReactNode> = {
    nota: <StickyNote size={14} />,
    chiamata: <Phone size={14} />,
    visita: <MapPin size={14} />,
    email: <Mail size={14} />,
    promemoria: <Bell size={14} />,
  };

  const noteTypeColors: Record<string, string> = {
    nota: 'bg-gray-100 text-gray-700',
    chiamata: 'bg-blue-100 text-blue-700',
    visita: 'bg-green-100 text-green-700',
    email: 'bg-purple-100 text-purple-700',
    promemoria: 'bg-orange-100 text-orange-700',
  };

  const customerName = (c: { companyName: string | null; firstName: string | null; lastName: string | null }) =>
    c.companyName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || '-';

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">
        Gestione Clienti
        {!loading && <span className="text-base font-normal text-gray-500 ml-2">({pagination.total})</span>}
      </h1>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca per nome, email, azienda, P.IVA..."
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
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            {search ? 'Nessun cliente trovato per la ricerca' : 'Nessun cliente registrato'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left w-8"></th>
                    <th className="px-4 py-3 text-left">Nome</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Tipo</th>
                    <th className="px-4 py-3 text-left">Azienda</th>
                    <th className="px-4 py-3 text-left">P.IVA</th>
                    <th className="px-4 py-3 text-left">Listino</th>
                    <th className="px-4 py-3 text-center">Stato</th>
                    <th className="px-4 py-3 text-left">Data registrazione</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customers.map((c) => (
                    <>
                      <tr
                        key={c.id}
                        onClick={() => handleExpand(c.id)}
                        className={`cursor-pointer transition-colors ${
                          expandedId === c.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-400">
                          {expandedId === c.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </td>
                        <td className="px-4 py-3 font-medium text-navy">
                          {customerName(c)}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{c.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              c.customerType === 'azienda'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {c.customerType === 'azienda' ? 'Azienda' : 'Privato'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{c.companyName || '-'}</td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">{c.vatNumber || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {c.priceList || 'standard'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={async () => {
                              const res = await fetch('/api/admin/customers', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: c.id, isActive: !c.isActive }),
                              });
                              if (res.ok) {
                                setCustomers((prev) =>
                                  prev.map((x) => x.id === c.id ? { ...x, isActive: !c.isActive } : x)
                                );
                              }
                            }}
                            className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                              c.isActive
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red/10 text-red hover:bg-red/20'
                            }`}
                          >
                            {c.isActive ? 'Attivo' : 'Inattivo'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {formatDate(c.createdAt)}
                        </td>
                      </tr>

                      {/* Expanded detail */}
                      {expandedId === c.id && (
                        <tr key={`detail-${c.id}`}>
                          <td colSpan={9} className="bg-gray-50 border-b">
                            {detailLoading ? (
                              <div className="p-6 text-center text-gray-500">Caricamento dettagli...</div>
                            ) : detail ? (
                              <div className="p-6 space-y-6">
                                {/* Stats cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-blue-50 rounded-lg">
                                        <Package size={20} className="text-blue" />
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium">Ordini totali</p>
                                        <p className="text-xl font-bold text-navy">{detailStats?.totalOrders ?? 0}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-green-50 rounded-lg">
                                        <TrendingUp size={20} className="text-green-600" />
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium">Totale speso</p>
                                        <p className="text-xl font-bold text-navy">
                                          {formatCurrency(detailStats?.totalSpent || '0')}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-purple-50 rounded-lg">
                                        <ShoppingCart size={20} className="text-purple-600" />
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium">Ultimo ordine</p>
                                        <p className="text-xl font-bold text-navy">
                                          {detailStats?.lastOrder ? formatDate(detailStats.lastOrder) : 'Mai'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Detail sections in two columns */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Left: Customer info */}
                                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                                    <h3 className="font-heading font-bold text-navy mb-3">Dati cliente</h3>
                                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                      <dt className="text-gray-500">Nome</dt>
                                      <dd className="font-medium">{detail.firstName || '-'} {detail.lastName || ''}</dd>
                                      <dt className="text-gray-500">Azienda</dt>
                                      <dd className="font-medium">{detail.companyName || '-'}</dd>
                                      <dt className="text-gray-500">Email</dt>
                                      <dd className="font-medium">{detail.email}</dd>
                                      <dt className="text-gray-500">Telefono</dt>
                                      <dd className="font-medium">{detail.phone || '-'}</dd>
                                      <dt className="text-gray-500">Tipo</dt>
                                      <dd className="font-medium">{detail.customerType === 'azienda' ? 'Azienda' : 'Privato'}</dd>
                                      <dt className="text-gray-500">P.IVA</dt>
                                      <dd className="font-medium font-mono text-xs">{detail.vatNumber || '-'}</dd>
                                      <dt className="text-gray-500">Codice fiscale</dt>
                                      <dd className="font-medium font-mono text-xs">{detail.fiscalCode || '-'}</dd>
                                      <dt className="text-gray-500">SDI</dt>
                                      <dd className="font-medium font-mono text-xs">{detail.sdiCode || '-'}</dd>
                                      <dt className="text-gray-500">PEC</dt>
                                      <dd className="font-medium">{detail.pecEmail || '-'}</dd>
                                      <dt className="text-gray-500">Indirizzo</dt>
                                      <dd className="font-medium">{detail.address || '-'}</dd>
                                      <dt className="text-gray-500">CAP / Citta / Prov.</dt>
                                      <dd className="font-medium">
                                        {[detail.postcode, detail.city, detail.province].filter(Boolean).join(', ') || '-'}
                                      </dd>
                                      <dt className="text-gray-500">Cod. Easyfatt</dt>
                                      <dd className="font-medium font-mono text-xs">{detail.easyfattCode || '-'}</dd>
                                      <dt className="text-gray-500">CRM ID</dt>
                                      <dd className="font-medium font-mono text-xs">{detail.crmId || '-'}</dd>
                                    </dl>

                                    {/* Price list selector */}
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                      <label className="text-sm text-gray-500 font-medium block mb-1">Listino assegnato</label>
                                      <div className="flex items-center gap-2">
                                        <select
                                          value={selectedPriceList}
                                          onChange={(e) => setSelectedPriceList(e.target.value)}
                                          className="text-sm border border-gray-200 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                        >
                                          <option value="standard">Standard</option>
                                          {priceLists.map((pl) => (
                                            <option key={pl.id} value={pl.code}>
                                              {pl.name}
                                            </option>
                                          ))}
                                        </select>
                                        <button
                                          onClick={handleSavePriceList}
                                          disabled={saving || selectedPriceList === detail.priceList}
                                          className="flex items-center gap-1 px-3 py-2 bg-blue text-white text-sm font-bold rounded-lg hover:bg-blue-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                          <Save size={14} />
                                          {saving ? 'Salvataggio...' : 'Salva'}
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right: Top products */}
                                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                                    <h3 className="font-heading font-bold text-navy mb-3">Prodotti piu acquistati</h3>
                                    {topProducts.length === 0 ? (
                                      <p className="text-sm text-gray-500">Nessun acquisto</p>
                                    ) : (
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                          <thead className="text-xs text-gray-500 uppercase border-b">
                                            <tr>
                                              <th className="py-2 text-left">Prodotto</th>
                                              <th className="py-2 text-right">Qtà</th>
                                              <th className="py-2 text-right">Totale</th>
                                              <th className="py-2 text-right">Ordini</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y">
                                            {topProducts.map((p, idx) => (
                                              <tr key={idx}>
                                                <td className="py-2">
                                                  <div className="font-medium text-navy truncate max-w-[200px]">{p.productName}</div>
                                                  <div className="text-xs text-gray-400 font-mono">{p.productCode}</div>
                                                </td>
                                                <td className="py-2 text-right font-medium">{p.totalQty}</td>
                                                <td className="py-2 text-right">{formatCurrency(p.totalSpent)}</td>
                                                <td className="py-2 text-right text-gray-500">{p.orderCount}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Recent orders */}
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                  <h3 className="font-heading font-bold text-navy mb-3">Ordini recenti</h3>
                                  {recentOrders.length === 0 ? (
                                    <p className="text-sm text-gray-500">Nessun ordine</p>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-sm">
                                        <thead className="text-xs text-gray-500 uppercase border-b">
                                          <tr>
                                            <th className="py-2 text-left">N. Ordine</th>
                                            <th className="py-2 text-left">Data</th>
                                            <th className="py-2 text-right">Totale</th>
                                            <th className="py-2 text-left">Stato</th>
                                            <th className="py-2 text-left">Pagamento</th>
                                            <th className="py-2 text-right">Articoli</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                          {recentOrders.map((o) => (
                                            <tr key={o.id}>
                                              <td className="py-2 font-medium font-mono text-navy">{o.orderNumber}</td>
                                              <td className="py-2 text-gray-600">{formatDate(o.createdAt)}</td>
                                              <td className="py-2 text-right font-medium">{formatCurrency(o.total)}</td>
                                              <td className="py-2">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[o.status] || 'bg-gray-100 text-gray-600'}`}>
                                                  {statusLabels[o.status] || o.status}
                                                </span>
                                              </td>
                                              <td className="py-2">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                  o.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                                  o.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                                                  'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                  {o.paymentStatus === 'paid' ? 'Pagato' : o.paymentStatus === 'failed' ? 'Fallito' : 'In attesa'}
                                                </span>
                                              </td>
                                              <td className="py-2 text-right text-gray-500">{o.itemCount}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>

                                {/* Note e attività */}
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                  <h3 className="font-heading font-bold text-navy mb-3 flex items-center gap-2">
                                    <StickyNote size={18} />
                                    Note e Attività
                                  </h3>

                                  {/* Form nuova nota */}
                                  <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                                    <select
                                      value={noteType}
                                      onChange={(e) => setNoteType(e.target.value)}
                                      className="text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                    >
                                      <option value="nota">📝 Nota</option>
                                      <option value="chiamata">📞 Chiamata</option>
                                      <option value="visita">📍 Visita</option>
                                      <option value="email">📧 Email</option>
                                      <option value="promemoria">🔔 Promemoria</option>
                                    </select>
                                    <input
                                      type="text"
                                      placeholder="Scrivi una nota..."
                                      value={noteText}
                                      onChange={(e) => setNoteText(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && detail && handleAddNote(detail.id)}
                                      className="flex-1 min-w-[200px] text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                    />
                                    {noteType === 'promemoria' && (
                                      <input
                                        type="date"
                                        value={noteReminder}
                                        onChange={(e) => setNoteReminder(e.target.value)}
                                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                      />
                                    )}
                                    <button
                                      onClick={() => detail && handleAddNote(detail.id)}
                                      disabled={noteSaving || !noteText.trim()}
                                      className="flex items-center gap-1 px-3 py-2 bg-blue text-white text-sm font-bold rounded-lg hover:bg-blue-light disabled:opacity-50 transition-colors"
                                    >
                                      <Plus size={14} />
                                      {noteSaving ? '...' : 'Aggiungi'}
                                    </button>
                                  </div>

                                  {/* Lista note */}
                                  {notesLoading ? (
                                    <p className="text-sm text-gray-500">Caricamento note...</p>
                                  ) : notes.length === 0 ? (
                                    <p className="text-sm text-gray-500">Nessuna nota per questo cliente</p>
                                  ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                      {notes.map((n) => (
                                        <div
                                          key={n.id}
                                          className={`flex items-start gap-3 p-3 rounded-lg border ${
                                            n.isCompleted ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200'
                                          }`}
                                        >
                                          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full shrink-0 ${noteTypeColors[n.type] || 'bg-gray-100 text-gray-700'}`}>
                                            {noteTypeIcons[n.type]} {n.type}
                                          </span>
                                          <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${n.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                              {n.content}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                              <span className="text-xs text-gray-400">{formatDate(n.createdAt)}</span>
                                              {n.reminderDate && !n.isCompleted && (
                                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                                  new Date(n.reminderDate) <= new Date() ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                  ⏰ {formatDate(n.reminderDate)}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          {!n.isCompleted && n.type === 'promemoria' && (
                                            <button
                                              onClick={() => detail && handleCompleteNote(n.id, detail.id)}
                                              className="shrink-0 p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                              title="Segna completato"
                                            >
                                              <Check size={16} />
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
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
                  Pagina {pagination.page} di {pagination.totalPages} &middot; {pagination.total} clienti totali
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fetchCustomers(pagination.page - 1)}
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
                        onClick={() => fetchCustomers(pageNum)}
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
                    onClick={() => fetchCustomers(pagination.page + 1)}
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
