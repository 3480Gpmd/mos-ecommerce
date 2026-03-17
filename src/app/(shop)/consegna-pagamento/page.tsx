import type { Metadata } from 'next';
import { PageTitle } from '@/components/ui/page-title';
import { Truck, CreditCard, Clock, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Consegna e Pagamento | Milano Offre Servizi',
  description: 'Informazioni su metodi di consegna, tempi di spedizione e modalità di pagamento. Consegna rapida a Milano e provincia.',
  alternates: {
    canonical: 'https://milanooffreservizi-ecommerce.it/consegna-pagamento',
  },
  openGraph: {
    type: 'website',
    url: 'https://milanooffreservizi-ecommerce.it/consegna-pagamento',
    title: 'Consegna e Pagamento | Milano Offre Servizi',
    description: 'Informazioni su metodi di consegna, tempi di spedizione e modalità di pagamento',
    siteName: 'Milano Offre Servizi',
  },
};

export default function ConsegnaPagamentoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <PageTitle subtitle="Tutto quello che devi sapere su spedizione e pagamento" className="mb-8">
        Consegna e Pagamento
      </PageTitle>

      {/* Spedizione */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue/10 rounded-xl flex items-center justify-center">
            <Truck size={20} className="text-blue" />
          </div>
          <h2 className="font-heading text-xl font-bold text-navy">Spedizione</h2>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Gli ordini vengono elaborati e spediti entro 24/48 ore lavorative dal ricevimento del pagamento.
            Non si effettuano consegne il sabato e la domenica.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold text-navy border-b">Zona</th>
                  <th className="text-left p-3 font-semibold text-navy border-b">Soglia gratuita</th>
                  <th className="text-left p-3 font-semibold text-navy border-b">Costo</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b">
                  <td className="p-3 font-medium">Milano città</td>
                  <td className="p-3">Ordini sopra 50&euro;</td>
                  <td className="p-3">5&euro;</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Provincia di Milano</td>
                  <td className="p-3">Ordini sopra 90&euro;</td>
                  <td className="p-3">10&euro;</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Italia (sotto 100&euro;)</td>
                  <td className="p-3">—</td>
                  <td className="p-3">15&euro;</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Italia (100-300&euro;)</td>
                  <td className="p-3">—</td>
                  <td className="p-3">10&euro;</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Italia (sopra 300&euro;)</td>
                  <td className="p-3">—</td>
                  <td className="p-3">5&euro;</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">Supplemento contrassegno: 4&euro;</p>
        </div>
      </div>

      {/* Tempi */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue/10 rounded-xl flex items-center justify-center">
            <Clock size={20} className="text-blue" />
          </div>
          <h2 className="font-heading text-xl font-bold text-navy">Tempi di Consegna</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="font-semibold text-navy mb-1">Milano e provincia</p>
            <p>Consegna in 24 ore lavorative</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="font-semibold text-navy mb-1">Resto d&apos;Italia</p>
            <p>Consegna in 48 ore lavorative tramite corriere espresso</p>
          </div>
        </div>
      </div>

      {/* Pagamenti */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue/10 rounded-xl flex items-center justify-center">
            <CreditCard size={20} className="text-blue" />
          </div>
          <h2 className="font-heading text-xl font-bold text-navy">Metodi di Pagamento</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            { name: 'Carta di credito', desc: 'Visa, Mastercard, American Express' },
            { name: 'PayPal', desc: 'Pagamento sicuro tramite conto PayPal' },
            { name: 'Bonifico bancario', desc: 'Anticipato, spedizione dopo accredito' },
            { name: 'Satispay', desc: 'Pagamento mobile rapido e sicuro' },
            { name: 'Contrassegno', desc: 'Solo Milano e provincia (+4\u20AC)' },
            { name: 'Contanti / Bancomat', desc: 'Alla consegna, solo Milano e provincia' },
          ].map((m) => (
            <div key={m.name} className="bg-gray-50 rounded-xl p-3">
              <p className="font-semibold text-navy">{m.name}</p>
              <p className="text-gray-500 text-xs">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contatti */}
      <div className="bg-blue/5 rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <MapPin size={18} className="text-blue" />
          <h3 className="font-heading text-lg font-bold text-navy">Hai domande?</h3>
        </div>
        <p className="text-sm text-gray-600 mb-1">
          Contattaci al <strong>02.6473060</strong> o scrivi a <strong>info@milanooffreservizi.it</strong>
        </p>
        <p className="text-xs text-gray-500">Lun-Ven, 9:00-13:00 / 14:00-18:00</p>
      </div>
    </div>
  );
}
