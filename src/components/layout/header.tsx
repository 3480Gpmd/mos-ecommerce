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

  // Close account dropdown when clicking outside
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

  // Fetch cart count
  useEffect(() => {
    if (!session?.user) return;
    const fetchCount = () => {
      fetch('/api/cart')
        .then((r) => r.json())
        .then((data) => setCartCount((data.items || []).reduce((s: number, i: { qty: number }) => s + i.qty, 0)))
        .catch(() => {});
    };
    fetchCount();
    // Ascolta evento custom per aggiornare il contatore
    const handler = () => fetchCount();
    window.addEventListener('cart-updated', handler);
    // Polling leggero ogni 30s
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

  const handleCatalogEnter = () => {
    if (catalogTimeout.current) clearTimeout(catalogTimeout.current);
    setCatalogOpen(true);
  };

  const handleCatalogLeave = () => {
    catalogTimeout.current = setTimeout(() => setCatalogOpen(false), 250);
  };

  const handleCaffeEnter = () => {
    if (caffeTimeout.current) clearTimeout(caffeTimeout.current);
    setCaffeOpen(true);
  };

  const handleCaffeLeave = () => {
    caffeTimeout.current = setTimeout(() => setCaffeOpen(false), 250);
  };

  const handleFreddeEnter = () => {
    if (freddeTimeout.current) clearTimeout(freddeTimeout.current);
    setFreddeOpen(true);
  };

  const handleFreddeLeave = () => {
    freddeTimeout.current = setTimeout(() => setFreddeOpen(false), 250);
  };

  const handleServiziEnter = () => {
    if (serviziTimeout.current) clearTimeout(serviziTimeout.current);
    setServiziOpen(true);
  };

  const handleServiziLeave = () => {
    serviziTimeout.current = setTimeout(() => setServiziOpen(false), 250);
  };

  const caffeGroup = groups.find((g) => g.slug === 'caffe-e-bevande-calde');
  const freddeGroup = groups.find((g) => g.slug === 'bevande-fredde');

  const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

  return (
    <header className="bg-navy text-white sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-navy-light text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>Consegna gratuita per ordini sopra 100&euro;</span>
          <div className="hidden sm:flex gap-4">
            <Link href="/chi-siamo" className="hover:text-blue-light transition-colors">Chi siamo</Link>
            <Link href="/contatti" className="hover:text-blue-light transition-colors">Contatti</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img src="/logo-light.png" alt="MOS Milano Offre Servizi" className="h-16 md:h-20 w-auto" />
          </Link>

          {/* Search bar - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca prodotti, marche, codici..."
                className="w-full py-3 px-5 pr-14 rounded-lg text-gray-900 text-base bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue"
              />
              <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-blue text-white rounded-md hover:bg-blue/90 transition-colors">
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                <Link href="/preferiti" className="hidden sm:flex items-center gap-1 text-sm hover:text-blue-light transition-colors">
                  <Heart size={20} />
                </Link>
                <Link href="/checkout" className="flex items-center gap-1 text-sm hover:text-blue-light transition-colors relative">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
                {/* Account Dropdown */}
                <div className="relative hidden sm:block" ref={accountDropdownRef}>
                  <button
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className="flex items-center gap-1 text-sm hover:text-blue-light transition-colors"
                  >
                    <User size={20} />
                    <span className="hidden lg:inline">{session.user.name || 'Account'}</span>
                    <ChevronDown size={16} className={`hidden lg:inline transition-transform ${accountDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {accountDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 z-50 bg-white shadow-xl rounded-lg border border-gray-200 w-56 py-1 animate-in fade-in-0 zoom-in-95 duration-200">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Account</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{session.user.name || session.user.email}</p>
                      </div>

                      {/* Menu Items */}
                      <Link
                        href="/ordini"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setAccountDropdownOpen(false)}
                      >
                        I miei ordini
                      </Link>
                      <Link
                        href="/preferiti"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setAccountDropdownOpen(false)}
                      >
                        Preferiti
                      </Link>
                      <Link
                        href="/profilo"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setAccountDropdownOpen(false)}
                      >
                        Il mio profilo
                      </Link>

                      {/* Separator */}
                      <div className="my-1 border-t border-gray-100"></div>

                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          signOut({ callbackUrl: '/' });
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium"
                      >
                        <LogOut size={16} />
                        Esci
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="flex items-center gap-1 text-sm hover:text-blue-light transition-colors">
                  <User size={20} />
                  <span className="hidden sm:inline">Accedi</span>
                </Link>
                <span className="hidden sm:inline text-gray-500">|</span>
                <Link href="/registrati" className="hidden sm:flex items-center gap-1 text-sm hover:text-blue-light transition-colors">
                  <UserPlus size={18} />
                  <span className="hidden lg:inline">Registrati</span>
                </Link>
              </div>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-1"
            >
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
              className="w-full py-2 px-4 pr-10 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500">
              <Search size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* Navigation bar - una sola riga */}
      <nav className="bg-blue border-t border-blue-light/20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop menu - una riga con mega-menu catalogo */}
          <ul className="hidden md:flex items-center gap-0">
            {/* Servizi */}
            <li
              className="relative"
              onMouseEnter={handleServiziEnter}
              onMouseLeave={handleServiziLeave}
            >
              <button
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-white/10 hover:bg-white/20 rounded transition-colors"
              >
                <Wrench size={18} />
                Servizi
                <ChevronDown size={14} className={`transition-transform ${serviziOpen ? 'rotate-180' : ''}`} />
              </button>

              {serviziOpen && (
                <div className="absolute left-0 top-full z-50 bg-white shadow-2xl rounded-b-xl border border-gray-200 w-[320px] p-4">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Caffè e Bevande Calde</span>
                  <ul className="space-y-1 mb-3">
                    <li><Link href="/servizi/macchine-caffe-comodato" className="block text-sm text-gray-600 hover:text-blue hover:bg-blue/5 px-2 py-1.5 rounded transition-colors" onClick={() => setServiziOpen(false)}>Macchine del caffè in comodato</Link></li>
                    <li><Link href="/servizi/lavazza-firma" className="block text-sm text-gray-600 hover:text-blue hover:bg-blue/5 px-2 py-1.5 rounded transition-colors" onClick={() => setServiziOpen(false)}>Lavazza Firma</Link></li>
                    <li><Link href="/servizi/caffe-borbone" className="block text-sm text-gray-600 hover:text-blue hover:bg-blue/5 px-2 py-1.5 rounded transition-colors" onClick={() => setServiziOpen(false)}>Caffè Borbone</Link></li>
                    <li><Link href="/servizi/bevande-gise" className="block text-sm text-gray-600 hover:text-blue hover:bg-blue/5 px-2 py-1.5 rounded transition-colors" onClick={() => setServiziOpen(false)}>Bevande Gise</Link></li>
                  </ul>
                  <div className="border-t border-gray-100 pt-3">
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bevande Fredde</span>
                    <ul className="space-y-1">
                      <li><Link href="/servizi/dispenser-boccioni" className="block text-sm text-gray-600 hover:text-blue hover:bg-blue/5 px-2 py-1.5 rounded transition-colors" onClick={() => setServiziOpen(false)}>Dispenser e boccioni</Link></li>
                    </ul>
                  </div>
                </div>
              )}
            </li>

            {/* Caffè e Bevande Calde */}
            {caffeGroup && (
              <li
                className="relative"
                onMouseEnter={handleCaffeEnter}
                onMouseLeave={handleCaffeLeave}
              >
                <button
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-white/10 hover:bg-white/20 rounded transition-colors"
                >
                  <Coffee size={18} />
                  Caffè e Bevande Calde
                  <ChevronDown size={14} className={`transition-transform ${caffeOpen ? 'rotate-180' : ''}`} />
                </button>

                {caffeOpen && (
                  <div className="absolute left-0 top-full z-50 bg-white shadow-2xl rounded-b-xl border border-gray-200 w-[320px] p-4">
                    <div>
                      <Link
                        href={`/catalogo?group=${caffeGroup.slug}`}
                        className="block text-sm font-bold text-navy hover:text-blue transition-colors mb-2"
                        onClick={() => setCaffeOpen(false)}
                      >
                        Tutti i prodotti
                      </Link>
                      {caffeGroup.categories.length > 0 && (
                        <ul className="space-y-1">
                          {caffeGroup.categories.map((cat) => (
                            <li key={cat.id}>
                              <Link
                                href={`/catalogo?group=${caffeGroup.slug}&category=${cat.slug}`}
                                className="block text-sm text-gray-600 hover:text-blue hover:bg-blue/5 px-2 py-1.5 rounded transition-colors"
                                onClick={() => setCaffeOpen(false)}
                              >
                                {titleCase(cat.name)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </li>
            )}

            {/* Bevande Fredde */}
            {freddeGroup && (
              <li
                className="relative"
                onMouseEnter={handleFreddeEnter}
                onMouseLeave={handleFreddeLeave}
              >
                <button
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10 rounded transition-colors"
                >
                  <GlassWater size={18} />
                  Bevande Fredde
                  <ChevronDown size={14} className={`transition-transform ${freddeOpen ? 'rotate-180' : ''}`} />
                </button>

                {freddeOpen && (
                  <div className="absolute left-0 top-full z-50 bg-white shadow-2xl rounded-b-xl border border-gray-200 w-[320px] p-4">
                    <div>
                      <Link
                        href={`/catalogo?group=${freddeGroup.slug}`}
                        className="block text-sm font-bold text-navy hover:text-blue transition-colors mb-2"
                        onClick={() => setFreddeOpen(false)}
                      >
                        Tutti i prodotti
                      </Link>
                      {freddeGroup.categories.length > 0 && (
                        <ul className="space-y-1">
                          {freddeGroup.categories.map((cat) => (
                            <li key={cat.id}>
                              <Link
                                href={`/catalogo?group=${freddeGroup.slug}&category=${cat.slug}`}
                                className="block text-sm text-gray-600 hover:text-blue hover:bg-blue/5 px-2 py-1.5 rounded transition-colors"
                                onClick={() => setFreddeOpen(false)}
                              >
                                {titleCase(cat.name)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </li>
            )}

            {/* Catalogo con mega-menu */}
            <li
              className="relative"
              onMouseEnter={handleCatalogEnter}
              onMouseLeave={handleCatalogLeave}
            >
              <button
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10 rounded transition-colors"
              >
                <LayoutGrid size={18} />
                Catalogo
                <ChevronDown size={14} className={`transition-transform ${catalogOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega dropdown */}
              {catalogOpen && (
                <div className="absolute left-0 top-full z-50 bg-white shadow-2xl rounded-b-xl border border-gray-200 w-[1100px] max-h-[480px] overflow-y-auto p-6">
                  <div className="grid grid-cols-4 gap-x-8 gap-y-4">
                    {groups.map((group) => (
                      <div key={group.slug}>
                        <Link
                          href={`/catalogo?group=${group.slug}`}
                          className="block text-sm font-bold text-navy hover:text-blue transition-colors mb-1.5"
                          onClick={() => setCatalogOpen(false)}
                        >
                          {titleCase(group.name)}
                        </Link>
                        {group.categories.length > 0 && (
                          <ul className="space-y-0.5">
                            {group.categories.slice(0, 5).map((cat) => (
                              <li key={cat.id}>
                                <Link
                                  href={`/catalogo?group=${group.slug}&category=${cat.slug}`}
                                  className="block text-xs text-gray-500 hover:text-blue transition-colors py-0.5"
                                  onClick={() => setCatalogOpen(false)}
                                >
                                  {titleCase(cat.name)}
                                </Link>
                              </li>
                            ))}
                            {group.categories.length > 5 && (
                              <li>
                                <Link
                                  href={`/catalogo?group=${group.slug}`}
                                  className="block text-xs text-blue font-medium py-0.5"
                                  onClick={() => setCatalogOpen(false)}
                                >
                                  Vedi tutte ({group.categories.length})
                                </Link>
                              </li>
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
              <Link
                href="/catalogo?promo=true"
                className="block px-4 py-2.5 text-sm font-medium text-yellow-300 hover:bg-white/10 rounded transition-colors"
              >
                Promozioni
              </Link>
            </li>

            {/* Trova cartucce */}
            <li>
              <Link
                href="/ricerca-cartucce"
                className="block px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 rounded transition-colors"
              >
                Trova cartucce
              </Link>
            </li>

            {/* Novita */}
            <li>
              <Link
                href="/catalogo?sort=newest"
                className="block px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 rounded transition-colors"
              >
                Novita
              </Link>
            </li>
          </ul>

          {/* Mobile menu */}
          {menuOpen && (
            <ul className="md:hidden flex flex-col py-2">
              <li>
                <Link href="/servizi/macchine-caffe-comodato" className="block px-3 py-2 text-sm text-white font-bold hover:bg-white/10" onClick={() => setMenuOpen(false)}>
                  Servizi
                </Link>
                <ul className="pl-4">
                  <li><Link href="/servizi/macchine-caffe-comodato" className="block px-3 py-1.5 text-xs text-white/70 hover:bg-white/10" onClick={() => setMenuOpen(false)}>Macchine caffè in comodato</Link></li>
                  <li><Link href="/servizi/lavazza-firma" className="block px-3 py-1.5 text-xs text-white/70 hover:bg-white/10" onClick={() => setMenuOpen(false)}>Lavazza Firma</Link></li>
                  <li><Link href="/servizi/caffe-borbone" className="block px-3 py-1.5 text-xs text-white/70 hover:bg-white/10" onClick={() => setMenuOpen(false)}>Caffè Borbone</Link></li>
                  <li><Link href="/servizi/bevande-gise" className="block px-3 py-1.5 text-xs text-white/70 hover:bg-white/10" onClick={() => setMenuOpen(false)}>Bevande Gise</Link></li>
                  <li><Link href="/servizi/dispenser-boccioni" className="block px-3 py-1.5 text-xs text-white/70 hover:bg-white/10" onClick={() => setMenuOpen(false)}>Dispenser e boccioni</Link></li>
                </ul>
              </li>
              <li className="border-t border-white/10 mt-1 pt-1"></li>
              {groups.map((group) => (
                <li key={group.slug}>
                  <Link
                    href={`/catalogo?group=${group.slug}`}
                    className="block px-3 py-2 text-sm text-white hover:bg-white/10"
                    onClick={() => setMenuOpen(false)}
                  >
                    {titleCase(group.name)}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/catalogo?promo=true" className="block px-3 py-2 text-sm text-yellow-300" onClick={() => setMenuOpen(false)}>
                  Promozioni
                </Link>
              </li>
              <li>
                <Link href="/ricerca-cartucce" className="block px-3 py-2 text-sm text-white" onClick={() => setMenuOpen(false)}>
                  Trova cartucce
                </Link>
              </li>
              <li className="border-t border-white/10 mt-2 pt-2">
                <Link href="/chi-siamo" className="block px-3 py-2 text-sm text-white/70" onClick={() => setMenuOpen(false)}>
                  Chi siamo
                </Link>
              </li>
              <li>
                <Link href="/contatti" className="block px-3 py-2 text-sm text-white/70" onClick={() => setMenuOpen(false)}>
                  Contatti
                </Link>
              </li>
            </ul>
          )}
        </div>
      </nav>
    </header>
  );
}
