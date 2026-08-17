'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Check, Copy, CreditCard, ExternalLink, Building2, Save, ShoppingCart, Link2, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export function SettingsClient({ org, site, freeUrl, rootDomain, canDomain, categories }: any) {
  const router = useRouter();
  const [name, setName] = useState(site.name);
  const [domain, setDomain] = useState(site.customDomain || '');
  const [msg, setMsg] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [savingDomain, setSavingDomain] = useState(false);
  const [domainChoice, setDomainChoice] = useState<'connect' | 'buy' | null>(site.customDomain ? 'connect' : null);
  const [profile, setProfile] = useState({ language: 'fr', year: '', category: '', mission: '', functioning: '', actions: '', beneficiaries: '', goodToKnow: '', city: '', email: '', phone: '', legalName: '', registrationNumber: '', legalAddress: '', publicationDirector: '', facebook: '', instagram: '', linkedin: '', youtube: '', ...(org.profile || {}) });

  async function saveName() {
    await fetch('/api/site', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    setMsg('Nom enregistré'); router.refresh(); setTimeout(() => setMsg(''), 1500);
  }
  async function saveDomain() {
    setSavingDomain(true);
    const res = await fetch('/api/site', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customDomain: domain }) });
    const data = await res.json();
    setSavingDomain(false);
    setMsg(res.ok ? 'Le domaine de votre association a bien été ajouté. Suivez maintenant les étapes ci-dessous.' : (data.error || 'Impossible d’ajouter ce domaine.'));
    if (res.ok) router.refresh();
    setTimeout(() => setMsg(''), 5000);
  }
  async function verify() {
    setVerifying(true);
    const res = await fetch('/api/site/verify-domain', { method: 'POST' });
    const data = await res.json();
    setVerifying(false);
    setMsg(data.verified ? 'Votre domaine est prêt !' : (data.error || 'Le branchement n’est pas encore terminé. Réessayez dans quelques minutes.'));
    router.refresh(); setTimeout(() => setMsg(''), 3000);
  }
  const copy = (t: string) => navigator.clipboard.writeText(t);
  const setProfileField = (key: string, value: string) => setProfile((current: any) => ({ ...current, [key]: value }));
  async function saveProfile() {
    const res = await fetch('/api/organization/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
    setMsg(res.ok ? 'Fiche de l’association enregistrée. Le générateur sera automatiquement prérempli.' : 'Impossible d’enregistrer ces informations.');
    if (res.ok) {
      localStorage.setItem('easyasso-language', profile.language);
      document.cookie = `easyasso-language=${profile.language};path=/;max-age=31536000;samesite=lax`;
      window.dispatchEvent(new CustomEvent('easyasso-language-change', { detail: profile.language }));
      router.refresh();
    }
    setTimeout(() => setMsg(''), 3500);
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Réglages" subtitle="Nom, adresse du site, nom de domaine et abonnement." />
      {msg && <div className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">{msg}</div>}

      {/* General */}
      <div className="card mb-6">
        <h2 className="mb-3 font-bold text-gray-900">Général</h2>
        <label className="label">Nom de l’association / du site</label>
        <div className="flex gap-2">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          <button onClick={saveName} className="btn btn-primary shrink-0">Enregistrer</button>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="mb-1 flex items-center gap-2 font-bold text-gray-900"><Building2 className="h-5 w-5" /> Fiche de l’association</h2>
        <p className="mb-5 text-sm text-gray-500">Ces informations sont conservées et préremplissent automatiquement le générateur magique.</p>
        <div className="mb-4 max-w-xs"><label className="label">Langue de votre espace</label><select className="input" value={profile.language} onChange={(e) => setProfileField('language', e.target.value)}><option value="fr">Français</option><option value="en">English</option></select></div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className="label">Année de création</label><input className="input" value={profile.year} onChange={(e) => setProfileField('year', e.target.value)} placeholder="2015" /></div>
          <div className="sm:col-span-2"><label className="label">Cause / type d’association</label><select className="input" value={profile.category} onChange={(e) => setProfileField('category', e.target.value)}><option value="">Choisir une cause</option>{categories.map((category: any) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
        </div>
        <div className="mt-4"><label className="label">Mission et raison d’être</label><textarea className="input min-h-[110px]" value={profile.mission} onChange={(e) => setProfileField('mission', e.target.value)} placeholder="Pourquoi l’association existe, son histoire, ses valeurs et ce qu’elle veut changer." /></div>
        <div className="mt-4"><label className="label">Fonctionnement</label><textarea className="input min-h-[90px]" value={profile.functioning} onChange={(e) => setProfileField('functioning', e.target.value)} placeholder="Équipe, bénévoles, adhérents, financement, fréquence et zone d’intervention." /></div>
        <div className="mt-4"><label className="label">Actions concrètes</label><textarea className="input min-h-[90px]" value={profile.actions} onChange={(e) => setProfileField('actions', e.target.value)} placeholder="Programmes, activités, permanences et événements." /></div>
        <div className="mt-4"><label className="label">Public accompagné</label><textarea className="input min-h-[70px]" value={profile.beneficiaries} onChange={(e) => setProfileField('beneficiaries', e.target.value)} placeholder="Qui bénéficie des actions et quels sont ses besoins ?" /></div>
        <div className="mt-4"><label className="label">Informations importantes</label><textarea className="input min-h-[80px]" value={profile.goodToKnow} onChange={(e) => setProfileField('goodToKnow', e.target.value)} placeholder="Adhésion, horaires, reçus fiscaux, partenaires, chiffres clés…" /></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="label">Ville / territoire</label><input className="input" value={profile.city} onChange={(e) => setProfileField('city', e.target.value)} /></div>
          <div><label className="label">E-mail public</label><input type="email" className="input" value={profile.email} onChange={(e) => setProfileField('email', e.target.value)} placeholder="contact@association.fr" /></div>
          <div><label className="label">Téléphone public</label><input className="input" value={profile.phone} onChange={(e) => setProfileField('phone', e.target.value)} placeholder="01 23 45 67 89" /></div>
        </div>
        <div className="mt-6 border-t border-gray-100 pt-5">
          <h3 className="font-bold text-gray-900">Réseaux sociaux</h3>
          <p className="mb-3 text-sm text-gray-500">Ajoutez uniquement les comptes officiels de l’association.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(['facebook', 'instagram', 'linkedin', 'youtube'] as const).map((network) => (
              <div key={network}><label className="label capitalize">{network}</label><input className="input" type="url" value={profile[network]} onChange={(e) => setProfileField(network, e.target.value)} placeholder={`https://${network}.com/...`} /></div>
            ))}
          </div>
        </div>
        <div className="mt-6 border-t border-gray-100 pt-5">
          <h3 className="font-bold text-gray-900">Informations légales</h3>
          <p className="mb-3 text-sm text-gray-500">Elles servent à générer automatiquement les mentions légales et les conditions d’utilisation.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label">Nom légal complet</label><input className="input" value={profile.legalName} onChange={(e) => setProfileField('legalName', e.target.value)} /></div>
            <div><label className="label">Numéro RNA / SIREN / enregistrement</label><input className="input" value={profile.registrationNumber} onChange={(e) => setProfileField('registrationNumber', e.target.value)} /></div>
            <div className="sm:col-span-2"><label className="label">Adresse du siège social</label><input className="input" value={profile.legalAddress} onChange={(e) => setProfileField('legalAddress', e.target.value)} /></div>
            <div className="sm:col-span-2"><label className="label">Responsable de publication</label><input className="input" value={profile.publicationDirector} onChange={(e) => setProfileField('publicationDirector', e.target.value)} /></div>
          </div>
        </div>
        <button onClick={saveProfile} className="btn btn-primary mt-5"><Save className="h-4 w-4" /> Enregistrer la fiche</button>
      </div>

      {/* Address */}
      <div className="card mb-6">
        <h2 className="mb-1 flex items-center gap-2 font-bold text-gray-900"><Globe className="h-5 w-5" /> Adresse de votre site</h2>
        <p className="text-sm text-gray-500">Votre adresse gratuite, disponible immédiatement :</p>
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-gray-50 p-3">
          <span className="flex-1 break-all font-mono text-sm text-brand-700">{freeUrl}</span>
          <button onClick={() => copy(freeUrl)} className="text-gray-400 hover:text-gray-700"><Copy className="h-4 w-4" /></button>
          <a href={freeUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-700"><ExternalLink className="h-4 w-4" /></a>
        </div>
      </div>

      {/* Custom domain */}
      <div className="card mb-6">
        <h2 className="mb-1 flex items-center gap-2 font-bold text-gray-900"><ShieldCheck className="h-5 w-5" /> Adresse personnalisée de l’association</h2>
        <p className="text-sm text-gray-500">Cela change uniquement l’adresse du site de l’association. L’adresse principale EasyAsso reste toujours protégée.</p>
        {!canDomain ? (
          <p className="mt-3 text-sm text-amber-600">Vous n’avez pas la permission de gérer le domaine.</p>
        ) : (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setDomainChoice('connect')} className={`rounded-xl border p-4 text-left transition ${domainChoice === 'connect' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <Link2 className="mb-2 h-5 w-5 text-brand-600" />
                <span className="block font-semibold text-gray-900">J’ai déjà une adresse</span>
                <span className="mt-1 block text-sm text-gray-500">Par exemple mon-association.fr</span>
              </button>
              <button type="button" onClick={() => setDomainChoice('buy')} className={`rounded-xl border p-4 text-left transition ${domainChoice === 'buy' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <ShoppingCart className="mb-2 h-5 w-5 text-brand-600" />
                <span className="block font-semibold text-gray-900">Je veux acheter une adresse</span>
                <span className="mt-1 block text-sm text-gray-500">Nous vous guidons, sans abonnement d’hébergement inutile</span>
              </button>
            </div>
            {domainChoice === 'buy' && (
              <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
                <p className="font-semibold">1. Choisissez et achetez votre adresse</p>
                <p className="mt-1 text-blue-800">Le domaine restera à votre nom. Une fois l’achat terminé, revenez ici et choisissez « J’ai déjà une adresse ».</p>
                <a className="btn btn-primary mt-3 inline-flex text-sm" href="https://www.ovhcloud.com/fr/domains/domain-name-checker/" target="_blank" rel="noreferrer">Chercher une adresse disponible <ExternalLink className="h-4 w-4" /></a>
              </div>
            )}
            {domainChoice === 'connect' && (
              <div className="mt-4 rounded-xl border border-gray-200 p-4">
                <label className="label">Quelle adresse appartient à l’association ?</label>
                <div className="flex gap-2">
                  <input className="input" placeholder="mon-association.fr" value={domain} onChange={(e) => setDomain(e.target.value)} />
                  <button onClick={saveDomain} disabled={savingDomain || !domain.trim()} className="btn btn-primary shrink-0">{savingDomain ? 'Ajout…' : 'Continuer'}</button>
                </div>
                <p className="mt-2 text-xs text-gray-500">Ne saisissez pas easyasso.vercel.app : cette adresse est protégée automatiquement.</p>
              </div>
            )}
            {site.customDomain && (
              <div className="mt-4 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">{site.customDomain}</span>
                  <span className={`badge ${site.domainVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {site.domainVerified ? <><Check className="mr-1 h-3 w-3" /> Prêt</> : 'Branchement à terminer'}
                  </span>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  {site.domainVerified ? (
                    <p>Tout est terminé. Les visiteurs peuvent utiliser cette adresse pour voir le site de l’association.</p>
                  ) : (
                    <><p className="font-medium">Dernière étape</p><p className="mt-1">Ouvrez l’espace où cette adresse a été achetée, puis demandez à son assistance de la « diriger vers EasyAsso ». Si vous avez besoin des informations techniques, contactez le support EasyAsso : nous vous les fournirons selon votre fournisseur.</p></>
                  )}
                </div>
                {!site.domainVerified && <button onClick={verify} disabled={verifying} className="btn btn-ghost mt-3 text-sm">{verifying ? 'Vérification…' : 'Vérifier si tout est prêt'}</button>}
              </div>
            )}
          </>
        )}
      </div>

      {/* Billing */}
      <div className="card">
        <h2 className="mb-1 flex items-center gap-2 font-bold text-gray-900"><CreditCard className="h-5 w-5" /> Abonnement</h2>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className={`badge ${org.planStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {org.planStatus === 'ACTIVE' ? 'Actif' : org.planStatus}
            </span>
            {org.paidAt && <p className="mt-1 text-sm text-gray-500">Réglé le {formatDate(org.paidAt)}</p>}
          </div>
          <span className="text-sm text-gray-500">Paiement unique — accès à vie</span>
        </div>
      </div>
    </div>
  );
}
