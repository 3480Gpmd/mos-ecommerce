import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Droplets, Wifi, Package, Clock, Wrench, CheckCircle2 } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';

export const metadata = {
  title: 'Dispenser, Boccioni e Acqua a Rete - Milano Offre Servizi',
  description: 'Installazione dispenser con boccioni o allacciati alla rete idrica. Filtri, CO₂ e rifornimenti programmati. Operativi entro 48 ore.',
};

export default function DispenserBoccioniPage() {
  const steps = [
    { title: 'Sopralluogo / chiamata', desc: 'Capiremo insieme esigenze, numero persone e spazi disponibili.' },
    { title: 'Proposta su misura', desc: 'Scelta tra boccioni o rete idrica, opzioni di erogazione e piano rifornimenti.' },
    { title: 'Installazione rapida', desc: 'In genere entro 48 ore dall\'ordine, senza fermare l\'operatività.' },
    { title: 'Assistenza e rifornimenti', desc: 'Consegne puntuali e manutenzione programmata.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-gray-50 to-blue/5 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <PageTitle className="mb-4">Dispenser, Boccioni e Acqua a Rete</PageTitle>
                <p className="text-lg text-gray-600 mb-2">
                  Installiamo dispenser con boccioni o allacciati alla rete idrica e impianti di filtrazione.
                </p>
                <p className="text-gray-500 mb-8">
                  Forniamo filtri e CO₂ quando serve e rifornimenti programmati. Se il dispenser è disponibile, entro 48 ore sei operativo.
                </p>
                <Link href="/aziende" className="inline-flex items-center gap-2 bg-blue hover:bg-blue-light text-white font-bold px-6 py-3 rounded-lg transition-colors">
                  Richiedi un preventivo <ArrowRight size={18} />
                </Link>
              </div>
              <div className="flex gap-4 justify-center">
                <Image src="/servizi/dispenser-rete.png" alt="Dispenser a rete idrica" width={250} height={350} className="rounded-xl shadow-lg" />
                <Image src="/servizi/dispenser-boccioni.png" alt="Dispenser con boccioni" width={200} height={300} className="rounded-xl shadow-lg mt-8" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Rete idrica */}
              <div className="border border-gray-200 rounded-2xl p-8">
                <Image src="/servizi/dispenser-rete.png" alt="Dispenser rete idrica" width={300} height={200} className="rounded-xl mx-auto mb-6" />
                <div className="flex items-center gap-3 mb-4">
                  <Wifi size={28} className="text-blue" />
                  <h2 className="font-heading text-xl font-bold text-navy">Collegati alla rete idrica</h2>
                </div>
                <ul className="space-y-3">
                  <li className="flex gap-3"><CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /><span className="text-sm text-gray-600">Acqua microfiltrata sempre disponibile</span></li>
                  <li className="flex gap-3"><CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /><span className="text-sm text-gray-600">Opzioni: naturale, fredda, gassata e calda</span></li>
                  <li className="flex gap-3"><CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /><span className="text-sm text-gray-600">Manutenzione periodica filtri inclusa</span></li>
                  <li className="flex gap-3"><CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /><span className="text-sm text-gray-600">CO₂ fornita dove previsto</span></li>
                </ul>
                <p className="text-xs text-gray-400 mt-4">Richiede punto acqua e allaccio elettrico.</p>
              </div>

              {/* Boccioni */}
              <div className="border border-gray-200 rounded-2xl p-8">
                <Image src="/servizi/dispenser-boccioni.png" alt="Dispenser con boccioni" width={300} height={200} className="rounded-xl mx-auto mb-6" />
                <div className="flex items-center gap-3 mb-4">
                  <Package size={28} className="text-blue" />
                  <h2 className="font-heading text-xl font-bold text-navy">Dispenser con boccioni</h2>
                </div>
                <ul className="space-y-3">
                  <li className="flex gap-3"><CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /><span className="text-sm text-gray-600">Installazione rapida senza interventi sull&apos;impianto</span></li>
                  <li className="flex gap-3"><CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /><span className="text-sm text-gray-600">Rifornimenti programmati e gestione scorte</span></li>
                  <li className="flex gap-3"><CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /><span className="text-sm text-gray-600">Acqua naturale a temperatura ambiente e fredda</span></li>
                  <li className="flex gap-3"><CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /><span className="text-sm text-gray-600">Opzione gassata e calda disponibile</span></li>
                </ul>
                <p className="text-xs text-gray-400 mt-4">Richiede solo allaccio elettrico.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-navy mb-8 text-center">Come funziona</h2>
            <div className="space-y-6">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue text-white flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                  <div>
                    <h3 className="font-bold text-navy">{step.title}</h3>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-navy mb-8 text-center">Marchi disponibili</h2>
            <p className="text-center text-gray-500 mb-6">
              Sant&apos;Anna, San Pellegrino, San Benedetto, Coca-Cola, Estathé, succhi Pago e Yoga, e altri brand su richiesta.
            </p>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-navy mb-6 text-center">Domande frequenti</h2>
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <h3 className="font-bold text-navy text-sm mb-1">Serve un allaccio elettrico?</h3>
                <p className="text-sm text-gray-500">Sì, per entrambi i sistemi. Per i modelli a rete idrica serve anche il punto acqua.</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <h3 className="font-bold text-navy text-sm mb-1">In quanto tempo installate?</h3>
                <p className="text-sm text-gray-500">Di norma entro 48 ore dall&apos;ordine, salvo necessità particolari.</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <h3 className="font-bold text-navy text-sm mb-1">Gestite anche le scorte di boccioni?</h3>
                <p className="text-sm text-gray-500">Sì, possiamo programmare i passaggi oppure intervenire su chiamata.</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <h3 className="font-bold text-navy text-sm mb-1">Disponete di acqua gassata?</h3>
                <p className="text-sm text-gray-500">Sì, con modelli dedicati e bombole CO₂.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue/5 border-y border-blue/10 py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="font-heading text-2xl font-bold text-navy mb-4">Richiedi un preventivo</h2>
            <p className="text-gray-500 mb-6">Servizio disponibile per casa e ufficio. Rifornimenti programmati o su chiamata. Assistenza dedicata MOS.</p>
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
