import { db } from '@/db';
import { orders, customers, products, csvImports } from '@/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import Link from 'next/link';
import {
  Package, Users, ShoppingCart, TrendingUp, Tag, FolderTree,
  Upload, FileText, Settings, Search, BarChart3,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [
    orderCount,
    customerCount,
    productCount,
    recentOrders,
    latestImport,
    revenue,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(orders),
    db.select({ count: sql<number>`count(*)` }).from(customers),
    db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.isActive, true)),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),
    db.select().from(csvImports).orderBy(desc(csvImports.importedAt)).limit(1),
    db.select({ total: sql<number>`COALESCE(SUM(total::numeric), 0)` }).from(orders).where(eq(orders.paymentStatus, 'paid')),
  ]);

  const stats = [
    { label: 'Ordini', value: Number(orderCount[0]?.count || 0), icon: ShoppingCart, color: 'bg-blue' },
    { label: 'Clienti', value: Number(customerCount[0]?.count || 0), icon: Users, color: 'bg-green-600' },
    { label: 'Prodotti attivi', value: Number(productCount[0]?.count || 0), icon: Package, color: 'bg-purple-600' },
    {
      label: 'Fatturato',
      value: new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(revenue[0]?.total || 0)),
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  const modules = [
    {
      href: '/admin/ordini',
      icon: ShoppingCart,
      title: 'Ordini',
      description: 'Gestire gli ordini ricevuti, aggiornare lo stato, esportare per Easyfatt.',
      color: 'text-blue',
      bg: 'bg-blue/5',
    },
    {
      href: '/admin/clienti',
      icon: Users,
      title: 'Clienti',
      description: 'Gestire i clienti registrati, assegnare listini, visualizzare storico acquisti.',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      href: '/admin/prodotti',
      icon: Package,
      title: 'Prodotti',
      description: 'Gestire il catalogo prodotti, prezzi, disponibilita e immagini.',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      href: '/admin/categorie',
      icon: FolderTree,
      title: 'Cataloghi',
      description: 'Gestire gruppi, categorie e sottocategorie del catalogo.',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      href: '/admin/prezzi',
      icon: Tag,
      title: 'Prezzi e Listini',
      description: 'Gestire i listini prezzi, ricarichi per categoria e sconti speciali.',
      color: 'text-red',
      bg: 'bg-red/5',
    },
    {
      href: '/admin/import',
      icon: Upload,
      title: 'Import CSV',
      description: 'Importare e aggiornare il catalogo prodotti da file CSV.',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      href: '/admin/easyfatt',
      icon: FileText,
      title: 'Easyfatt',
      description: 'Esportare ordini e clienti in formato Easyfatt per la fatturazione.',
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      href: '/admin/impostazioni',
      icon: Settings,
      title: 'Preferenze',
      description: 'Gestire le impostazioni del canale di vendita online.',
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
  ];

  const statusLabels: Record<string, string> = {
    nuovo: 'Nuovo',
    confermato: 'Confermato',
    in_preparazione: 'In preparazione',
    spedito: 'Spedito',
    consegnato: 'Consegnato',
    annullato: 'Annullato',
  };

  const statusColors: Record<string, string> = {
    nuovo: 'bg-blue-100 text-blue-800',
    confermato: 'bg-indigo-100 text-indigo-800',
    in_preparazione: 'bg-yellow-100 text-yellow-800',
    spedito: 'bg-purple-100 text-purple-800',
    consegnato: 'bg-green-100 text-green-800',
    annullato: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-1">Canale di vendita</h1>
      <p className="text-gray-500 text-sm mb-6">
        Usa i moduli qui sotto per gestire tutti gli aspetti del tuo e-commerce: clienti, prodotti, cataloghi, ordini e preferenze.
      </p>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{stat.label}</span>
              <div className={`p-2 rounded-lg text-white ${stat.color}`}>
                <stat.icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-navy">{typeof stat.value === 'number' ? stat.value.toLocaleString('it-IT') : stat.value}</p>
          </div>
        ))}
      </div>

      {/* Module cards - stile Intershop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue/20 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${mod.bg} flex-shrink-0`}>
                <mod.icon size={22} className={mod.color} />
              </div>
              <div>
                <h3 className={`font-heading font-bold text-lg ${mod.color} group-hover:underline mb-1`}>
                  {mod.title}
                </h3>
                <p className="text-sm text-gray-500">{mod.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Latest import */}
      {latestImport[0] && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-heading font-bold text-navy mb-2">Ultimo import CSV</h2>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{latestImport[0].filename}</span> &mdash;{' '}
            {new Date(latestImport[0].importedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })} &mdash;{' '}
            Stato: <span className="font-medium">{latestImport[0].status}</span> &mdash;{' '}
            {latestImport[0].productsNew} nuovi, {latestImport[0].productsUpdated} aggiornati
          </p>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-heading font-bold text-navy">Ordini recenti</h2>
          <Link href="/admin/ordini" className="text-sm text-blue font-medium hover:underline">
            Vedi tutti
          </Link>
        </div>
        {recentOrders.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Ordine</th>
                <th className="px-5 py-3 text-left">Cliente</th>
                <th className="px-5 py-3 text-left">Stato</th>
                <th className="px-5 py-3 text-right">Totale</th>
                <th className="px-5 py-3 text-left">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium font-mono text-navy">{order.orderNumber}</td>
                  <td className="px-5 py-3 text-gray-600">{order.customerName || order.customerEmail}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-medium">
                    {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(parseFloat(String(order.total)))}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">Nessun ordine</div>
        )}
      </div>
    </div>
  );
}
