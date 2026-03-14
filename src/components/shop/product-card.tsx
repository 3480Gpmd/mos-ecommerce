'use client';

import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import type { Product } from '@/db/schema';
import { useSession } from 'next-auth/react';

export function ProductCard({ product }: { product: Product }) {
  const { data: session } = useSession();
  const customerType = (session?.user as { customerType?: string } | undefined)?.customerType || 'privato';
  const priceNet = parseFloat(String(product.priceNet));
  const vatRate = parseFloat(String(product.vatCode));

  const displayPrice = customerType === 'privato'
    ? priceNet * (1 + vatRate / 100)
    : priceNet;

  const priceLabel = customerType === 'privato' ? 'IVA incl.' : `+IVA ${vatRate}%`;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, qty: 1 }),
      });
    } catch {
      // Silently fail for non-authenticated users
    }
  };

  return (
    <Link href={`/prodotto/${product.code}`} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 p-4">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingCart size={48} />
          </div>
        )}
        {product.isPromo && (
          <span className="absolute top-2 left-2 bg-red text-white text-xs font-bold px-2 py-1 rounded">
            PROMO
          </span>
        )}
        {product.isExhausting && (
          <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
            ULTIME SCORTE
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {product.brand && (
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.brand}</p>
        )}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem] mb-2">
          {product.name}
        </h3>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-navy">
              {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(displayPrice)}
            </p>
            <p className="text-xs text-gray-500">{priceLabel}</p>
          </div>
          {session?.user && (
            <button
              onClick={handleAddToCart}
              className="p-2 bg-blue text-white rounded-lg hover:bg-blue-light transition-colors"
              title="Aggiungi al carrello"
            >
              <ShoppingCart size={16} />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
