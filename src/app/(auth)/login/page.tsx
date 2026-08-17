'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', { redirect: false, email, password });
    setLoading(false);
    if (res?.error) return setError('Email ou mot de passe incorrect.');
    router.push(params.get('callbackUrl') || '/dashboard');
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-xl font-extrabold text-brand-700">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">E</span> Easy Asso
        </Link>
        <div className="card">
          <h1 className="text-xl font-bold text-gray-900">Connexion</h1>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button className="btn btn-primary w-full py-3" disabled={loading}>{loading ? '…' : 'Se connecter'}</button>
          </form>
          <Link href="/forgot-password" className="mt-4 block text-center text-sm font-semibold text-brand-600">Mot de passe oublié ?</Link>
        </div>
        <p className="mt-4 text-center text-sm text-gray-500">
          Pas encore de compte ? <Link href="/register" className="font-semibold text-brand-600">Créer mon site</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
