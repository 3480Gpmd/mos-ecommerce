'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search, Plus, Trash2, X, Edit2, Eye, Mail, Image as ImageIcon, Tag, ChevronDown, ChevronUp,
} from 'lucide-react';

interface Campaign {
  id: number;
  name: string;
  description?: string;
  type: string;
  status: string;
  targetType: string;
  targetValue?: string;
  discountType?: string;
  discountValue?: number;
  minOrderAmount?: number;
  startDate?: string;
  endDate?: string;
  emailSubject?: string;
  emailBody?: string;
  bannerImageUrl?: string;
  bannerLink?: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
  conversionCount: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Product {
  id: number;
  code: string;
  name: string;
  pricePublic?: string | number;
}

interface CampaignProduct {
  id: number;
  campaignId: number;
  productId: number;
  product?: Product;
}

const formatCurrency = (n: string | number | null) => {
  if (n === null || n === undefined) return '-';
  const num = typeof n === 'string' ? parseFloat(n) : n;
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
};

const typeLabel = (type: string): string => {
  const labels: { [key: string]: string } = {
    email: 'Email',
    banner: 'Banner',
    discount: 'Sconto',
    bundle: 'Bundle',
  };
  return labels[type] || type;
};

const typeIcon = (type: string) => {
  switch (type) {
    case 'email':
      return <Mail size={16} />;
    case 'banner':
      return <ImageIcon size={16} />;
    case 'discount':
      return <Tag size={16} />;
    default:
      return null;
  }
};

const typeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    email: 'bg-blue-100 text-blue-800',
    banner: 'bg-purple-100 text-purple-800',
    discount: 'bg-green-100 text-green-800',
    bundle: 'bg-orange-100 text-orange-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

const statusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const statusLabel = (status: string): string => {
  const labels: { [key: string]: string } = {
    draft: 'Bozza',
    active: 'Attiva',
    paused: 'Sospesa',
    completed: 'Completata',
  };
  return labels[status] || status;
};

export default function CampagnePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  // Detail modal
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignProducts, setCampaignProducts] = useState<CampaignProduct[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Edit form
  const [editData, setEditData] = useState<Partial<Campaign>>({});
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState<Product[]>([]);

  // New campaign modal
  const [showNew, setShowNew] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    type: 'email',
    status: 'draft',
    targetType: 'all',
    discountType: 'percentage',
  });

  const fetchCampaigns = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (typeFilter) params.set('type', typeFilter);
    params.set('page', String(page));
    params.set('limit', '50');

    try {
      const res = await fetch(`/api/admin/campaigns?${params}`);
      const data = await res.json();
      setCampaigns(data.campaigns || []);
      setPagination({
        page,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      });
    } catch {
      console.error('Errore caricamento campagne');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchCampaigns(1);
  }, [fetchCampaigns]);

  const handleExpand = async (campaign: Campaign) => {
    if (expandedId === campaign.id) {
      setExpandedId(null);
      setSelectedCampaign(null);
      return;
    }

    setExpandedId(campaign.id);
    setSelectedCampaign(campaign);
    setEditData({
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      status: campaign.status,
      targetType: campaign.targetType,
      discountType: campaign.discountType,
      discountValue: campaign.discountValue,
      minOrderAmount: campaign.minOrderAmount,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      emailSubject: campaign.emailSubject,
      emailBody: campaign.emailBody,
      bannerImageUrl: campaign.bannerImageUrl,
      bannerLink: campaign.bannerLink,
    });

    // Fetch campaign products
    try {
      const res = await fetch(`/api/admin/campaigns?id=${campaign.id}`);
      const data = await res.json();
      if (data.campaign?.campaignProducts) {
        setCampaignProducts(data.campaign.campaignProducts);
      }
    } catch {
      console.error('Errore caricamento prodotti campagna');
    }
  };

  const handleSave = async () => {
    if (!expandedId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: expandedId, ...editData }),
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns((prev) => prev.map((c) => c.id === expandedId ? data.campaign : c));
        if (selectedCampaign) {
          setSelectedCampaign(data.campaign);
        }
      }
    } catch {
      console.error('Errore salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (campaignId: number, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaignId, status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns((prev) => prev.map((c) => c.id === campaignId ? data.campaign : c));
      }
    } catch {
      console.error('Errore cambio status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questa campagna?')) return;
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
        setExpandedId(null);
        setSelectedCampaign(null);
      }
    } catch {
      console.error('Errore eliminazione');
    }
  };

  const handleSearchProducts = useCallback(async (q: string) => {
    if (!q.trim()) {
      setProductResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/admin/products?q=${encodeURIComponent(q)}&limit=10`);
      const data = await res.json();
      setProductResults(data.products || []);
    } catch {
      console.error('Errore ricerca');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearchProducts(productSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch, handleSearchProducts]);

  const handleAddProduct = (product: Product) => {
    if (!selectedCampaign?.id) return;
    setCampaignProducts((prev) => [
      ...prev,
      { id: 0, campaignId: selectedCampaign.id, productId: product.id, product },
    ]);
    setProductSearch('');
    setProductResults([]);
  };

  const handleRemoveProduct = (productId: number) => {
    setCampaignProducts((prev) => prev.filter((p) => p.productId !== productId));
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.type) return;
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign),
      });
      if (res.ok) {
        setShowNew(false);
        setNewCampaign({
          name: '',
          description: '',
          type: 'email',
          status: 'draft',
          targetType: 'all',
          discountType: 'percentage',
        });
        fetchCampaigns(1);
      }
    } catch {
      console.error('Errore creazione');
    }
  };

  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length;
  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversionCount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">
          Campagne Marketing
        </h1>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-blue text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-blue-light transition-colors"
        >
          <Plus size={16} />
          Nuova campagna
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="text-xs text-gray-500 uppercase font-medium">Campagne Attive</div>
          <div className="text-2xl font-bold text-navy mt-1">{activeCampaigns}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue">
          <div className="text-xs text-gray-500 uppercase font-medium">Email Inviate</div>
          <div className="text-2xl font-bold text-navy mt-1">{totalSent.toLocaleString('it-IT')}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
          <div className="text-xs text-gray-500 uppercase font-medium">Conversioni Totali</div>
          <div className="text-2xl font-bold text-navy mt-1">{totalConversions.toLocaleString('it-IT')}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-light"
        >
          <option value="">Tutti gli stati</option>
          <option value="draft">Bozza</option>
          <option value="active">Attiva</option>
          <option value="paused">Sospesa</option>
          <option value="completed">Completata</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-light"
        >
          <option value="">Tutti i tipi</option>
          <option value="email">Email</option>
          <option value="banner">Banner</option>
          <option value="discount">Sconto</option>
          <option value="bundle">Bundle</option>
        </select>
      </div>

      {/* Campaigns table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Caricamento...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Tag size={48} className="mx-auto mb-4 text-gray-300" />
            Nessuna campagna trovata
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 w-8"></th>
                    <th className="px-4 py-3 text-left">Nome</th>
                    <th className="px-4 py-3 text-left">Tipo</th>
                    <th className="px-4 py-3 text-left">Target</th>
                    <th className="px-4 py-3 text-left">Data inizio</th>
                    <th className="px-4 py-3 text-right">Inviate</th>
                    <th className="px-4 py-3 text-right">Aperture</th>
                    <th className="px-4 py-3 text-right">Click</th>
                    <th className="px-4 py-3 text-right">Conversioni</th>
                    <th className="px-4 py-3 text-center">Stato</th>
                    <th className="px-4 py-3 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {campaigns.map((campaign) => (
                    <>
                      <tr
                        key={campaign.id}
                        onClick={() => handleExpand(campaign)}
                        className={`cursor-pointer transition-colors ${
                          expandedId === campaign.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-400">
                          {expandedId === campaign.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </td>
                        <td className="px-4 py-3 font-medium">{campaign.name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded inline-flex items-center gap-1 ${typeColor(campaign.type)}`}>
                            {typeIcon(campaign.type)}
                            {typeLabel(campaign.type)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{campaign.targetType}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString('it-IT') : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">{campaign.sentCount}</td>
                        <td className="px-4 py-3 text-right text-blue">{campaign.openCount}</td>
                        <td className="px-4 py-3 text-right text-green-700">{campaign.clickCount}</td>
                        <td className="px-4 py-3 text-right font-medium text-navy">{campaign.conversionCount}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded ${statusColor(campaign.status)}`}>
                            {statusLabel(campaign.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(campaign.id);
                            }}
                            className="text-red hover:text-red-dark transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded detail */}
                      {expandedId === campaign.id && selectedCampaign && (
                        <tr key={`detail-${campaign.id}`}>
                          <td colSpan={11} className="bg-gray-50 border-b">
                            <div className="p-6 space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Nome</label>
                                  <input
                                    type="text"
                                    value={String(editData.name || '')}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Tipo</label>
                                  <select
                                    value={String(editData.type || 'email')}
                                    onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                  >
                                    <option value="email">Email</option>
                                    <option value="banner">Banner</option>
                                    <option value="discount">Sconto</option>
                                    <option value="bundle">Bundle</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Stato</label>
                                  <select
                                    value={String(editData.status || 'draft')}
                                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                  >
                                    <option value="draft">Bozza</option>
                                    <option value="active">Attiva</option>
                                    <option value="paused">Sospesa</option>
                                    <option value="completed">Completata</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Target Type</label>
                                  <select
                                    value={String(editData.targetType || 'all')}
                                    onChange={(e) => setEditData({ ...editData, targetType: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                  >
                                    <option value="all">Tutti</option>
                                    <option value="segment">Segmento</option>
                                    <option value="purchased_product">Prodotto acquistato</option>
                                    <option value="purchased_category">Categoria acquistata</option>
                                    <option value="inactive_customers">Clienti inattivi</option>
                                    <option value="top_spenders">Clienti top</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Data inizio</label>
                                  <input
                                    type="datetime-local"
                                    value={String(editData.startDate || '').slice(0, 16)}
                                    onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Data fine</label>
                                  <input
                                    type="datetime-local"
                                    value={String(editData.endDate || '').slice(0, 16)}
                                    onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Descrizione</label>
                                <textarea
                                  value={String(editData.description || '')}
                                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                  rows={3}
                                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light resize-none"
                                />
                              </div>

                              {/* Email content (if type = email) */}
                              {editData.type === 'email' && (
                                <>
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Oggetto email</label>
                                    <input
                                      type="text"
                                      value={String(editData.emailSubject || '')}
                                      onChange={(e) => setEditData({ ...editData, emailSubject: e.target.value })}
                                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Corpo email</label>
                                    <textarea
                                      value={String(editData.emailBody || '')}
                                      onChange={(e) => setEditData({ ...editData, emailBody: e.target.value })}
                                      rows={5}
                                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light resize-none"
                                    />
                                  </div>
                                </>
                              )}

                              {/* Banner config (if type = banner) */}
                              {editData.type === 'banner' && (
                                <>
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">URL immagine</label>
                                    <input
                                      type="url"
                                      value={String(editData.bannerImageUrl || '')}
                                      onChange={(e) => setEditData({ ...editData, bannerImageUrl: e.target.value })}
                                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                      placeholder="https://..."
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Link</label>
                                    <input
                                      type="url"
                                      value={String(editData.bannerLink || '')}
                                      onChange={(e) => setEditData({ ...editData, bannerLink: e.target.value })}
                                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                      placeholder="https://..."
                                    />
                                  </div>
                                </>
                              )}

                              {/* Discount config (if type = discount) */}
                              {editData.type === 'discount' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Tipo sconto</label>
                                    <select
                                      value={String(editData.discountType || 'percentage')}
                                      onChange={(e) => setEditData({ ...editData, discountType: e.target.value })}
                                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                    >
                                      <option value="percentage">Percentuale %</option>
                                      <option value="fixed">Importo fisso €</option>
                                      <option value="free_shipping">Spedizione gratis</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Valore</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={String(editData.discountValue || '')}
                                      onChange={(e) => setEditData({ ...editData, discountValue: parseFloat(e.target.value) || 0 })}
                                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Ordine minimo</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={String(editData.minOrderAmount || '')}
                                      onChange={(e) => setEditData({ ...editData, minOrderAmount: parseFloat(e.target.value) || 0 })}
                                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Products */}
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase block mb-2">Prodotti collegati</label>

                                {/* Product search */}
                                <div className="relative mb-3">
                                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                  <input
                                    type="text"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    placeholder="Cerca prodotto..."
                                    className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-light"
                                  />

                                  {productSearch.length > 2 && productResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                                      {productResults.map((product) => (
                                        <button
                                          key={product.id}
                                          onClick={() => {
                                            handleAddProduct(product);
                                          }}
                                          className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                                        >
                                          <div className="font-medium text-sm">{product.name}</div>
                                          <div className="text-xs text-gray-500">{product.code}</div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Selected products */}
                                {campaignProducts.length > 0 && (
                                  <div className="space-y-2">
                                    {campaignProducts.map((cp) => (
                                      <div
                                        key={cp.productId}
                                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                                      >
                                        <div>
                                          <div className="font-medium text-sm">{cp.product?.name}</div>
                                          <div className="text-xs text-gray-500">{cp.product?.code}</div>
                                        </div>
                                        <button
                                          onClick={() => handleRemoveProduct(cp.productId)}
                                          className="text-red hover:text-red-dark transition-colors"
                                        >
                                          <X size={16} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2 pt-2">
                                <button
                                  onClick={handleSave}
                                  disabled={saving}
                                  className="flex items-center gap-1 px-4 py-2 bg-blue text-white text-sm font-bold rounded-lg hover:bg-blue-light disabled:opacity-50 transition-colors"
                                >
                                  <Edit2 size={14} />
                                  {saving ? 'Salvataggio...' : 'Salva modifiche'}
                                </button>
                              </div>
                            </div>
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
                  Pagina {pagination.page} di {pagination.totalPages}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* New campaign modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg">Nuova campagna</h2>
              <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Nome *</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Descrizione</label>
                <textarea
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  rows={3}
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Tipo *</label>
                  <select
                    value={newCampaign.type}
                    onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value })}
                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                  >
                    <option value="email">Email</option>
                    <option value="banner">Banner</option>
                    <option value="discount">Sconto</option>
                    <option value="bundle">Bundle</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Stato</label>
                  <select
                    value={newCampaign.status}
                    onChange={(e) => setNewCampaign({ ...newCampaign, status: e.target.value })}
                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                  >
                    <option value="draft">Bozza</option>
                    <option value="active">Attiva</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleCreateCampaign}
                disabled={!newCampaign.name || !newCampaign.type}
                className="w-full flex items-center justify-center gap-2 bg-blue text-white font-bold py-2.5 rounded-lg hover:bg-blue-light disabled:opacity-50 transition-colors"
              >
                <Plus size={16} />
                Crea campagna
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
