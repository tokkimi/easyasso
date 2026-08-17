'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

const PRICE = process.env.NEXT_PUBLIC_PRICE_EUR || '250';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', assoName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      // Auto sign-in then head to checkout
      const login = await signIn('credentials', { redirect: false, email: form.email, password: form.password });
      if (login?.error) throw new Error('Connexion impossible après inscription.');
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-xl font-extrabold text-brand-700">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">E</span> Easy Asso
        </Link>
        <div className="card">
          <h1 className="text-xl font-bold text-gray-900">Créer le site de votre association</h1>
          <p className="mt-1 text-sm text-gray-500">Étape 1 sur 2 — votre compte. Le paiement de {PRICE} € vient ensuite.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label">Votre nom</label>
              <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Marie Dupont" />
            </div>
            <div>
              <label className="label">Nom de l’association</label>
              <input className="input" required value={form.assoName} onChange={(e) => setForm({ ...form, assoName: e.target.value })} placeholder="Les Amis du Quartier" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="vous@asso.fr" />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="6 caractères minimum" />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button className="btn btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Création…' : 'Continuer'}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-gray-500">
          Déjà un compte ? <Link href="/login" className="font-semibold text-brand-600">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
