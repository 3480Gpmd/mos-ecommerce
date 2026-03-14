'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Printer, ChevronRight } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface Model {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  code: string;
  name: string;
  brand: string | null;
  partNumber: string | null;
  priceNet: string | null;
  pricePublic: string | null;
  vatCode: string | null;
  stockAvailable: number;
  imageUrl: string | null;
  isPromo: boolean;
}

export default function RicercaCartuccePage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Carica le marche all'avvio
  useEffect(() => {
    fetch('/api/printer-search?action=brands')
      .then((r) => r.json())
      .then((data) => setBrands(data.brands || []))
      .catch(() => {});
  }, []);

  // Quando cambia marca, carica i modelli (sottocategorie)
  useEffect(() => {
    setModels([]);
    setSelectedModel('');
    if (!selectedBrand) return;
    fetch(`/api/printer-search?action=models&brand=${encodeURIComponent(selectedBrand)}`)
      .then((r) => r.json())
      .then((data) => setModels(data.models || []))
      .catch(() => {});
  }, [selectedBrand]);

  // Ricerca automatica quando cambia marca o modello
  useEffect(() => {
    if (selectedBrand) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand, selectedModel]);

  const handleSearch = async () => {
    if (!selectedBrand && !searchText.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ action: 'products' });
      if (selectedBrand) params.set('brand', selectedBrand);
      if (selectedModel) params.set('model', selectedModel);
      if (searchText.trim()) params.set('q', searchText.trim());
      const res = await fetch(`/api/printer-search?${params}`);
      const data = await res.json();
      setResults(data.products || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

  const formatPrice = (price: string | null) => {
    if (!price) return '—';
    const num = parseFloat(price);
    return num.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue/10 rounded-2xl mb-4">
          <Printer size={32} className="text-blue" />
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-navy mb-3">
          Trova Cartucce e Toner
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Trova il toner o la cartuccia compatibile con la tua stampante.
          Seleziona la marca, il tipo di prodotto e cerca per modello o codice.
        </p>
      </div>

      {/* Search form */}
      <div className="bg-white shadow-lg rounded-2xl border border-gray-100 p-6 md:p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Marca */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              1. Marca
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue bg-white"
            >
              <option value="">Seleziona marca...</option>
              {brands.map((b) => (
                <option key={b.slug} value={b.slug}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Tipo prodotto (sottocategoria) */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              2. Tipo prodotto
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={!selectedBrand || models.length === 0}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue bg-white disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">Tutti i tipi</option>
              {models.map((m) => (
                <option key={m.slug} value={m.slug}>{titleCase(m.name)}</option>
              ))}
            </select>
          </div>

          {/* Ricerca libera */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              3. Modello o codice
            </label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Es: LaserJet, CF258A..."
              className="w-full py-3 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
            />
          </div>

          {/* Pulsante cerca */}
          <div>
            <button
              onClick={handleSearch}
              disabled={loading || (!selectedBrand && !searchText.trim())}
              className="w-full bg-blue text-white py-3 px-6 rounded-lg font-semibold text-sm hover:bg-blue/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Search size={18} />
              {loading ? 'Ricerca...' : 'Cerca'}
            </button>
          </div>
        </div>

        {/* Suggerimenti */}
        <div className="mt-4 text-xs text-gray-500">
          <strong>Suggerimento:</strong> Seleziona la marca della stampante per vedere tutti i consumabili disponibili,
          poi filtra per tipo o cerca un modello specifico.
        </div>
      </div>

      {/* Risultati */}
      {searched && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold text-navy">
              {loading ? 'Ricerca in corso...' : `${results.length} prodotti trovati`}
            </h2>
          </div>

          {results.length === 0 && !loading && (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <p className="text-gray-500 mb-2">Nessun prodotto trovato per la tua ricerca.</p>
              <p className="text-sm text-gray-400">Prova con un termine diverso o contattaci al <strong>02 6473060</strong></p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            {results.map((product) => (
              <Link
                key={product.code}
                href={`/prodotto/${product.code}`}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-md hover:border-blue/30 transition-all group"
              >
                {/* Immagine */}
                <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                  ) : (
                    <Printer size={28} className="text-gray-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {product.brand && (
                      <span className="text-xs font-semibold text-blue bg-blue/10 px-2 py-0.5 rounded">
                        {product.brand}
                      </span>
                    )}
                    {product.isPromo && (
                      <span className="text-xs font-semibold text-red bg-red/10 px-2 py-0.5 rounded">
                        PROMO
                      </span>
                    )}
                    {product.partNumber && (
                      <span className="text-xs text-gray-400">
                        {product.partNumber}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-navy text-sm truncate group-hover:text-blue transition-colors">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Cod. {product.code}
                    {product.stockAvailable > 0
                      ? <span className="text-green-600 ml-2">Disponibile ({product.stockAvailable})</span>
                      : <span className="text-red ml-2">Non disponibile</span>
                    }
                  </p>
                </div>

                {/* Prezzo */}
                <div className="text-right flex-shrink-0">
                  {product.pricePublic && product.pricePublic !== product.priceNet && (
                    <p className="text-xs text-gray-400 line-through">{formatPrice(product.pricePublic)}</p>
                  )}
                  <p className="font-bold text-navy text-lg">{formatPrice(product.priceNet)}</p>
                  <p className="text-xs text-gray-400">+ IVA</p>
                </div>

                <ChevronRight size={20} className="text-gray-300 group-hover:text-blue transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Info section */}
      {!searched && (
        <div className="bg-blue/5 rounded-2xl p-6 md:p-8">
          <h2 className="font-heading text-xl font-bold text-navy mb-4">Come trovare il prodotto giusto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
              <div>
                <h3 className="font-semibold text-navy text-sm mb-1">Seleziona la marca</h3>
                <p className="text-xs text-gray-600">Scegli il produttore della tua stampante (HP, Epson, Canon, ecc.)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
              <div>
                <h3 className="font-semibold text-navy text-sm mb-1">Scegli il tipo</h3>
                <p className="text-xs text-gray-600">Filtra per tipo di consumabile: inkjet, laser, nastri, ecc.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
              <div>
                <h3 className="font-semibold text-navy text-sm mb-1">Cerca il modello</h3>
                <p className="text-xs text-gray-600">Inserisci il modello della stampante o il codice della cartuccia</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
