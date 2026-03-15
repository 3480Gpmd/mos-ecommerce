import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Coffee, Leaf, Sparkles, Wrench, Truck } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';

export const metadata = {
  title: 'Caffè Borbone - Milano Offre Servizi',
  description: 'Caffè Borbone: macchina Bluemoon e cialde ESE compostabili. Autentico espresso napoletano a casa e in ufficio.',
};

export default function CaffeBorbonePage() {
  const miscele = [
    { nome: 'Miscela NERA', desc: 'Cremoso, tostato al punto giusto, corpo deciso.', img: '/servizi/cialda-nera.png' },
    { nome: 'Miscela ROSSA', desc: 'Energica e intensa, per chi ama il gusto forte.', img: '/servizi/cialda-rossa.png' },
    { nome: 'Miscela BLU', desc: 'Equilibrata, la tradizione del caffè napoletano.', img: '/servizi/cialda-blu.png' },
    { nome: 'Miscela ORO', desc: 'Dolce, morbida, adatta ad ogni momento della giornata.', img: '/servizi/cialda-oro.png' },
    { nome: 'Miscela DEK', desc: 'Decaffeinato leggero con la stessa cremosità.', img: '/servizi/cialda-dek.png' },
    { nome: 'Miscela LIGHT', desc: 'Equilibrio perfetto tra Blu e Dek.', img: null },
  ];

  return (
    <>
        <section className="bg-gradient-to-br from-gray-50 to-blue/5 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <PageTitle className="mb-4">Caffè Borbone</PageTitle>
                <p className="text-lg text-gray-600 mb-2">
                  L&apos;autentico espresso napoletano a casa tua e in ufficio.
                </p>
                <p className="text-gray-500 mb-8">
                  Macchina Bluemoon in comodato d&apos;uso con cialde ESE compostabili. Servizio completo: installazione, manutenzione, fornitura cialde e assistenza tecnica.
                </p>
                <Link href="/aziende" className="inline-flex items-center gap-2 bg-blue hover:bg-blue-light text-white font-bold px-6 py-3 rounded-lg transition-colors">
                  Richiedi un preventivo <ArrowRight size={18} />
                </Link>
              </div>
              <div className="flex gap-4 justify-center items-end">
                <Image src="/servizi/bluemoon3.png" alt="Macchina Bluemoon" width={180} height={280} className="rounded-xl shadow-lg" />
                <Image src="/servizi/bluemoon-home5.png" alt="Bluemoon Home" width={220} height={320} className="rounded-xl shadow-lg" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-navy mb-4 text-center">Bluemoon: piccola, elegante, autentica</h2>
            <p className="text-center text-gray-500 mb-8 max-w-2xl mx-auto">
              Macchina compatta e affidabile progettata per un espresso autentico con un solo click. Pressione a 15 bar per un&apos;estrazione costante, serbatoio capiente con caricamento frontale intuitivo.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <Coffee size={36} className="text-blue mx-auto mb-3" />
                <h3 className="font-bold text-navy mb-1">15 bar di pressione</h3>
                <p className="text-sm text-gray-500">Estrazione costante e cremosa.</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <Sparkles size={36} className="text-blue mx-auto mb-3" />
                <h3 className="font-bold text-navy mb-1">Design compatto</h3>
                <p className="text-sm text-gray-500">Perfetta per casa, ufficio e piccole attività.</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <Wrench size={36} className="text-blue mx-auto mb-3" />
                <h3 className="font-bold text-navy mb-1">Manutenzione minima</h3>
                <p className="text-sm text-gray-500">Struttura robusta, costruita per durare.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-center gap-2 mb-8">
              <Leaf size={24} className="text-green-500" />
              <h2 className="font-heading text-2xl font-bold text-navy">Cialde ESE compostabili</h2>
            </div>
            <p className="text-center text-gray-500 mb-8 max-w-xl mx-auto">
              Cialde 100% compostabili, smaltibili nell&apos;umido domestico. Zero plastica, zero alluminio. Compatibili con tutte le macchine ESE 44mm.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {miscele.map((m) => (
                <div key={m.nome} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow text-center">
                  {m.img && <Image src={m.img} alt={m.nome} width={120} height={120} className="mx-auto mb-3" />}
                  <h3 className="font-bold text-navy mb-1 text-sm">{m.nome}</h3>
                  <p className="text-xs text-gray-500">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-navy mb-8 text-center">Servizio completo in comodato</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="flex gap-4"><Wrench size={24} className="text-blue shrink-0 mt-0.5" /><div><h3 className="font-bold text-navy text-sm">Installazione e manutenzione</h3><p className="text-xs text-gray-500">Incluse nel servizio, con ricambi originali.</p></div></div>
              <div className="flex gap-4"><Truck size={24} className="text-blue shrink-0 mt-0.5" /><div><h3 className="font-bold text-navy text-sm">Rifornimenti programmati</h3><p className="text-xs text-gray-500">Gestione fornitura cialde e accessori.</p></div></div>
            </div>
          </div>
        </section>

        <section className="bg-blue/5 border-y border-blue/10 py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="font-heading text-2xl font-bold text-navy mb-4">Prova Caffè Borbone</h2>
            <p className="text-gray-500 mb-6">Contattaci per un preventivo personalizzato. Consegna gratuita a Milano.</p>
            <Link href="/aziende" className="inline-flex items-center gap-2 bg-blue hover:bg-blue-light text-white font-bold px-8 py-3 rounded-lg transition-colors">
              Richiedi preventivo <ArrowRight size={18} />
            </Link>
          </div>
        </section>
    </>
  );
}
