'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, FolderOpen, PenTool, Printer, FileText, Monitor, Package, Coffee, Droplets, Zap, Palette, Gamepad2, Gift, BookOpen, Sofa, TreePine, Eye, Scissors, Calculator, Mail, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import type { Product } from '@/db/schema';
import { useSession } from 'next-auth/react';

// Mappa gruppo/categoria → icona + colore di sfondo
function getPlaceholder(product: Product) {
  const name = (product.name || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const code = (product.code || '').toLowerCase();

  // Bevande fredde
  if (brand.includes('levissima') || brand.includes('san benedetto') || brand.includes('sant') || brand.includes('vinadio') || name.includes('acqua'))
    return { Icon: Droplets, bg: 'bg-cyan-50', color: 'text-cyan-400' };
  if (brand.includes('valfrutta') || brand.includes('yoga') || name.includes('succo') || name.includes('succhi') || name.includes('frutta'))
    return { Icon: Droplets, bg: 'bg-orange-50', color: 'text-orange-400' };

  // Caffè
  if (name.includes('caffè') || name.includes('caffe') || name.includes('capsul') || name.includes('cialda') || brand.includes('lavazza') || brand.includes('borbone') || brand.includes('covim') || code.startsWith('lvf'))
    return { Icon: Coffee, bg: 'bg-amber-50', color: 'text-amber-700' };

  // Consumabili / Toner / Cartucce
  if (name.includes('toner') || name.includes('cartuccia') || name.includes('inkjet') || name.includes('nastro') || name.includes('ink-jet') || name.includes('drum'))
    return { Icon: Printer, bg: 'bg-purple-50', color: 'text-purple-400' };

  // Carta
  if (name.includes('carta') || name.includes('risma') || name.includes('rotolo') || name.includes('foglio') || name.includes('busta'))
    return { Icon: FileText, bg: 'bg-blue-50', color: 'text-blue-400' };

  // Informatica
  if (name.includes('mouse') || name.includes('tastiera') || name.includes('usb') || name.includes('monitor') || name.includes('hard') || name.includes('webcam') || name.includes('cavo') || name.includes('hub'))
    return { Icon: Monitor, bg: 'bg-indigo-50', color: 'text-indigo-400' };

  // Archiviazione
  if (name.includes('raccoglitor') || name.includes('registrator') || name.includes('cartell') || name.includes('busta') || name.includes('portalist') || name.includes('classificator') || name.includes('scatol') || name.includes('faldone') || name.includes('divisor') || name.includes('dorso'))
    return { Icon: FolderOpen, bg: 'bg-yellow-50', color: 'text-yellow-500' };

  // Scrittura
  if (name.includes('penna') || name.includes('matita') || name.includes('evidenziator') || name.includes('pennarello') || name.includes('marker') || name.includes('roller') || name.includes('sfera') || name.includes('gomma') || name.includes('correttor'))
    return { Icon: PenTool, bg: 'bg-green-50', color: 'text-green-500' };

  // Cancelleria
  if (name.includes('cucitric') || name.includes('forbic') || name.includes('cutter') || name.includes('punto') || name.includes('perforator') || name.includes('colla') || name.includes('nastro adesivo') || name.includes('scotch'))
    return { Icon: Scissors, bg: 'bg-pink-50', color: 'text-pink-400' };

  // Macchine ufficio
  if (name.includes('calcolatric') || name.includes('distrugg') || name.includes('plastificatric') || name.includes('rilegatric') || name.includes('stampant') || name.includes('scanner'))
    return { Icon: Calculator, bg: 'bg-slate-50', color: 'text-slate-400' };

  // Arredamento
  if (name.includes('poltrona') || name.includes('sedia') || name.includes('scrivania') || name.includes('armadio') || name.includes('scaffal') || name.includes('cassettier'))
    return { Icon: Sofa, bg: 'bg-stone-50', color: 'text-stone-400' };

  // Spedizione/imballo
  if (name.includes('scatol') || name.includes('imballo') || name.includes('film') || name.includes('reggett') || name.includes('bilancia'))
    return { Icon: Mail, bg: 'bg-teal-50', color: 'text-teal-400' };

  // Pulizia / Comunità
  if (name.includes('detergent') || name.includes('sapone') || name.includes('carta igien') || name.includes('asciugaman') || name.includes('guant'))
    return { Icon: Zap, bg: 'bg-emerald-50', color: 'text-emerald-400' };

  // Scuola / Belle arti
  if (name.includes('quaderno') || name.includes('album') || name.includes('pastello') || name.includes('tempera') || name.includes('acquerell'))
    return { Icon: Palette, bg: 'bg-fuchsia-50', color: 'text-fuchsia-400' };

  // Giochi
  if (name.includes('gioco') || name.includes('puzzle'))
    return { Icon: Gamepad2, bg: 'bg-violet-50', color: 'text-violet-400' };

  // Regalo
  if (name.includes('regalo') || name.includes('confezione regalo') || name.includes('nastro'))
    return { Icon: Gift, bg: 'bg-rose-50', color: 'text-rose-400' };

  // Visual / Lavagne
  if (name.includes('lavagna') || name.includes('bacheca') || name.includes('espositore') || name.includes('proiettor'))
    return { Icon: Eye, bg: 'bg-sky-50', color: 'text-sky-400' };

  // Cartotecnica
  if (name.includes('blocco') || name.includes('agenda') || name.includes('registro') || name.includes('modul'))
    return { Icon: BookOpen, bg: 'bg-lime-50', color: 'text-lime-500' };

  // Garden / Esterni
  if (name.includes('garden') || name.includes('insetticid') || name.includes('irrigaz'))
    return { Icon: TreePine, bg: 'bg-green-50', color: 'text-green-600' };

  // Default
  return { Icon: Package, bg: 'bg-gray-50', color: 'text-gray-300' };
}

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

  const { Icon, bg, color } = getPlaceholder(product);

  return (
    <Link href={`/prodotto/${product.code}`} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200">
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
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem] mb-2">
          {product.name}
        </h3>
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
