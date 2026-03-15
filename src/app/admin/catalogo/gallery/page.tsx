'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Save, X, Search, Image, Star, GripVertical } from 'lucide-react';

interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

interface ProductResult {
  id: number;
  code: string;
  name: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductResult[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newImage, setNewImage] = useState({ imageUrl: '', altText: '', isPrimary: false });
  const [error, setError] = useState('');

  const fetchImages = useCallback(async (productId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/catalog/gallery?productId=${productId}`);
      if (res.ok) setImages(await res.json());
    } catch {
      setError('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchProducts = async () => {
    if (!searchQuery || searchQuery.length < 2) return;
    try {
      const res = await fetch(`/api/admin/catalog/gallery?searchProducts=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      }
    } catch { /* ignore */ }
  };

  const selectProduct = (product: ProductResult) => {
    setSelectedProduct(product);
    setSearchQuery('');
    setSearchResults([]);
    fetchImages(product.id);
  };

  const handleAddImage = async () => {
    if (!selectedProduct || !newImage.imageUrl) {
      setError('URL immagine obbligatorio');
      return;
    }

    const res = await fetch('/api/admin/catalog/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: selectedProduct.id,
        imageUrl: newImage.imageUrl,
        altText: newImage.altText || null,
        sortOrder: images.length,
        isPrimary: newImage.isPrimary,
      }),
    });

    if (res.ok) {
      setShowAddForm(false);
      setNewImage({ imageUrl: '', altText: '', isPrimary: false });
      fetchImages(selectedProduct.id);
    } else {
      const data = await res.json();
      setError(data.error || 'Errore nel salvataggio');
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    const res = await fetch('/api/admin/catalog/gallery', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: imageId, isPrimary: true }),
    });

    if (res.ok && selectedProduct) {
      fetchImages(selectedProduct.id);
    }
  };

  const handleUpdateSort = async (imageId: number, sortOrder: number) => {
    await fetch('/api/admin/catalog/gallery', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: imageId, sortOrder }),
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questa immagine?')) return;
    const res = await fetch(`/api/admin/catalog/gallery?id=${id}`, { method: 'DELETE' });
    if (res.ok && selectedProduct) fetchImages(selectedProduct.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Image className="w-6 h-6 text-navy" />
        <h1 className="font-heading text-2xl text-navy">Galleria Prodotti</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Product search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Cerca Prodotto</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchProducts()}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
            placeholder="Cerca per codice o nome prodotto..."
          />
        </div>
        {searchResults.length > 0 && (
          <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
            {searchResults.map((p) => (
              <button
                key={p.id}
                onClick={() => selectProduct(p)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0"
              >
                <span className="font-mono text-navy">{p.code}</span>
                <span className="ml-2 text-gray-600">{p.name}</span>
              </button>
            ))}
          </div>
        )}

        {selectedProduct && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-mono text-sm font-medium text-navy">{selectedProduct.code}</span>
              <span className="ml-2 text-sm text-gray-700">{selectedProduct.name}</span>
            </div>
            <button onClick={() => { setSelectedProduct(null); setImages([]); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Image gallery */}
      {selectedProduct && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-heading text-lg text-navy">Immagini ({images.length})</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-navy text-white px-3 py-1.5 rounded-lg text-sm hover:bg-opacity-90 transition"
            >
              <Plus className="w-4 h-4" /> Aggiungi Immagine
            </button>
          </div>

          {showAddForm && (
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Immagine</label>
                <input
                  type="text"
                  value={newImage.imageUrl}
                  onChange={(e) => setNewImage({ ...newImage, imageUrl: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Testo Alternativo</label>
                <input
                  type="text"
                  value={newImage.altText}
                  onChange={(e) => setNewImage({ ...newImage, altText: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Descrizione immagine"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newImage.isPrimary}
                  onChange={(e) => setNewImage({ ...newImage, isPrimary: e.target.checked })}
                  className="rounded"
                />
                <label className="text-sm text-gray-700">Immagine principale</label>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddImage} className="bg-navy text-white px-4 py-2 rounded-lg text-sm hover:bg-opacity-90">
                  <Save className="w-4 h-4 inline mr-1" /> Salva
                </button>
                <button onClick={() => { setShowAddForm(false); setNewImage({ imageUrl: '', altText: '', isPrimary: false }); }}
                  className="text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-100">
                  Annulla
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="px-6 py-8 text-center text-gray-400">Caricamento...</div>
            ) : images.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400">Nessuna immagine per questo prodotto</div>
            ) : (
              images.map((img, index) => (
                <div key={img.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50">
                  <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={img.imageUrl} alt={img.altText || ''} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{img.imageUrl}</p>
                    <p className="text-xs text-gray-400">{img.altText || 'Nessun testo alternativo'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={img.sortOrder}
                      onChange={(e) => handleUpdateSort(img.id, parseInt(e.target.value) || 0)}
                      className="border border-gray-200 rounded px-2 py-1 text-sm w-14 text-center"
                      title="Ordine"
                    />
                    <button
                      onClick={() => handleSetPrimary(img.id)}
                      className={`p-1 rounded ${img.isPrimary ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}
                      title={img.isPrimary ? 'Immagine principale' : 'Imposta come principale'}
                    >
                      <Star className="w-4 h-4" fill={img.isPrimary ? 'currentColor' : 'none'} />
                    </button>
                    <button onClick={() => handleDelete(img.id)} className="text-gray-400 hover:text-red-600 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
