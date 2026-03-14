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
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Errore nella registrazione');
        return;
      }

      // Auto-login
      await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      router.push('/');
    } catch {
      setError('Errore di rete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-heading text-3xl font-bold text-center mb-8">Registrati</h1>

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
