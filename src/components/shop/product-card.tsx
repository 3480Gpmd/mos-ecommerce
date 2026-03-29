'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, FolderOpen, PenTool, Printer, FileText, Monitor, Package, Coffee, Droplets, Zap, Palette, Gamepad2, Gift, BookOpen, Sofa, TreePine, Eye, Scissors, Calculator, Mail, CheckCircle, AlertTriangle, XCircle, Clock, Minus, Plus, Check, Info } from 'lucide-react';
import type { Product } from '@/db/schema';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mappa gruppo/categoria → icona + colore di sfondo
function getPlaceholder(product: Product) {
  const name = (product.name || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const code = (product.code || '').toLowerCase();

  if (brand.includes('levissima') || brand.includes('san benedetto') || brand.includes('sant') || brand.includes('vinadio') || name.includes('acqua'))
    return { Icon: Droplets, bg: 'bg-cyan-50', color: 'text-cyan-400' };
  if (brand.includes('valfrutta') || brand.includes('yoga') || name.includes('succo') || name.includes('succhi') || name.includes('frutta'))
    return { Icon: Droplets, bg: 'bg-orange-50', color: 'text-orange-400' };
  if (name.includes('caffè') || name.includes('caffe') || name.includes('capsul') || name.includes('cialda') || brand.includes('lavazza') || brand.includes('borbone') || brand.includes('covim') || code.startsWith('lvf'))
    return { Icon: Coffee, bg: 'bg-amber-50', color: 'text-amber-700' };
  if (name.includes('toner') || name.includes('cartuccia') || name.includes('inkjet') || name.includes('nastro') || name.includes('ink-jet') || name.includes('drum'))
    return { Icon: Printer, bg: 'bg-purple-50', color: 'text-purple-400' };
  if (name.includes('carta') || name.includes('risma') || name.includes('rotolo') || name.includes('foglio') || name.includes('busta'))
    return { Icon: FileText, bg: 'bg-blue-50', color: 'text-blue-400' };
  if (name.includes('mouse') || name.includes('tastiera') || name.includes('usb') || name.includes('monitor') || name.includes('hard') || name.includes('webcam') || name.includes('cavo') || name.includes('hub'))
    return { Icon: Monitor, bg: 'bg-indigo-50', color: 'text-indigo-400' };
  if (name.includes('raccoglitor') || name.includes('registrator') || name.includes('cartell') || name.includes('busta') || name.includes('portalist') || name.includes('classificator') || name.includes('scatol') || name.includes('faldone') || name.includes('divisor') || name.includes('dorso'))
    return { Icon: FolderOpen, bg: 'bg-yellow-50', color: 'text-yellow-500' };
  if (name.includes('penna') || name.includes('matita') || name.includes('evidenziator') || name.includes('pennarello') || name.includes('marker') || name.includes('roller') || name.includes('sfera') || name.includes('gomma') || name.includes('correttor'))
    return { Icon: PenTool, bg: 'bg-green-50', color: 'text-green-500' };
  if (name.includes('cucitric') || name.includes('forbic') || name.includes('cutter') || name.includes('punto') || name.includes('perforator') || name.includes('colla') || name.includes('nastro adesivo') || name.includes('scotch'))
    return { Icon: Scissors, bg: 'bg-pink-50', color: 'text-pink-400' };
  if (name.includes('calcolatric') || name.includes('distrugg') || name.includes('plastificatric') || name.includes('rilegatric') || name.includes('stampant') || name.includes('scanner'))
    return { Icon: Calculator, bg: 'bg-slate-50', color: 'text-slate-400' };
  if (name.includes('poltrona') || name.includes('sedia') || name.includes('scrivania') || name.includes('armadio') || name.includes('scaffal') || name.includes('cassettier'))
    return { Icon: Sofa, bg: 'bg-stone-50', color: 'text-stone-400' };
  if (name.includes('scatol') || name.includes('imballo') || name.includes('film') || name.includes('reggett') || name.includes('bilancia'))
    return { Icon: Mail, bg: 'bg-teal-50', color: 'text-teal-400' };
  if (name.includes('detergent') || name.includes('sapone') || name.includes('carta igien') || name.includes('asciugaman') || name.includes('guant'))
    return { Icon: Zap, bg: 'bg-emerald-50', color: 'text-emerald-400' };
  if (name.includes('quaderno') || name.includes('album') || name.includes('pastello') || name.includes('tempera') || name.includes('acquerell'))
    return { Icon: Palette, bg: 'bg-fuchsia-50', color: 'text-fuchsia-400' };
  if (name.includes('gioco') || name.includes('puzzle'))
    return { Icon: Gamepad2, bg: 'bg-violet-50', color: 'text-violet-400' };
  if (name.includes('regalo') || name.includes('confezione regalo') || name.includes('nastro'))
    return { Icon: Gift, bg: 'bg-rose-50', color: 'text-rose-400' };
  if (name.includes('lavagna') || name.includes('bacheca') || name.includes('espositore') || name.includes('proiettor'))
    return { Icon: Eye, bg: 'bg-sky-50', color: 'text-sky-400' };
  if (name.includes('blocco') || name.includes('agenda') || name.includes('registro') || name.includes('modul'))
    return { Icon: BookOpen, bg: 'bg-lime-50', color: 'text-lime-500' };
  if (name.includes('garden') || name.includes('insetticid') || name.includes('irrigaz'))
    return { Icon: TreePine, bg: 'bg-green-50', color: 'text-green-600' };

  return { Icon: Package, bg: 'bg-gray-50', color: 'text-gray-300' };
}

export function ProductCard({ product }: { product: Product }) {
  const { data: session } = useSession();
  const router = useRouter();
  const customerType = (session?.user as { customerType?: string } | undefined)?.customerType || 'privato';
  const priceNet = parseFloat(String(product.priceNet));
  const vatRate = parseFloat(String(product.vatCode));

  const displayPrice = customerType === 'privato'
    ? priceNet * (1 + vatRate / 100)
    : priceNet;

  const priceLabel = customerType === 'privato' ? 'IVA incl.' : `+IVA ${vatRate}%`;

  const minQty = product.minOrderQty ?? 1;
  const multiple = product.orderMultiple ?? 1;

  const [qty, setQty] = useState(minQty);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showQtySelector, setShowQtySelector] = useState(false);

  const adjustQty = useCallback((newQty: number) => {
    const rounded = Math.max(minQty, Math.ceil(newQty / multiple) * multiple);
    setQty(rounded);
  }, [minQty, multiple]);

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      router.push('/login?redirect=/catalogo');
      return;
    }

    // Mostra sempre il selettore quantità inline
    if (!showQtySelector) {
      setQty(minQty);
      setShowQtySelector(true);
    } else {
      addToCart(qty);
    }
  };

  const addToCart = async (quantity: number) => {
    setAdding(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, qty: quantity }),
      });
      if (res.ok) {
        setAdded(true);
        setShowQtySelector(false);
        window.dispatchEvent(new Event('cart-updated'));
        setTimeout(() => setAdded(false), 2000);
      }
    } catch {
      // Handle error silently
    } finally {
      setAdding(false);
    }
  };

  const { Icon, bg, color } = getPlaceholder(product);

  return (
    <>
      <Link href={`/prodotto/${product.code}`} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 relative">
        {/* Image */}
        <div className={`relative aspect-square ${product.imageUrl ? 'bg-gray-50' : bg} p-4`}>
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-3 group-hover:scale-105 transition-transform duration-200"
              unoptimized={!product.imageUrl.includes('identiprint.it') && !product.imageUrl.startsWith('/')}
            />
          ) : (
            <div className={`w-full h-full flex flex-col items-center justify-center ${color}`}>
              <Icon size={48} strokeWidth={1.5} />
              {product.brand && (
                <span className="mt-2 text-xs font-medium opacity-60 text-center line-clamp-1">{product.brand}</span>
              )}
            </div>
          )}
          {product.isPromo && (
            <span className="absolute top-2 left-2 bg-red text-white text-xs font-bold px-2 py-1 rounded z-10">
              PROMO
            </span>
          )}
          {product.isExhausting && (
            <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
              ULTIME SCORTE
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {product.brand && (
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.brand}</p>
          )}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem] mb-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 mb-2">Cod. {product.code}</p>
          {/* Disponibilità */}
          <div className="flex items-center gap-1 mb-2">
            {(product.stockAvailable ?? 0) > 5 ? (
              <>
                <CheckCircle size={12} className="text-green-500" />
                <span className="text-xs text-green-600">Disponibile ({product.stockAvailable})</span>
              </>
            ) : (product.stockAvailable ?? 0) > 0 ? (
              <>
                <AlertTriangle size={12} className="text-yellow-500" />
                <span className="text-xs text-yellow-600">Ultime {product.stockAvailable} pz</span>
              </>
            ) : (product.stockOrdered ?? 0) > 0 ? (
              <>
                <Clock size={12} className="text-blue-500" />
                <span className="text-xs text-blue-600">In arrivo ({product.stockOrdered} pz){product.stockArrivalDate ? ` - ${product.stockArrivalDate}` : ''}</span>
              </>
            ) : (
              <>
                <XCircle size={12} className="text-gray-400" />
                <span className="text-xs text-gray-400">Non disponibile</span>
              </>
            )}
          </div>

          {/* Min ordine badge */}
          {minQty > 1 && (
            <div className="flex items-center gap-1 mb-2">
              <Info size={11} className="text-blue-400" />
              <span className="text-xs text-blue-500">Min. {minQty} pz</span>
            </div>
          )}

          <div>
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-lg font-bold text-navy">
                  {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(displayPrice)}
                </p>
                <p className="text-xs text-gray-500">{priceLabel}</p>
              </div>
              {!showQtySelector && (
                <button
                  onClick={handleCartClick}
                  className={`p-2 rounded-lg transition-colors ${
                    added
                      ? 'bg-green-600 text-white'
                      : 'bg-blue text-white hover:bg-blue-light'
                  }`}
                  title={added ? 'Aggiunto!' : 'Aggiungi al carrello'}
                >
                  {added ? <Check size={16} /> : <ShoppingCart size={16} />}
                </button>
              )}
            </div>
            {showQtySelector && (
              <div className="flex items-center gap-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); adjustQty(qty - multiple); }}
                  disabled={qty <= minQty}
                  className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                >
                  <Minus size={12} />
                </button>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => { e.stopPropagation(); adjustQty(parseInt(e.target.value) || minQty); }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  className="w-12 text-center text-sm font-bold border border-gray-300 rounded py-0.5 focus:outline-none focus:ring-1 focus:ring-blue"
                  min={minQty}
                  step={multiple}
                />
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); adjustQty(qty + multiple); }}
                  className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100 text-xs"
                >
                  <Plus size={12} />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(qty); }}
                  disabled={adding}
                  className="flex-1 bg-blue text-white text-xs font-bold py-1.5 px-2 rounded hover:bg-blue-light transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {adding ? '...' : <><ShoppingCart size={12} /> Aggiungi</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </Link>

    </>
  );
}
