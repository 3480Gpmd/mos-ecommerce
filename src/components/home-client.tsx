'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, Shield, Headphones, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { CountUp } from '@/components/ui/count-up';
import { MotionCard } from '@/components/ui/motion-card';
import { MotionButton } from '@/components/ui/motion-button';

/* ──────────────────────────────────────────────
   Service card data
   ────────────────────────────────────────────── */
const services = [
  {
    title: 'Forniture Ufficio',
    desc: 'Oltre 25.000 prodotti: consumabili, carta, informatica e molto altro.',
    href: '/servizi/prodotti-ufficio',
    img: '/Home 1b.png',
  },
  {
    title: 'Caffè e Bevande Calde',
    desc: 'Lavazza, Borbone, Covim, Toraldo, Gise. Cialde, capsule e grani.',
    href: '/servizi/caffe-bevande-calde',
    img: '/images/caffe-hero.jpg',
  },
  {
    title: 'Servizio Acqua',
    desc: 'Acqua, succhi, bibite e bevande fredde. Levissima, San Benedetto e altre.',
    href: '/servizi/acqua-bevande',
    img: '/servizi/acqua-hero.jpg',
  },
];

const stats = [
  { value: 25000, suffix: '+', label: 'Prodotti a catalogo' },
  { value: 15, suffix: '+', label: 'Anni di esperienza' },
  { value: 48, suffix: 'h', label: 'Consegna garantita' },
  { value: 500, suffix: '+', label: 'Aziende clienti' },
];

const usps = [
  { icon: Truck, title: 'Consegna gratuita', desc: 'Per ordini sopra 100\u20AC' },
  { icon: Shield, title: 'Pagamenti sicuri', desc: 'PayPal, TeamSystem Pay, Bonifico' },
  { icon: Headphones, title: 'Assistenza dedicata', desc: 'Lun\u2013Ven 9:00\u201318:00' },
];

const perche = [
  'Un unico fornitore per tutto l\u2019ufficio',
  'Consegna rapida su Milano e provincia',
  'Prezzi netti per aziende con partita IVA',
  'Assistenza personale e diretta',
  'Nessun vincolo contrattuale',
  'Fatturazione elettronica automatica',
];

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */
export function HomeClient() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
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
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/Home 1b2.png"
                  alt="MOS — Showroom Milano Offre Servizi"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              {/* Accent corner */}
              <div className="absolute -bottom-3 -left-3 w-24 h-24 border-l-4 border-b-4 border-mos-red rounded-bl-2xl pointer-events-none" />
              <div className="absolute -top-3 -right-3 w-16 h-16 border-t-4 border-r-4 border-mos-red/30 rounded-tr-2xl pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── USP STRIP ─── */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <ScrollReveal className="grid grid-cols-1 sm:grid-cols-3 gap-6" stagger={0.1}>
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
          </ScrollReveal>
        </div>
      </section>

      {/* ─── STATISTICHE ─── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <ScrollReveal className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
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
          </ScrollReveal>
        </div>
      </section>

      {/* ─── SERVIZI ─── */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal single className="max-w-xl mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-dark mb-2">I nostri servizi</h2>
            <p className="text-gray-500">Tutto ciò che serve al tuo ufficio, da un unico fornitore.</p>
          </ScrollReveal>

          <ScrollReveal className="grid grid-cols-1 sm:grid-cols-3 gap-6" stagger={0.15}>
            {services.map((svc) => (
              <MotionCard key={svc.title} hoverScale={1.02}>
                <Link href={svc.href} className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-mos-red/30 hover:shadow-lg transition-all duration-300">
                  <div className="aspect-[4/3] relative bg-gray-100 overflow-hidden">
                    <Image src={svc.img} alt={svc.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading text-lg font-bold text-dark mb-1">{svc.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{svc.desc}</p>
                    <span className="inline-flex items-center gap-1 text-mos-red text-sm font-semibold mt-3 group-hover:gap-2 transition-all">
                      Scopri <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </MotionCard>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* ─── TRUST — Davide Mareggini ─── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-16 items-center">
            {/* Foto */}
            <ScrollReveal single className="md:col-span-2 flex justify-center">
              <div className="relative w-64 h-64 md:w-72 md:h-72">
                <div className="absolute inset-0 rounded-2xl bg-mos-red/8 transform rotate-3" />
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="/davide.png"
                    alt="Davide Mareggini — Fondatore MOS"
                    fill
                    className="object-cover"
                    sizes="288px"
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
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <ScrollReveal single>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-dark mb-4">Perché scegliere MOS</h2>
              <div className="w-12 h-1 bg-mos-red rounded-full mb-8" />
              <ScrollReveal className="space-y-4" stagger={0.1}>
                {perche.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-mos-red shrink-0 mt-0.5" />
                    <p className="text-gray-600">{item}</p>
                  </div>
                ))}
              </ScrollReveal>
            </ScrollReveal>

            <ScrollReveal single>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/Home 1b2.png"
                  alt="MOS Showroom"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
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
            <MotionButton href="/registrati" variant="primary">
              Registra la tua azienda <ArrowRight size={18} />
            </MotionButton>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
