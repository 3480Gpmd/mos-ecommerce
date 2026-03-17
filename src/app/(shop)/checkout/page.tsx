'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Trash2, Minus, Plus, ShoppingCart, AlertTriangle, MapPin, Zap } from 'lucide-react';
import Link from 'next/link';
import { PageTitle } from '@/components/ui/page-title';

interface CartItem {
  id: number;
  productId: number;
  qty: number;
  isUrgent: boolean;
  product: {
    code: string;
    name: string;
    brand: string | null;
    priceNet: string;
    vatCode: string;
    imageUrl: string | null;
    stockAvailable: number | null;
    unit: string | null;
  };
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'cart' | 'shipping' | 'payment'>('cart');
  const [shipping, setShipping] = useState({
    address: '',
    postcode: '',
    city: '',
    province: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'teamsystem' | 'bonifico'>('paypal');
  const [isUrgent, setIsUrgent] = useState(false);
  const [altShipping, setAltShipping] = useState(false);
  const [altAddress, setAltAddress] = useState({
    name: '',
    address: '',
    postcode: '',
    city: '',
    province: '',
  });
  const [orderNotes, setOrderNotes] = useState('');
  const [addressLoaded, setAddressLoaded] = useState(false);

  const customerType = (session?.user as { customerType?: string } | undefined)?.customerType || 'privato';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/checkout');
      return;
    }
    fetchCart();
    fetchCustomerAddress();
  }, [status, router]);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerAddress = async () => {
    try {
      const res = await fetch('/api/customers/me');
      if (res.ok) {
        const data = await res.json();
        if (data.address && !addressLoaded) {
          setShipping({
            address: data.address || '',
            postcode: data.postcode || '',
            city: data.city || '',
            province: data.province || '',
          });
          setAddressLoaded(true);
        }
      }
    } catch {
      // ignore
    }
  };

  const updateQty = async (productId: number, qty: number) => {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, qty }),
    });
    fetchCart();
  };

  const toggleItemUrgent = async (productId: number, currentQty: number, urgent: boolean) => {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, qty: currentQty, isUrgent: urgent }),
    });
    // Aggiorna localmente per feedback immediato
    setItems(prev => prev.map(item =>
      item.productId === productId ? { ...item, isUrgent: urgent } : item
    ));
  };

  const subtotal = items.reduce((sum, item) => {
    return sum + parseFloat(item.product.priceNet) * item.qty;
  }, 0);

  const vatTotal = items.reduce((sum, item) => {
    const net = parseFloat(item.product.priceNet) * item.qty;
    const vat = net * (parseFloat(item.product.vatCode) / 100);
    return sum + vat;
  }, 0);

  const shippingCost = subtotal >= 100 ? 0 : 8.90;
  const total = subtotal + vatTotal + shippingCost;
  const urgentItems = items.filter(i => i.isUrgent);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: shipping.address,
          shippingPostcode: shipping.postcode,
          shippingCity: shipping.city,
          shippingProvince: shipping.province,
          paymentMethod,
          isUrgent,
          altShipping,
          ...(altShipping ? {
            altShippingName: altAddress.name,
            altShippingAddress: altAddress.address,
            altShippingPostcode: altAddress.postcode,
            altShippingCity: altAddress.city,
            altShippingProvince: altAddress.province,
          } : {}),
          notes: orderNotes || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/ordini?success=${data.orderNumber}`);
      } else {
        alert(data.error || 'Errore nella creazione ordine');
      }
    } catch {
      alert('Errore di rete');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="font-heading text-2xl font-bold mb-2">Carrello vuoto</h1>
        <p className="text-gray-500 mb-6">Aggiungi prodotti dal catalogo per iniziare.</p>
        <Link href="/catalogo" className="inline-flex items-center gap-2 bg-blue text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-light transition-colors">
          Vai al catalogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageTitle className="mb-6">Checkout</PageTitle>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-8 text-sm">
        {['cart', 'shipping', 'payment'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step === s ? 'bg-blue text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {i + 1}
            </span>
            <span className={step === s ? 'font-bold' : 'text-gray-500'}>
              {s === 'cart' ? 'Carrello' : s === 'shipping' ? 'Spedizione' : 'Pagamento'}
            </span>
          </div>
        ))}
      </div>

      {step === 'cart' && (
        <div className="space-y-4">
          {items.map((item) => {
            const priceNet = parseFloat(item.product.priceNet);
            const vatRate = parseFloat(item.product.vatCode);
            const displayPrice = customerType === 'privato' ? priceNet * (1 + vatRate / 100) : priceNet;

            return (
              <div key={item.id} className={`flex items-center gap-4 border rounded-xl p-4 ${item.isUrgent ? 'border-orange-300 bg-orange-50/50' : ''}`}>
                <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt="" className="w-full h-full object-contain p-1" />
                  ) : (
                    <ShoppingCart size={24} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm line-clamp-1">{item.product.name}</p>
                    {item.isUrgent && (
                      <span className="flex-shrink-0 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">URGENTE</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{item.product.brand} - {item.product.code}</p>
                  <p className="text-sm font-bold text-navy mt-1">{formatCurrency(displayPrice)}</p>
                </div>
                <div className="flex items-center border rounded-lg">
                  <button onClick={() => updateQty(item.productId, item.qty - 1)} className="p-2">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm">{item.qty}</span>
                  <button onClick={() => updateQty(item.productId, item.qty + 1)} className="p-2">
                    <Plus size={14} />
                  </button>
                </div>
                <p className="font-bold text-sm w-20 text-right">{formatCurrency(displayPrice * item.qty)}</p>
                {/* Toggle urgenza prodotto */}
                <button
                  onClick={() => toggleItemUrgent(item.productId, item.qty, !item.isUrgent)}
                  className={`p-2 rounded-lg transition-colors ${
                    item.isUrgent
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'
                  }`}
                  title={item.isUrgent ? 'Rimuovi urgenza' : 'Segna come urgente'}
                >
                  <Zap size={16} />
                </button>
                <button onClick={() => updateQty(item.productId, 0)} className="text-gray-400 hover:text-red">
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

          {/* Info urgenza prodotti */}
          {urgentItems.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
              <Zap size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-700">
                  {urgentItems.length} prodott{urgentItems.length === 1 ? 'o' : 'i'} contrassegnat{urgentItems.length === 1 ? 'o' : 'i'} come urgente
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Organizzeremo una consegna prioritaria per questi articoli.
                </p>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotale</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {customerType === 'azienda' && (
              <div className="flex justify-between text-gray-500">
                <span>IVA</span>
                <span>{formatCurrency(vatTotal)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Spedizione</span>
              <span>{shippingCost === 0 ? 'Gratuita' : formatCurrency(shippingCost)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
              <span>Totale</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            onClick={() => setStep('shipping')}
            className="w-full bg-blue text-white font-bold py-3 rounded-lg hover:bg-blue-light transition-colors"
          >
            Procedi alla spedizione
          </button>
        </div>
      )}

      {step === 'shipping' && (
        <div className="space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <MapPin size={18} /> Indirizzo di spedizione
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Indirizzo</label>
              <input
                type="text"
                value={shipping.address}
                onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CAP</label>
              <input
                type="text"
                value={shipping.postcode}
                onChange={(e) => setShipping({ ...shipping, postcode: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Città</label>
              <input
                type="text"
                value={shipping.city}
                onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Provincia</label>
              <input
                type="text"
                value={shipping.province}
                onChange={(e) => setShipping({ ...shipping, province: e.target.value.toUpperCase() })}
                maxLength={2}
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
                required
              />
            </div>
          </div>

          {/* Destinazione alternativa */}
          <div className="border-t pt-4 mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={altShipping}
                onChange={(e) => setAltShipping(e.target.checked)}
                className="w-4 h-4 text-blue focus:ring-blue rounded"
              />
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-500" />
                <span className="text-sm font-medium">Spedisci a un indirizzo diverso</span>
              </div>
            </label>

            {altShipping && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-7">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Nome / Ragione Sociale destinatario</label>
                  <input
                    type="text"
                    value={altAddress.name}
                    onChange={(e) => setAltAddress({ ...altAddress, name: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
                    placeholder="Es. Mario Rossi c/o Azienda Srl"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Indirizzo</label>
                  <input
                    type="text"
                    value={altAddress.address}
                    onChange={(e) => setAltAddress({ ...altAddress, address: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CAP</label>
                  <input
                    type="text"
                    value={altAddress.postcode}
                    onChange={(e) => setAltAddress({ ...altAddress, postcode: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Città</label>
                  <input
                    type="text"
                    value={altAddress.city}
                    onChange={(e) => setAltAddress({ ...altAddress, city: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Provincia</label>
                  <input
                    type="text"
                    value={altAddress.province}
                    onChange={(e) => setAltAddress({ ...altAddress, province: e.target.value.toUpperCase() })}
                    maxLength={2}
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Urgenza ordine intero */}
          <div className="border-t pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-4 h-4 text-red focus:ring-red rounded"
              />
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red" />
                <span className="text-sm font-medium">Ordine urgente (tutto l&apos;ordine)</span>
              </div>
            </label>
            {isUrgent && (
              <p className="text-xs text-orange-600 mt-2 pl-7">
                L&apos;ordine sarà processato con priorità. Il nostro team farà il possibile per accelerare la consegna.
              </p>
            )}
          </div>

          {/* Note ordine */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium mb-1">Note per l&apos;ordine (opzionale)</label>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Istruzioni particolari per la consegna, riferimenti interni..."
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue text-sm"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('cart')}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Indietro
            </button>
            <button
              onClick={() => {
                if (shipping.address && shipping.postcode && shipping.city && shipping.province) {
                  if (altShipping && (!altAddress.address || !altAddress.postcode || !altAddress.city || !altAddress.province)) {
                    alert('Compila tutti i campi dell\'indirizzo alternativo');
                    return;
                  }
                  setStep('payment');
                }
              }}
              className="flex-1 bg-blue text-white font-bold py-3 rounded-lg hover:bg-blue-light transition-colors"
            >
              Procedi al pagamento
            </button>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div className="space-y-4">
          <h2 className="font-bold text-lg">Metodo di pagamento</h2>
          <div className="space-y-3">
            {[
              { value: 'paypal' as const, label: 'PayPal', desc: 'Paga con il tuo account PayPal' },
              { value: 'teamsystem' as const, label: 'TeamSystem Pay', desc: 'Pagamento con carta di credito' },
              { value: 'bonifico' as const, label: 'Bonifico Bancario', desc: 'Riceverai le coordinate via email' },
            ].map((method) => (
              <label
                key={method.value}
                className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-colors ${
                  paymentMethod === method.value ? 'border-blue bg-blue/5' : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={() => setPaymentMethod(method.value)}
                  className="text-blue focus:ring-blue"
                />
                <div>
                  <p className="font-medium">{method.label}</p>
                  <p className="text-sm text-gray-500">{method.desc}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Order summary / Recap */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-3 text-sm">
            <h3 className="font-bold text-base mb-2">Riepilogo ordine</h3>

            {/* Indirizzo spedizione */}
            <div className="text-gray-600">
              <p className="font-medium flex items-center gap-1"><MapPin size={14} /> Spedizione:</p>
              <p className="text-xs ml-5">{shipping.address}, {shipping.postcode} {shipping.city} ({shipping.province})</p>
            </div>

            {altShipping && (
              <div className="text-gray-600">
                <p className="font-medium flex items-center gap-1"><MapPin size={14} /> Destinazione alternativa:</p>
                <p className="text-xs ml-5">{altAddress.name && `${altAddress.name}, `}{altAddress.address}, {altAddress.postcode} {altAddress.city} ({altAddress.province})</p>
              </div>
            )}

            {isUrgent && (
              <div className="flex items-center gap-2 text-red font-medium">
                <AlertTriangle size={16} />
                <span>ORDINE URGENTE</span>
              </div>
            )}

            {urgentItems.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="font-medium text-orange-700 flex items-center gap-1 mb-1">
                  <Zap size={14} /> Prodotti urgenti:
                </p>
                {urgentItems.map(item => (
                  <p key={item.id} className="text-xs text-orange-600 ml-5">
                    - {item.product.name} ({item.qty} {item.product.unit || 'pz'})
                  </p>
                ))}
              </div>
            )}

            {orderNotes && (
              <div className="text-gray-600">
                <p className="font-medium">Note:</p>
                <p className="text-xs ml-5 italic">{orderNotes}</p>
              </div>
            )}

            <div className="border-t pt-2 mt-2 space-y-1">
              <div className="flex justify-between">
                <span>Subtotale</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {customerType === 'azienda' && (
                <div className="flex justify-between text-gray-500">
                  <span>IVA</span>
                  <span>{formatCurrency(vatTotal)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Spedizione</span>
                <span>{shippingCost === 0 ? 'Gratuita' : formatCurrency(shippingCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Totale ordine</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('shipping')}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Indietro
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="flex-1 bg-red text-white font-bold py-3 rounded-lg hover:bg-red-light transition-colors disabled:opacity-50"
            >
              {submitting ? 'Elaborazione...' : 'Conferma ordine'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
