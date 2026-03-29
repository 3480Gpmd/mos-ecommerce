import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Coffee, Droplet, Briefcase, TrendingUp, Users, Zap } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { ProcessSteps } from '@/components/shop/process-steps';

export const metadata = {
  title: 'I Nostri Servizi - Milano Offre Servizi',
  description:
    'Scopri i nostri servizi: caffè e bevande calde, acqua e bevande fredde, prodotti per ufficio. Soluzioni complete per il tuo business con consegna rapida a Milano.',
  openGraph: {
    title: 'I Nostri Servizi - Milano Offre Servizi',
    description:
      'Scopri i nostri servizi: caffè e bevande calde, acqua e bevande fredde, prodotti per ufficio.',
    url: 'https://milanooffreservizi-ecommerce.it/servizi',
  },
};

export default function ServiziPage() {
  const services = [
    {
      title: 'Caffè & Bevande Calde',
      description:
        'Macchine per caffè in comodato d\'uso, noleggiano acquisto. Caffè Borbone, Lavazza, Illy e altri brand premium.',
      icon: Coffee,
      href: '/servizi/caffe-bevande-calde',
      color: 'from-amber-500 to-orange-500',
      image: '/servizi/caffe-hero.jpg',
    },
    {
      title: 'Acqua & Bevande',
      description:
        'Dispenser di acqua, boccioni, bevande fredde e bibite. Soluzioni per ufficio e aziende con consegna programmata.',
      icon: Droplet,
      href: '/servizi/acqua-bevande',
      color: 'from-blue-500 to-cyan-500',
      image: '/servizi/acqua-hero.jpg',
    },
    {
      title: 'Prodotti Ufficio',
      description:
        'Toner, cartucce, carta, cancelleria, igiene. Catalogo completo di 25.000+ prodotti con consegna entro 24h.',
      icon: Briefcase,
      href: '/servizi/prodotti-ufficio',
      color: 'from-indigo-500 to-purple-500',
      image: '/servizi/ufficio-hero.jpg',
    },
  ];

  const stats = [
    { value: '25.000+', label: 'Prodotti nel catalogo' },
    { value: '500+', label: 'Clienti affidati' },
    { value: '24h', label: 'Consegna rapida' },
    { value: '15+', label: 'Anni di esperienza' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy via-blue-900 to-navy-light py-20 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 animate-slide-up">
              I Nostri Servizi
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-light to-cyan-400 rounded-full mx-auto mb-6 animate-line-expand" />
            <p className="text-xl text-gray-200 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Soluzioni complete per il tuo ufficio e la tua azienda. Qualità garantita, consegna veloce a Milano e provincia.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Link key={service.title} href={service.href}>
                  <div className="group h-full bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-blue hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    {/* Image placeholder */}
                    <div className={`h-48 bg-gradient-to-br ${service.color} relative overflow-hidden`}>
                      <Icon size={80} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-40" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/40 transition-all duration-300" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-heading text-2xl font-bold text-navy mb-2 group-hover:text-blue transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-2 text-blue font-bold group-hover:gap-4 transition-all">
                        Scopri di più <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <ProcessSteps
        title="Come iniziare è semplice"
        subtitle="Quattro semplici passi per accedere ai nostri servizi"
      />

      {/* Stats Section */}
      <section className="py-16 bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-heading text-4xl md:text-5xl font-bold text-blue-light mb-2">
                  {stat.value}
                </div>
                <p className="text-gray-300 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-navy mb-4">Perché scegliere noi</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Siamo partner affidabili con anni di esperienza nel settore
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border-2 border-gray-100 rounded-xl hover:border-blue transition-colors">
              <div className="w-14 h-14 bg-blue/10 rounded-lg flex items-center justify-center mb-4">
                <Zap size={28} className="text-blue" />
              </div>
              <h3 className="font-bold text-navy text-lg mb-2">Consegna Rapida</h3>
              <p className="text-gray-600 text-sm">
                Entro 24 ore a Milano e provincia. Spedizioni rapide e affidabili garantite.
              </p>
            </div>

            <div className="p-8 border-2 border-gray-100 rounded-xl hover:border-blue transition-colors">
              <div className="w-14 h-14 bg-blue/10 rounded-lg flex items-center justify-center mb-4">
                <Users size={28} className="text-blue" />
              </div>
              <h3 className="font-bold text-navy text-lg mb-2">Supporto Dedicato</h3>
              <p className="text-gray-600 text-sm">
                Team di esperti pronti a assistere. Disponibilità 24h per i nostri clienti aziendali.
              </p>
            </div>

            <div className="p-8 border-2 border-gray-100 rounded-xl hover:border-blue transition-colors">
              <div className="w-14 h-14 bg-blue/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp size={28} className="text-blue" />
              </div>
              <h3 className="font-bold text-navy text-lg mb-2">Prezzi Competitivi</h3>
              <p className="text-gray-600 text-sm">
                Offerte personalizzate per aziende e grossisti. Massima trasparenza nei preventivi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue to-blue-light py-16 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl font-bold mb-4">Pronto a iniziare?</h2>
          <p className="text-lg mb-8 text-blue-50">
            Contattaci per ricevere una consulenza gratuita e un preventivo personalizzato per le tue esigenze.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/aziende"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue hover:bg-gray-100 font-bold px-8 py-4 rounded-lg transition-colors"
            >
              Richiedi preventivo <ArrowRight size={20} />
            </Link>
            <Link
              href="/contatti"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white/10 font-bold px-8 py-4 rounded-lg transition-colors"
            >
              Contattaci
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
