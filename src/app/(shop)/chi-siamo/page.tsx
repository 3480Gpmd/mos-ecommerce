import { Phone, Mail, MapPin, Clock, Truck, Shield, Users } from 'lucide-react';
import Image from 'next/image';
import { PageTitle } from '@/components/ui/page-title';

export const metadata = {
  title: 'Chi Siamo - Milano Offre Servizi',
  description: 'Scopri MOS MilanoOffreServizi: la storia di Davide e la passione per il servizio al cliente.',
};

export default function ChiSiamoPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <PageTitle subtitle="Scopri MOS MilanoOffreServizi" className="flex flex-col items-center">
          Chi Siamo
        </PageTitle>
      </div>

      {/* Davide section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12 items-start">
        <div className="md:col-span-2 flex justify-center">
          <div className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/davide.png"
              alt="Davide - MOS Milano Offre Servizi"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="md:col-span-3 space-y-5 text-gray-700">
          <p className="text-lg leading-relaxed">
            Sono <strong className="text-navy">Davide</strong>, non il fondatore di MOS, ma parte del progetto sin dai suoi primi passi.
          </p>

          <p>
            Nel <strong>2009</strong> sono stato coinvolto nel progetto OCS e Vending Machine. L&apos;azienda
            e cresciuta rapidamente, raddoppiando il fatturato annualmente fino a servire
            oltre <strong>400 clienti</strong>.
          </p>

          <p>
            Nel <strong>2013</strong> ho acquisito il ramo d&apos;azienda e ho proseguito da solo, portando
            avanti la visione di un servizio attento e personalizzato.
          </p>

          <p>
            Credo fermamente che <em>la qualita abbia il prezzo che merita</em>. Oggi tutti possono vendere un
            prodotto, ma solo chi mette al centro il cliente sa davvero fare la differenza.
          </p>

          <div className="bg-blue/5 border-l-4 border-blue rounded-r-xl p-5 mt-6">
            <p className="text-xl font-heading font-bold text-navy mb-2">
              Chiedilo a Davide!
            </p>
            <p className="text-gray-600 text-sm mb-3">
              Per qualsiasi esigenza, non esitare a contattarmi direttamente.
            </p>
            <a
              href="tel:+393385895455"
              className="inline-flex items-center gap-2 text-blue font-bold hover:underline"
            >
              <Phone size={18} />
              338 589 5455
            </a>
          </div>
        </div>
      </div>

      {/* Cards servizi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-blue/5 rounded-xl p-6 flex gap-4 items-start">
          <div className="bg-blue text-white p-3 rounded-lg flex-shrink-0">
            <Truck size={24} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-navy mb-1">Consegna rapida</h3>
            <p className="text-sm text-gray-600">Consegna in 48h tramite corriere espresso. Gratuita per ordini sopra 100&euro;.</p>
          </div>
        </div>

        <div className="bg-blue/5 rounded-xl p-6 flex gap-4 items-start">
          <div className="bg-blue text-white p-3 rounded-lg flex-shrink-0">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-navy mb-1">Qualita garantita</h3>
            <p className="text-sm text-gray-600">Solo prodotti originali e compatibili di alta qualita certificata.</p>
          </div>
        </div>

        <div className="bg-blue/5 rounded-xl p-6 flex gap-4 items-start">
          <div className="bg-blue text-white p-3 rounded-lg flex-shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-navy mb-1">Assistenza dedicata</h3>
            <p className="text-sm text-gray-600">Supporto telefonico e via email per ogni tua esigenza.</p>
          </div>
        </div>

        <div className="bg-blue/5 rounded-xl p-6 flex gap-4 items-start">
          <div className="bg-blue text-white p-3 rounded-lg flex-shrink-0">
            <Users size={24} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-navy mb-1">B2B e B2C</h3>
            <p className="text-sm text-gray-600">Prezzi dedicati per aziende con partita IVA e privati.</p>
          </div>
        </div>
      </div>

      {/* Sede e contatti */}
      <div className="bg-navy rounded-2xl p-8 md:p-10 text-white">
        <h2 className="font-heading text-2xl font-bold mb-6 text-center">Dove trovarci</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-blue-light mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Via Romolo Bitti, 28 - 20125 Milano</p>
                <p className="text-gray-400 text-sm">A 50m dalla fermata Ca&apos; Granda, linea Lilla</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={20} className="text-blue-light flex-shrink-0" />
              <span>02 6473060</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-blue-light flex-shrink-0" />
              <span>info@milanooffreservizi.it</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-blue-light flex-shrink-0" />
              <span className="text-sm">PEC: mospec@pec.it</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Clock size={20} className="text-blue-light mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Orari</p>
                <p className="text-gray-400 text-sm">Lunedi - Venerdi: 9:00 - 13:00 / 14:00 - 18:00</p>
              </div>
            </div>
            <div className="text-sm text-gray-400 mt-4">
              <p>P.IVA: 08401340966</p>
              <p>REA MI-2023389</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
