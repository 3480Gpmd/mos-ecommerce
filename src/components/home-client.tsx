'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, Shield, Headphones, CheckCircle, Coffee, Droplets, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { CountUp } from '@/components/ui/count-up';
import { MotionCard } from '@/components/ui/motion-card';
import { MotionButton } from '@/components/ui/motion-button';

/* ──────────────────────────────────────────────
   Data
   ────────────────────────────────────────────── */
const services = [
  {
    title: 'Caffè e Bevande Calde',
    desc: 'Macchine in comodato gratuito. Lavazza, Borbone, Covim, Gise. Cialde, capsule e grani per ogni esigenza.',
    href: '/servizi/caffe-bevande-calde',
    img: '/servizi/dr-coffee.png',
    icon: Coffee,
    accent: 'bg-amber-50 text-amber-700',
  },
  {
    title: 'Servizio Acqua e Bevande',
    desc: 'Dispenser a rete idrica e boccioni. Acqua, succhi, bibite fredde. Sant\'Anna, Levissima e molto altro.',
    href: '/servizi/acqua-bevande',
    img: '/servizi/acqua-uffici.png',
    icon: Droplets,
    accent: 'bg-sky-50 text-sky-700',
  },
  {
    title: 'Forniture Ufficio',
    desc: 'Oltre 25.000 prodotti: toner, carta, cancelleria, igiene, informatica. Tutto per il tuo ufficio.',
    href: '/servizi/prodotti-ufficio',
    img: '/servizi/ufficio.png',
    icon: Printer,
    accent: 'bg-violet-50 text-violet-700',
  },
];

const stats = [
  { value: 25000, suffix: '+', label: 'Prodotti a catalogo' },
  { value: 15, suffix: '+', label: 'Anni di esperienza' },
  { value: 48, suffix: 'h', label: 'Consegna garantita' },
  { value: 500, suffix: '+', label: 'Aziende clienti' },
];

const usps = [
  { icon: Truck, title: 'Consegna gratuita', desc: 'Per ordini sopra 100€ a Milano e provincia' },
  { icon: Shield, title: 'Pagamenti sicuri', desc: 'PayPal, TeamSystem Pay, Bonifico bancario' },
  { icon: Headphones, title: 'Assistenza dedicata', desc: 'Lun–Ven 9:00–18:00 — risposta diretta' },
];

