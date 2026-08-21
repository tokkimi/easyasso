'use client';

import { FormEvent, useEffect, useState } from 'react';

export function CustomerAccessForm({
  organizationId,
  organizationName,
  locale,
}: {
  organizationId: string;
  organizationName: string;
  locale: 'fr' | 'en';
}) {
  const en = locale === 'en';
  const storageKey = `easyasso-customer-${organizationId}`;
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.email) setEmail(data.email);
        if (data.name) setName(data.name);
      }
    } catch {}
  }, [storageKey]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const response = await fetch('/api/public/customer-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId, email, name }),
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok || !data.profile) {
      setError(data.error || (en ? 'Unable to open the customer account.' : 'Impossible d’ouvrir le profil client.'));
      return;
    }
    try { localStorage.setItem(storageKey, JSON.stringify(data.profile)); } catch {}
    setMessage(en
      ? `Customer account opened for ${data.profile.email}.`
      : `Profil client ouvert pour ${data.profile.email}.`);
  }

  return (
    <form onSubmit={submit} className="mt-8 rounded-2xl bg-gray-50 p-4 text-left">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-bold text-gray-700">
          {en ? 'Name' : 'Nom'}
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={en ? 'Your name' : 'Votre nom'}
            className="input mt-2 bg-white"
          />
        </label>
        <label className="text-sm font-bold text-gray-700">
          {en ? 'Email address' : 'Adresse email'}
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
            placeholder={en ? 'you@example.com' : 'vous@email.fr'}
            className="input mt-2 bg-white"
          />
        </label>
      </div>
      <button disabled={loading} className="mt-4 w-full rounded-xl bg-[var(--brand)] px-5 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-60">
        {loading ? (en ? 'Opening…' : 'Ouverture…') : (en ? 'Sign in / create my customer account' : 'Connexion / inscription client')}
      </button>
      {message && <p className="mt-3 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{message}</p>}
      {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      <p className="mt-3 text-xs text-gray-500">
        {en
          ? `This customer account belongs to ${organizationName}'s website and is separate from the EasyAsso creator dashboard.`
          : `Ce profil client appartient au site de ${organizationName} et reste séparé du tableau de bord créateur EasyAsso.`}
      </p>
    </form>
  );
}
