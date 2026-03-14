'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PageTitle } from '@/components/ui/page-title';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <PageTitle className="mb-4">Link non valido</PageTitle>
          <p className="text-gray-500 mb-6">
            Il link di recupero password non è valido o è incompleto.
          </p>
          <Link
            href="/recupera-password"
            className="text-blue font-medium hover:underline"
          >
            Richiedi un nuovo link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La password deve avere almeno 6 caratteri');
      return;
    }

    if (password !== confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Errore durante il reset');
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
        <PageTitle className="mb-8 text-center">Nuova password</PageTitle>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="text-green-800 font-medium mb-2">Password reimpostata!</p>
            <p className="text-sm text-green-700 mb-4">
              La tua password è stata aggiornata con successo.
            </p>
            <Link
              href="/login"
              className="inline-block bg-blue text-white font-bold px-6 py-2.5 rounded-lg hover:bg-blue-light transition-colors"
            >
              Vai al login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red/10 border border-red/20 text-red text-sm rounded-lg p-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nuova password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="Minimo 6 caratteri"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Conferma password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="Ripeti la password"
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue text-white font-bold py-3 rounded-lg hover:bg-blue-light transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvataggio...' : 'Reimposta password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">Caricamento...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
