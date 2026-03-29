'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Save, ArrowLeft, Eye, AlertCircle, CheckCircle2, XCircle,
} from 'lucide-react';

interface SEOSettings {
  site_title?: string;
  site_description?: string;
  site_keywords?: string;
  og_default_image?: string;
  og_site_name?: string;
  twitter_handle?: string;
  twitter_card_type?: string;
  google_analytics_id?: string;
  google_search_console_verification?: string;
  schema_org_json?: string;
  robots_txt_custom?: string;
  product_meta_template?: string;
}

interface ServicePageMeta {
  id: number;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
}

export default function SEOPage() {
  const [seoSettings, setSeoSettings] = useState<SEOSettings>({});
  const [servicePages, setServicePages] = useState<ServicePageMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'global' | 'services' | 'products' | 'sitemap' | 'analytics' | 'schema' | 'social' | 'redirects'>('global');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [seoRes, pagesRes] = await Promise.all([
        fetch('/api/admin/seo'),
        fetch('/api/admin/service-pages?limit=1000'),
      ]);
      if (seoRes.ok) {
        const data = await seoRes.json();
        setSeoSettings(data.settings || {});
      }
      if (pagesRes.ok) {
        const data = await pagesRes.json();
        setServicePages(data.pages || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: seoSettings }),
      });
      if (res.ok) {
        alert('Impostazioni SEO salvate con successo');
      }
    } catch (err) {
      console.error('Error saving:', err);
      alert('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const calculateSEOScore = (page: ServicePageMeta): { score: number; color: string; status: string } => {
    let score = 0;
    if (page.metaTitle && page.metaTitle.length >= 30 && page.metaTitle.length <= 60) score += 40;
    else if (page.metaTitle) score += 20;
    if (page.metaDescription && page.metaDescription.length >= 120 && page.metaDescription.length <= 160) score += 40;
    else if (page.metaDescription) score += 20;
    if (page.title) score += 20;

    if (score >= 80) {
      return { score, color: 'text-green-600', status: 'Ottimo' };
    }
    if (score >= 50) {
      return { score, color: 'text-yellow-600', status: 'Buono' };
    }
    return { score, color: 'text-red', status: 'Da migliorare' };
  };

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Gestione SEO</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-blue-light disabled:opacity-50 transition-colors"
        >
          <Save size={16} />
          {saving ? 'Salvataggio...' : 'Salva impostazioni'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'global', label: 'Meta globali' },
          { id: 'services', label: 'Pagine servizi' },
          { id: 'products', label: 'Pagine prodotto' },
          { id: 'sitemap', label: 'Sitemap & Robots' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'schema', label: 'Structured Data' },
          { id: 'social', label: 'Social Media' },
          { id: 'redirects', label: 'Redirect 301' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Global Meta Tags */}
      {activeTab === 'global' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-heading font-bold text-lg mb-4">Meta Tag Globali</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Titolo sito</label>
                <input
                  type="text"
                  value={seoSettings.site_title || ''}
                  onChange={(e) => setSeoSettings({ ...seoSettings, site_title: e.target.value })}
                  maxLength={60}
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                />
                <p className="text-xs text-gray-500 mt-1">{(seoSettings.site_title || '').length}/60</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Descrizione sito</label>
                <textarea
                  value={seoSettings.site_description || ''}
                  onChange={(e) => setSeoSettings({ ...seoSettings, site_description: e.target.value })}
                  maxLength={160}
                  rows={2}
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{(seoSettings.site_description || '').length}/160</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Parole chiave</label>
                <input
                  type="text"
                  value={seoSettings.site_keywords || ''}
                  onChange={(e) => setSeoSettings({ ...seoSettings, site_keywords: e.target.value })}
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-heading font-bold text-lg mb-4">OpenGraph Predefinito</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">OG Image (URL)</label>
                <input
                  type="url"
                  value={seoSettings.og_default_image || ''}
                  onChange={(e) => setSeoSettings({ ...seoSettings, og_default_image: e.target.value })}
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">OG Site Name</label>
                <input
                  type="text"
                  value={seoSettings.og_site_name || ''}
                  onChange={(e) => setSeoSettings({ ...seoSettings, og_site_name: e.target.value })}
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Pages SEO */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-heading font-bold text-lg mb-4">SEO Pagine Servizi</h2>
          {servicePages.length === 0 ? (
            <p className="text-gray-500">Nessuna pagina servizi trovata</p>
          ) : (
            <div className="space-y-3">
              {servicePages.map((page) => {
                const { score, color, status } = calculateSEOScore(page);
                return (
                  <div key={page.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-navy">{page.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Meta Title: {page.metaTitle ? '✓' : '✗'} | Meta Description: {page.metaDescription ? '✓' : '✗'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-xl font-bold ${color}`}>{score}</p>
                        <p className={`text-xs ${color}`}>{status}</p>
                      </div>
                      <Link
                        href={`/admin/servizi/${page.id}`}
                        className="p-2 text-blue hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Products SEO Template */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-heading font-bold text-lg mb-4">Template Meta Pagine Prodotto</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex gap-3">
            <AlertCircle size={18} className="text-blue flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue">
              Usa {'{name}'} per il nome del prodotto, {'{brand}'} per la marca, {'{price}'} per il prezzo.
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Template Meta Title</label>
            <input
              type="text"
              value={seoSettings.product_meta_template || ''}
              onChange={(e) => setSeoSettings({ ...seoSettings, product_meta_template: e.target.value })}
              placeholder="{name} - {brand} | Miglior prezzo"
              className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light mb-3"
            />
          </div>
        </div>
      )}

      {/* Sitemap & Robots */}
      {activeTab === 'sitemap' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-heading font-bold text-lg mb-4">Robots.txt Personalizzato</h2>
            <textarea
              value={seoSettings.robots_txt_custom || ''}
              onChange={(e) => setSeoSettings({ ...seoSettings, robots_txt_custom: e.target.value })}
              rows={8}
              className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light resize-none font-mono"
              placeholder="User-agent: *\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://example.com/sitemap.xml"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle2 size={20} className="text-blue flex-shrink-0" />
              <div>
                <p className="font-medium text-blue mb-1">Sitemap automatica</p>
                <p className="text-sm text-blue">La sitemap è generata automaticamente all'URL: /sitemap.xml</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-heading font-bold text-lg mb-4">Google Analytics</h2>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Google Analytics ID</label>
              <input
                type="text"
                value={seoSettings.google_analytics_id || ''}
                onChange={(e) => setSeoSettings({ ...seoSettings, google_analytics_id: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              />
              <p className="text-xs text-gray-500 mt-1">Inserisci l'ID di Google Analytics 4</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-heading font-bold text-lg mb-4">Google Search Console</h2>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Meta Tag di verifica</label>
              <input
                type="text"
                value={seoSettings.google_search_console_verification || ''}
                onChange={(e) => setSeoSettings({ ...seoSettings, google_search_console_verification: e.target.value })}
                placeholder="google-site-verification=..."
                className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
              />
              <p className="text-xs text-gray-500 mt-1">Solo il valore del content, non il tag completo</p>
            </div>
          </div>
        </div>
      )}

      {/* Structured Data */}
      {activeTab === 'schema' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-heading font-bold text-lg mb-4">Schema.org JSON-LD</h2>
          <p className="text-sm text-gray-600 mb-3">Dati strutturati per Organization, LocalBusiness, ecc.</p>
          <textarea
            value={seoSettings.schema_org_json || ''}
            onChange={(e) => setSeoSettings({ ...seoSettings, schema_org_json: e.target.value })}
            rows={10}
            className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light resize-none font-mono"
            placeholder='{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "MOS",\n  "url": "https://example.com"\n}'
          />
        </div>
      )}

      {/* Social Media */}
      {activeTab === 'social' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-heading font-bold text-lg mb-4">Twitter</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Twitter Handle</label>
                <input
                  type="text"
                  value={seoSettings.twitter_handle || ''}
                  onChange={(e) => setSeoSettings({ ...seoSettings, twitter_handle: e.target.value })}
                  placeholder="@yourhandle"
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Twitter Card Type</label>
                <select
                  value={seoSettings.twitter_card_type || 'summary_large_image'}
                  onChange={(e) => setSeoSettings({ ...seoSettings, twitter_card_type: e.target.value })}
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary Large Image</option>
                  <option value="app">App</option>
                  <option value="player">Player</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Redirects */}
      {activeTab === 'redirects' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-heading font-bold text-lg mb-4">Reindirizzamenti 301</h2>
          <p className="text-sm text-gray-600 mb-4">Gestisci i redirect permanenti da vecchi URL a nuovi URL.</p>
          <Link
            href="/admin/seo/redirects"
            className="flex items-center gap-2 bg-blue text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-blue-light transition-colors inline-flex"
          >
            <Eye size={16} />
            Gestisci Redirect 301
          </Link>
        </div>
      )}
    </div>
  );
}
