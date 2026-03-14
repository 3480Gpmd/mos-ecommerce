import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-navy text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <img src="/logo-light.png" alt="MOS Milano Offre Servizi" className="h-14 w-auto mb-3" />
            <p className="text-sm leading-relaxed">
              Forniture per ufficio, caffè e acqua per aziende e privati. Consegna rapida a Milano e provincia.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wide mb-3">Categorie</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/catalogo?group=consumabili" className="hover:text-white transition-colors">Consumabili</Link></li>
              <li><Link href="/catalogo?group=carta" className="hover:text-white transition-colors">Carta</Link></li>
              <li><Link href="/catalogo?group=informatica" className="hover:text-white transition-colors">Informatica</Link></li>
              <li><Link href="/catalogo?group=cancelleria" className="hover:text-white transition-colors">Cancelleria</Link></li>
              <li><Link href="/catalogo?group=archiviazione" className="hover:text-white transition-colors">Archiviazione</Link></li>
              <li><Link href="/catalogo" className="hover:text-white transition-colors">Tutto il catalogo</Link></li>
            </ul>
          </div>

          {/* Informazioni */}
          <div>
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wide mb-3">Informazioni</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/chi-siamo" className="hover:text-white transition-colors">Chi siamo</Link></li>
              <li><Link href="/consegna-pagamento" className="hover:text-white transition-colors">Consegna e pagamento</Link></li>
              <li><Link href="/condizioni-vendita" className="hover:text-white transition-colors">Condizioni di vendita</Link></li>
              <li><Link href="/aziende" className="hover:text-white transition-colors font-medium text-yellow-300">Per le aziende</Link></li>
              <li><Link href="/ricerca-cartucce" className="hover:text-white transition-colors">Trova cartucce</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Accedi</Link></li>
              <li><Link href="/registrati" className="hover:text-white transition-colors">Registrati</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wide mb-3">Contatti</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={14} />
                <span>02 6473060</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} />
                <span>info@milanooffreservizi.it</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5" />
                <span>Milano, Italia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Milano Offre Servizi. Tutti i diritti riservati.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
            <Link href="/cookie-policy" className="hover:text-gray-300">Cookie Policy</Link>
            <Link href="/condizioni-vendita" className="hover:text-gray-300">Condizioni di Vendita</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
