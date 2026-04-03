'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, User, Search, Menu, X, Heart, ChevronDown, UserPlus, LayoutGrid, Coffee, GlassWater, Wrench, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Group {
  id: number;
  name: string;
  slug: string;
  categories: Category[];
}

export function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [caffeOpen, setCaffeOpen] = useState(false);
  const [freddeOpen, setFreddeOpen] = useState(false);
  const [serviziOpen, setServiziOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const catalogTimeout = useRef<NodeJS.Timeout | null>(null);
  const caffeTimeout = useRef<NodeJS.Timeout | null>(null);
  const freddeTimeout = useRef<NodeJS.Timeout | null>(null);
  const serviziTimeout = useRef<NodeJS.Timeout | null>(null);
  const accountDropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/navigation')
      .then((r) => r.json())
      .then((data) => setGroups(data.groups || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };
    if (accountDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [accountDropdownOpen]);

  useEffect(() => {
    if (!session?.user) return;
    const fetchCount = () => {
      fetch('/api/cart')
        .then((r) => r.json())
        .then((data) => setCartCount((data.items || []).reduce((s: number, i: { qty: number }) => s + i.qty, 0)))
        .catch(() => {});
    };
    fetchCount();
    const handler = () => fetchCount();
    window.addEventListener('cart-updated', handler);
    const interval = setInterval(fetchCount, 30000);
    return () => { window.removeEventListener('cart-updated', handler); clearInterval(interval); };
  }, [session]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleCatalogEnter = () => { if (catalogTimeout.current) clearTimeout(catalogTimeout.current); setCatalogOpen(true); };
  const handleCatalogLeave = () => { catalogTimeout.current = setTimeout(() => setCatalogOpen(false), 250); };
  const handleCaffeEnter = () => { if (caffeTimeout.current) clearTimeout(caffeTimeout.current); setCaffeOpen(true); };
  const handleCaffeLeave = () => { caffeTimeout.current = setTimeout(() => setCaffeOpen(false), 250); };
  const handleFreddeEnter = () => { if (freddeTimeout.current) clearTimeout(freddeTimeout.current); setFreddeOpen(true); };
  const handleFreddeLeave = () => { freddeTimeout.current = setTimeout(() => setFreddeOpen(false), 250); };
  const handleServiziEnter = () => { if (serviziTimeout.current) clearTimeout(serviziTimeout.current); setServiziOpen(true); };
  const handleServiziLeave = () => { serviziTimeout.current = setTimeout(() => setServiziOpen(false), 250); };

  const caffeGroup = groups.find((g) => g.slug === 'caffe-e-bevande-calde');
  const freddeGroup = groups.find((g) => g.slug === 'bevande-fredde');
  const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

  return (
    <header className={`bg-white sticky top-0 z-50 transition-shadow duration-200 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      {/* Top bar — sottile, elegante */}
      <div className="bg-gray-50 border-b border-gray-100 text-[11px] text-gray-500 tracking-wide">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-8">
          <span>Consegna gratuita per ordini sopra 100&euro; &mdash; Milano e provincia</span>
          <div className="hidden sm:flex gap-5">
            <Link href="/chi-siamo" className="hover:text-dark transition-colors">Chi siamo</Link>
            <Link href="/contatti" className="hover:text-dark transition-colors">Contatti</Link>
            <span>Tel. 02 6473060</span>
          </div>
        </div>
      </div>

      {/* Main header — bianco, spazioso */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img src="/logo-dark.jpg" alt="MOS Milano Offre Servizi" className="h-14 md:h-16 w-auto" />
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca prodotti, marche, codici..."
                className="w-full py-2.5 px-4 pr-12 rounded-lg text-gray-900 text-sm bg-gray-50 border border-gray-200 focus:outline-none focus:border-mos-red focus:ring-1 focus:ring-mos-red/20 transition-colors"
              />
              <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-mos-red transition-colors">
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                <Link href="/preferiti" className="hidden sm:flex items-center text-gray-500 hover:text-mos-red transition-colors">
                  <Heart size={20} />
                </Link>
                <Link href="/checkout" className="flex items-center text-gray-500 hover:text-mos-red transition-colors relative">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-mos-red text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
                {/* Account Dropdown */}
                <div className="relative hidden sm:block" ref={accountDropdownRef}>
                  <button
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-dark transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User size={16} className="text-gray-500" />
                    </div>
                    <span className="hidden lg:inline font-medium">{session.user.name || 'Account'}</span>
                    <ChevronDown size={14} className={`hidden lg:inline transition-transform ${accountDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {accountDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 z-50 bg-white shadow-lg rounded-xl border border-gray-100 w-56 py-1 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Account</p>
                        <p className="text-sm font-semibold text-dark truncate mt-0.5">{session.user.name || session.user.email}</p>
                      </div>
                      <Link href="/ordini" className="block px-4 py-2.5 text-sm text-gray-600 hover:text-dark hover:bg-gray-50 transition-colors" onClick={() => setAccountDropdownOpen(false)}>I miei ordini</Link>
                      <Link href="/preferiti" className="block px-4 py-2.5 text-sm text-gray-600 hover:text-dark hover:bg-gray-50 transition-colors" onClick={() => setAccountDropdownOpen(false)}>Preferiti</Link>
                      <Link href="/profilo" className="block px-4 py-2.5 text-sm text-gray-600 hover:text-dark hover:bg-gray-50 transition-colors" onClick={() => setAccountDropdownOpen(false)}>Il mio profilo</Link>
                      <div className="my-1 border-t border-gray-50"></div>
                      <button
                        onClick={() => { setAccountDropdownOpen(false); signOut({ callbackUrl: '/' }); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-mos-red hover:bg-mos-red-light transition-colors flex items-center gap-2 font-medium"
                      >
                        <LogOut size={16} />
                        Esci
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-dark transition-colors">
                  <User size={18} />
                  <span className="hidden sm:inline">Accedi</span>
                </Link>
                <Link href="/registrati" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-white bg-mos-red hover:bg-mos-red-hover px-4 py-2 rounded-lg transition-colors">
                  <UserPlus size={16} />
                  Registrati
                </Link>
              </div>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-1 text-gray-600">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="md:hidden mt-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca prodotti..."
              className="w-full py-2.5 px-4 pr-10 rounded-lg text-gray-900 text-sm bg-gray-50 border border-gray-200 focus:outline-none focus:border-mos-red focus:ring-1 focus:ring-mos-red/20"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400">
              <Search size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* Navigation bar — sfondo scuro elegante */}
      <nav className="bg-dark">
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop menu */}
          <ul className="hidden md:flex items-center gap-0">
            {/* Servizi */}
            <li className="relative" onMouseEnter={handleServiziEnter} onMouseLeave={handleServiziLeave}>
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white hover:text-mos-red transition-colors">
                <Wrench size={16} />
                Servizi
                <ChevronDown size={13} className={`transition-transform opacity-60 ${serviziOpen ? 'rotate-180' : ''}`} />
              </button>
              {serviziOpen && (
                <div className="absolute left-0 top-full z-50 bg-white shadow-xl rounded-b-xl border border-gray-100 w-[300px] p-5">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Caffè e Bevande Calde</span>
                  <ul className="space-y-0.5 mb-4">
                    <li><Link href="/servizi/macchine-caffe-comodato" className="block text-sm text-gray-600 hover:text-mos-red hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors" onClick={() => setServiziOpen(false)}>Macchine del caffè in comodato</Link></li>
                    <li><Link href="/servizi/lavazza-firma" className="block text-sm text-gray-600 hover:text-mos-red hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors" onClick={() => setServiziOpen(false)}>Lavazza Firma</Link></li>
                    <li><Link href="/servizi/caffe-borbone" className="block text-sm text-gray-600 hover:text-mos-red hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors" onClick={() => setServiziOpen(false)}>Caffè Borbone</Link></li>
                    <li><Link href="/servizi/bevande-gise" className="block text-sm text-gray-600 hover:text-mos-red hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors" onClick={() => setServiziOpen(false)}>Bevande Gise</Link></li>
                  </ul>
                  <div className="border-t border-gray-100 pt-3">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Bevande Fredde</span>
                    <ul className="space-y-0.5">
                      <li><Link href="/servizi/dispenser-boccioni" className="block text-sm text-gray-600 hover:text-mos-red hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors" onClick={() => setServiziOpen(false)}>Dispenser e boccioni</Link></li>
                    </ul>
                  </div>
                </div>
              )}
            </li>

            {/* Caffè e Bevande Calde */}
            {caffeGroup && (
              <li className="relative" onMouseEnter={handleCaffeEnter} onMouseLeave={handleCaffeLeave}>
                <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white hover:text-mos-red transition-colors">
                  <Coffee size={16} />
                  Caffè e Bevande Calde
                  <ChevronDown size={13} className={`transition-transform opacity-60 ${caffeOpen ? 'rotate-180' : ''}`} />
                </button>
                {caffeOpen && (
                  <div className="absolute left-0 top-full z-50 bg-white shadow-xl rounded-b-xl border border-gray-100 w-[300px] p-5">
                    <Link href={`/catalogo?group=${caffeGroup.slug}`} className="block text-sm font-bold text-dark hover:text-mos-red transition-colors mb-3" onClick={() => setCaffeOpen(false)}>Tutti i prodotti</Link>
                    {caffeGroup.categories.length > 0 && (
                      <ul className="space-y-0.5">
                        {caffeGroup.categories.map((cat) => (
                          <li key={cat.id}>
                            <Link href={`/catalogo?group=${caffeGroup.slug}&category=${cat.slug}`} className="block text-sm text-gray-600 hover:text-mos-red hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors" onClick={() => setCaffeOpen(false)}>{titleCase(cat.name)}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            )}

            {/* Bevande Fredde */}
            {freddeGroup && (
              <li className="relative" onMouseEnter={handleFreddeEnter} onMouseLeave={handleFreddeLeave}>
                <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white hover:text-mos-red transition-colors">
                  <GlassWater size={16} />
                  Bevande Fredde
                  <ChevronDown size={13} className={`transition-transform opacity-60 ${freddeOpen ? 'rotate-180' : ''}`} />
                </button>
                {freddeOpen && (
                  <div className="absolute left-0 top-full z-50 bg-white shadow-xl rounded-b-xl border border-gray-100 w-[300px] p-5">
                    <Link href={`/catalogo?group=${freddeGroup.slug}`} className="block text-sm font-bold text-dark hover:text-mos-red transition-colors mb-3" onClick={() => setFreddeOpen(false)}>Tutti i prodotti</Link>
                    {freddeGroup.categories.length > 0 && (
                      <ul className="space-y-0.5">
                        {freddeGroup.categories.map((cat) => (
                          <li key={cat.id}>
                            <Link href={`/catalogo?group=${freddeGroup.slug}&category=${cat.slug}`} className="block text-sm text-gray-600 hover:text-mos-red hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors" onClick={() => setFreddeOpen(false)}>{titleCase(cat.name)}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            )}

            {/* Catalogo con mega-menu */}
            <li className="relative" onMouseEnter={handleCatalogEnter} onMouseLeave={handleCatalogLeave}>
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white hover:text-mos-red transition-colors">
                <LayoutGrid size={16} />
                Catalogo
                <ChevronDown size={13} className={`transition-transform opacity-60 ${catalogOpen ? 'rotate-180' : ''}`} />
              </button>
              {catalogOpen && (
                <div className="absolute left-0 top-full z-50 bg-white shadow-xl rounded-b-xl border border-gray-100 w-[1100px] max-h-[480px] overflow-y-auto p-6">
                  <div className="grid grid-cols-4 gap-x-8 gap-y-5">
                    {groups.map((group) => (
                      <div key={group.slug}>
                        <Link href={`/catalogo?group=${group.slug}`} className="block text-sm font-bold text-dark hover:text-mos-red transition-colors mb-2" onClick={() => setCatalogOpen(false)}>{titleCase(group.name)}</Link>
                        {group.categories.length > 0 && (
                          <ul className="space-y-0.5">
                            {group.categories.slice(0, 5).map((cat) => (
                              <li key={cat.id}>
                                <Link href={`/catalogo?group=${group.slug}&category=${cat.slug}`} className="block text-xs text-gray-500 hover:text-mos-red transition-colors py-0.5" onClick={() => setCatalogOpen(false)}>{titleCase(cat.name)}</Link>
                              </li>
                            ))}
                            {group.categories.length > 5 && (
                              <li><Link href={`/catalogo?group=${group.slug}`} className="block text-xs text-mos-red font-medium py-0.5" onClick={() => setCatalogOpen(false)}>Vedi tutte ({group.categories.length})</Link></li>
                            )}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>

            {/* Promozioni */}
            <li>
              <Link href="/catalogo?promo=true" className="block px-4 py-2.5 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                Promozioni
              </Link>
            </li>

            {/* Trova cartucce */}
            <li>
              <Link href="/ricerca-cartucce" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white transition-colors">
                Trova cartucce
              </Link>
            </li>

            {/* Novita */}
            <li>
              <Link href="/catalogo?sort=newest" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white transition-colors">
                Novità
              </Link>
            </li>
          </ul>

          {/* Mobile menu */}
          {menuOpen && (
            <ul className="md:hidden flex flex-col py-3 divide-y divide-white/10">
              <li>
                <span className="block px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Servizi</span>
                <ul>
                  <li><Link href="/servizi/macchine-caffe-comodato" className="block px-3 py-2 text-sm text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Macchine caffè in comodato</Link></li>
                  <li><Link href="/servizi/lavazza-firma" className="block px-3 py-2 text-sm text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Lavazza Firma</Link></li>
                  <li><Link href="/servizi/caffe-borbone" className="block px-3 py-2 text-sm text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Caffè Borbone</Link></li>
                  <li><Link href="/servizi/bevande-gise" className="block px-3 py-2 text-sm text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Bevande Gise</Link></li>
                  <li><Link href="/servizi/dispenser-boccioni" className="block px-3 py-2 text-sm text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Dispenser e boccioni</Link></li>
                </ul>
              </li>
              <li className="pt-2">
                {groups.map((group) => (
                  <Link key={group.slug} href={`/catalogo?group=${group.slug}`} className="block px-3 py-2 text-sm text-white hover:text-mos-red" onClick={() => setMenuOpen(false)}>{titleCase(group.name)}</Link>
                ))}
              </li>
              <li className="pt-2">
                <Link href="/catalogo?promo=true" className="block px-3 py-2 text-sm font-semibold text-amber-400" onClick={() => setMenuOpen(false)}>Promozioni</Link>
                <Link href="/ricerca-cartucce" className="block px-3 py-2 text-sm text-gray-300" onClick={() => setMenuOpen(false)}>Trova cartucce</Link>
              </li>
              <li className="pt-2">
                <Link href="/chi-siamo" className="block px-3 py-2 text-sm text-gray-400" onClick={() => setMenuOpen(false)}>Chi siamo</Link>
                <Link href="/contatti" className="block px-3 py-2 text-sm text-gray-400" onClick={() => setMenuOpen(false)}>Contatti</Link>
              </li>
            </ul>
          )}
        </div>
      </nav>
    </header>
  );
}
