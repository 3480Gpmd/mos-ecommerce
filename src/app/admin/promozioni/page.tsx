import Link from 'next/link';
import { Tag, Star, Zap, Gift, Sparkles } from 'lucide-react';

export default function PromozioniPage() {
  const modules = [
    {
      href: '/admin/promozioni/coupon',
      icon: Tag,
      title: 'Gestione Coupon',
      description: 'Crea e gestisci codici sconto per i clienti.',
      color: 'text-blue',
      bg: 'bg-blue/5',
    },
    {
      href: '/admin/promozioni/vetrina',
      icon: Star,
      title: 'Prodotti in Vetrina',
      description: 'Seleziona i prodotti da mettere in evidenza nella homepage.',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      href: '/admin/promozioni/superprezzo',
      icon: Zap,
      title: 'Prodotti SuperPrezzo',
      description: 'Imposta prezzi speciali promozionali sui prodotti.',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      href: '/admin/promozioni/omaggi',
      icon: Gift,
      title: 'Prodotti in Omaggio',
      description: 'Configura regole per omaggi automatici sugli ordini.',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      href: '/admin/promozioni/promo-novita',
      icon: Sparkles,
      title: 'Promo e Novit\u00e0',
      description: 'Gestisci date promo e flag novit\u00e0 sui prodotti.',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-1">Promozioni</h1>
      <p className="text-gray-500 text-sm mb-6">
        Gestisci coupon, prodotti in vetrina, super prezzi, omaggi e promozioni.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue/20 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${mod.bg} flex-shrink-0`}>
                <mod.icon size={22} className={mod.color} />
              </div>
              <div>
                <h3 className={`font-heading font-bold text-lg ${mod.color} group-hover:underline mb-1`}>
                  {mod.title}
                </h3>
                <p className="text-sm text-gray-500">{mod.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
