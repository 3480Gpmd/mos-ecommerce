'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProductCard } from '@/components/shop/product-card';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X, FolderOpen } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import type { Product } from '@/db/schema';

interface Subcategory {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

interface Group {
  id: number;
  name: string;
  slug: string;
  categories: Category[];
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function CatalogoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);

  const q = searchParams.get('q') || '';
  const group = searchParams.get('group') || '';
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const brand = searchParams.get('brand') || '';
  const promo = searchParams.get('promo') || '';
  const sort = searchParams.get('sort') || 'name';
  const page = parseInt(searchParams.get('page') || '1');

  const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

  // Fetch navigation groups for sidebar
  useEffect(() => {
    fetch('/api/navigation')
      .then((r) => r.json())
      .then((data) => setGroups(data.groups || []))
      .catch(() => {});
  }, []);

  const currentGroup = groups.find((g) => g.slug === group);
  const currentCategory = currentGroup?.categories.find((c) => c.slug === category);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (group) params.set('group', group);
    if (category) params.set('category', category);
    if (subcategory) params.set('subcategory', subcategory);
    if (brand) params.set('brand', brand);
    if (promo) params.set('promo', promo);
    params.set('sort', sort);
    params.set('page', String(page));
    params.set('limit', '24');

    try {
      const res = await fetch(`/api/products?${params}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Errore caricamento prodotti:', err);
    } finally {
      setLoading(false);
    }
  }, [q, group, category, subcategory, brand, promo, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/catalogo?${params}`);
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/catalogo?${params}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <PageTitle
          subtitle={data ? `${data.pagination.total} prodotti trovati` : undefined}
        >
          {q
            ? `Risultati per "${q}"`
            : promo
              ? 'Promozioni'
              : category && currentGroup
                ? titleCase(currentGroup.categories.find((c) => c.slug === category)?.name || category)
                : currentGroup
                  ? titleCase(currentGroup.name)
                  : 'Catalogo'}
        </PageTitle>
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue"
          >
            <option value="name">Nome A-Z</option>
            <option value="price_asc">Prezzo crescente</option>
            <option value="price_desc">Prezzo decrescente</option>
            <option value="newest">Più recenti</option>
          </select>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="md:hidden p-2 border rounded-lg"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <aside className={`${filtersOpen ? 'fixed inset-0 z-50 bg-white p-4 overflow-auto' : 'hidden'} md:block md:relative md:w-60 md:flex-shrink-0`}>
          <div className="flex items-center justify-between mb-4 md:hidden">
            <h2 className="font-bold text-lg">Filtri</h2>
            <button onClick={() => setFiltersOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Category sidebar when a group is selected */}
            {currentGroup && (
              <div>
                <Link
                  href={`/catalogo?group=${currentGroup.slug}`}
                  className="flex items-center gap-2 font-heading font-bold text-navy text-sm mb-3 hover:text-blue transition-colors"
                >
                  <FolderOpen size={16} />
                  {titleCase(currentGroup.name)}
                </Link>
                <ul className="space-y-0.5 border-l-2 border-gray-200 ml-1">
                  {currentGroup.categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/catalogo?group=${currentGroup.slug}&category=${cat.slug}`}
                        className={`block text-sm py-1.5 pl-4 -ml-[2px] border-l-2 transition-colors ${
                          category === cat.slug
                            ? 'border-blue text-blue font-semibold bg-blue/5'
                            : 'border-transparent text-gray-600 hover:text-navy hover:border-gray-400'
                        }`}
                      >
                        {titleCase(cat.name)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Subcategory filters */}
            {currentCategory && currentCategory.subcategories.length > 0 && (
              <div>
                <h3 className="font-bold text-sm mb-2">Filtra per tipo</h3>
                <ul className="space-y-0.5">
                  {currentCategory.subcategories.map((sub) => (
                    <li key={sub.id}>
                      <button
                        onClick={() => updateParam('subcategory', subcategory === sub.slug ? '' : sub.slug)}
                        className={`w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors ${
                          subcategory === sub.slug
                            ? 'bg-blue/10 text-blue font-semibold'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-navy'
                        }`}
                      >
                        {titleCase(sub.name)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Brand filter */}
            <div>
              <h3 className="font-bold text-sm mb-2">Marca</h3>
              <input
                type="text"
                value={brand}
                onChange={(e) => updateParam('brand', e.target.value)}
                placeholder="Cerca marca..."
                className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue"
              />
            </div>

            {/* Promo filter */}
            <div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={promo === 'true'}
                  onChange={(e) => updateParam('promo', e.target.checked ? 'true' : '')}
                  className="rounded border-gray-300 text-blue focus:ring-blue"
                />
                Solo promozioni
              </label>
            </div>

            {/* Active filters */}
            {(q || group || category || subcategory || brand || promo) && (
              <button
                onClick={() => router.push('/catalogo')}
                className="text-sm text-red hover:underline"
              >
                Rimuovi tutti i filtri
              </button>
            )}
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl animate-pulse aspect-[3/4]" />
              ))}
            </div>
          ) : data && data.products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, data.pagination.totalPages - 4));
                    const p = start + i;
                    return (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium ${p === page ? 'bg-blue text-white' : 'border hover:bg-gray-50'}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= data.pagination.totalPages}
                    className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Nessun prodotto trovato</p>
              <p className="text-gray-400 text-sm mt-2">Prova a modificare i filtri o la ricerca</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