const perche = [
  { title: 'Un unico fornitore', desc: 'Caffè, acqua, cancelleria e forniture: tutto in un solo ordine.' },
  { title: 'Consegna rapida', desc: 'Entro 48h su Milano e provincia, con tracciamento.' },
  { title: 'Prezzi netti B2B', desc: 'Listini dedicati per aziende con partita IVA.' },
  { title: 'Assistenza personale', desc: 'Davide e il suo team seguono ogni cliente direttamente.' },
  { title: 'Nessun vincolo', desc: 'Zero contratti a lungo termine, massima flessibilità.' },
  { title: 'Fatturazione automatica', desc: 'Fattura elettronica emessa in automatico ad ogni ordine.' },
];

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */
export function HomeClient() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-lg"
            >
              <div className="inline-block bg-mos-red-light text-mos-red text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
                Consegna in 48h a Milano
              </div>
              <h1 className="font-heading text-4xl md:text-[3.25rem] font-bold text-dark leading-[1.08] mb-5">
                Il tuo unico fornitore
                <span className="text-mos-red"> a Milano.</span>
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Caffè, acqua e cancelleria consegnati in 48 ore. Oltre 25.000 prodotti a prezzi competitivi per aziende e privati.
              </p>
              <div className="flex flex-wrap gap-3">
                <MotionButton href="/catalogo" variant="primary">
                  Sfoglia il catalogo <ArrowRight size={18} />
                </MotionButton>
                <MotionButton href="/registrati" variant="outline">
                  Registrati gratis
                </MotionButton>
              </div>
            </motion.div>

            {/* Hero image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/hero-showroom.png"
                  alt="Davide Mareggini nello showroom MOS — Milano Offre Servizi"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              {/* Accent corners */}
              <div className="absolute -bottom-3 -left-3 w-24 h-24 border-l-4 border-b-4 border-mos-red rounded-bl-2xl pointer-events-none" />
              <div className="absolute -top-3 -right-3 w-16 h-16 border-t-4 border-r-4 border-mos-red/30 rounded-tr-2xl pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── USP STRIP ─── */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {usps.map((usp) => (
              <div key={usp.title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-mos-red shrink-0">
                  <usp.icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-dark">{usp.title}</p>
                  <p className="text-xs text-gray-500">{usp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATISTICHE ─── */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <CountUp
                  end={stat.value}
                  suffix={stat.suffix}
                  className="font-heading text-4xl md:text-5xl font-bold text-mos-red"
                />
                <p className="text-sm text-gray-500 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVIZI ─── */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal single className="max-w-xl mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-dark mb-2">I nostri servizi</h2>
            <p className="text-gray-500">Tutto ciò che serve al tuo ufficio, da un unico fornitore.</p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((svc) => (
              <ScrollReveal key={svc.title} single>
                <MotionCard hoverScale={1.02}>
                  <Link href={svc.href} className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-mos-red/30 hover:shadow-lg transition-all duration-300">
                    <div className="aspect-[16/10] relative bg-gray-100 overflow-hidden">
                      <Image
                        src={svc.img}
                        alt={svc.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      {/* Category badge */}
                      <div className={`absolute top-3 left-3 ${svc.accent} text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5`}>
                        <svc.icon size={13} />
                        {svc.title.split(' ')[0]}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading text-lg font-bold text-dark mb-1.5">{svc.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{svc.desc}</p>
                      <span className="inline-flex items-center gap-1 text-mos-red text-sm font-semibold mt-4 group-hover:gap-2 transition-all">
                        Scopri di più <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                </MotionCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BRAND STRIP — Macchine ─── */}
      <section className="py-10 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal single>
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src="/servizi/macchine-strip.png"
                alt="Macchine professionali MOS — Caffè automatiche e semi-professionali"
                width={1280}
                height={320}
                className="w-full h-auto object-cover"
                sizes="100vw"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── TRUST — Davide Mareggini ─── */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-16 items-center">
            {/* Foto */}
            <ScrollReveal single className="md:col-span-2 flex justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <div className="absolute inset-0 rounded-full bg-mos-red/8 transform translate-x-3 translate-y-3" />
                <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg border-4 border-white">
                  <Image
                    src="/davide-portrait.png"
                    alt="Davide Mareggini — Fondatore MOS Milano Offre Servizi"
                    fill
                    className="object-cover"
                    sizes="320px"
                  />
                </div>
              </div>
            </ScrollReveal>

            {/* Copy */}
            <ScrollReveal single className="md:col-span-3">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-dark mb-4">
                Il tuo partner di fiducia
              </h2>
              <div className="w-12 h-1 bg-mos-red rounded-full mb-6" />
              <p className="text-gray-600 leading-relaxed mb-4">
                Sono <strong className="text-dark">Davide Mareggini</strong>, fondatore di MOS Milano Offre Servizi. Da oltre 15 anni mi dedico personalmente a garantire che ogni azienda milanese abbia il servizio che merita: caffè di qualità, acqua fresca e forniture complete per l&apos;ufficio.
              </p>
              <p className="text-gray-500 leading-relaxed mb-6">
                La mia organizzazione efficace ed efficiente è al servizio del tuo business. Credo che una partnership duratura si costruisca sulla fiducia, sulla trasparenza e su un impegno genuino verso il successo dei miei clienti.
              </p>
              <blockquote className="border-l-[3px] border-mos-red pl-5 py-1 mb-8">
                <p className="text-dark font-heading font-semibold italic text-lg">
                  &quot;Ogni cliente per noi è unico. Il mio impegno personale è la garanzia del servizio.&quot;
                </p>
              </blockquote>
              <div className="flex flex-wrap gap-3">
                <MotionButton href="/contatti" variant="primary">
                  Contattami direttamente <ArrowRight size={18} />
                </MotionButton>
                <MotionButton href="/chi-siamo" variant="outline">
                  Scopri la nostra storia
                </MotionButton>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── PERCHÉ MOS ─── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal single className="text-center mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-dark mb-2">Perché scegliere MOS</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Sei vantaggi concreti che fanno la differenza per il tuo ufficio.</p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {perche.map((item) => (
              <ScrollReveal key={item.title} single>
                <MotionCard hoverScale={1.02}>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 hover:border-mos-red/20 hover:shadow-md transition-all duration-300 h-full">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-mos-red-light flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle size={16} className="text-mos-red" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-dark mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                </MotionCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Aziende ─── */}
      <section className="py-16 md:py-20 bg-dark text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <ScrollReveal single>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Sei un&apos;azienda?</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Registrati come cliente business per visualizzare i prezzi netti e scaricare fatture con IVA.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <MotionButton href="/registrati" variant="primary">
                Registra la tua azienda <ArrowRight size={18} />
              </MotionButton>
              <MotionButton href="/contatti" variant="outline" className="!border-gray-500 !text-white hover:!border-white">
                Richiedi un preventivo
              </MotionButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
