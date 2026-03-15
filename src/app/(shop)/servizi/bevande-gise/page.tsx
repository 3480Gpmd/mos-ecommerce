import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import { ArrowRight, Coffee, Droplets, Leaf, Palette, Volume2, Zap } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';

export const metadata = {
  title: 'Gise Aura - La Gamma Più Completa di Bevande Calde - Milano Offre Servizi',
  description: 'Gise Aura: oltre 20 bevande calde tra caffè, ginseng, cioccolata, tisane senza zucchero. In comodato d\'uso per casa e ufficio.',
};

export default function BevandeGisePage() {
  const caffe = [
    'Scirocco', 'Ostro', 'Marino (dek)', 'Zefiro', 'Maestrale', 'Libeccio', 'Levante', 'Grecale', 'Viento de la Sierra',
  ];

  const bevandeCalde = [
    'Ginseng classico', 'Ginseng senza zucchero', 'Ganoderma', 'Cioccolata', 'Cappuccino', 'Mocaccino', 'Orzo', 'Tè al limone', 'Tè ai frutti', 'Bevanda alla nocciola',
  ];

  const tisane = [
    'Pancia piatta', 'Sera relax', 'Tè energizzante', 'Frutti di bosco-curcuma-cannella', 'Cocco-lampone',
  ];

  const features = [
    { icon: Coffee, title: '15 bar costanti', desc: 'Pressione ottimale per ogni bevanda.' },
    { icon: Palette, title: '6 colori iconici', desc: 'Design che si adatta al tuo ambiente.' },
    { icon: Volume2, title: 'Sotto i 70 dB', desc: 'Silenziosa, perfetta anche durante le riunioni.' },
    { icon: Zap, title: 'Risparmio energetico', desc: 'Modalità energy-saving automatica.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-gray-50 to-blue/5 py-16">
          <div className="max-w-4xl mx-auto px-4">
            <PageTitle className="mb-4">Gise Aura</PageTitle>
            <p className="text-lg text-gray-600 mb-2 max-w-2xl">
              La gamma di bevande calde più completa: oltre 20 varianti tra caffè, ginseng, cioccolata e tisane senza zucchero.
            </p>
            <p className="text-gray-500 mb-8 max-w-2xl">
              Macchina Aura in comodato d&apos;uso con capsule originali e riconoscimento automatico. Perfetta per famiglie e uffici che vogliono accontentare tutti i gusti.
            </p>
            <Link href="/aziende" className="inline-flex items-center gap-2 bg-blue hover:bg-blue-light text-white font-bold px-6 py-3 rounded-lg transition-colors">
              Richiedi un preventivo <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-navy mb-8 text-center">Perché scegliere Aura</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {features.map((f) => (
                <div key={f.title} className="text-center p-5 bg-gray-50 rounded-xl">
                  <f.icon size={32} className="text-blue mx-auto mb-3" />
                  <h3 className="font-bold text-navy text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-navy mb-8 text-center">La gamma completa</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Coffee size={20} className="text-blue" />
                  <h3 className="font-bold text-navy">9 miscele caffè</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {caffe.map((c) => <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{c}</span>)}
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Droplets size={20} className="text-blue" />
                  <h3 className="font-bold text-navy">10 bevande calde</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {bevandeCalde.map((b) => <span key={b} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{b}</span>)}
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Leaf size={20} className="text-green-500" />
                  <h3 className="font-bold text-navy">5 tisane L&apos;Angelica</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tisane.map((t) => <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{t}</span>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue/5 border-y border-blue/10 py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="font-heading text-2xl font-bold text-navy mb-4">Prova Gise Aura</h2>
            <p className="text-gray-500 mb-6">Consegna gratuita a Milano. Rifornimenti programmati e assistenza dedicata.</p>
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
