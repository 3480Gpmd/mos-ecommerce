'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { ShoppingCart, Plus, RotateCcw, Package, Loader2, Search, Check, X, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';

interface PurchasedProduct {
  productId: number;
  productName: string;
  productCode: string;
  totalQty: number;
  orderCount: number;
  lastPurchaseDate: string;
  lastPrice: string;
  currentPrice: string;
  imageUrl: string | null;
  unit: string;
  stockAvailable: number;
  isActive: boolean;
  brand: string | null;
}

interface LastOrderItem {
  productId: number;
  productName: string;
  productCode: string | null;
  qty: number;
  priceUnit: string;
}

type SortOption = 'recent' | 'frequency' | 'name';

export default function RiordinaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<PurchasedProduct[]>([]);
  const [lastOrder, setLastOrder] = useState<{ id: number; orderNumber: string; createdAt: string; items: LastOrderItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingMap, setAddingMap] = useState<Record<number, boolean>>({});
  const [addedMap, setAddedMap] = useState<Record<number, boolean>>({});
  const [reorderingAll, setReorderingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [qtyInputs, setQtyInputs] = useState<Record<number, number>>({});
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/riordina');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/orders/my-products')
        .then((r) => r.json())
        .then((data) => {
          const prods = (data.products || []).filter((p: PurchasedProduct) => p.isActive);
          setProducts(prods);
          setLastOrder(data.lastOrder || null);
          // Initialize qty inputs with 1
          const qtyMap: Record<number, number> = {};
          prods.forEach((p: PurchasedProduct) => {
            qtyMap[p.productId] = 1;
          });
          setQtyInputs(qtyMap);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(p =>
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.lastPurchaseDate).getTime() - new Date(a.lastPurchaseDate).getTime();
      } else if (sortBy === 'frequency') {
        return b.orderCount - a.orderCount;
      } else {
        return a.productName.localeCompare(b.productName);
      }
    });
  }, [products, searchTerm, sortBy]);

  const addToCart = async (productId: number, qty: number = 1) => {
    setAddingMap((prev) => ({ ...prev, [productId]: true }));
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, qty }),
      });
      setAddedMap((prev) => ({ ...prev, [productId]: true }));
      setTimeout(() => setAddedMap((prev) => ({ ...prev, [productId]: false })), 2000);
    } catch {}
    setAddingMap((prev) => ({ ...prev, [productId]: false }));
  };

  const addMultipleToCart = async () => {
    if (selectedProducts.size === 0) return;

    const items = Array.from(selectedProducts).map(productId => ({
      productId,
      qty: qtyInputs[productId] || 1,
    }));

    setAddingMap(Object.fromEntries(items.map(item => [item.productId, true])));
    try {
      for (const item of items) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      }
      items.forEach(item => {
        setAddedMap((prev) => ({ ...prev, [item.productId]: true }));
      });
      setTimeout(() => {
        setSelectedProducts(new Set());
        items.forEach(item => {
          setAddedMap((prev) => ({ ...prev, [item.productId]: false }));
        });
      }, 2000);
    } catch {}
    setAddingMap(Object.fromEntries(items.map(item => [item.productId, false])));
  };

  const reorderLastOrder = async () => {
    if (!lastOrder?.items.length) return;
    setReorderingAll(true);
    try {
      for (const item of lastOrder.items) {
        if (item.productId) {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: item.productId, qty: item.qty }),
          });
        }
      }
      router.push('/carrello');
    } catch {}
    setReorderingAll(false);
  };

  const getStockStatus = (product: PurchasedProduct) => {
    if ((product.stockAvailable ?? 0) > 5) {
      return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: `Disponibile (${product.stockAvailable})` };
    } else if ((product.stockAvailable ?? 0) > 0) {
      return { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: `Ultime ${product.stockAvailable} pz` };
    } else {
      return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Non disponibile' };
    }
  };

  const toggleProduct = (productId: number) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  if (!session?.user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <PageTitle className="mb-6">Riordina</PageTitle>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue" size={32} />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <Package size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="font-bold text-lg text-gray-700 mb-2">Nessun acquisto precedente</h3>
          <p className="text-gray-500 mb-6">Inizia a ordinare per vedere qui i tuoi prodotti abituali.</p>
          <Link href="/catalogo" className="inline-flex items-center gap-2 bg-blue text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-light transition-colors">
            Vai al catalogo
          </Link>
        </div>
      ) : (
        <>
          {/* Riordina ultimo ordine */}
          {lastOrder && (
            <div className="bg-blue/5 border border-blue/20 rounded-xl p-5 mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="font-heading font-bold text-navy mb-1">Riordina ultimo ordine</h2>
                  <p className="text-sm text-gray-600">
                    Ordine #{lastOrder.orderNumber} del{' '}
                    {new Date(lastOrder.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {' '}• {lastOrder.items.length} prodotti
                  </p>
                </div>
                <button
                  onClick={reorderLastOrder}
                  disabled={reorderingAll}
                  className="inline-flex items-center gap-2 bg-blue text-white font-bold px-5 py-2.5 rounded-lg hover:bg-blue-light transition-colors disabled:opacity-50"
                >
                  {reorderingAll ? <Loader2 size={18} className="animate-spin" /> : <RotateCcw size={18} />}
                  {reorderingAll ? 'Aggiunta in corso...' : 'Aggiungi tutto al carrello'}
                </button>
              </div>
            </div>
          )}

          {/* Ricerca e filtri */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-2 bg-white border rounded-lg px-4 py-2">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Cerca per nome, codice o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 outline-none text-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="p-1 hover:bg-gray-100 rounded">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50"
                >
                  <option value="recent">Ultimi ordinati</option>
                  <option value="frequency">Più frequenti</option>
                  <option value="name">Alfabetico</option>
                </select>
              </div>

              <div className="text-sm text-gray-600">
                {filteredAndSortedProducts.length} prodotto{filteredAndSortedProducts.length !== 1 ? 'i' : ''}
                {selectedProducts.size > 0 && ` • ${selectedProducts.size} selezionato${selectedProducts.size !== 1 ? 'i' : ''}`}
              </div>
            </div>

            {/* Aggiungi multipli button */}
            {selectedProducts.size > 0 && (
              <button
                onClick={addMultipleToCart}
                disabled={Array.from(selectedProducts).some(id => addingMap[id])}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue text-white font-bold px-4 py-3 rounded-lg hover:bg-blue-light transition-colors disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                Aggiungi {selectedProducts.size} prodotto{selectedProducts.size !== 1 ? 'i' : ''} al carrello
              </button>
            )}
          </div>

          {/* Prodotti acquistati */}
          {filteredAndSortedProducts.length === 0 ? (
            <div className="bg-white border rounded-xl p-8 text-center">
              <Package size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600">Nessun prodotto corrisponde ai tuoi criteri di ricerca</p>
            </div>
          ) : (
            <>
              <h2 className="font-heading font-bold text-navy text-lg mb-4">I tuoi prodotti abituali</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedProducts.map((p) => {
                  const stockStatus = getStockStatus(p);
                  const StockIcon = stockStatus.icon;
                  const isSelected = selectedProducts.has(p.productId);

                  return (
                    <div
                      key={p.productId}
                      className={`bg-white border rounded-xl p-4 transition-all ${
                        isSelected ? 'border-blue ring-2 ring-blue/20' : 'border-gray-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex gap-3 mb-3">
                        {/* Checkbox */}
                        <div className="flex-shrink-0 pt-1">
                          <button
                            onClick={() => toggleProduct(p.productId)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-blue border-blue'
                                : 'border-gray-300 hover:border-blue'
                            }`}
                          >
                            {isSelected && <Check size={14} className="text-white" />}
                          </button>
                        </div>

                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.productName} className="w-full h-full object-contain p-2" />
                          ) : (
                            <Package size={24} className="text-gray-300" />
                          )}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2 mb-3">
                        <div>
                          <h3 className="font-medium text-sm text-navy line-clamp-2 mb-1">{p.productName}</h3>
                          <p className="text-xs text-gray-500">{p.productCode}</p>
                        </div>

                        {p.brand && (
                          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{p.brand}</p>
                        )}

                        {/* Stock Status */}
                        <div className={`flex items-center gap-2 px-2 py-1.5 rounded ${stockStatus.bg}`}>
                          <StockIcon size={14} className={stockStatus.color} />
                          <span className={`text-xs font-medium ${stockStatus.color}`}>{stockStatus.label}</span>
                        </div>

                        {/* Last Order Info */}
                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded">
                          <span>Ordinato {p.orderCount}x • Ultimo:</span>
                          <span className="font-medium">
                            {new Date(p.lastPurchaseDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>

                      {/* Price and Qty */}
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="font-bold text-navy">
                            € {parseFloat(p.currentPrice).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500">/{p.unit || 'PZ'}</span>
                        </div>

                        {/* Qty Input */}
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                          <button
                            onClick={() => setQtyInputs((prev) => ({ ...prev, [p.productId]: Math.max(1, (prev[p.productId] || 1) - 1) }))}
                            className="flex-shrink-0 w-7 h-7 flex items-center justify-center hover:bg-white rounded text-sm font-bold text-gray-600"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={qtyInputs[p.productId] || 1}
                            onChange={(e) => setQtyInputs((prev) => ({ ...prev, [p.productId]: Math.max(1, parseInt(e.target.value) || 1) }))}
                            className="flex-1 text-center bg-transparent text-sm font-bold outline-none"
                          />
                          <button
                            onClick={() => setQtyInputs((prev) => ({ ...prev, [p.productId]: (prev[p.productId] || 1) + 1 }))}
                            className="flex-shrink-0 w-7 h-7 flex items-center justify-center hover:bg-white rounded text-sm font-bold text-gray-600"
                          >
                            +
                          </button>
                        </div>

                        {/* Add Button */}
                        <button
                          onClick={() => addToCart(p.productId, qtyInputs[p.productId] || 1)}
                          disabled={addingMap[p.productId]}
                          className={`w-full inline-flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-lg transition-colors ${
                            addedMap[p.productId]
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue/10 text-blue hover:bg-blue/20'
                          }`}
                        >
                          {addingMap[p.productId] ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : addedMap[p.productId] ? (
                            <>
                              <Check size={14} /> Aggiunto
                            </>
                          ) : (
                            <>
                              <Plus size={14} /> Aggiungi
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
