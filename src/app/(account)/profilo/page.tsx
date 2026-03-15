'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Package, Heart, Settings, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { PageTitle } from '@/components/ui/page-title';
import { useEffect } from 'react';

export default function ProfiloPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/profilo');
    }
  }, [status, router]);

  if (!session?.user) return null;

  const customerType = (session.user as { customerType?: string }).customerType;
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <PageTitle className="mb-6">Il mio profilo</PageTitle>

      <div className="bg-white border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-blue/10 rounded-full flex items-center justify-center text-blue">
            <User size={32} />
          </div>
          <div>
            <h2 className="font-bold text-lg">{session.user.name || session.user.email}</h2>
            <p className="text-sm text-gray-500">{session.user.email}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
              customerType === 'azienda' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {customerType === 'azienda' ? 'Account Business' : 'Account Privato'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Link href="/ordini" className="flex items-center justify-between bg-white border rounded-xl p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3">
            <Package size={20} className="text-gray-500" />
            <span className="font-medium">I miei ordini</span>
          </div>
        </Link>
        <Link href="/preferiti" className="flex items-center justify-between bg-white border rounded-xl p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3">
            <Heart size={20} className="text-gray-500" />
            <span className="font-medium">Preferiti</span>
          </div>
        </Link>
        <Link href="/riordina" className="flex items-center justify-between bg-white border rounded-xl p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3">
            <RotateCcw size={20} className="text-gray-500" />
            <span className="font-medium">Riordina</span>
          </div>
        </Link>
        {isAdmin && (
          <Link href="/admin" className="flex items-center justify-between bg-white border rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3">
              <Settings size={20} className="text-blue" />
              <span className="font-medium text-blue">Pannello Admin</span>
            </div>
          </Link>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 bg-white border rounded-xl p-4 hover:shadow-sm transition-shadow text-red"
        >
          <LogOut size={20} />
          <span className="font-medium">Esci</span>
        </button>
      </div>
    </div>
  );
}
