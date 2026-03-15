'use client';

import { useEffect, useState, useCallback } from 'react';
import { Save, Check, ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';

interface Setting {
  id: number;
  key: string;
  value: string;
  label: string;
  group: string;
  type: string;
}

const fieldOrder = [
  'ragione_sociale', 'p_iva', 'cf', 'sede_legale',
  'telefono', 'email_ordini', 'pec', 'sdi',
  'iban', 'banca', 'email_notifica_ordine', 'cc_ordini',
  'ordine_minimo',
];

const fieldLabels: Record<string, string> = {
  ragione_sociale: 'Ragione Sociale',
  p_iva: 'Partita IVA',
  cf: 'Codice Fiscale',
  sede_legale: 'Sede Legale',
  telefono: 'Telefono',
  email_ordini: 'Email Ordini',
  pec: 'PEC',
  sdi: 'Codice SDI',
  iban: 'IBAN',
  banca: 'Banca',
  email_notifica_ordine: 'Email Notifica Ordine',
  cc_ordini: 'CC Ordini',
  ordine_minimo: 'Ordine Minimo',
};

export default function AziendaPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings?group=azienda');
      const data = await res.json();
      const all: Setting[] = data.settings || [];
      const filtered = all.filter((s) => s.group === 'azienda');
      setSettings(filtered);
      const vals: Record<string, string> = {};
      for (const s of filtered) {
        vals[s.key] = s.value;
      }
      setEditValues(vals);
    } catch {
      console.error('Errore caricamento impostazioni');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const updates = settings
        .filter((s) => editValues[s.key] !== s.value)
        .map((s) => ({ key: s.key, value: editValues[s.key] }));

      if (updates.length === 0) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        setSaving(false);
        return;
      }

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      if (res.ok) {
        setSettings((prev) =>
          prev.map((s) => ({ ...s, value: editValues[s.key] ?? s.value }))
        );
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      console.error('Errore salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = settings.some((s) => editValues[s.key] !== s.value);

  // Sort settings by fieldOrder
  const sortedSettings = [...settings].sort((a, b) => {
    const ia = fieldOrder.indexOf(a.key);
    const ib = fieldOrder.indexOf(b.key);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  if (loading) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-bold mb-6 text-navy">Dati Aziendali</h1>
        <div className="p-8 text-center text-gray-500">Caricamento...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/configurazione"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
          <div className="flex items-center gap-2">
            <Building2 size={22} className="text-blue" />
            <h1 className="font-heading text-2xl font-bold text-navy">Dati Aziendali</h1>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : hasChanges
                ? 'bg-blue text-white hover:bg-blue-light'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saving ? 'Salvataggio...' : saved ? 'Salvato!' : 'Salva modifiche'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 grid gap-4 sm:grid-cols-2">
          {sortedSettings.map((s) => (
            <div key={s.key} className={s.key === 'sede_legale' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                {fieldLabels[s.key] || s.label || s.key}
              </label>
              {s.key === 'sede_legale' ? (
                <textarea
                  value={editValues[s.key] || ''}
                  onChange={(e) => setEditValues({ ...editValues, [s.key]: e.target.value })}
                  rows={2}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light resize-none"
                />
              ) : (
                <input
                  type={s.key === 'ordine_minimo' ? 'number' : s.key.includes('email') || s.key === 'pec' ? 'email' : 'text'}
                  value={editValues[s.key] || ''}
                  onChange={(e) => setEditValues({ ...editValues, [s.key]: e.target.value })}
                  className={`w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light ${
                    editValues[s.key] !== s.value ? 'border-blue bg-blue/5' : ''
                  }`}
                />
              )}
            </div>
          ))}

          {sortedSettings.length === 0 && (
            <div className="sm:col-span-2 text-center py-8 text-gray-400">
              Nessuna impostazione trovata per il gruppo &quot;azienda&quot;.
              <br />
              <span className="text-sm">Verifica che le impostazioni siano state inizializzate nel database.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
