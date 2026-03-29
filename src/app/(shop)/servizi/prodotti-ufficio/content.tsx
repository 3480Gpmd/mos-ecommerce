'use client';

import Link from 'next/link';
import { ArrowRight, Briefcase, Package, Zap, Clock, TrendingUp, Truck, CheckCircle } from 'lucide-react';
import { ProcessSteps } from '@/components/shop/process-steps';
import { useEffect, useState } from 'react';

export default function ProdottiUfficioContent() {
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

  const categories = [
    {
      name: 'Toner e Cartucce',
      count: '2.000+',
      desc: 'Per stampanti laser e inkjet di tutti i brand principali',
      color: 'from-indigo-600 to-purple-600',
      icon: '🖨️',
    },
    {
      name: 'Carta e Formati',
      count: '500+',
      desc: 'Carte da stampa, buste, blocchi, quaderni, registri',
      color: 'from-blue-600 to-cyan-600',
      icon: '📄',
    },
    {
      name: 'Cancelleria',
      count: '1.000+',
      desc: 'Penne, matite, evidenziatori, evidenziatori, adesivi, forbici',
      color: 'from-green-600 to-emerald-600',
      icon: '✏️',
    },
    {
      name: 'Prodotti Igiene',
      count: '300+',
      desc: 'Carta igienica, salviette, asciugamani, igienizzanti',
      color: 'from-pink-600 to-rose-600',
      icon: '🧼',
    },
    {
      name: 'Arredi Ufficio',
      count: '200+',
      desc: 'Scrivanie, sedie, scaffalature, elementi di arredo modulare',
      color: 'from-amber-600 to-orange-600',
      icon: '🪑',
    },
    {
      name: 'Accessori Tech',
      count: '500+',
      desc: 'Cavi, hub USB, caricabatterie, supporti, webcam, microfoni',
      color: 'from-slate-600 to-gray-600',
      icon: '🔌',
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Catalogo Online',
      desc: 'Accedi al nostro e-commerce con 25.000+ prodotti. Filtri avanzati per trovare rapidamente quello che cercai',
    },
    {
      step: '2',
      title: 'Carrello Personalizzato',
      desc: 'Aggiungi i prodotti al tuo carrello. Crea elenchi personalizzati per ordini ricorrenti.',
    },
    {
      step: '3',
      title: 'Ordine Semplice',
      desc: 'Procedi al checkout con pochi click. Scegli il metodo di pagamento preferito.',
    },
    {
      step: '4',
      title: 'Consegna 24h',
      desc: 'Ricevi il tuo ordine entro 24 ore a Milano e provincia. Tracciamento disponibile.',
    },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Prezzi Competitivi',
      desc: 'Sconti dedicati per aziende e grossisti. Listini trasparenti, no sorprese.',
    },
    {
      icon: Clock,
      title: 'Consegna Rapida',
      desc: 'Entro 24 ore a Milano. Spedizioni tracciabili e assicurate.',
    },
    {
      icon: Package,
      title: 'Ampia Scelta',
      desc: 'Oltre 25.000 prodotti da brand rinomati. Sempre in stock i principali articoli.',
    },
    {
      icon: Truck,
      title: 'Logistica Affidabile',
      desc: 'Fleet di veicoli dedicati. Gestione professionale delle consegne.',
    },
    {
      icon: CheckCircle,
      title: 'Supporto Clienti',
      desc: 'Team disponibile per consulenze. Assistenza durante l\'ordine e dopo.',
    },
    {
      icon: Zap,
      title: 'Servizio Programmato',
      desc: 'Ordini automatici per prodotti di consumo. Fatturazione centralizzata.',
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-navy mb-4 animate-slide-up">
                Prodotti per Ufficio
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-6 animate-line-expand" />
              <p className="text-lg text-gray-700 mb-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                25.000+ prodotti per il tuo ufficio e la tua azienda.
              </p>
              <p className="text-gray-600 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                Toner, cancelleria, carta, igiene, arredo e accessori tech. Consegna entro 24h a Milano. Prezzi competitivi garantiti.
              </p>
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
              >
                Visualizza catalogo <ArrowRight size={18} />
              </Link>
            </div>

            <div className="relative h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 to-purple-300 rounded-3xl blur-2xl opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-3xl" />
              <div className="relative flex items-center justify-center h-full">
                <Briefcase size={180} className="text-indigo-600 opacity-30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-navy mb-4">Categorie Prodotti</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Scopri le nostre principali categorie di forniture ufficio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <Link
                key={cat.name}
                href="/catalogo"
                data-index={idx}
                className={`p-6 rounded-2xl border-2 border-gray-100 hover:border-blue hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col ${
                  visibleItems.includes(idx) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{
                  transitionDelay: `${idx * 100}ms`,
                }}
              >
                <div className={`h-24 bg-gradient-to-br ${cat.color} rounded-lg mb-4 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <h3 className="font-bold text-navy text-lg mb-1 group-hover:text-blue transition-colors">
                  {cat.name}
                </h3>
                <p className="text-sm text-blue font-semibold mb-3">{cat.count} articoli</p>
                <p className="text-sm text-gray-600 flex-grow">{cat.desc}</p>
                <div className="flex items-center gap-2 text-blue font-bold mt-4 group-hover:gap-4 transition-all">
                  Scopri <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-navy mb-4">Come Ordinare</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Quattro semplici step per ricevere i tuoi ordini
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {howItWorks.map((item, idx) => (
              <div
                key={item.title}
                data-index={idx + 6}
                className={`p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue relative transition-all duration-300 ${
                  visibleItems.includes(idx + 6) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{
                  transitionDelay: `${idx * 100}ms`,
                }}
              >
                {/* Step number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>

                {/* Connector */}
                {idx < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute -right-6 top-12 w-12 h-0.5 bg-gradient-to-r from-indigo-600 to-transparent" />
                )}

                <h3 className="font-bold text-navy text-lg mb-3 pt-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <ProcessSteps
        title="Il nostro impegno con te"
        subtitle="Qualità, velocità e affidabilità in ogni ordine"
      />

      {/* Benefits Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-navy mb-4">Perché ordinare da noi</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  data-index={idx + 10}
                  className={`p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-100 hover:border-blue hover:shadow-lg transition-all duration-300 ${
                    visibleItems.includes(idx + 10) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{
                    transitionDelay: `${idx * 100}ms`,
                  }}
                >
                  <Icon size={40} className="text-indigo-600 mb-4" />
                  <h3 className="font-bold text-navy text-lg mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-indigo-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-heading text-4xl font-bold mb-2">25.000+</div>
              <p className="text-sm text-indigo-100">Prodotti disponibili</p>
            </div>
            <div>
              <div className="font-heading text-4xl font-bold mb-2">24h</div>
              <p className="text-sm text-indigo-100">Consegna a Milano</p>
            </div>
            <div>
              <div className="font-heading text-4xl font-bold mb-2">500+</div>
              <p className="text-sm text-indigo-100">Clienti soddisfatti</p>
            </div>
            <div>
              <div className="font-heading text-4xl font-bold mb-2">100%</div>
              <p className="text-sm text-indigo-100">Garantito in stock</p>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-navy mb-4">Il nostro Catalogo Online</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {[
                'Ricerca avanzata con filtri per marchi, categorie e prezzi',
                'Schede prodotto complete con foto, specifiche e compatibilità',
                'Comparazione tra prodotti simili per scegliere il migliore',
                'Storico ordini e lista preferiti per ordinare velocemente',
                'Dati tecnici e manuali scaricabili per ogni prodotto',
                'Recensioni verificate di clienti reali',
              ].map((feature, idx) => (
                <div
                  key={feature}
                  data-index={idx + 16}
                  className={`flex gap-4 items-start p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue transition-all ${
                    visibleItems.includes(idx + 16) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                  style={{
                    transitionDelay: `${idx * 50}ms`,
                  }}
                >
                  <CheckCircle size={24} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="relative h-96 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <Package size={100} className="text-indigo-600/30 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold">Catalogo completo a portata di mano</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl font-bold mb-4">Pronto a ordinare?</h2>
          <p className="text-lg mb-8 text-indigo-50">
            Accedi al nostro catalogo completo di 25.000+ prodotti. Consegna entro 24h garantita.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-lg transition-colors"
            >
              Vai al Catalogo <ArrowRight size={20} />
            </Link>
            <Link
              href="/aziende"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white/10 font-bold px-8 py-4 rounded-lg transition-colors"
            >
              Richiedi preventivo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
