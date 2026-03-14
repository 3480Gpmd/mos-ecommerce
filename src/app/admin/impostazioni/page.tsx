'use client';

import { useEffect, useState } from 'react';
import {
  Settings, Store, ShoppingCart, Globe, Mail, FileText, Save, Check,
} from 'lucide-react';

interface Setting {
  id: number;
  key: string;
  value: string;
  label: string;
  group: string;
  type: string;
}

const groupMeta: Record<string, { icon: React.ReactNode; title: string }> = {
  general: { icon: <Store size={20} className="text-navy" />, title: 'Informazioni azienda' },
  orders: { icon: <ShoppingCart size={20} className="text-navy" />, title: 'Impostazioni ordini' },
  content: { icon: <FileText size={20} className="text-navy" />, title: 'Contenuti sito' },
  email: { icon: <Mail size={20} className="text-navy" />, title: 'Configurazione email' },
};

const groupOrder = ['general', 'orders', 'content', 'email'];

export default function AdminImpostazioniPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        setSettings(data.settings || []);
        const vals: Record<string, string> = {};
        for (const s of data.settings || []) {
          vals[s.key] = s.value;
        }
        setEditValues(vals);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        // Update local state
        setSettings((prev) =>
          prev.map((s) => ({
            ...s,
            value: editValues[s.key] ?? s.value,
          }))
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

  const grouped = new Map<string, Setting[]>();
  for (const s of settings) {
    const list = grouped.get(s.group) ?? [];
    list.push(s);
    grouped.set(s.group, list);
  }

  const hasChanges = settings.some((s) => editValues[s.key] !== s.value);

  if (loading) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-bold mb-6">Impostazioni</h1>
        <div className="p-8 text-center text-gray-500">Caricamento...</div>
      </div>
    );
  }

  // Fallback if settings table doesn't exist yet
  if (settings.length === 0) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-bold mb-6">Impostazioni</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <p className="text-yellow-800 font-medium mb-2">Tabella impostazioni non trovata</p>
          <p className="text-sm text-yellow-700 mb-4">
            Esegui la migration v2 per creare la tabella delle impostazioni editabili.
          </p>
          <button
            onClick={async () => {
              const res = await fetch('/api/admin/migrate-v2', { method: 'POST' });
              const data = await res.json();
              if (res.ok) {
                window.location.reload();
              } else {
                alert(data.error || 'Errore migration');
              }
            }}
            className="bg-blue text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-light transition-colors text-sm"
          >
            Esegui Migration V2
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Impostazioni</h1>
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

      <div className="grid gap-6">
        {groupOrder.map((groupKey) => {
          const groupSettings = grouped.get(groupKey);
          if (!groupSettings || groupSettings.length === 0) return null;
          const meta = groupMeta[groupKey] || { icon: <Settings size={20} />, title: groupKey };

          return (
            <div key={groupKey} className="bg-white rounded-xl shadow-sm">
              <div className="flex items-center gap-3 px-6 py-4 border-b">
                {meta.icon}
                <h2 className="font-heading font-semibold text-lg">{meta.title}</h2>
              </div>
              <div className="p-6 grid gap-4 sm:grid-cols-2">
                {groupSettings.map((s) => (
                  <div key={s.key} className={s.type === 'textarea' ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      {s.label}
                    </label>
                    {s.type === 'textarea' ? (
                      <textarea
                        value={editValues[s.key] || ''}
                        onChange={(e) => setEditValues({ ...editValues, [s.key]: e.target.value })}
                        rows={3}
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light resize-none"
                      />
                    ) : s.type === 'boolean' ? (
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editValues[s.key] === 'true'}
                          onChange={(e) => setEditValues({ ...editValues, [s.key]: String(e.target.checked) })}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{editValues[s.key] === 'true' ? 'Attivo' : 'Disattivo'}</span>
                      </label>
                    ) : (
                      <input
                        type={s.type === 'number' ? 'number' : s.type === 'email' ? 'email' : 'text'}
                        value={editValues[s.key] || ''}
                        onChange={(e) => setEditValues({ ...editValues, [s.key]: e.target.value })}
                        className={`w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-light ${
                          editValues[s.key] !== s.value ? 'border-blue bg-blue/5' : ''
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
