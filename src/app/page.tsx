import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, Shield, Headphones, Coffee, Droplets, Printer } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Milano Offre Servizi - Forniture Ufficio, Caffè, Acqua',
  description: 'E-commerce B2B/B2C per forniture ufficio, caffè e acqua. Consegna rapida a Milano e provincia. Oltre 25.000 prodotti a prezzi competitivi. Preventivi personalizzati per aziende.',
  keywords: 'forniture ufficio Milano, caffè online, acqua boccioni, consegna rapida, e-commerce, B2B, B2C',
  alternates: {
    canonical: 'https://milanooffreservizi-ecommerce.it',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* Hero sfalsato con overlap */}
        <section className="bg-gray-50 py-12 md:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 md:gap-0">
              {/* Blocco testo con cornice */}
              <div className="md:col-span-5 bg-white border border-gray-200 rounded-2xl p-8 md:p-12 relative z-10 md:translate-y-8 shadow-lg">
                <Image
                  src="/logo-dark.jpg"
                  alt="MOS Milano Offre Servizi"
                  width={220}
                  height={90}
                  className="mb-6"
                  priority
                />
                <p className="font-heading text-[1.25rem] md:text-[1.5rem] font-bold leading-snug mb-3 text-navy">
                  Il tuo unico fornitore a Milano.
                  <br />
                  Caffè, acqua e cancelleria consegnati in 48 ore.
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  Forniture per ufficio, caffè e acqua per aziende e privati. Oltre 25.000 prodotti a prezzi competitivi.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/catalogo"
                    className="inline-flex items-center gap-2 bg-blue hover:bg-blue-light text-white font-bold px-6 py-3 rounded-lg transition-colors"
                  >
                    Sfoglia il catalogo <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/registrati"
                    className="inline-flex items-center gap-2 border-2 border-navy/20 text-navy hover:bg-gray-50 font-medium px-6 py-3 rounded-lg transition-colors"
                  >
                    Registrati gratis
                  </Link>
                </div>
              </div>
              {/* Blocco foto sfalsato */}
              <div className="md:col-span-7 md:-ml-8 md:-mt-8">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/Home 1b2.png"
                    alt="Milano Offre Servizi"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 58vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Personal Trust Section - Davide Mareggini */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-white to-blue/5">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Foto Davide */}
              <div className="flex justify-center md:justify-start order-2 md:order-1">
                <div className="relative w-full max-w-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue/20 to-blue/10 rounded-3xl transform -rotate-3"></div>
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-blue/20 hover:border-blue/40 transition-colors duration-300">
                    <Image
                      src="/davide.png"
                      alt="Davide Mareggini - Fondatore MOS Milano Offre Servizi"
                      width={500}
                      height={500}
                      className="w-full h-auto object-cover"
                      priority={false}
                    />
                  </div>
                </div>
              </div>

              {/* Testo e CTA */}
              <div className="order-1 md:order-2">
                <div className="space-y-6">
                  <div>
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy mb-2">
                      Il tuo partner di fiducia
                    </h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-blue to-blue-light rounded-full"></div>
                  </div>

                  <p className="text-gray-700 leading-relaxed">
                    Sono <strong>Davide Mareggini</strong>, fondatore di <strong>MOS Milano Offre Servizi</strong>. Da oltre 15 anni mi dedico personalmente a garantire che ogni azienda milanese abbia il servizio che merita: caffè di qualità, acqua fresca e forniture complete per l&apos;ufficio.
                  </p>

                  <p className="text-gray-600 leading-relaxed">
                    La mia organizzazione efficace ed efficiente è al servizio del tuo business. Credo che una partnership duratura si costruisca sulla fiducia, sulla trasparenza e su un impegno genuino verso il successo dei miei clienti.
                  </p>

                  <div className="bg-blue/5 border-l-4 border-blue rounded-lg p-6 my-6">
                    <p className="text-lg font-heading font-semibold text-navy italic">
                      &quot;Ogni cliente per noi è unico. Il mio impegno personale è la garanzia del servizio.&quot;
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Link
                      href="/contatti"
                      className="inline-flex items-center justify-center gap-2 bg-blue hover:bg-blue-light text-white font-bold px-8 py-3 rounded-lg transition-colors"
                    >
                      Contattami direttamente <ArrowRight size={18} />
                    </Link>
                    <Link
                      href="/chi-siamo"
                      className="inline-flex items-center justify-center gap-2 border-2 border-blue/30 text-navy hover:border-blue hover:bg-blue/5 font-medium px-8 py-3 rounded-lg transition-colors"
                    >
                      Scopri la nostra storia
                    </Link>
                  </div>
                </div>
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
            <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4 scrollbar-hide">
              <Link href="/servizi/prodotti-ufficio" className="group bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-lg hover:border-blue transition-all snap-start shrink-0 w-[80%] sm:w-[calc(33.333%-1rem)] sm:shrink">
                <div className="text-blue mb-4 flex justify-center"><Printer size={48} /></div>
                <h3 className="font-heading text-lg font-bold text-gray-800 mb-2">Forniture Ufficio</h3>
                <p className="text-sm text-gray-500">Oltre 25.000 prodotti: consumabili, carta, informatica e molto altro.</p>
              </Link>
              <Link href="/servizi/caffe-bevande-calde" className="group bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-lg hover:border-blue transition-all snap-start shrink-0 w-[80%] sm:w-[calc(33.333%-1rem)] sm:shrink">
                <div className="text-blue mb-4 flex justify-center"><Coffee size={48} /></div>
                <h3 className="font-heading text-lg font-bold text-gray-800 mb-2">Caffè</h3>
                <p className="text-sm text-gray-500">Lavazza, Borbone, Covim, Toraldo, Gise. Cialde, capsule e grani.</p>
              </Link>
              <Link href="/servizi/acqua-bevande" className="group bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-lg hover:border-blue transition-all snap-start shrink-0 w-[80%] sm:w-[calc(33.333%-1rem)] sm:shrink">
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
