'use client';
import { useState } from 'react';
import { CheckCircle, ExternalLink, FileText, ShieldCheck } from 'lucide-react';

type AdminOrg = {
  id: string;
  name: string;
  planStatus: string;
  createdAt: string;
  paidAt: string | null;
  siteUrl: string;
  ownerEmail: string;
  ownerName: string;
  manual: {
    reference?: string;
    amountEur?: number;
    status?: string;
    requestedAt?: string;
    proofSubmittedAt?: string;
    proofNote?: string;
    proofFile?: { name: string; type: string; dataUrl: string } | null;
  };
};

export function AdminClient({ organizations }: { organizations: AdminOrg[] }) {
  const [items, setItems] = useState(organizations);
  const [busy, setBusy] = useState('');
  const [references, setReferences] = useState<Record<string, string>>({});

  async function activate(org: AdminOrg) {
    setBusy(org.id);
    const res = await fetch(`/api/admin/organizations/${org.id}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: references[org.id] || org.manual.reference || '' }),
    });
    setBusy('');
    if (!res.ok) {
      alert('Validation impossible pour le moment.');
      return;
    }
    setItems((current) => current.map((item) => (
      item.id === org.id ? { ...item, planStatus: 'ACTIVE', paidAt: new Date().toISOString(), manual: { ...item.manual, status: 'VALIDATED' } } : item
    )));
  }

  const pending = items.filter((org) => org.planStatus !== 'ACTIVE');
  const active = items.filter((org) => org.planStatus === 'ACTIVE');

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brand-700"><ShieldCheck className="h-4 w-4" /> Admin EasyAsso</p>
            <h1 className="mt-2 text-3xl font-black text-gray-900">Utilisateurs, paiements et activations</h1>
            <p className="mt-2 text-gray-600">Validez manuellement les virements reçus et suivez les associations inscrites.</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-gray-100">
            <p><strong>{items.length}</strong> associations</p>
            <p><strong>{pending.length}</strong> en attente</p>
            <p><strong>{active.length}</strong> actives</p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-gray-900">Paiements à vérifier</h2>
          {pending.length === 0 && <div className="card text-gray-600">Aucun paiement en attente.</div>}
          {pending.map((org) => (
            <OrgCard
              key={org.id}
              org={org}
              busy={busy === org.id}
              reference={references[org.id] || ''}
              onReference={(value) => setReferences((current) => ({ ...current, [org.id]: value }))}
              onActivate={() => activate(org)}
            />
          ))}
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-extrabold text-gray-900">Associations actives</h2>
          {active.map((org) => (
            <OrgCard
              key={org.id}
              org={org}
              busy={false}
              reference={references[org.id] || ''}
              onReference={(value) => setReferences((current) => ({ ...current, [org.id]: value }))}
              onActivate={() => activate(org)}
            />
          ))}
        </section>
      </div>
    </div>
  );
}

function OrgCard({
  org, busy, reference, onReference, onActivate,
}: {
  org: AdminOrg; busy: boolean; reference: string; onReference: (value: string) => void; onActivate: () => void;
}) {
  const isActive = org.planStatus === 'ACTIVE';
  const hasProof = Boolean(org.manual?.proofSubmittedAt || org.manual?.proofFile || org.manual?.proofNote);
  return (
    <article className="card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold text-gray-900">{org.name}</h3>
            <span className={`badge ${isActive ? 'bg-green-100 text-green-700' : hasProof ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}`}>
              {isActive ? 'Actif' : hasProof ? 'Preuve envoyée' : 'En attente'}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">{org.ownerName || 'Utilisateur'} · {org.ownerEmail}</p>
          <a href={org.siteUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
            Voir le site <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Créé le {formatDate(org.createdAt)}</p>
          {org.paidAt && <p>Payé le {formatDate(org.paidAt)}</p>}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Info label="Référence demandée" value={org.manual?.reference || '—'} />
        <Info label="Montant" value={org.manual?.amountEur ? `${org.manual.amountEur} €` : '250 €'} />
        <Info label="Statut virement" value={org.manual?.status || org.planStatus} />
      </div>

      {hasProof && (
        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-bold text-gray-900">Preuve de virement</p>
          {org.manual.proofSubmittedAt && <p className="mt-1 text-xs text-gray-500">Envoyée le {formatDate(org.manual.proofSubmittedAt)}</p>}
          {org.manual.proofNote && <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{org.manual.proofNote}</p>}
          {org.manual.proofFile?.dataUrl && (
            <a href={org.manual.proofFile.dataUrl} download={org.manual.proofFile.name} className="btn btn-ghost mt-3">
              <FileText className="h-4 w-4" /> Télécharger la preuve
            </a>
          )}
        </div>
      )}

      {!isActive && (
        <div className="mt-4 grid gap-3 rounded-xl border border-green-100 bg-green-50 p-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label className="label">Référence bancaire réellement reçue</label>
            <input className="input" value={reference} onChange={(event) => onReference(event.target.value)} placeholder={org.manual?.reference || 'Référence du relevé bancaire'} />
          </div>
          <button onClick={onActivate} disabled={busy} className="btn btn-primary">
            <CheckCircle className="h-4 w-4" /> {busy ? 'Validation…' : 'Valider le virement reçu'}
          </button>
        </div>
      )}
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 break-all font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
