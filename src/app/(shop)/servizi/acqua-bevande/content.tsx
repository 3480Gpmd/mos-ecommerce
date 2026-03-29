'use client';

import Link from 'next/link';
import { ArrowRight, Droplet, Leaf, Zap, CheckCircle, Recycle } from 'lucide-react';
import { ProcessSteps } from '@/components/shop/process-steps';
import { useEffect, useState } from 'react';

export default function AcquaBevandContent() {
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

  const dispenserTypes = [
    {
      title: 'Dispenser Rete Idrica',
      subtitle: 'Soluzione sostenibile',
      features: [
        'Collegamento diretto alla rete',
        'Acqua fredda, naturale e frizzante',
        'Bassissimi costi operativi',
        'Ingombro minimo',
        'Manutenzione semplice',
      ],
      pros: [
        'Illimitato',
        'Sostenibile',
        'Economico',
      ],
      color: 'from-cyan-500 to-blue-500',
    },
    {
      title: 'Dispenser a Boccioni',
      subtitle: 'Soluzione flessibile',
      features: [
        'Collocabile ovunque',
        'Acqua di qualità certificata',
        'Consegna programmata boccioni',
        'Design moderno',
        'Due versioni: fredda o fredda+naturale',
      ],
      pros: [
        'Flessibile',
        'Qualità',
        'Comodo',
      ],
      color: 'from-blue-500 to-indigo-500',
    },
  ];

  const drinkCategories = [
    {
      name: 'Bibite Energizzanti',
      brands: 'Red Bull, Monster, Celsius',
      desc: 'Bevande ricche di energia per affrontare la giornata',
    },
    {
      name: 'Bibite Classiche',
      brands: 'Coca-Cola, Sprite, Fanta',
      desc: 'Le bevande più amate, disponibili in diverse varianti',
    },
    {
      name: 'Bevande Salutistiche',
      brands: 'Succhi di frutta, Tè freddo, Isotoniche',
      desc: 'Scelte consapevoli per chi preferisce ingredienti naturali',
    },
    {
      name: 'Private Label',
      brands: 'Brand personalizzati',
      desc: 'Bibite a marchio vostro per rafforzare l\'identità aziendale',
    },
  ];

  const benefits = [
    {
      icon: Leaf,
      title: 'Sostenibilità',
      desc: 'Riduci l\'impronta ecologica con dispenser a rete idrica.',
    },
    {
      icon: Zap,
      title: 'Praticità',
      desc: 'Acqua disponibile in qualsiasi momento della giornata.',
    },
    {
      icon: CheckCircle,
      title: 'Qualità Certificata',
      desc: 'Acqua filtrata e controllata secondo normative rigide.',
    },
    {
      icon: Recycle,
      title: 'Riduzione Plastica',
      desc: 'Meno bottiglie di plastica, più responsabilità ambientale.',
    },
  ];

  const environmentalImpact = [
    {
      metric: '1000+',
      label: 'Bottiglie di plastica evitate all\'anno per dispenser',
      icon: '🌍',
    },
    {
      metric: '50%',
      label: 'Riduzione costi vs. bottiglie individuali',
      icon: '💰',
    },
    {
      metric: '100%',
      label: 'Acqua disponibile quando serve',
      icon: '💧',
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-navy mb-4 animate-slide-up">
                Acqua & Bevande
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-6 animate-line-expand" />
              <p className="text-lg text-gray-700 mb-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Soluzioni complete per l&apos;idratazione in ufficio e azienda.
              </p>
              <p className="text-gray-600 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                Dispenser a rete idrica o a boccioni, bibite fredde e bevande di qualità. Consegna e manutenzione incluse.
              </p>
              <Link
                href="/aziende"
                className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
              >
                Richiedi preventivo <ArrowRight size={18} />
              </Link>
            </div>

            <div className="relative h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-3xl blur-2xl opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-3xl" />
              <div className="relative flex items-center justify-center h-full">
                <Droplet size={180} className="text-cyan-600 opacity-30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dispenser Types */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-navy mb-4">Tipologie di Dispenser</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Scegli la soluzione più adatta alle tue esigenze
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dispenserTypes.map((type, idx) => (
              <div
                key={type.title}
                data-index={idx}
                className={`relative p-8 rounded-2xl border-2 border-gray-100 hover:border-blue transition-all duration-300 h-full flex flex-col ${
                  visibleItems.includes(idx) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{
                  transitionDelay: `${idx * 100}ms`,
                }}
              >
                <div className={`h-20 bg-gradient-to-r ${type.color} rounded-lg mb-6 flex items-center justify-center`}>
                  <Droplet size={48} className="text-white opacity-40" />
                </div>

                <h3 className="font-bold text-navy text-2xl mb-1">{type.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{type.subtitle}</p>

                <ul className="space-y-2 mb-6 flex-grow">
                  {type.features.map((feature) => (
                    <li key={feature} className="flex gap-2 items-start">
                      <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  {type.pros.map((pro) => (
                    <span key={pro} className="text-xs font-bold text-blue bg-blue/10 px-3 py-1 rounded-full">
                      {pro}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bevande Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-navy mb-4">Bevande Disponibili</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Ampia scelta di bibite e bevande fredde per tutti i gusti
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {drinkCategories.map((category, idx) => (
              <div
                key={category.name}
                data-index={idx + 2}
                className={`p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue hover:shadow-lg transition-all duration-300 ${
                  visibleItems.includes(idx + 2) ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                style={{
                  transitionDelay: `${idx * 100}ms`,
                }}
              >
                <h3 className="font-bold text-navy text-lg mb-1">{category.name}</h3>
                <p className="text-sm text-blue font-semibold mb-3">{category.brands}</p>
                <p className="text-sm text-gray-600">{category.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <ProcessSteps
        title="Come funziona il servizio"
        subtitle="Quattro semplici passi per avere acqua e bevande in ufficio"
      />

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-navy mb-4">I Vantaggi</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  data-index={idx + 6}
                  className={`p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-100 hover:border-blue transition-all duration-300 text-center ${
                    visibleItems.includes(idx + 6) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{
                    transitionDelay: `${idx * 100}ms`,
                  }}
                >
                  <Icon size={40} className="text-cyan-600 mx-auto mb-3" />
                  <h3 className="font-bold text-navy text-lg mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Environmental Impact */}
      <section className="bg-gradient-to-r from-cyan-500 to-blue-500 py-16 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-4">Impatto Ambientale Positivo</h2>
            <p className="text-lg text-cyan-50 max-w-2xl mx-auto">
              Scegli la sostenibilità senza compromessi sulla qualità
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {environmentalImpact.map((item, idx) => (
              <div
                key={item.label}
                data-index={idx + 10}
                className={`text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 ${
                  visibleItems.includes(idx + 10) ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                style={{
                  transitionDelay: `${idx * 100}ms`,
                }}
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="text-3xl font-bold mb-2">{item.metric}</div>
                <p className="text-sm text-cyan-50">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-navy mb-4">Confronto Soluzioni</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-bold text-navy">Caratteristica</th>
                  <th className="text-center py-4 px-6 font-bold text-navy">Rete Idrica</th>
                  <th className="text-center py-4 px-6 font-bold text-navy">Boccioni</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Installazione', rete: '✓', boccioni: '✓' },
                  { feature: 'Manutenzione inclusa', rete: '✓', boccioni: '✓' },
                  { feature: 'Acqua illimitata', rete: '✓', boccioni: '✗' },
                  { feature: 'Installazione semplice', rete: '✗', boccioni: '✓' },
                  { feature: 'Flessibilità posizionamento', rete: '✗', boccioni: '✓' },
                  { feature: 'Costi minimi', rete: '✓', boccioni: '✗' },
                  { feature: 'Sostenibilità', rete: '✓', boccioni: '≈' },
                ].map((row, idx) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="py-4 px-6 font-semibold text-navy">{row.feature}</td>
                    <td className="py-4 px-6 text-center">
                      {row.rete === '✓' && <span className="text-green-500 text-xl">✓</span>}
                      {row.rete === '✗' && <span className="text-gray-300 text-xl">✗</span>}
                      {row.rete === '≈' && <span className="text-yellow-500 text-xl">≈</span>}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.boccioni === '✓' && <span className="text-green-500 text-xl">✓</span>}
                      {row.boccioni === '✗' && <span className="text-gray-300 text-xl">✗</span>}
                      {row.boccioni === '≈' && <span className="text-yellow-500 text-xl">≈</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-cyan-500 to-blue-500 py-16 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl font-bold mb-4">Scegli acqua e bevande di qualità</h2>
          <p className="text-lg mb-8 text-cyan-50">
            Richiedi una consulenza gratuita. Ti aiuteremo a scegliere la soluzione migliore per il tuo business.
          </p>
          <Link
            href="/aziende"
            className="inline-flex items-center justify-center gap-2 bg-white text-cyan-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-lg transition-colors"
          >
            Richiedi preventivo <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </>
  );
}
