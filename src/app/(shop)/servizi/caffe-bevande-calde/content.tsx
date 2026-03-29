'use client';

import Link from 'next/link';
import { ArrowRight, Coffee, Leaf, Zap, CheckCircle, AlertCircle, Award } from 'lucide-react';
import { ProcessSteps } from '@/components/shop/process-steps';
import { useEffect, useState } from 'react';

export default function CaffeBevandeCaldeContent() {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target instanceof HTMLElement) {
            const index = parseInt(entry.target.dataset.index || '0', 10);
            setVisibleItems((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-index]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const brands = [
    { name: 'Caffè Borbone', desc: 'Autentico espresso napoletano. Miscele pregiate, cialde ESE compostabili.', color: 'from-amber-600 to-orange-500' },
    { name: 'Lavazza', desc: 'Tradizione italiana dal 1895. Qualità certificata e varietà di miscele.', color: 'from-red-600 to-red-500' },
    { name: 'Illy', desc: 'Eccellenza triestina. Selezione 100% Arabica, crema densa e persistente.', color: 'from-yellow-600 to-yellow-500' },
    { name: 'Pellini', desc: 'Caffè italiano di qualità. Soluzioni eco-friendly e sostenibili.', color: 'from-emerald-600 to-green-500' },
  ];

  const productTypes = [
    {
      title: 'Cialde ESE 44mm',
      desc: 'Compostabili al 100%, compatibili con tutte le macchine ESE. Facilissime da usare.',
      icon: Leaf,
    },
    {
      title: 'Capsule A Doppia Parete',
      desc: 'Per macchine specifiche. Migliore isolamento termico, estrazione ottimale.',
      icon: Coffee,
    },
    {
      title: 'Caffè in Grani',
      desc: 'Macinazione al momento. Per chi preferisce il controllo totale della preparazione.',
      icon: Award,
    },
  ];

  const formulas = [
    {
      title: 'Comodato d\'uso',
      price: 'Gratis',
      features: [
        'Macchina fornita senza costo',
        'Installazione e manutenzione incluse',
        'Fornitura programmata di caffè',
        'Assistenza tecnica 24h',
        'Ricambi e pulizia inclusi',
      ],
      best: true,
    },
    {
      title: 'Noleggio',
      price: 'Da €99/mese',
      features: [
        'Canone di noleggio mensile',
        'Scelta della macchina',
        'Manutenzione e assistenza incluse',
        'Fornitura di caffè a parte',
        'Possibilità di cambio macchina',
      ],
    },
    {
      title: 'Acquisto',
      price: 'Su preventivo',
      features: [
        'Macchina di proprietà',
        'Prezzo vantaggioso',
        'Assistenza opzionale',
        'Fornitura caffè scontata',
        'Nessun vincolo contrattuale',
      ],
    },
  ];

  const benefits = [
    {
      icon: CheckCircle,
      title: 'Qualità Garantita',
      desc: 'Brand riconosciuti a livello mondiale. Solo materie prime premium.',
    },
    {
      icon: Zap,
      title: 'Assistenza Rapida',
      desc: 'Team tecnico disponibile. Interventi entro 24h in caso di problemi.',
    },
    {
      icon: AlertCircle,
      title: 'Consegna Garantita',
      desc: 'Entro 24h a Milano. Installazione gratuita e configurazione inclusa.',
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-navy mb-4 animate-slide-up">
                Caffè & Bevande Calde
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-6 animate-line-expand" />
              <p className="text-lg text-gray-700 mb-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Macchine per caffè professionali e domestiche con i brand più prestigiosi.
              </p>
              <p className="text-gray-600 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                In comodato d&apos;uso, noleggio o acquisto. Servizio completo con installazione, manutenzione e fornitura programmata.
              </p>
              <Link
                href="/aziende"
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
              >
                Richiedi preventivo <ArrowRight size={18} />
              </Link>
            </div>

            <div className="relative h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-orange-300 rounded-3xl blur-2xl opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-3xl" />
              <div className="relative flex items-center justify-center h-full">
                <Coffee size={180} className="text-amber-700 opacity-30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-navy mb-4">Brand Disponibili</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              I migliori caffè italiani e internazionali per soddisfare ogni preferenza
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {brands.map((brand, idx) => (
              <div
                key={brand.name}
                data-index={idx}
                className={`p-6 rounded-2xl border-2 border-gray-100 hover:border-blue hover:shadow-lg transition-all duration-300 ${
                  visibleItems.includes(idx) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{
                  transitionDelay: `${idx * 100}ms`,
                }}
              >
                <div className={`h-12 bg-gradient-to-r ${brand.color} rounded-lg mb-4`} />
                <h3 className="font-bold text-navy text-lg mb-2">{brand.name}</h3>
                <p className="text-sm text-gray-600">{brand.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Types */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-navy mb-4">Tipologie di Prodotto</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Scegli il formato più adatto alle tue esigenze
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {productTypes.map((type, idx) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.title}
                  data-index={idx + 4}
                  className={`p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue hover:shadow-lg transition-all duration-300 text-center ${
                    visibleItems.includes(idx + 4) ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                  style={{
                    transitionDelay: `${idx * 100}ms`,
                  }}
                >
                  <Icon size={48} className="text-amber-600 mx-auto mb-4" />
                  <h3 className="font-bold text-navy text-lg mb-2">{type.title}</h3>
                  <p className="text-sm text-gray-600">{type.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Formulas */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-navy mb-4">Formule di Servizio</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Scegli la soluzione più conveniente per la tua azienda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {formulas.map((formula, idx) => (
              <div
                key={formula.title}
                data-index={idx + 7}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 h-full flex flex-col ${
                  formula.best
                    ? 'border-blue bg-gradient-to-br from-blue/5 to-blue-light/5 shadow-xl'
                    : 'border-gray-100 bg-white hover:border-blue hover:shadow-lg'
                } ${visibleItems.includes(idx + 7) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{
                  transitionDelay: `${idx * 100}ms`,
                }}
              >
                {formula.best && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue text-white px-4 py-1 rounded-full text-sm font-bold">
                    Più popolare
                  </div>
                )}

                <h3 className="font-bold text-navy text-xl mb-2">{formula.title}</h3>
                <div className="font-heading text-3xl font-bold text-blue mb-6">{formula.price}</div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {formula.features.map((feature) => (
                    <li key={feature} className="flex gap-3 items-start">
                      <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/aziende"
                  className={`w-full text-center py-3 rounded-lg font-bold transition-colors ${
                    formula.best
                      ? 'bg-blue text-white hover:bg-blue-dark'
                      : 'border-2 border-blue text-blue hover:bg-blue/5'
                  }`}
                >
                  Scegli piano
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <ProcessSteps />

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-navy mb-4">I Vantaggi del Nostro Servizio</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  data-index={idx + 10}
                  className={`p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue transition-all duration-300 text-center ${
                    visibleItems.includes(idx + 10) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{
                    transitionDelay: `${idx * 100}ms`,
                  }}
                >
                  <Icon size={40} className="text-blue mx-auto mb-4" />
                  <h3 className="font-bold text-navy text-lg mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-amber-500 to-orange-500 py-16 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl font-bold mb-4">Prova il nostro servizio caffè</h2>
          <p className="text-lg mb-8 text-orange-50">
            Richiedi una consulenza gratuita e scopri quale soluzione è la più adatta per il tuo business.
          </p>
          <Link
            href="/aziende"
            className="inline-flex items-center justify-center gap-2 bg-white text-amber-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-lg transition-colors"
          >
            Richiedi preventivo <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </>
  );
}
