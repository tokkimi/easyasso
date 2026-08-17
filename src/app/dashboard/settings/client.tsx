'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Check, Copy, CreditCard, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export function SettingsClient({ org, site, freeUrl, rootDomain, canDomain }: any) {
  const router = useRouter();
  const [name, setName] = useState(site.name);
  const [domain, setDomain] = useState(site.customDomain || '');
  const [msg, setMsg] = useState('');
  const [verifying, setVerifying] = useState(false);

  async function saveName() {
    await fetch('/api/site', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    setMsg('Nom enregistré'); router.refresh(); setTimeout(() => setMsg(''), 1500);
  }
  async function saveDomain() {
    await fetch('/api/site', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customDomain: domain }) });
    setMsg('Domaine enregistré — configurez le DNS puis vérifiez.'); router.refresh(); setTimeout(() => setMsg(''), 3000);
  }
  async function verify() {
    setVerifying(true);
    const res = await fetch('/api/site/verify-domain', { method: 'POST' });
    const data = await res.json();
    setVerifying(false);
    setMsg(data.verified ? 'Domaine vérifié ✓' : 'Domaine pas encore joignable. Vérifiez votre DNS.');
    router.refresh(); setTimeout(() => setMsg(''), 3000);
  }
  const copy = (t: string) => navigator.clipboard.writeText(t);

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
        <h2 className="mb-1 font-bold text-gray-900">Nom de domaine personnalisé</h2>
        <p className="text-sm text-gray-500">Reliez votre propre domaine (ex. <span className="font-mono">mon-asso.fr</span>) en toute autonomie.</p>
        {!canDomain ? (
          <p className="mt-3 text-sm text-amber-600">Vous n’avez pas la permission de gérer le domaine.</p>
        ) : (
          <>
            <div className="mt-3 flex gap-2">
              <input className="input" placeholder="mon-asso.fr" value={domain} onChange={(e) => setDomain(e.target.value)} />
              <button onClick={saveDomain} className="btn btn-primary shrink-0">Relier</button>
            </div>
            {site.customDomain && (
              <div className="mt-4 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">{site.customDomain}</span>
                  <span className={`badge ${site.domainVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {site.domainVerified ? <><Check className="mr-1 h-3 w-3" /> Vérifié</> : 'En attente DNS'}
                  </span>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <p className="font-medium">Étapes (chez votre registrar) :</p>
                  <ol className="mt-2 list-decimal space-y-1 pl-5">
                    <li>Ajoutez un enregistrement <span className="font-mono">CNAME</span> : <span className="font-mono">www</span> → <span className="font-mono">{rootDomain}</span></li>
                    <li>Pour le domaine racine, ajoutez un enregistrement <span className="font-mono">A</span> vers l’IP fournie par votre hébergeur (Vercel : <span className="font-mono">76.76.21.21</span>).</li>
                    <li>Revenez ici et cliquez sur « Vérifier ».</li>
                  </ol>
                </div>
                <button onClick={verify} disabled={verifying} className="btn btn-ghost mt-3 text-sm">{verifying ? 'Vérification…' : 'Vérifier le domaine'}</button>
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
