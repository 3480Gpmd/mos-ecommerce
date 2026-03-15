import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Coffee, Clock, Wrench, Truck, BarChart3, CheckCircle2 } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';

export const metadata = {
  title: 'Lavazza Firma in Comodato d\'Uso - Milano Offre Servizi',
  description: 'Lavazza Firma in comodato d\'uso per uffici. Installazione, manutenzione, assistenza e rifornimenti programmati inclusi.',
};

export default function LavazzaFirmaPage() {
  const piani = [
    { nome: 'START', tazze: '100-149/mese', prezzo: '€0,46/tazza' },
    { nome: 'SMART', tazze: '150-299/mese', prezzo: '€0,42/tazza' },
    { nome: 'PRO', tazze: '300-599/mese', prezzo: '€0,38/tazza' },
    { nome: 'ENTERPRISE', tazze: '600-1000+/mese', prezzo: 'Su misura' },
  ];

  const incluso = [
    'Macchina in comodato d\'uso',
    'Manutenzione ordinaria e straordinaria',
    'Assistenza tecnica dedicata',
    'Consegne programmate',
    'Accessori (bicchierini, palette, zucchero)',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-gray-50 to-blue/5 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <PageTitle className="mb-4">Lavazza Firma in Comodato d&apos;Uso</PageTitle>
                <p className="text-lg text-gray-600 mb-2">
                  Caffè di qualità per ambienti di lavoro che considerano il servizio l&apos;aspetto più importante.
                </p>
                <p className="text-gray-500 mb-8">
                  Installiamo macchine Lavazza Firma nel tuo ufficio con manutenzione, assistenza e rifornimenti programmati inclusi. Installazione media entro 5 giorni lavorativi.
                </p>
                <Link href="/aziende" className="inline-flex items-center gap-2 bg-blue hover:bg-blue-light text-white font-bold px-6 py-3 rounded-lg transition-colors">
                  Richiedi un preventivo <ArrowRight size={18} />
                </Link>
              </div>
              <div className="flex justify-center">
                <Image src="/servizi/lavazza-firma.png" alt="Lavazza Firma macchina" width={400} height={400} className="rounded-2xl shadow-xl" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-navy mb-8 text-center">Piani di consumo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {piani.map((piano) => (
                <div key={piano.nome} className={`border rounded-xl p-6 text-center transition-shadow hover:shadow-lg ${piano.nome === 'SMART' ? 'border-blue bg-blue/5 ring-2 ring-blue' : 'border-gray-200'}`}>
                  <h3 className="font-heading text-lg font-bold text-navy mb-2">{piano.nome}</h3>
                  <p className="text-sm text-gray-500 mb-3">{piano.tazze}</p>
                  <p className="text-2xl font-bold text-blue">{piano.prezzo}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-400 mt-4">Tutti i piani includono macchina, manutenzione, assistenza, consegne e accessori.</p>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-navy mb-8 text-center">Cosa è incluso</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {incluso.map((item) => (
                <div key={item} className="flex items-center gap-3 bg-white rounded-lg p-4 border border-gray-100">
                  <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-navy mb-8 text-center">Il nostro servizio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-4 bg-white rounded-xl p-6 border border-gray-100">
                <Wrench size={28} className="text-blue shrink-0 mt-1" />
                <div><h3 className="font-bold text-navy mb-1">Installazione e formazione</h3><p className="text-sm text-gray-500">Sopralluogo, installazione e formazione utenti in loco.</p></div>
              </div>
              <div className="flex gap-4 bg-white rounded-xl p-6 border border-gray-100">
                <Clock size={28} className="text-blue shrink-0 mt-1" />
                <div><h3 className="font-bold text-navy mb-1">Assistenza in 48 ore</h3><p className="text-sm text-gray-500">Intervento garantito entro 48 ore lavorative con macchina sostitutiva.</p></div>
              </div>
              <div className="flex gap-4 bg-white rounded-xl p-6 border border-gray-100">
                <Truck size={28} className="text-blue shrink-0 mt-1" />
                <div><h3 className="font-bold text-navy mb-1">Rifornimenti smart</h3><p className="text-sm text-gray-500">Pianificazione basata sui consumi reali. Nessuna interruzione.</p></div>
              </div>
              <div className="flex gap-4 bg-white rounded-xl p-6 border border-gray-100">
                <BarChart3 size={28} className="text-blue shrink-0 mt-1" />
                <div><h3 className="font-bold text-navy mb-1">Report trimestrali</h3><p className="text-sm text-gray-500">Monitoriamo i consumi e forniamo report dettagliati.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue/5 border-y border-blue/10 py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="font-heading text-2xl font-bold text-navy mb-4">Inizia subito</h2>
            <p className="text-gray-500 mb-6">Contattaci per un preventivo personalizzato. Risposta entro 48 ore.</p>
            <Link href="/aziende" className="inline-flex items-center gap-2 bg-blue hover:bg-blue-light text-white font-bold px-8 py-3 rounded-lg transition-colors">
              Richiedi preventivo <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
