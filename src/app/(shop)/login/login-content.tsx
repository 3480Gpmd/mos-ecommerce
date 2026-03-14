'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error.includes('ACCOUNT_INACTIVE')) {
        setError('Il tuo account non è ancora stato attivato. Contatta l\'amministratore.');
      } else {
        setError('Email o password non corretti');
      }
      setLoading(false);
    } else {
      // Fetch session to check if admin
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      const isAdmin = session?.user?.isAdmin;

      if (isAdmin && redirect === '/') {
        router.push('/admin');
      } else {
        router.push(redirect);
      }
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="font-heading text-3xl font-bold text-center mb-8">Accedi</h1>

        {error && (
          <div className="bg-red/10 border border-red/20 text-red text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue text-white font-bold py-3 rounded-lg hover:bg-blue-light transition-colors disabled:opacity-50"
          >
            {loading ? 'Accesso...' : 'Accedi'}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link
            href="/recupera-password"
            className="text-sm text-gray-500 hover:text-blue transition-colors"
          >
            Password dimenticata?
          </Link>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Non hai un account?{' '}
          <Link href="/registrati" className="text-blue font-medium hover:underline">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
}
