import { Phone, Mail, MapPin, Clock, Truck, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';
import { PageTitle } from '@/components/ui/page-title';

export const metadata: Metadata = {
  title: 'Contatti | Milano Offre Servizi',
  description: 'Contattaci per informazioni, preventivi o assistenza. Telefono 02 6473060, email info@milanooffreservizi.it. Sede a Milano.',
  alternates: {
    canonical: 'https://milanooffreservizi-ecommerce.it/contatti',
  },
  openGraph: {
    type: 'website',
    url: 'https://milanooffreservizi-ecommerce.it/contatti',
    title: 'Contatti | Milano Offre Servizi',
    description: 'Contattaci per informazioni, preventivi o assistenza. Siamo a tua disposizione.',
    siteName: 'Milano Offre Servizi',
  },
};

export default function ContattiPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <PageTitle
          subtitle="Siamo a tua disposizione per informazioni, preventivi personalizzati e assistenza."
          className="flex flex-col items-center"
        >
          Contattaci
        </PageTitle>
      </div>

      {/* Cards contatto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue/10 rounded-xl mb-4">
            <Phone size={28} className="text-blue" />
          </div>
          <h3 className="font-heading font-bold text-navy text-lg mb-2">Telefono</h3>
          <p className="text-gray-600 text-sm mb-3">Chiamaci per assistenza immediata</p>
          <a href="tel:+390264730060" className="text-blue font-bold text-lg hover:underline">
            02 6473060
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue/10 rounded-xl mb-4">
            <Mail size={28} className="text-blue" />
          </div>
          <h3 className="font-heading font-bold text-navy text-lg mb-2">Email</h3>
          <p className="text-gray-600 text-sm mb-3">Scrivici per preventivi e informazioni</p>
          <a href="mailto:info@milanooffreservizi.it" className="text-blue font-bold hover:underline">
            info@milanooffreservizi.it
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue/10 rounded-xl mb-4">
            <MapPin size={28} className="text-blue" />
          </div>
          <h3 className="font-heading font-bold text-navy text-lg mb-2">Sede</h3>
          <p className="text-gray-600 text-sm mb-3">Vieni a trovarci</p>
          <p className="text-navy font-medium text-sm">Via Romolo Bitti, 28<br />20125 Milano</p>
        </div>
      </div>

      {/* Info aggiuntive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-blue/5 rounded-2xl p-6 md:p-8">
          <h2 className="font-heading text-xl font-bold text-navy mb-6">Orari di servizio</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Clock size={20} className="text-blue mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-navy">Lunedi - Venerdi</p>
                <p className="text-gray-600 text-sm">09:00 - 18:00</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-navy">Sabato e Domenica</p>
                <p className="text-gray-600 text-sm">Chiuso</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck size={20} className="text-blue mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-navy">Consegne</p>
                <p className="text-gray-600 text-sm">
                  Consegna rapida a Milano e provincia. Gratuita per ordini superiori a 100&euro;.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue/5 rounded-2xl p-6 md:p-8">
          <h2 className="font-heading text-xl font-bold text-navy mb-6">Servizio clienti</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MessageCircle size={20} className="text-blue mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-navy">Assistenza dedicata</p>
                <p className="text-gray-600 text-sm">
                  Il nostro team di esperti e a tua disposizione per consigliarti i prodotti
                  migliori per le tue esigenze aziendali.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail size={20} className="text-blue mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-navy">Preventivi personalizzati</p>
                <p className="text-gray-600 text-sm">
                  Richiedi un preventivo su misura per la tua azienda.
                  Offriamo condizioni speciali per forniture continuative e grandi volumi.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={20} className="text-blue mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-navy">Supporto tecnico</p>
                <p className="text-gray-600 text-sm">
                  Hai bisogno di aiuto per trovare il toner o la cartuccia giusta?
                  Chiamaci e ti guidiamo nella scelta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-navy rounded-2xl p-8 md:p-10 text-center text-white">
        <h2 className="font-heading text-2xl font-bold mb-3">Hai bisogno di un preventivo?</h2>
        <p className="text-gray-300 mb-6 max-w-lg mx-auto">
          Contattaci telefonicamente o via email per ricevere un&apos;offerta personalizzata
          per la tua azienda. Rispondiamo entro 24 ore lavorative.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="tel:+390264730060"
            className="bg-blue text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-blue/90 transition-colors inline-flex items-center gap-2"
          >
            <Phone size={18} />
            Chiama ora
          </a>
          <a
            href="mailto:info@milanooffreservizi.it"
            className="bg-white/10 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-white/20 transition-colors inline-flex items-center gap-2"
          >
            <Mail size={18} />
            Scrivici
          </a>
        </div>
      </div>
    </div>
  );
}
