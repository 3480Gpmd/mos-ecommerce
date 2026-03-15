'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { ShoppingCart, Plus, RotateCcw, Package, Loader2 } from 'lucide-react';
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

export default function RiordinaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<PurchasedProduct[]>([]);
  const [lastOrder, setLastOrder] = useState<{ id: number; orderNumber: string; createdAt: string; items: LastOrderItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingMap, setAddingMap] = useState<Record<number, boolean>>({});
  const [addedMap, setAddedMap] = useState<Record<number, boolean>>({});
  const [reorderingAll, setReorderingAll] = useState(false);

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
          setProducts(data.products || []);
          setLastOrder(data.lastOrder || null);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session]);

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

  if (!session?.user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
                    {' '}&middot; {lastOrder.items.length} prodotti
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

          {/* Prodotti acquistati */}
          <h2 className="font-heading font-bold text-navy text-lg mb-4">I tuoi prodotti abituali</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.filter(p => p.isActive).map((p) => (
              <div key={p.productId} className="bg-white border rounded-xl p-4 flex gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.productName} className="w-full h-full object-contain" />
                  ) : (
                    <Package size={24} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-navy leading-tight line-clamp-2 mb-1">{p.productName}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    {p.brand && <span>{p.brand}</span>}
                    <span>&middot;</span>
                    <span>Ordinato {p.orderCount}x</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy">
                      &euro; {parseFloat(p.currentPrice).toFixed(2)}
                      <span className="text-xs text-gray-400 font-normal"> /{p.unit || 'PZ'}</span>
                    </span>
                    <button
                      onClick={() => addToCart(p.productId)}
                      disabled={addingMap[p.productId]}
                      className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        addedMap[p.productId]
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue/10 text-blue hover:bg-blue/20'
                      }`}
                    >
                      {addingMap[p.productId] ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : addedMap[p.productId] ? (
                        '✓ Aggiunto'
                      ) : (
                        <><Plus size={14} /> Aggiungi</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
