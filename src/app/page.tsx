import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, Shield, Headphones, Coffee, Droplets, Printer } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* Hero fullscreen */}
        <section className="relative h-[80vh] min-h-[500px] max-h-[800px] flex items-center">
          {/* Immagine di sfondo */}
          <Image
            src="/Home 1b2.png"
            alt="Milano Offre Servizi"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Gradiente leggero per leggibilità testo */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent" />
          {/* Testo */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full -mt-10">
            <div className="max-w-2xl">
              <Image
                src="/logo-light.png"
                alt="MOS Milano Offre Servizi"
                width={280}
                height={120}
                className="mb-6 drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
              />
              <p className="font-heading text-[1.4rem] md:text-[1.65rem] font-bold leading-snug mb-3 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                Tutto per il tuo ufficio da un unico fornitore.
                <br />
                Caffè, acqua e cancelleria consegnati in 48 ore.
              </p>
              <p className="text-sm md:text-base text-white/70 mb-8 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                Forniture per ufficio, caffè e acqua per aziende e privati. Oltre 25.000 prodotti a prezzi competitivi.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/catalogo"
                  className="inline-flex items-center gap-2 bg-white text-navy font-bold px-7 py-3.5 rounded-lg hover:bg-gray-100 transition-colors text-lg"
                >
                  Sfoglia il catalogo <ArrowRight size={20} />
                </Link>
                <Link
                  href="/registrati"
                  className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white/15 font-medium px-7 py-3.5 rounded-lg transition-colors text-lg"
                >
                  Registrati gratis
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* USP */}
        <section className="border-b border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue/10 rounded-lg text-blue"><Truck size={24} /></div>
                <div>
                  <p className="font-bold text-sm text-gray-800">Consegna gratuita</p>
                  <p className="text-xs text-gray-500">Per ordini sopra 100&euro;</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue/10 rounded-lg text-blue"><Shield size={24} /></div>
                <div>
                  <p className="font-bold text-sm text-gray-800">Pagamenti sicuri</p>
                  <p className="text-xs text-gray-500">PayPal, TeamSystem Pay, Bonifico</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue/10 rounded-lg text-blue"><Headphones size={24} /></div>
                <div>
                  <p className="font-bold text-sm text-gray-800">Assistenza dedicata</p>
                  <p className="text-xs text-gray-500">Lun-Ven 9:00-18:00</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories highlight */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-gray-800 mb-6">I nostri servizi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Link href="/catalogo" className="group bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-lg hover:border-blue transition-all">
                <div className="text-blue mb-4 flex justify-center"><Printer size={48} /></div>
                <h3 className="font-heading text-lg font-bold text-gray-800 mb-2">Forniture Ufficio</h3>
                <p className="text-sm text-gray-500">Oltre 25.000 prodotti: consumabili, carta, informatica e molto altro.</p>
              </Link>
              <Link href="/catalogo?group=caffe-e-bevande-calde" className="group bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-lg hover:border-blue transition-all">
                <div className="text-blue mb-4 flex justify-center"><Coffee size={48} /></div>
                <h3 className="font-heading text-lg font-bold text-gray-800 mb-2">Caffè</h3>
                <p className="text-sm text-gray-500">Lavazza, Borbone, Covim, Toraldo, Gise. Cialde, capsule e grani.</p>
              </Link>
              <Link href="/catalogo?group=bevande-fredde" className="group bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-lg hover:border-blue transition-all">
                <div className="text-blue mb-4 flex justify-center"><Droplets size={48} /></div>
                <h3 className="font-heading text-lg font-bold text-gray-800 mb-2">Servizio Acqua</h3>
                <p className="text-sm text-gray-500">Acqua, succhi, bibite e bevande fredde. Levissima, San Benedetto, Valfrutta e altre.</p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue/5 border-y border-blue/10 py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl font-bold text-navy mb-4">Sei un&apos;azienda?</h2>
            <p className="text-gray-500 mb-6">
              Registrati come cliente business per visualizzare i prezzi netti e scaricare fatture con IVA.
            </p>
            <Link
              href="/registrati"
              className="inline-flex items-center gap-2 bg-blue hover:bg-blue-light text-white font-bold px-8 py-3 rounded-lg transition-colors"
            >
              Registra la tua azienda <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
