'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Metadata } from 'next';
import {
  Coffee, Droplets, Printer, ArrowRight, CheckCircle2,
  Building2, Truck, Receipt, Headphones, Repeat,
} from 'lucide-react';

// Metadata is defined through parent layout or using a separate metadata export pattern
export default function AziendePage() {
  const [form, setForm] = useState({
    contactName: '', companyName: '', email: '', phone: '', message: '', interests: [] as string[],
    employeeCount: '', smartWorking: '', smartWorkingDays: '', currentProduct: '', issues: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (i: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(i) ? prev.interests.filter((x) => x !== i) : [...prev.interests, i],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contactName || !form.email) { setError('Nome e email sono obbligatori'); return; }
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          interests: form.interests.join(', '),
          smartWorking: form.smartWorking === 'si' ? `Sì — ${form.smartWorkingDays || '?'} gg/settimana` : form.smartWorking === 'no' ? 'No' : '',
        }),
      });
      if (!res.ok) throw new Error('Errore invio');
      setSent(true);
    } catch {
      setError('Errore nell\'invio. Riprova o contattaci direttamente.');
    } finally {
      setSending(false);
    }
  };

  const services = [
    { icon: Coffee, title: 'Caffè e Bevande Calde', desc: 'Macchine in comodato d\'uso, capsule e cialde da tutti i brand: Lavazza, Borbone, GISE, Covim e altri.' },
    { icon: Droplets, title: 'Acqua e Boccioni', desc: 'Boccioni con consegna periodica programmata, bicchieri, accessori e distributori.' },
    { icon: Printer, title: 'Forniture Ufficio', desc: 'Oltre 25.000 prodotti: consumabili, carta, informatica, cancelleria e archiviazione.' },
  ];

  const benefits = [
    { icon: Receipt, title: 'Listino dedicato', desc: 'Prezzi riservati e sconti personalizzati per la tua azienda.' },
    { icon: Truck, title: 'Consegna programmata', desc: 'Consegna gratuita a Milano e provincia. Riordino automatico.' },
    { icon: Headphones, title: 'Assistenza dedicata', desc: 'Un referente commerciale per ogni esigenza. Rispondiamo in giornata.' },
    { icon: Repeat, title: 'Riordino con un clic', desc: 'Area riservata con storico ordini e riordino rapido dei prodotti abituali.' },
  ];

  const interestOptions = ['Caffè e capsule', 'Acqua e boccioni', 'Forniture ufficio', 'Macchina caffè in comodato', 'Altro'];

  return (
    <>
        {/* Hero */}
        <section className="bg-gradient-to-br from-navy to-blue py-16 md:py-24 text-white">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Il partner ideale per la tua <span className="text-yellow-300">azienda</span>
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
              Caffè, acqua, forniture per ufficio: tutto in un unico fornitore con consegna a Milano e provincia. Prezzi dedicati e assistenza personalizzata.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="#preventivo" className="inline-flex items-center gap-2 bg-white text-navy font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                Richiedi un preventivo <ArrowRight size={18} />
              </a>
              <Link href="/registrati" className="inline-flex items-center gap-2 border-2 border-white text-white font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
                Apri un account aziendale
              </Link>
            </div>
          </div>
        </section>

        {/* Servizi */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-navy text-center mb-10">I nostri servizi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((s) => (
                <div key={s.title} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <s.icon size={40} className="text-blue mb-4" />
                  <h3 className="font-heading text-lg font-bold text-navy mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefici */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-navy text-center mb-10">Perche scegliere MOS</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {benefits.map((b) => (
                <div key={b.title} className="flex items-start gap-4 bg-white rounded-xl p-5 border border-gray-100">
                  <div className="p-3 bg-blue/10 rounded-lg shrink-0">
                    <b.icon size={24} className="text-blue" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-navy mb-1">{b.title}</h3>
                    <p className="text-sm text-gray-600">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form preventivo */}
        <section id="preventivo" className="py-16 bg-white">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-navy text-center mb-2">Richiedi un preventivo</h2>
            <p className="text-gray-500 text-center mb-8">Compila il form e ti contatteremo entro 24 ore.</p>

            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-green-600" />
                <h3 className="font-heading text-xl font-bold text-green-800 mb-2">Richiesta inviata!</h3>
                <p className="text-green-700">Ti contatteremo al piu presto. Grazie per l&apos;interesse.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome e cognome *</label>
                    <input
                      type="text" required
                      value={form.contactName}
                      onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Azienda</label>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email" required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                    />
                  </div>
                </div>

                {/* Interessi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">A cosa sei interessato?</label>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleInterest(i)}
                        className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                          form.interests.includes(i)
                            ? 'bg-blue text-white border-blue'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue'
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Persone in azienda */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quante persone ci sono in azienda?</label>
                  <select
                    value={form.employeeCount}
                    onChange={(e) => setForm({ ...form, employeeCount: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue bg-white"
                  >
                    <option value="">Seleziona...</option>
                    <option value="1-5">1–5 persone</option>
                    <option value="6-15">6–15 persone</option>
                    <option value="16-30">16–30 persone</option>
                    <option value="31-50">31–50 persone</option>
                    <option value="51-100">51–100 persone</option>
                    <option value="100+">Oltre 100 persone</option>
                  </select>
                </div>

                {/* Smart Working */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fate smart working?</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio" name="smartWorking" value="si"
                        checked={form.smartWorking === 'si'}
                        onChange={() => setForm({ ...form, smartWorking: 'si' })}
                        className="accent-blue"
                      />
                      <span className="text-sm text-gray-700">Sì</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio" name="smartWorking" value="no"
                        checked={form.smartWorking === 'no'}
                        onChange={() => setForm({ ...form, smartWorking: 'no' })}
                        className="accent-blue"
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                    {form.smartWorking === 'si' && (
                      <div className="flex items-center gap-2">
                        <select
                          value={form.smartWorkingDays}
                          onChange={(e) => setForm({ ...form, smartWorkingDays: e.target.value })}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue bg-white"
                        >
                          <option value="">Quanti gg?</option>
                          <option value="1">1 gg/settimana</option>
                          <option value="2">2 gg/settimana</option>
                          <option value="3">3 gg/settimana</option>
                          <option value="4">4 gg/settimana</option>
                          <option value="5">5 gg/settimana</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prodotto attuale */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Che prodotto/servizio state usando al momento?</label>
                  <input
                    type="text"
                    value={form.currentProduct}
                    onChange={(e) => setForm({ ...form, currentProduct: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                    placeholder="Es. macchina Nespresso, boccioni Culligan, fornitore attuale..."
                  />
                </div>

                {/* Criticità */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quali criticità riscontrate?</label>
                  <textarea
                    rows={2}
                    value={form.issues}
                    onChange={(e) => setForm({ ...form, issues: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                    placeholder="Es. consegne in ritardo, qualità caffè scadente, prezzi alti, mancanza assistenza..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Messaggio (opzionale)</label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                    placeholder="Descrivi le tue esigenze..."
                  />
                </div>

                {error && <p className="text-red text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-blue hover:bg-blue-light text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {sending ? 'Invio in corso...' : 'Invia richiesta preventivo'}
                </button>
              </form>
            )}
          </div>
        </section>
    </>
  );
}
