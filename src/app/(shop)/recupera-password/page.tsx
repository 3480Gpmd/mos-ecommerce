'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageTitle } from '@/components/ui/page-title';

export default function RecuperaPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok) {
        setSent(true);
      } else {
        setError(data.error || 'Errore durante la richiesta');
      }
    } catch {
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <PageTitle className="mb-8 text-center">Recupera password</PageTitle>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="text-green-800 font-medium mb-2">Email inviata!</p>
            <p className="text-sm text-green-700">
              Se l&apos;indirizzo email è registrato, riceverai un link per reimpostare la password.
              Controlla anche la cartella spam.
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 text-blue font-medium text-sm hover:underline"
            >
              Torna al login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6 text-center">
              Inserisci l&apos;email associata al tuo account. Ti invieremo un link per reimpostare la password.
            </p>

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
                  placeholder="nome@esempio.it"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue text-white font-bold py-3 rounded-lg hover:bg-blue-light transition-colors disabled:opacity-50"
              >
                {loading ? 'Invio in corso...' : 'Invia link di recupero'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Ricordi la password?{' '}
              <Link href="/login" className="text-blue font-medium hover:underline">
                Accedi
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
