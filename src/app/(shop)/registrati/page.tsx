'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function RegistratiPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    customerType: 'privato' as 'privato' | 'azienda',
    firstName: '',
    lastName: '',
    companyName: '',
    vatNumber: '',
    fiscalCode: '',
    sdiCode: '',
    pecEmail: '',
    phone: '',
    address: '',
    postcode: '',
    city: '',
    province: '',
    birthDate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [needsActivation, setNeedsActivation] = useState(false);

  const update = (key: string, value: string) => setForm({ ...form, [key]: value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Le password non coincidono');
      return;
    }

    if (form.password.length < 8) {
      setError('La password deve essere di almeno 8 caratteri');
      return;
    }

    setLoading(true);
    try {
      // Rimuovi confirmPassword e campi vuoti prima di inviare
      const { confirmPassword: _, ...payload } = form;
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== '')
      );

      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Errore nella registrazione');
        return;
      }

      setRegistered(true);

      if (data.isActive) {
        // Utente privato: auto-login immediato
        await signIn('credentials', {
          email: form.email,
          password: form.password,
          redirect: false,
        });
        router.push('/');
      } else {
        // Azienda: richiede attivazione admin
        setNeedsActivation(true);
      }
    } catch {
      setError('Errore di rete');
    } finally {
      setLoading(false);
    }
  };

  if (needsActivation) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="font-heading text-2xl font-bold mb-3">Registrazione completata!</h1>
          <p className="text-gray-600 mb-2">
            Il tuo account aziendale è stato creato con successo.
          </p>
          <p className="text-gray-600 mb-6">
            Un amministratore verificherà i tuoi dati e attiverà il tuo account.
            Riceverai una comunicazione quando sarà attivo.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-light transition-colors"
          >
            Torna alla home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-heading text-3xl font-bold text-center mb-8">Registrati</h1>

      {/* OAuth buttons */}
      <div className="space-y-3 mb-6">
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Registrati con Google
        </button>
        <button
          onClick={() => signIn('apple', { callbackUrl: '/' })}
          className="w-full flex items-center justify-center gap-3 bg-black text-white rounded-lg px-4 py-2.5 font-medium text-sm hover:bg-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Registrati con Apple
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-400">oppure registrati con email</span>
        </div>
      </div>

      {error && (
        <div className="bg-red/10 border border-red/20 text-red text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer type */}
        <div>
          <label className="block text-sm font-medium mb-2">Tipo account</label>
          <div className="flex gap-3">
            {['privato', 'azienda'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => update('customerType', type)}
                className={`flex-1 py-3 rounded-lg border font-medium text-sm transition-colors ${
                  form.customerType === type ? 'bg-blue text-white border-blue' : 'hover:bg-gray-50'
                }`}
              >
                {type === 'privato' ? 'Privato' : 'Azienda'}
              </button>
            ))}
          </div>
        </div>

        {/* Name fields */}
        {form.customerType === 'azienda' ? (
          <div>
            <label className="block text-sm font-medium mb-1">Ragione Sociale *</label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => update('companyName', e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
              required
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome *</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cognome *</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data di nascita</label>
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => update('birthDate', e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Codice Fiscale</label>
              <input
                type="text"
                value={form.fiscalCode}
                onChange={(e) => update('fiscalCode', e.target.value.toUpperCase())}
                maxLength={16}
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
              />
            </div>
          </div>
        )}

        {/* Fiscal data for business */}
        {form.customerType === 'azienda' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Partita IVA *</label>
                <input
                  type="text"
                  value={form.vatNumber}
                  onChange={(e) => update('vatNumber', e.target.value)}
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Codice Fiscale</label>
                <input
                  type="text"
                  value={form.fiscalCode}
                  onChange={(e) => update('fiscalCode', e.target.value)}
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Codice SDI</label>
                <input
                  type="text"
                  value={form.sdiCode}
                  onChange={(e) => update('sdiCode', e.target.value)}
                  maxLength={7}
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">PEC</label>
                <input
                  type="email"
                  value={form.pecEmail}
                  onChange={(e) => update('pecEmail', e.target.value)}
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
                />
              </div>
            </div>
          </>
        )}

        {/* Contact */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Conferma Password *</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telefono</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
            />
          </div>
        </div>

        {/* Address */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Indirizzo</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">CAP</label>
            <input
              type="text"
              value={form.postcode}
              onChange={(e) => update('postcode', e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Città</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Provincia</label>
            <input
              type="text"
              value={form.province}
              onChange={(e) => update('province', e.target.value.toUpperCase())}
              maxLength={2}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue text-white font-bold py-3 rounded-lg hover:bg-blue-light transition-colors disabled:opacity-50"
        >
          {loading ? 'Registrazione...' : 'Registrati'}
        </button>

        <p className="text-center text-sm text-gray-500">
          Hai già un account?{' '}
          <Link href="/login" className="text-blue font-medium hover:underline">
            Accedi
          </Link>
        </p>
      </form>
    </div>
  );
}
