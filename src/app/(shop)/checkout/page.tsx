'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Trash2, Minus, Plus, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { PageTitle } from '@/components/ui/page-title';

interface CartItem {
  id: number;
  productId: number;
  qty: number;
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

  const customerType = (session?.user as { customerType?: string } | undefined)?.customerType || 'privato';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/checkout');
      return;
    }
    fetchCart();
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

  const updateQty = async (productId: number, qty: number) => {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, qty }),
    });
    fetchCart();
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

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...shipping,
          shippingAddress: shipping.address,
          shippingPostcode: shipping.postcode,
          shippingCity: shipping.city,
          shippingProvince: shipping.province,
          paymentMethod,
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
              <div key={item.id} className="flex items-center gap-4 border rounded-xl p-4">
                <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt="" className="w-full h-full object-contain p-1" />
                  ) : (
                    <ShoppingCart size={24} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{item.product.name}</p>
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
                <button onClick={() => updateQty(item.productId, 0)} className="text-gray-400 hover:text-red">
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

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

          {/* Order summary */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-2 text-sm">
            <div className="flex justify-between font-bold text-lg">
              <span>Totale ordine</span>
              <span>{formatCurrency(total)}</span>
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
