'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Save, Plus, Trash2, ArrowUp, ArrowDown, X, ArrowLeft, Eye,
} from 'lucide-react';

interface Section {
  id: number;
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  backgroundColor?: string;
  sortOrder: number;
}

interface ServicePageData {
  id: number;
  title: string;
  slug: string;
  subtitle?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  category: string;
  isActive: boolean;
  sections: Section[];
}

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero' },
  { value: 'text', label: 'Testo' },
  { value: 'features', label: 'Caratteristiche' },
  { value: 'pricing', label: 'Prezzi' },
  { value: 'gallery', label: 'Galleria' },
  { value: 'cta', label: 'Call-to-Action' },
  { value: 'faq', label: 'FAQ' },
  { value: 'testimonial', label: 'Testimonianze' },
  { value: 'process', label: 'Processo' },
];

export default function EditServicePagePage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;
  const isNew = pageId === 'new';

  const [page, setPage] = useState<ServicePageData | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showNewSection, setShowNewSection] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [newSectionType, setNewSectionType] = useState('text');

  useEffect(() => {
    if (!isNew) {
      fetchPage();
    } else {
      setPage({
        id: 0,
        title: '',
        slug: '',
        subtitle: '',
        heroTitle: '',
        heroSubtitle: '',
        heroImageUrl: '',
        metaTitle: '',
        metaDescription: '',
        category: 'caffe',
        isActive: true,
        sections: [],
      });
      setLoading(false);
    }
  }, [pageId, isNew]);

  const fetchPage = async () => {
    try {
      const res = await fetch(`/api/admin/service-pages/${pageId}`);
      if (res.ok) {
        const data = await res.json();
        setPage(data.page);
      }
    } catch (err) {
      console.error('Errore caricamento pagina:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!page || !page.title || !page.slug) {
      alert('Compilare almeno titolo e slug');
      return;
    }

    setSaving(true);
    try {
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/service-pages', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: isNew ? undefined : page.id,
          title: page.title,
          slug: page.slug,
          subtitle: page.subtitle,
          heroTitle: page.heroTitle,
          heroSubtitle: page.heroSubtitle,
          heroImageUrl: page.heroImageUrl,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          category: page.category,
          isActive: page.isActive,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (isNew) {
          router.push(`/admin/servizi/${data.page.id}`);
        } else {
          alert('Pagina salvata con successo');
        }
      }
    } catch (err) {
      console.error('Errore salvataggio:', err);
      alert('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async () => {
    if (!page) return;
    try {
      const res = await fetch(`/api/admin/service-pages/${page.id}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newSectionType,
          sortOrder: page.sections.length,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPage({
          ...page,
          sections: [...page.sections, data.section],
        });
        setShowNewSection(false);
      }
    } catch (err) {
      console.error('Errore aggiunta sezione:', err);
    }
  };

  const handleSaveSection = async () => {
    if (!page || !editingSection) return;
    try {
      const res = await fetch(`/api/admin/service-pages/${page.id}/sections`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSection),
      });
      if (res.ok) {
        const data = await res.json();
        setPage({
          ...page,
          sections: page.sections.map((s) => (s.id === editingSection.id ? data.section : s)),
        });
        setEditingSection(null);
      }
    } catch (err) {
      console.error('Errore salvataggio sezione:', err);
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm('Eliminare questa sezione?')) return;
    if (!page) return;
    try {
      const res = await fetch(`/api/admin/service-pages/${page.id}/sections`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sectionId }),
      });
      if (res.ok) {
        setPage({
          ...page,
          sections: page.sections.filter((s) => s.id !== sectionId),
        });
      }
    } catch (err) {
      console.error('Errore eliminazione sezione:', err);
    }
  };

  const handleReorderSection = async (sectionId: number, direction: 'up' | 'down') => {
    if (!page) return;
    const index = page.sections.findIndex((s) => s.id === sectionId);
    if (
      (direction === 'up' && index === 0)
      || (direction === 'down' && index === page.sections.length - 1)
    ) {
      return;
    }

    const newSections = [...page.sections];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index].sortOrder, newSections[swapIndex].sortOrder] = [
      newSections[swapIndex].sortOrder,
      newSections[index].sortOrder,
    ];
    [newSections[index], newSections[swapIndex]] = [newSections[swapIndex], newSections[index]];

    setPage({ ...page, sections: newSections });

    try {
      await fetch(`/api/admin/service-pages/${page.id}/sections`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: newSections }),
      });
    } catch (err) {
      console.error('Errore riordino sezioni:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>;
  }

  if (!page) {
    return <div className="text-center py-8 text-red">Errore caricamento pagina</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <h1 className="font-heading text-2xl font-bold text-navy">
          {isNew ? 'Nuova pagina' : 'Modifica pagina'}
        </h1>
      </div>

      {/* Main form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-heading font-bold text-lg mb-4">Informazioni generali</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Titolo *</label>
            <input
              type="text"
              value={page.title}
              onChange={(e) => setPage({ ...page, title: e.target.value })}
              className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Slug *</label>
            <input
              type="text"
              value={page.slug}
              onChange={(e) => setPage({ ...page, slug: e.target.value })}
              className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Sottotitolo</label>
          <input
            type="text"
            value={page.subtitle || ''}
            onChange={(e) => setPage({ ...page, subtitle: e.target.value })}
            className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Categoria</label>
            <select
              value={page.category}
              onChange={(e) => setPage({ ...page, category: e.target.value })}
              className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
            >
              <option value="caffe">Caffè</option>
              <option value="acqua">Acqua</option>
              <option value="ufficio">Ufficio</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={page.isActive}
              onChange={(e) => setPage({ ...page, isActive: e.target.checked })}
              className="rounded border-gray-300"
            />
            Attivo
          </label>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-heading font-bold text-lg mb-4">Sezione Hero</h2>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Titolo Hero</label>
          <input
            type="text"
            value={page.heroTitle || ''}
            onChange={(e) => setPage({ ...page, heroTitle: e.target.value })}
            className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light mb-3"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Sottotitolo Hero</label>
          <textarea
            value={page.heroSubtitle || ''}
            onChange={(e) => setPage({ ...page, heroSubtitle: e.target.value })}
            rows={2}
            className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light resize-none mb-3"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase block mb-1">URL immagine Hero</label>
          <input
            type="url"
            value={page.heroImageUrl || ''}
            onChange={(e) => setPage({ ...page, heroImageUrl: e.target.value })}
            className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* SEO Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-heading font-bold text-lg mb-4">SEO</h2>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Meta Title</label>
          <input
            type="text"
            value={page.metaTitle || ''}
            onChange={(e) => setPage({ ...page, metaTitle: e.target.value })}
            maxLength={60}
            className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light mb-3"
          />
          <p className="text-xs text-gray-500">{(page.metaTitle || '').length}/60</p>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Meta Description</label>
          <textarea
            value={page.metaDescription || ''}
            onChange={(e) => setPage({ ...page, metaDescription: e.target.value })}
            maxLength={160}
            rows={2}
            className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light resize-none"
          />
          <p className="text-xs text-gray-500">{(page.metaDescription || '').length}/160</p>
        </div>
      </div>

      {/* Sections Management */}
      {!isNew && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg">Sezioni contenuto</h2>
            <button
              onClick={() => setShowNewSection(true)}
              className="flex items-center gap-2 bg-blue text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-light transition-colors"
            >
              <Plus size={14} />
              Aggiungi sezione
            </button>
          </div>

          {page.sections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nessuna sezione. Crea la prima aggiungendone una nuova.
            </div>
          ) : (
            <div className="space-y-3">
              {page.sections
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((section, idx) => (
                  <div
                    key={section.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          {SECTION_TYPES.find((t) => t.value === section.type)?.label || section.type}
                        </p>
                        <p className="font-medium text-navy">{section.title || '(Senza titolo)'}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleReorderSection(section.id, 'up')}
                          disabled={idx === 0}
                          className="p-2 text-gray-500 hover:bg-gray-200 rounded disabled:opacity-30"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => handleReorderSection(section.id, 'down')}
                          disabled={idx === page.sections.length - 1}
                          className="p-2 text-gray-500 hover:bg-gray-200 rounded disabled:opacity-30"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          onClick={() => setEditingSection(section)}
                          className="p-2 text-blue hover:bg-blue-50 rounded"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(section.id)}
                          className="p-2 text-red hover:bg-red/10 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* New section modal */}
          {showNewSection && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-bold text-lg">Nuova sezione</h2>
                  <button
                    onClick={() => setShowNewSection(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase block mb-2">Tipo sezione</label>
                  <select
                    value={newSectionType}
                    onChange={(e) => setNewSectionType(e.target.value)}
                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                  >
                    {SECTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowNewSection(false)}
                    className="flex-1 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleAddSection}
                    className="flex-1 px-4 py-2 text-sm bg-blue text-white font-bold rounded-lg hover:bg-blue-light transition-colors"
                  >
                    Crea
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit section modal */}
          {editingSection && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-bold text-lg">Modifica sezione</h2>
                  <button
                    onClick={() => setEditingSection(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Titolo</label>
                    <input
                      type="text"
                      value={editingSection.title || ''}
                      onChange={(e) =>
                        setEditingSection({ ...editingSection, title: e.target.value })
                      }
                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Sottotitolo</label>
                    <input
                      type="text"
                      value={editingSection.subtitle || ''}
                      onChange={(e) =>
                        setEditingSection({ ...editingSection, subtitle: e.target.value })
                      }
                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Contenuto</label>
                    <textarea
                      value={editingSection.content || ''}
                      onChange={(e) =>
                        setEditingSection({ ...editingSection, content: e.target.value })
                      }
                      rows={5}
                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">URL immagine</label>
                    <input
                      type="url"
                      value={editingSection.imageUrl || ''}
                      onChange={(e) =>
                        setEditingSection({ ...editingSection, imageUrl: e.target.value })
                      }
                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Colore sfondo</label>
                    <input
                      type="color"
                      value={editingSection.backgroundColor || '#ffffff'}
                      onChange={(e) =>
                        setEditingSection({ ...editingSection, backgroundColor: e.target.value })
                      }
                      className="w-full h-10 border rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => setEditingSection(null)}
                      className="flex-1 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annulla
                    </button>
                    <button
                      onClick={handleSaveSection}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue text-white font-bold rounded-lg hover:bg-blue-light transition-colors"
                    >
                      <Save size={14} />
                      Salva
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save button */}
      <div className="flex gap-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} />
          Indietro
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue text-white text-sm font-bold rounded-lg hover:bg-blue-light disabled:opacity-50 transition-colors"
        >
          <Save size={16} />
          {saving ? 'Salvataggio...' : 'Salva pagina'}
        </button>
      </div>
    </div>
  );
}
