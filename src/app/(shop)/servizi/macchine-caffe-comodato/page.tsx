import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Coffee, Building2, Home, Store, UtensilsCrossed, PartyPopper, Clock, Wrench, Truck, BarChart3 } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';

export const metadata = {
  title: 'Macchine del Caffè in Comodato d\'Uso - Milano Offre Servizi',
  description: 'Macchine del caffè in comodato d\'uso per casa, ufficio, negozi, ristoranti e catering. Installazione, manutenzione e rifornimenti inclusi.',
};

export default function MacchineCaffeComodatoPage() {
  const ambienti = [
    { icon: Home, title: 'Casa', desc: 'Macchine compatte, silenziose e facili da usare con bevande per tutta la famiglia.', prezzo: 'Da €0,24/tazza', minimo: 'Min. 100 tazze/mese' },
    { icon: Building2, title: 'Ufficio', desc: 'La soluzione più richiesta: dallo startup alla sede centrale, per ogni dimensione.', prezzo: 'Da €0,30/tazza', minimo: 'Min. 150 tazze/mese' },
    { icon: Store, title: 'Negozi', desc: 'Angolo caffè per clienti e staff. Soluzioni salvaspazio e personalizzabili.', prezzo: 'Su misura', minimo: '100-400 tazze/mese' },
    { icon: UtensilsCrossed, title: 'Ristoranti e Bar', desc: 'Sistemi ad alte prestazioni con assistenza tecnica rapida e affidabile.', prezzo: 'Su misura', minimo: '600-1200+ tazze/mese' },
    { icon: PartyPopper, title: 'Catering', desc: 'Allestimenti temporanei per grandi volumi con logistica dedicata.', prezzo: 'Su misura', minimo: 'Volume variabile' },
  ];

  const vantaggi = [
    { icon: Wrench, title: 'Installazione e formazione', desc: 'Sopralluogo, installazione e formazione degli utenti inclusi nel servizio.' },
    { icon: Clock, title: 'Assistenza in 48 ore', desc: 'Intervento garantito entro 48 ore lavorative. Macchina sostitutiva in caso di fermo prolungato.' },
    { icon: Truck, title: 'Rifornimenti programmati', desc: 'Pianificazione intelligente basata sui consumi reali. Zero interruzioni.' },
    { icon: BarChart3, title: 'Report trimestrali', desc: 'Monitoriamo i consumi e forniamo report dettagliati ogni trimestre.' },
  ];

  return (
    <>
        <section className="bg-gradient-to-br from-gray-50 to-blue/5 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <PageTitle className="mb-4">Macchine del Caffè in Comodato d&apos;Uso</PageTitle>
                <p className="text-lg text-gray-600 mb-2">
                  Il caffè giusto nel posto giusto: a casa, in ufficio, per eventi e nel tuo locale.
                </p>
                <p className="text-gray-500 mb-8">
                  Ti forniamo la macchina senza costi di acquisto. Rimane di nostra proprietà, tu paghi solo i consumi secondo il piano scelto. Installazione, manutenzione e rifornimenti sono inclusi.
                </p>
                <Link href="/aziende" className="inline-flex items-center gap-2 bg-blue hover:bg-blue-light text-white font-bold px-6 py-3 rounded-lg transition-colors">
                  Richiedi un preventivo <ArrowRight size={18} />
                </Link>
              </div>
              <div className="flex gap-4 justify-center">
                <Image src="/servizi/bluemoon-home.png" alt="Macchina caffè Bluemoon" width={200} height={300} className="rounded-xl shadow-lg" />
                <Image src="/servizi/dr-coffee.png" alt="Dr. Coffee" width={200} height={300} className="rounded-xl shadow-lg mt-8" />
              </div>
            </div>
          </div>
        </section>

        {/* Gallery macchine */}
        <section className="py-10 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 scrollbar-hide justify-center">
              <Image src="/servizi/macchine-slider2.png" alt="Macchina caffè per ufficio" width={250} height={250} className="rounded-xl shadow-md snap-start shrink-0" />
              <Image src="/servizi/macchina-home-x4.png" alt="Macchina Home X4" width={250} height={250} className="rounded-xl shadow-md snap-start shrink-0" />
              <Image src="/servizi/bluemoon-home.png" alt="Bluemoon Home" width={250} height={250} className="rounded-xl shadow-md snap-start shrink-0" />
              <Image src="/servizi/dr-coffee.png" alt="Dr. Coffee Center" width={250} height={250} className="rounded-xl shadow-md snap-start shrink-0" />
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-navy mb-8 text-center">Soluzioni per ogni ambiente</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ambienti.map((amb) => (
                <div key={amb.title} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <amb.icon size={36} className="text-blue mb-4" />
                  <h3 className="font-heading text-lg font-bold text-navy mb-2">{amb.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{amb.desc}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-navy">{amb.prezzo}</span>
                    <span className="text-gray-400">{amb.minimo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-navy mb-8 text-center">Il servizio che fa la differenza</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {vantaggi.map((v) => (
                <div key={v.title} className="flex gap-4 bg-white rounded-xl p-6 border border-gray-100">
                  <v.icon size={28} className="text-blue shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-navy mb-1">{v.title}</h3>
                    <p className="text-sm text-gray-500">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-navy mb-8 text-center">Come funziona</h2>
            <div className="space-y-6">
              {['Consulenza telefonica e analisi delle esigenze', 'Sopralluogo gratuito e proposta macchina/miscela', 'Installazione, configurazione e calendario rifornimenti'].map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue text-white flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                  <p className="text-gray-700 pt-2">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-blue/5 border-y border-blue/10 py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="font-heading text-2xl font-bold text-navy mb-4">Inizia subito</h2>
            <p className="text-gray-500 mb-6">Contattaci per un preventivo personalizzato. Risposta entro 48 ore.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/aziende" className="inline-flex items-center gap-2 bg-blue hover:bg-blue-light text-white font-bold px-8 py-3 rounded-lg transition-colors">
                Richiedi preventivo <ArrowRight size={18} />
              </Link>
              <Link href="/contatti" className="inline-flex items-center gap-2 border-2 border-navy/20 text-navy hover:bg-gray-50 font-medium px-8 py-3 rounded-lg transition-colors">
                Contattaci
              </Link>
            </div>
          </div>
        </section>
    </>
  );
}
