'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

const PRICE = process.env.NEXT_PUBLIC_PRICE_EUR || '250';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', assoName: '', email: '', password: '', language: 'fr' as 'fr' | 'en', startMode: 'trial' as 'trial' | 'pay',
    phone: '', city: '', legalName: '', registrationNumber: '', legalAddress: '', publicationDirector: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const en = form.language === 'en';

  useEffect(() => {
    if (localStorage.getItem('easyasso-language') === 'en') setForm((current) => ({ ...current, language: 'en' }));
  }, []);

  function changeLanguage(language: 'fr' | 'en') {
    setForm((current) => ({ ...current, language }));
    localStorage.setItem('easyasso-language', language);
    document.cookie = `easyasso-language=${language};path=/;max-age=31536000;samesite=lax`;
    window.dispatchEvent(new CustomEvent('easyasso-language-change', { detail: language }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const response = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || (en ? 'Unable to create the account.' : 'Impossible de créer le compte.'));
      const login = await signIn('credentials', { redirect: false, email: form.email, password: form.password });
      if (login?.error) throw new Error(en ? 'Unable to log in after registration.' : 'Connexion impossible après l’inscription.');
      if (form.startMode === 'pay') {
        const checkout = await fetch('/api/checkout', { method: 'POST' });
        const checkoutData = await checkout.json().catch(() => ({}));
        if (!checkout.ok || !checkoutData.url) throw new Error(checkoutData.error || (en ? 'Secure payment is currently unavailable. Your account was created, but nothing was charged.' : 'Le paiement sécurisé est momentanément indisponible. Votre compte a été créé, mais rien n’a été débité.'));
        window.location.href = checkoutData.url;
        return;
      }
      router.push('/dashboard/generate?welcome=1');
    } catch (exception: any) { setError(exception.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gray-50 px-4 py-10" data-no-translate>
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}<img src="/easyasso-logo.png" alt="EasyAsso" className="h-20 w-auto" />
        </Link>
        <div className="card">
          <h1 className="text-xl font-bold text-gray-900">{en ? 'Create your association website' : 'Créer le site de votre association'}</h1>
          <p className="mt-1 text-sm text-gray-500">{en ? `3-day free trial — no credit card required. Then €${PRICE} once, and your website is hosted for life.` : `Essai gratuit de 3 jours — sans carte bancaire. Ensuite ${PRICE} € une seule fois, votre site est hébergé à vie.`}</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div><label className="label">{en ? 'Your name' : 'Votre nom'}</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={en ? 'Mary Smith' : 'Marie Dupont'} /></div>
            <div><label className="label">{en ? 'Association name' : 'Nom de l’association'}</label><input className="input" required value={form.assoName} onChange={(e) => setForm({ ...form, assoName: e.target.value })} placeholder={en ? 'Community Friends' : 'Les Amis du Quartier'} /></div>
            <div><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={en ? 'you@association.org' : 'vous@asso.fr'} /></div>
            <div><label className="label">{en ? 'Password' : 'Mot de passe'}</label><input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={en ? '6 characters minimum' : '6 caractères minimum'} /></div>
            <div><label className="label">{en ? 'Workspace language' : 'Langue de votre espace'}</label><select className="input" value={form.language} onChange={(e) => changeLanguage(e.target.value as 'fr' | 'en')}><option value="fr">Français</option><option value="en">English</option></select></div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <h2 className="font-bold text-gray-900">{en ? 'Association contact and legal details' : 'Coordonnées et infos légales de l’association'}</h2>
              <p className="mt-1 text-xs text-gray-500">{en ? 'These details will prefill Settings, legal notices and generated pages.' : 'Ces infos rempliront automatiquement Réglages, mentions légales et pages générées.'}</p>
              <div className="mt-4 space-y-3">
                <div><label className="label">{en ? 'Legal association name' : 'Nom légal de l’association'}</label><input className="input" value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} placeholder={form.assoName || (en ? 'Official registered name' : 'Nom officiel déclaré')} /></div>
                <div><label className="label">{en ? 'Registration number' : 'Numéro d’enregistrement'}</label><input className="input" value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} placeholder={en ? 'Registration / charity number' : 'RNA, SIREN, SIRET…'} /></div>
                <div><label className="label">{en ? 'Legal address' : 'Adresse légale / siège'}</label><textarea className="input" value={form.legalAddress} onChange={(e) => setForm({ ...form, legalAddress: e.target.value })} placeholder={en ? 'Full registered address' : 'Adresse complète du siège'} /></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><label className="label">{en ? 'Phone' : 'Téléphone'}</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><label className="label">{en ? 'City' : 'Ville'}</label><input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                </div>
                <div><label className="label">{en ? 'Publication director' : 'Directeur/directrice de publication'}</label><input className="input" value={form.publicationDirector} onChange={(e) => setForm({ ...form, publicationDirector: e.target.value })} placeholder={form.name || (en ? 'Usually the president or owner' : 'Souvent le/la président(e)')} /></div>
              </div>
            </div>
            <div>
              <p className="label">{en ? 'How do you want to start?' : 'Comment voulez-vous commencer ?'}</p>
              <div className="grid gap-2">
                <label className={`cursor-pointer rounded-xl border p-3 ${form.startMode === 'trial' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'}`}>
                  <input type="radio" className="mr-2" checked={form.startMode === 'trial'} onChange={() => setForm({ ...form, startMode: 'trial' })} />
                  <span className="font-semibold text-gray-900">{en ? 'Start my 3-day free trial' : 'Commencer mon essai gratuit de 3 jours'}</span>
                  <span className="mt-1 block text-xs text-gray-500">{en ? 'No card required. You can pay later from your dashboard.' : 'Sans carte bancaire. Vous pourrez payer ensuite depuis le tableau de bord.'}</span>
                </label>
                <label className={`cursor-pointer rounded-xl border p-3 ${form.startMode === 'pay' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'}`}>
                  <input type="radio" className="mr-2" checked={form.startMode === 'pay'} onChange={() => setForm({ ...form, startMode: 'pay' })} />
                  <span className="font-semibold text-gray-900">{en ? `Pay €${PRICE} now` : `Payer ${PRICE} € maintenant`}</span>
                  <span className="mt-1 block text-xs text-gray-500">{en ? 'You will be sent to the secure payment page before activation.' : 'Vous serez envoyé vers la page de paiement sécurisé avant activation.'}</span>
                </label>
              </div>
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button className="btn btn-primary w-full py-3" disabled={loading}>{loading ? (form.startMode === 'pay' ? (en ? 'Opening secure payment…' : 'Ouverture du paiement sécurisé…') : (en ? 'Creating…' : 'Création…')) : form.startMode === 'pay' ? (en ? `Create account and pay €${PRICE}` : `Créer le compte et payer ${PRICE} €`) : (en ? 'Continue' : 'Continuer')}</button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-gray-500">{en ? 'Already have an account?' : 'Déjà un compte ?'} <Link href="/login" className="font-semibold text-brand-600">{en ? 'Log in' : 'Se connecter'}</Link></p>
      </div>
    </div>
  );
}
