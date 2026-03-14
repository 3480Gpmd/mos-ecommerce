'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Package, ShoppingCart, Users, Upload, FileText, FolderTree, Tag, Settings, LogOut, ExternalLink, ClipboardList } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/ordini', label: 'Ordini', icon: ShoppingCart },
  { href: '/admin/prodotti', label: 'Prodotti', icon: Package },
  { href: '/admin/categorie', label: 'Categorie', icon: FolderTree },
  { href: '/admin/prezzi', label: 'Prezzi', icon: Tag },
  { href: '/admin/clienti', label: 'Clienti', icon: Users },
  { href: '/admin/preventivi', label: 'Preventivi', icon: ClipboardList },
  { href: '/admin/import', label: 'Import CSV', icon: Upload },
  { href: '/admin/easyfatt', label: 'Easyfatt', icon: FileText },
  { href: '/admin/impostazioni', label: 'Impostazioni', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-navy text-white flex-shrink-0 hidden lg:flex lg:flex-col">
        <div className="p-4 border-b border-white/10">
          <Link href="/" className="font-heading text-lg font-bold">
            <span className="text-red">MOS</span> Admin
          </Link>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ExternalLink size={18} />
            Vai al sito
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-300 hover:bg-red/20 hover:text-red-200 transition-colors"
          >
            <LogOut size={18} />
            Esci
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-navy text-white p-3 z-50 flex items-center justify-between">
        <Link href="/admin" className="font-heading text-lg font-bold">
          <span className="text-red">MOS</span> Admin
        </Link>
        <div className="flex items-center gap-1">
          {navItems.slice(0, 5).map((item) => (
            <Link key={item.href} href={item.href} className="p-2 rounded-lg hover:bg-white/10" title={item.label}>
              <item.icon size={16} />
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 rounded-lg hover:bg-red/20 text-red-300"
            title="Esci"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-6 lg:p-8 lg:mt-0 mt-14 overflow-auto">
        {children}
      </main>
    </div>
  );
}
