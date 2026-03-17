'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart, Package, Loader2, Search, X, ShoppingCart, Check, CheckCircle, AlertTriangle, Clock, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { PageTitle } from '@/components/ui/page-title';
import { useEffect, useState, useMemo } from 'react';

interface FavoriteProduct {
  productId: number;
  productName: string;
  productCode: string;
  currentPrice: string;
  imageUrl: string | null;
  unit: string;
  stockAvailable: number;
  brand: string | null;
}

export default function PreferitiPage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addingMap, setAddingMap] = useState<Record<number, boolean>>({});
  const [addedMap, setAddedMap] = useState<Record<number, boolean>>({});
  const [removingMap, setRemovingMap] = useState<Record<number, boolean>>({});
  const [qtyInputs, setQtyInputs] = useState<Record<number, number>>({});
  const [selectedFavorites, setSelectedFavorites] = useState<Set<number>>(new Set());
  const [addingMultiple, setAddingMultiple] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/preferiti');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchFavorites();
    }
  }, [session]);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/wishlist');
      const data = await res.json();
      const prods = data.products || [];
      setFavorites(prods);
      // Initialize qty inputs
      const qtyMap: Record<number, number> = {};
      prods.forEach((p: FavoriteProduct) => {
        qtyMap[p.productId] = 1;
      });
      setQtyInputs(qtyMap);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFavorites = useMemo(() => {
    return favorites.filter(p =>
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [favorites, searchTerm]);

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

  const removeFromWishlist = async (productId: number) => {
    setRemovingMap((prev) => ({ ...prev, [productId]: true }));
    try {
      await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      setFavorites((prev) => prev.filter(p => p.productId !== productId));
      setSelectedFavorites((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    } catch {}
    setRemovingMap((prev) => ({ ...prev, [productId]: false }));
  };

  const addMultipleToCart = async () => {
    if (selectedFavorites.size === 0) return;

    const items = Array.from(selectedFavorites).map(productId => ({
      productId,
      qty: qtyInputs[productId] || 1,
    }));

    setAddingMultiple(true);
    const addingIds = Object.fromEntries(items.map(item => [item.productId, true]));
    setAddingMap(addingIds);

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
        setSelectedFavorites(new Set());
        items.forEach(item => {
          setAddedMap((prev) => ({ ...prev, [item.productId]: false }));
        });
      }, 2000);
    } catch {}
    setAddingMultiple(false);
    setAddingMap(Object.fromEntries(items.map(item => [item.productId, false])));
  };

  const toggleFavorite = (productId: number) => {
    const newSelected = new Set(selectedFavorites);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedFavorites(newSelected);
  };

  const getStockStatus = (product: FavoriteProduct) => {
    if ((product.stockAvailable ?? 0) > 5) {
      return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: `Disponibile (${product.stockAvailable})` };
    } else if ((product.stockAvailable ?? 0) > 0) {
      return { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: `Ultime ${product.stockAvailable} pz` };
    } else {
      return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Non disponibile' };
    }
  };

  if (!session?.user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <PageTitle className="mb-6">Preferiti</PageTitle>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue" size={32} />
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <Heart size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="font-bold text-lg text-gray-700 mb-2">La tua lista dei preferiti è vuota</h3>
          <p className="text-gray-500 mb-6">Aggiungi i prodotti che ti piacciono per trovarli facilmente in seguito.</p>
          <Link href="/catalogo" className="inline-flex items-center gap-2 bg-blue text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-light transition-colors">
            Sfoglia il catalogo
          </Link>
        </div>
      ) : (
        <>
          {/* Ricerca */}
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
              <div className="text-sm text-gray-600">
                {filteredFavorites.length} prodotto{filteredFavorites.length !== 1 ? 'i' : ''}
                {selectedFavorites.size > 0 && ` • ${selectedFavorites.size} selezionato${selectedFavorites.size !== 1 ? 'i' : ''}`}
              </div>
            </div>

            {/* Aggiungi multipli button */}
            {selectedFavorites.size > 0 && (
              <button
                onClick={addMultipleToCart}
                disabled={addingMultiple}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue text-white font-bold px-4 py-3 rounded-lg hover:bg-blue-light transition-colors disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                Aggiungi {selectedFavorites.size} prodotto{selectedFavorites.size !== 1 ? 'i' : ''} al carrello
              </button>
            )}
          </div>

          {/* Prodotti preferiti */}
          {filteredFavorites.length === 0 ? (
            <div className="bg-white border rounded-xl p-8 text-center">
              <Package size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600">Nessun prodotto corrisponde ai tuoi criteri di ricerca</p>
            </div>
          ) : (
            <>
              <h2 className="font-heading font-bold text-navy text-lg mb-4">I tuoi prodotti preferiti</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFavorites.map((p) => {
                  const stockStatus = getStockStatus(p);
                  const StockIcon = stockStatus.icon;
                  const isSelected = selectedFavorites.has(p.productId);

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
                            onClick={() => toggleFavorite(p.productId)}
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
                        <Link href={`/prodotto/${p.productCode}`} className="w-20 h-20 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden hover:shadow-md transition-shadow">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.productName} className="w-full h-full object-contain p-2" />
                          ) : (
                            <Package size={24} className="text-gray-300" />
                          )}
                        </Link>
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2 mb-3">
                        <div>
                          <Link href={`/prodotto/${p.productCode}`} className="font-medium text-sm text-navy line-clamp-2 mb-1 hover:text-blue transition-colors">
                            {p.productName}
                          </Link>
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

                        {/* Buttons */}
                        <div className="space-y-2">
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
                                <ShoppingCart size={14} /> Aggiungi al carrello
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => removeFromWishlist(p.productId)}
                            disabled={removingMap[p.productId]}
                            className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-lg border border-red/20 text-red hover:bg-red/5 transition-colors disabled:opacity-50"
                          >
                            {removingMap[p.productId] ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <>
                                <Trash2 size={14} /> Rimuovi
                              </>
                            )}
                          </button>
                        </div>
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
