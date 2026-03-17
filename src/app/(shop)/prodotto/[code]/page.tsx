'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ShoppingCart, Heart, Minus, Plus, Check, ArrowLeft, Info, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/db/schema';
import type { Metadata } from 'next';

// generateMetadata is exported from a separate server component below
// This is the client component for the page content

export default function ProductPage() {
  const { code } = useParams<{ code: string }>();
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const customerType = (session?.user as { customerType?: string } | undefined)?.customerType || 'privato';

  useEffect(() => {
    fetch(`/api/products/${code}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setProduct(data);
          const min = data.minOrderQty ?? 1;
          setQty(min);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [code]);

  const minQty = product?.minOrderQty ?? 1;
  const multiple = product?.orderMultiple ?? 1;

  const adjustQty = useCallback((newQty: number) => {
    const rounded = Math.max(minQty, Math.ceil(newQty / multiple) * multiple);
    setQty(rounded);
  }, [minQty, multiple]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, qty }),
      });
      if (res.ok) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    } catch {
      // Handle error
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-100 rounded-xl" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-100 rounded w-1/4" />
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="h-6 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Prodotto non trovato</h1>
        <Link href="/catalogo" className="text-blue hover:underline">Torna al catalogo</Link>
      </div>
    );
  }

  const priceNet = parseFloat(String(product.priceNet));
  const vatRate = parseFloat(String(product.vatCode));
  const displayPrice = customerType === 'privato' ? priceNet * (1 + vatRate / 100) : priceNet;
  const priceLabel = customerType === 'privato' ? 'IVA inclusa' : `+IVA ${vatRate}%`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/catalogo" className="hover:text-blue flex items-center gap-1">
          <ArrowLeft size={14} /> Catalogo
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 rounded-xl p-8">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-4"
              unoptimized={!product.imageUrl.includes('identiprint.it') && !product.imageUrl.startsWith('/')}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ShoppingCart size={96} />
            </div>
          )}
          {product.isPromo && (
            <span className="absolute top-4 left-4 bg-red text-white text-sm font-bold px-3 py-1 rounded">
              PROMO
            </span>
          )}
        </div>

        {/* Details */}
        <div>
          {product.brand && (
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">{product.brand}</p>
          )}
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-sm text-gray-500 mb-4">Codice: {product.code}</p>

          {/* Price */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <p className="text-3xl font-bold text-navy mb-1">
              {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(displayPrice)}
            </p>
            <p className="text-sm text-gray-500">{priceLabel}</p>
            {product.pricePublic && parseFloat(String(product.pricePublic)) > priceNet && (
              <p className="text-sm text-gray-400 line-through mt-1">
                Listino: {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(parseFloat(String(product.pricePublic)))}
              </p>
            )}
          </div>

          {/* Stock */}
          <div className="mb-6">
            {(product.stockAvailable ?? 0) > 0 ? (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <Check size={16} /> Disponibile ({product.stockAvailable} pz)
              </p>
            ) : (
              <p className="text-sm text-orange-500">
                Al momento non disponibile
                {product.stockArrivalDate && ` - Arrivo previsto: ${product.stockArrivalDate}`}
              </p>
            )}
          </div>

          {/* Min order info */}
          {(minQty > 1 || multiple > 1 || (product.packSize && product.packSize > 1)) && (
            <div className="bg-blue/5 border border-blue/20 rounded-xl p-4 mb-6 space-y-2">
              {minQty > 1 && (
                <div className="flex items-center gap-2 text-sm">
                  <Info size={14} className="text-blue-500 flex-shrink-0" />
                  <span className="text-blue-700">Quantità minima d&apos;ordine: <strong>{minQty} pz</strong></span>
                </div>
              )}
              {multiple > 1 && (
                <div className="flex items-center gap-2 text-sm">
                  <Info size={14} className="text-blue-500 flex-shrink-0" />
                  <span className="text-blue-700">Ordina in multipli di: <strong>{multiple} pz</strong></span>
                </div>
              )}
              {product.packSize && product.packSize > 1 && (
                <div className="flex items-center gap-2 text-sm">
                  <Package size={14} className="text-blue-500 flex-shrink-0" />
                  <span className="text-blue-700">Confezione da: <strong>{product.packSize} pz</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Add to cart */}
          {session?.user && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => adjustQty(qty - multiple)}
                    disabled={qty <= minQty}
                    className="p-3 hover:bg-gray-50 disabled:opacity-30"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => adjustQty(parseInt(e.target.value) || minQty)}
                    className="w-16 text-center font-medium border-0 focus:outline-none"
                    min={minQty}
                    step={multiple}
                  />
                  <button
                    onClick={() => adjustQty(qty + multiple)}
                    className="p-3 hover:bg-gray-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={added}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-bold text-white transition-colors ${
                    added ? 'bg-green-600' : 'bg-blue hover:bg-blue-light'
                  }`}
                >
                  {added ? (
                    <>
                      <Check size={18} /> Aggiunto al carrello!
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} /> Aggiungi {qty} pz al carrello
                    </>
                  )}
                </button>
                <button className="p-3 border rounded-lg hover:bg-gray-50 text-gray-600 hover:text-red">
                  <Heart size={18} />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Totale: <span className="font-bold text-navy">
                  {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(displayPrice * qty)}
                </span>
              </p>
            </div>
          )}

          {!session?.user && (
            <div className="bg-blue/5 border border-blue/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700">
                <Link href="/login" className="text-blue font-bold hover:underline">Accedi</Link> o{' '}
                <Link href="/registrati" className="text-blue font-bold hover:underline">registrati</Link> per acquistare e vedere i prezzi dedicati.
              </p>
            </div>
          )}

          {/* Details table */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-sm mb-3">Dettagli prodotto</h3>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              {product.brand && (
                <>
                  <dt className="text-gray-500">Marca</dt>
                  <dd className="font-medium">{product.brand}</dd>
                </>
              )}
              {product.partNumber && (
                <>
                  <dt className="text-gray-500">Part Number</dt>
                  <dd className="font-medium">{product.partNumber}</dd>
                </>
              )}
              {product.barcode && (
                <>
                  <dt className="text-gray-500">Barcode</dt>
                  <dd className="font-medium">{product.barcode}</dd>
                </>
              )}
              <dt className="text-gray-500">Unità</dt>
              <dd className="font-medium">{product.unit || 'PZ'}</dd>
              <dt className="text-gray-500">IVA</dt>
              <dd className="font-medium">{product.vatCode}%</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
