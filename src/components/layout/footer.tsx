import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-dark text-gray-400">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10">
          {/* Brand — full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <img src="/logo-light.png" alt="MOS Milano Offre Servizi" className="h-12 w-auto mb-4" />
            <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
              Forniture per ufficio, caffè e acqua per aziende e privati. Consegna rapida a Milano e provincia.
            </p>
          </div>

          {/* Servizi */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-4">Servizi</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/servizi/caffe-bevande-calde" className="hover:text-white transition-colors">Caffè e Bevande</Link></li>
              <li><Link href="/servizi/macchine-caffe-comodato" className="hover:text-white transition-colors">Macchine in comodato</Link></li>
              <li><Link href="/servizi/acqua-bevande" className="hover:text-white transition-colors">Acqua e Bibite</Link></li>
              <li><Link href="/servizi/prodotti-ufficio" className="hover:text-white transition-colors">Forniture ufficio</Link></li>
              <li><Link href="/catalogo" className="text-mos-red hover:text-mos-red-hover transition-colors font-medium">Tutto il catalogo →</Link></li>
            </ul>
          </div>

          {/* Categorie */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-4">Categorie</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/catalogo?group=consumabili" className="hover:text-white transition-colors">Consumabili</Link></li>
              <li><Link href="/catalogo?group=carta" className="hover:text-white transition-colors">Carta</Link></li>
              <li><Link href="/catalogo?group=informatica" className="hover:text-white transition-colors">Informatica</Link></li>
              <li><Link href="/catalogo?group=cancelleria" className="hover:text-white transition-colors">Cancelleria</Link></li>
              <li><Link href="/catalogo?group=archiviazione" className="hover:text-white transition-colors">Archiviazione</Link></li>
            </ul>
          </div>

          {/* Informazioni */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-4">Informazioni</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/chi-siamo" className="hover:text-white transition-colors">Chi siamo</Link></li>
              <li><Link href="/consegna-pagamento" className="hover:text-white transition-colors">Consegna e pagamento</Link></li>
              <li><Link href="/condizioni-vendita" className="hover:text-white transition-colors">Condizioni di vendita</Link></li>
              <li><Link href="/aziende" className="text-mos-red hover:text-mos-red-hover transition-colors font-medium">Per le aziende</Link></li>
              <li><Link href="/ricerca-cartucce" className="hover:text-white transition-colors">Trova cartucce</Link></li>
            </ul>
          </div>

          {/* Contatti */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-4">Contatti</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="tel:026473060" className="flex items-center gap-2.5 hover:text-white transition-colors">
                  <Phone size={14} className="text-mos-red shrink-0" />
                  <span>02 6473060</span>
                </a>
              </li>
              <li>
                <a href="mailto:info@milanooffreservizi.it" className="flex items-center gap-2.5 hover:text-white transition-colors">
                  <Mail size={14} className="text-mos-red shrink-0" />
                  <span>info@milanooffreservizi.it</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-mos-red mt-0.5 shrink-0" />
                <span>Via Romolo Bitti, 28<br />20125 Milano</span>
              </li>
            </ul>

            {/* CTA link */}
            <div className="mt-5">
              <Link
                href="/contatti"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-mos-red hover:text-mos-red-hover transition-colors uppercase tracking-wide"
              >
                Scrivici →
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-600">
          <p>&copy; {new Date().getFullYear()} Milano Offre Servizi S.r.l. &mdash; P.IVA 09464450960 &mdash; Tutti i diritti riservati.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
            <Link href="/cookie-policy" className="hover:text-gray-400 transition-colors">Cookie</Link>
            <Link href="/condizioni-vendita" className="hover:text-gray-400 transition-colors">Condizioni</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
