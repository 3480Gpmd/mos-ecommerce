'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Upload, FileText, FolderTree, Tag, Settings, LogOut, ExternalLink, ClipboardList,
  Cog, Megaphone, BookOpen, MessageSquare, BarChart3, Download, ChevronDown, ChevronRight, ShoppingBag,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/ordini', label: 'Ordini', icon: ShoppingCart },
  { href: '/admin/prodotti', label: 'Prodotti', icon: Package },
  { href: '/admin/categorie', label: 'Categorie', icon: FolderTree },
  { href: '/admin/prezzi', label: 'Prezzi', icon: Tag },
  { href: '/admin/clienti', label: 'Clienti', icon: Users },
  { href: '/admin/preventivi', label: 'Preventivi', icon: ClipboardList },
  { href: '/admin/carrelli-abbandonati', label: 'Carrelli Abbandonati', icon: ShoppingBag },
  {
    href: '/admin/configurazione', label: 'Configurazione', icon: Cog,
    children: [
      { href: '/admin/configurazione/azienda', label: 'Dati Aziendali', icon: Cog },
      { href: '/admin/configurazione/pagamenti', label: 'Pagamenti', icon: Cog },
      { href: '/admin/configurazione/spedizioni', label: 'Spedizioni', icon: Cog },
      { href: '/admin/configurazione/supplementi', label: 'Supplementi', icon: Cog },
      { href: '/admin/configurazione/destinazioni', label: 'Destinazioni', icon: Cog },
      { href: '/admin/configurazione/unita', label: 'Unità Vendita', icon: Cog },
      { href: '/admin/configurazione/scalare', label: 'Prezzi a Volume', icon: Cog },
      { href: '/admin/configurazione/contratti', label: 'Contratti', icon: Cog },
    ],
  },
  {
    href: '/admin/promozioni', label: 'Promozioni', icon: Megaphone,
    children: [
      { href: '/admin/promozioni/coupon', label: 'Coupon', icon: Megaphone },
      { href: '/admin/promozioni/vetrina', label: 'Vetrina', icon: Megaphone },
      { href: '/admin/promozioni/superprezzo', label: 'SuperPrezzo', icon: Megaphone },
      { href: '/admin/promozioni/omaggi', label: 'Omaggi', icon: Megaphone },
      { href: '/admin/promozioni/promo-novita', label: 'Promo e Novità', icon: Megaphone },
      { href: '/admin/campagne', label: 'Campagne', icon: Megaphone },
    ],
  },
  {
    href: '/admin/catalogo', label: 'Catalogo', icon: BookOpen,
    children: [
      { href: '/admin/catalogo/sinonimi', label: 'Sinonimi Ricerca', icon: BookOpen },
      { href: '/admin/catalogo/rilevanza', label: 'Rilevanza', icon: BookOpen },
      { href: '/admin/catalogo/gallery', label: 'Gallery Prodotti', icon: BookOpen },
      { href: '/admin/relazioni-prodotti', label: 'Relazioni Prodotti', icon: BookOpen },
    ],
  },
  { href: '/admin/comunicazioni', label: 'Comunicazioni', icon: MessageSquare },
  {
    href: '/admin/statistiche', label: 'Statistiche', icon: BarChart3,
    children: [
      { href: '/admin/statistiche/ordini', label: 'Ordini', icon: BarChart3 },
      { href: '/admin/statistiche/accessi', label: 'Accessi', icon: BarChart3 },
      { href: '/admin/statistiche/prodotti', label: 'Prodotti Più Visti', icon: BarChart3 },
    ],
  },
  { href: '/admin/esportazioni', label: 'Esportazioni', icon: Download },
  { href: '/admin/import', label: 'Import CSV', icon: Upload },
  { href: '/admin/easyfatt', label: 'Easyfatt', icon: FileText },
  { href: '/admin/impostazioni', label: 'Impostazioni', icon: Settings },
];

function NavLink({ item, pathname, depth = 0 }: { item: NavItem; pathname: string; depth?: number }) {
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
  const [open, setOpen] = useState(isActive);

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            isActive
              ? 'bg-white/15 text-white font-medium'
              : 'text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-3">
            <item.icon size={18} />
            {item.label}
          </span>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {open && (
          <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-2">
            {item.children!.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  pathname === child.href
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
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
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-navy text-white flex-shrink-0 hidden lg:flex lg:flex-col overflow-y-auto">
        <div className="p-4 border-b border-white/10">
          <Link href="/" className="font-heading text-lg font-bold">
            <span className="text-red">MOS</span> Admin
          </Link>
        </div>
        <nav className="p-3 space-y-0.5 flex-1">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
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
          {navItems.filter(i => !i.children).slice(0, 5).map((item) => (
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
