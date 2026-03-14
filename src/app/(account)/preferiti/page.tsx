'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { PageTitle } from '@/components/ui/page-title';
import { useEffect } from 'react';

export default function PreferitiPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/preferiti');
    }
  }, [status, router]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageTitle className="mb-6">Preferiti</PageTitle>
      <div className="text-center py-12">
        <Heart size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">La tua lista dei preferiti è vuota</p>
        <Link href="/catalogo" className="text-blue font-medium hover:underline">Sfoglia il catalogo</Link>
      </div>
    </div>
  );
}
