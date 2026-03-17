'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search, Plus, Trash2, X, ChevronDown, ChevronUp,
} from 'lucide-react';

interface Product {
  id: number;
  code: string;
  name: string;
  pricePublic?: string | number;
  priceNet?: string | number;
}

interface ProductRelation {
  id: number;
  productId: number;
  relatedProductId: number;
  relationType: string;
  sortOrder: number;
  relatedProduct?: Product;
}

const formatCurrency = (n: string | number | null) => {
  if (n === null || n === undefined) return '-';
  const num = typeof n === 'string' ? parseFloat(n) : n;
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
};

const relationTypeLabel = (type: string): string => {
  const labels: { [key: string]: string } = {
    upsell: 'Up-Sell',
    crosssell: 'Cross-Sell',
    accessory: 'Accessorio',
    similar: 'Simile',
  };
  return labels[type] || type;
};

const relationTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    upsell: 'bg-blue-100 text-blue-800',
    crosssell: 'bg-green-100 text-green-800',
    accessory: 'bg-purple-100 text-purple-800',
    similar: 'bg-gray-100 text-gray-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export default function RelazioniFrProdottiPage() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [relations, setRelations] = useState<ProductRelation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);

  // New relation form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRelation, setNewRelation] = useState({
    relatedProductId: 0,
    relationType: 'crosssell',
    sortOrder: 0,
    relatedProductSearch: '',
  });
  const [addingRelation, setAddingRelation] = useState(false);

  // Product search
  const handleSearchProducts = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/admin/products?q=${encodeURIComponent(q)}&limit=10`);
      const data = await res.json();
      setSearchResults(data.products || []);
    } catch {
      console.error('Errore ricerca prodotti');
    } finally {
      setSearching(false);
    }
  }, []);

  // Select main product
  const handleSelectProduct = async (product: Product) => {
    setSelectedProductId(product.id);
    setSelectedProduct(product);
    setSearchQuery('');
    setSearchResults([]);

    // Fetch relations
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/product-relations?productId=${product.id}`);
      const data = await res.json();
      setRelations(data.relations || []);
    } catch {
      console.error('Errore caricamento relazioni');
    } finally {
      setLoading(false);
    }
  };

  // Search debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearchProducts(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearchProducts]);

  // Add new relation
  const handleAddRelation = async () => {
    if (!selectedProductId || !newRelation.relatedProductId) return;

    setAddingRelation(true);
    try {
      const res = await fetch('/api/admin/product-relations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          relatedProductId: newRelation.relatedProductId,
          relationType: newRelation.relationType,
          sortOrder: newRelation.sortOrder,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRelations((prev) => [...prev, data.relation]);
        setShowAddForm(false);
        setNewRelation({
          relatedProductId: 0,
          relationType: 'crosssell',
          sortOrder: 0,
          relatedProductSearch: '',
        });
      }
    } catch {
      console.error('Errore aggiunta relazione');
    } finally {
      setAddingRelation(false);
    }
  };

  // Delete relation
  const handleDeleteRelation = async (relationId: number) => {
    if (!confirm('Eliminare questa relazione?')) return;

    try {
      const res = await fetch('/api/admin/product-relations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: relationId }),
      });

      if (res.ok) {
        setRelations((prev) => prev.filter((r) => r.id !== relationId));
      }
    } catch {
      console.error('Errore eliminazione relazione');
    }
  };

  const groupedRelations = {
    upsell: relations.filter((r) => r.relationType === 'upsell'),
    crosssell: relations.filter((r) => r.relationType === 'crosssell'),
    accessory: relations.filter((r) => r.relationType === 'accessory'),
    similar: relations.filter((r) => r.relationType === 'similar'),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Relazioni Prodotti</h1>
      </div>

      {/* Main product search */}
      <div className="mb-6 bg-white rounded-xl shadow-sm p-6">
        <label className="text-sm font-medium text-gray-700 block mb-3">Seleziona prodotto</label>
        <div className="relative max-w-lg">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca per nome, codice..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent"
          />

          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                >
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="text-xs text-gray-500">{product.code}</div>
                </button>
              ))}
            </div>
          )}

          {searching && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg p-3 text-center text-gray-500 text-sm">
              Ricerca in corso...
            </div>
          )}
        </div>
      </div>

      {/* Selected product info and relations */}
      {selectedProduct && (
        <div className="space-y-6">
          {/* Product header */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-heading font-bold text-lg">{selectedProduct.name}</h2>
                <p className="text-sm text-gray-500 mt-1">Codice: {selectedProduct.code}</p>
                {selectedProduct.pricePublic && (
                  <p className="text-sm font-medium text-navy mt-1">
                    Prezzo: {formatCurrency(selectedProduct.pricePublic)}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedProductId(null);
                  setSelectedProduct(null);
                  setRelations([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Relations by type */}
          <div className="space-y-4">
            {Object.entries(groupedRelations).map(([type, typeRelations]) => (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-bold text-gray-700">{relationTypeLabel(type)}</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {typeRelations.length}
                  </span>
                </div>

                {typeRelations.length > 0 ? (
                  <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                      <tbody className="divide-y">
                        {typeRelations.map((rel) => (
                          <tr key={rel.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{rel.relatedProduct?.name}</td>
                            <td className="px-4 py-3 text-gray-500">{rel.relatedProduct?.code}</td>
                            <td className="px-4 py-3 text-right text-gray-600">
                              {formatCurrency(rel.relatedProduct?.pricePublic ?? null)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-1 rounded ${relationTypeColor(rel.relationType)}`}>
                                {relationTypeLabel(rel.relationType)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-gray-500">{rel.sortOrder}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDeleteRelation(rel.id)}
                                className="text-red hover:text-red-dark transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
                    Nessuna relazione
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add relation button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-blue text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-blue-light transition-colors"
          >
            <Plus size={16} />
            Aggiungi relazione
          </button>
        </div>
      )}

      {/* Add relation modal */}
      {showAddForm && selectedProductId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg">Aggiungi relazione</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Related product search */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
                  Prodotto correlato
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={newRelation.relatedProductSearch}
                    onChange={(e) => setNewRelation({ ...newRelation, relatedProductSearch: e.target.value })}
                    placeholder="Cerca prodotto..."
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-light"
                  />
                </div>

                {/* Search results */}
                {newRelation.relatedProductSearch.length > 2 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-20 w-full">
                    <div className="relative">
                      {searchResults.length > 0 ? (
                        searchResults.map((product) => (
                          product.id !== selectedProductId && (
                            <button
                              key={product.id}
                              onClick={() => {
                                setNewRelation({
                                  ...newRelation,
                                  relatedProductId: product.id,
                                  relatedProductSearch: `${product.code} - ${product.name}`,
                                });
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0 transition-colors text-sm"
                            >
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-gray-500">{product.code}</div>
                            </button>
                          )
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center text-gray-500 text-sm">
                          Nessun prodotto trovato
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Relation type */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
                  Tipo relazione
                </label>
                <select
                  value={newRelation.relationType}
                  onChange={(e) => setNewRelation({ ...newRelation, relationType: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                >
                  <option value="upsell">Up-Sell</option>
                  <option value="crosssell">Cross-Sell</option>
                  <option value="accessory">Accessorio</option>
                  <option value="similar">Simile</option>
                </select>
              </div>

              {/* Sort order */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
                  Ordine
                </label>
                <input
                  type="number"
                  value={newRelation.sortOrder}
                  onChange={(e) => setNewRelation({ ...newRelation, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleAddRelation}
                  disabled={!newRelation.relatedProductId || addingRelation}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue text-white text-sm font-bold py-2 rounded-lg hover:bg-blue-light disabled:opacity-50 transition-colors"
                >
                  <Plus size={14} />
                  {addingRelation ? 'Aggiunta...' : 'Aggiungi'}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
