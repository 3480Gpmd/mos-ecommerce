'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package, ChevronRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { PageTitle } from '@/components/ui/page-title';

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  total: string;
  createdAt: string;
  paymentStatus: string;
  paymentMethod: string | null;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  nuovo: { label: 'Nuovo', color: 'bg-blue-100 text-blue-800' },
  confermato: { label: 'Confermato', color: 'bg-green-100 text-green-800' },
  in_preparazione: { label: 'In preparazione', color: 'bg-yellow-100 text-yellow-800' },
  spedito: { label: 'Spedito', color: 'bg-purple-100 text-purple-800' },
  consegnato: { label: 'Consegnato', color: 'bg-green-100 text-green-800' },
  annullato: { label: 'Annullato', color: 'bg-red-100 text-red-800' },
};

export function OrdiniContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const successOrder = searchParams.get('success');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/ordini');
      return;
    }
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .finally(() => setLoading(false));
  }, [status, router]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatCurrency = (n: string) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(parseFloat(n));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageTitle className="mb-6">I miei ordini</PageTitle>

      {successOrder && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-600" />
          <div>
            <p className="font-bold text-green-800">Ordine {successOrder} confermato!</p>
            <p className="text-sm text-green-700">Riceverai una email di conferma a breve.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Nessun ordine ancora</p>
          <Link href="/catalogo" className="text-blue font-medium hover:underline">Vai al catalogo</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const st = statusLabels[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };
            return (
              <div key={order.id} className="bg-white border rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4">
                  <Package size={24} className="text-gray-400" />
                  <div>
                    <p className="font-bold text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}>
                    {st.label}
                  </span>
                  <span className="font-bold text-sm">{formatCurrency(order.total)}</span>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
