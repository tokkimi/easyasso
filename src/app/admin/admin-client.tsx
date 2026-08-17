'use client';

import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { CheckCircle, Download, ExternalLink, FileText, Pencil, Save, ShieldCheck, Trash2, Users, WalletCards } from 'lucide-react';

type AdminStats = {
  organizations: number;
  users: number;
  active: number;
  pending: number;
  trials: number;
  validatedRevenue: number;
  pendingRevenue: number;
  contactMessages: number;
};

type AdminOrg = {
  id: string;
  name: string;
  planStatus: string;
  createdAt: string;
  trialEndsAt: string | null;
  paidAt: string | null;
  published: boolean;
  siteUrl: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  ownerEmailVerified: string | null;
  ownerIsSuperAdmin: boolean;
  adminNote: string;
  manual: {
    reference?: string;
    amountEur?: number;
    status?: string;
    requestedAt?: string;
    validatedAt?: string;
    bankReference?: string;
    proofSubmittedAt?: string;
    proofNote?: string;
    proofFile?: { name: string; type: string; dataUrl: string } | null;
  };
};

type EditState = {
  name: string;
  ownerName: string;
  ownerEmail: string;
  planStatus: string;
  trialEndsAt: string;
  published: boolean;
  ownerIsSuperAdmin: boolean;
  adminNote: string;
};

export function AdminClient({ organizations, stats }: { organizations: AdminOrg[]; stats: AdminStats }) {
  const [items, setItems] = useState(organizations);
  const [busy, setBusy] = useState('');
  const [references, setReferences] = useState<Record<string, string>>({});
  const [edits, setEdits] = useState<Record<string, EditState>>(() => Object.fromEntries(organizations.map((org) => [org.id, toEdit(org)])));

  const pending = useMemo(() => items.filter((org) => org.planStatus !== 'ACTIVE'), [items]);
  const active = useMemo(() => items.filter((org) => org.planStatus === 'ACTIVE'), [items]);

  async function activate(org: AdminOrg) {
    setBusy(`activate:${org.id}`);
    const res = await fetch(`/api/admin/organizations/${org.id}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: references[org.id] || org.manual.reference || '' }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy('');
    if (!res.ok) return alert(data.error || 'Validation impossible pour le moment.');
    updateLocal(org.id, { planStatus: 'ACTIVE', paidAt: new Date().toISOString(), published: true, manual: { ...org.manual, status: 'VALIDATED', validatedAt: new Date().toISOString(), bankReference: references[org.id] || org.manual.bankReference || org.manual.reference || '' } });
  }

  async function save(org: AdminOrg) {
    setBusy(`save:${org.id}`);
    const edit = edits[org.id] || toEdit(org);
    const res = await fetch(`/api/admin/organizations/${org.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(edit),
    });
    const data = await res.json().catch(() => ({}));
    setBusy('');
    if (!res.ok) return alert(data.error || 'Enregistrement impossible.');
    updateLocal(org.id, data.organization);
  }

  async function remove(org: AdminOrg) {
    const ok = confirm(`Supprimer définitivement "${org.name}" ?\n\nCela supprime l'association, son site, ses dons, sa compta et l'utilisateur propriétaire s'il n'a aucun autre espace.`);
    if (!ok) return;
    setBusy(`delete:${org.id}`);
    const res = await fetch(`/api/admin/organizations/${org.id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    setBusy('');
    if (!res.ok) return alert(data.error || 'Suppression impossible.');
    setItems((current) => current.filter((item) => item.id !== org.id));
  }

  function updateLocal(id: string, patch: Partial<AdminOrg>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    setEdits((current) => {
      const source = items.find((item) => item.id === id) || organizations.find((item) => item.id === id);
      return source ? { ...current, [id]: toEdit({ ...source, ...patch }) } : current;
    });
  }

  function patchEdit(id: string, patch: Partial<EditState>) {
    const source = items.find((item) => item.id === id);
    if (!source) return;
    setEdits((current) => ({ ...current, [id]: { ...(current[id] || toEdit(source)), ...patch } }));
  }

  const exportRows = [
    ['Date', 'Association', 'Responsable', 'Email', 'Statut', 'Montant', 'Référence demandée', 'Référence bancaire'],
    ...items.map((org) => [
      org.paidAt || org.manual.validatedAt || org.manual.requestedAt || org.createdAt,
      org.name,
      org.ownerName,
      org.ownerEmail,
      org.planStatus,
      `${org.manual.amountEur || 250} €`,
      org.manual.reference || '',
      org.manual.bankReference || '',
    ]),
  ];
  const csv = `data:text/csv;charset=utf-8,${encodeURIComponent(exportRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n'))}`;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brand-700"><ShieldCheck className="h-4 w-4" /> Admin EasyAsso</p>
            <h1 className="mt-2 text-3xl font-black text-gray-900">Pilotage, utilisateurs et comptabilité</h1>
            <p className="mt-2 text-gray-600">Gérez les associations, les responsables, les statuts, les sites publiés et les virements de 250 €.</p>
          </div>
          <a href={csv} download="easyasso-comptabilite-clients.csv" className="btn btn-ghost"><Download className="h-4 w-4" /> Export comptable</a>
        </div>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<Users className="h-5 w-5" />} label="Associations" value={items.length} hint={`${active.length} actives · ${pending.length} à traiter`} />
          <StatCard icon={<Users className="h-5 w-5" />} label="Utilisateurs" value={stats.users} hint={`${stats.trials} essais enregistrés`} />
          <StatCard icon={<WalletCards className="h-5 w-5" />} label="CA validé" value={formatEuros(active.length * 250)} hint="Paiements EasyAsso confirmés" />
          <StatCard icon={<WalletCards className="h-5 w-5" />} label="À encaisser" value={formatEuros(pending.length * 250)} hint={`${stats.contactMessages} messages visiteurs au total`} />
        </section>

        <section className="mb-10 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-xl font-extrabold text-gray-900">Comptabilité EasyAsso</h2>
          <p className="mb-4 text-sm text-gray-600">Une ligne par dossier client : paiement unique, statut et référence bancaire.</p>
          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-gray-500">
                <tr><th className="py-3 pr-4">Date</th><th className="py-3 pr-4">Association</th><th className="py-3 pr-4">Responsable</th><th className="py-3 pr-4">Statut</th><th className="py-3 pr-4">Montant</th><th className="py-3 pr-4">Référence</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((org) => (
                  <tr key={org.id}>
                    <td className="py-3 pr-4 text-gray-600">{formatDate(org.paidAt || org.manual.validatedAt || org.createdAt)}</td>
                    <td className="py-3 pr-4 font-semibold text-gray-900">{org.name}</td>
                    <td className="py-3 pr-4 text-gray-600">{org.ownerName || '—'} · {org.ownerEmail || '—'}</td>
                    <td className="py-3 pr-4"><StatusBadge org={org} /></td>
                    <td className="py-3 pr-4 font-bold text-gray-900">{formatEuros(org.manual.amountEur || 250)}</td>
                    <td className="py-3 pr-4 text-gray-600">{org.manual.bankReference || org.manual.reference || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <OrgList title="Paiements à vérifier" empty="Aucun paiement en attente." items={pending} busy={busy} edits={edits} references={references} onReference={setReferences} onEdit={patchEdit} onSave={save} onActivate={activate} onRemove={remove} />
        <div className="mt-10">
          <OrgList title="Associations actives" empty="Aucune association active." items={active} busy={busy} edits={edits} references={references} onReference={setReferences} onEdit={patchEdit} onSave={save} onActivate={activate} onRemove={remove} />
        </div>
      </div>
    </div>
  );
}

function OrgList({ title, empty, items, busy, edits, references, onReference, onEdit, onSave, onActivate, onRemove }: {
  title: string; empty: string; items: AdminOrg[]; busy: string; edits: Record<string, EditState>; references: Record<string, string>;
  onReference: Dispatch<SetStateAction<Record<string, string>>>; onEdit: (id: string, patch: Partial<EditState>) => void; onSave: (org: AdminOrg) => void; onActivate: (org: AdminOrg) => void; onRemove: (org: AdminOrg) => void;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-extrabold text-gray-900">{title}</h2>
      {items.length === 0 && <div className="card text-gray-600">{empty}</div>}
      {items.map((org) => (
        <OrgCard
          key={org.id}
          org={org}
          edit={edits[org.id] || toEdit(org)}
          busy={busy}
          reference={references[org.id] || ''}
          onReference={(value) => onReference((current) => ({ ...current, [org.id]: value }))}
          onEdit={(patch) => onEdit(org.id, patch)}
          onSave={() => onSave(org)}
          onActivate={() => onActivate(org)}
          onRemove={() => onRemove(org)}
        />
      ))}
    </section>
  );
}

function OrgCard({ org, edit, busy, reference, onReference, onEdit, onSave, onActivate, onRemove }: {
  org: AdminOrg; edit: EditState; busy: string; reference: string; onReference: (value: string) => void; onEdit: (patch: Partial<EditState>) => void; onSave: () => void; onActivate: () => void; onRemove: () => void;
}) {
  const isActive = org.planStatus === 'ACTIVE';
  const hasProof = Boolean(org.manual?.proofSubmittedAt || org.manual?.proofFile || org.manual?.proofNote);
  return (
    <article className="card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold text-gray-900">{org.name}</h3>
            <StatusBadge org={org} />
            {org.ownerIsSuperAdmin && <span className="badge bg-purple-100 text-purple-700">Super admin</span>}
          </div>
          <p className="mt-1 text-sm text-gray-600">{org.ownerName || 'Utilisateur'} · {org.ownerEmail}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-sm font-semibold">
            <a href={org.siteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-700">Voir le site <ExternalLink className="h-3.5 w-3.5" /></a>
            <span className={org.published ? 'text-green-700' : 'text-amber-700'}>{org.published ? 'Site en ligne' : 'Site hors ligne'}</span>
            <span className={org.ownerEmailVerified ? 'text-green-700' : 'text-amber-700'}>{org.ownerEmailVerified ? 'Email vérifié' : 'Email non vérifié'}</span>
          </div>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Créé le {formatDate(org.createdAt)}</p>
          {org.paidAt && <p>Payé le {formatDate(org.paidAt)}</p>}
          {org.trialEndsAt && <p>Essai jusqu’au {formatDate(org.trialEndsAt)}</p>}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        <Info label="Référence demandée" value={org.manual?.reference || '—'} />
        <Info label="Montant" value={formatEuros(org.manual?.amountEur || 250)} />
        <Info label="Statut virement" value={org.manual?.status || org.planStatus} />
        <Info label="Référence reçue" value={org.manual?.bankReference || '—'} />
      </div>

      {hasProof && (
        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-bold text-gray-900">Preuve de virement</p>
          {org.manual.proofSubmittedAt && <p className="mt-1 text-xs text-gray-500">Envoyée le {formatDate(org.manual.proofSubmittedAt)}</p>}
          {org.manual.proofNote && <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{org.manual.proofNote}</p>}
          {org.manual.proofFile?.dataUrl && <a href={org.manual.proofFile.dataUrl} download={org.manual.proofFile.name} className="btn btn-ghost mt-3"><FileText className="h-4 w-4" /> Télécharger la preuve</a>}
        </div>
      )}

      <details className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
        <summary className="flex cursor-pointer items-center gap-2 font-bold text-gray-900"><Pencil className="h-4 w-4" /> Modifier / gérer ce dossier</summary>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Field label="Nom association"><input className="input" value={edit.name} onChange={(event) => onEdit({ name: event.target.value })} /></Field>
          <Field label="Statut"><select className="input" value={edit.planStatus} onChange={(event) => onEdit({ planStatus: event.target.value })}><option value="TRIAL">Essai gratuit</option><option value="PENDING_PAYMENT">Paiement en attente</option><option value="ACTIVE">Actif payé</option><option value="SUSPENDED">Suspendu</option><option value="CANCELLED">Annulé</option></select></Field>
          <Field label="Nom responsable"><input className="input" value={edit.ownerName} onChange={(event) => onEdit({ ownerName: event.target.value })} /></Field>
          <Field label="Email responsable"><input className="input" value={edit.ownerEmail} onChange={(event) => onEdit({ ownerEmail: event.target.value })} /></Field>
          <Field label="Fin essai"><input type="date" className="input" value={edit.trialEndsAt} onChange={(event) => onEdit({ trialEndsAt: event.target.value })} /></Field>
          <div className="grid gap-3 rounded-xl bg-gray-50 p-4">
            <label className="flex items-center gap-3"><input type="checkbox" className="h-5 w-5" checked={edit.published} onChange={(event) => onEdit({ published: event.target.checked })} /> Site en ligne</label>
            <label className="flex items-center gap-3"><input type="checkbox" className="h-5 w-5" checked={edit.ownerIsSuperAdmin} onChange={(event) => onEdit({ ownerIsSuperAdmin: event.target.checked })} /> Responsable super-admin EasyAsso</label>
          </div>
          <div className="lg:col-span-2"><Field label="Note administrative privée"><textarea className="input min-h-[90px]" value={edit.adminNote} onChange={(event) => onEdit({ adminNote: event.target.value })} placeholder="Ex : virement attendu, relance faite, infos client…" /></Field></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={onSave} disabled={busy === `save:${org.id}`} className="btn btn-primary"><Save className="h-4 w-4" /> {busy === `save:${org.id}` ? 'Enregistrement…' : 'Enregistrer'}</button>
          <button onClick={onRemove} disabled={busy === `delete:${org.id}`} className="btn btn-ghost text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> {busy === `delete:${org.id}` ? 'Suppression…' : 'Supprimer utilisateur/site'}</button>
        </div>
      </details>

      {!isActive && (
        <div className="mt-4 grid gap-3 rounded-xl border border-green-100 bg-green-50 p-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label className="label">Référence bancaire réellement reçue</label>
            <input className="input" value={reference} onChange={(event) => onReference(event.target.value)} placeholder={org.manual?.reference || 'Référence du relevé bancaire'} />
          </div>
          <button onClick={onActivate} disabled={busy === `activate:${org.id}`} className="btn btn-primary"><CheckCircle className="h-4 w-4" /> {busy === `activate:${org.id}` ? 'Validation…' : 'Valider le virement reçu'}</button>
        </div>
      )}
    </article>
  );
}

function StatCard({ icon, label, value, hint }: { icon: ReactNode; label: string; value: ReactNode; hint: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="mb-3 inline-flex rounded-xl bg-brand-50 p-2 text-brand-700">{icon}</div>
      <p className="text-sm font-semibold text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{hint}</p>
    </div>
  );
}

function StatusBadge({ org }: { org: AdminOrg }) {
  const hasProof = Boolean(org.manual?.proofSubmittedAt || org.manual?.proofFile || org.manual?.proofNote);
  const cls = org.planStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : hasProof ? 'bg-amber-100 text-amber-800' : org.planStatus === 'SUSPENDED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700';
  const label = org.planStatus === 'ACTIVE' ? 'Actif' : hasProof ? 'Preuve envoyée' : org.planStatus === 'TRIAL' ? 'Essai' : org.planStatus === 'PENDING_PAYMENT' ? 'Paiement en attente' : org.planStatus;
  return <span className={`badge ${cls}`}>{label}</span>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p><p className="mt-1 break-all font-semibold text-gray-900">{value}</p></div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><label className="label">{label}</label>{children}</div>;
}

function toEdit(org: AdminOrg): EditState {
  return {
    name: org.name || '',
    ownerName: org.ownerName || '',
    ownerEmail: org.ownerEmail || '',
    planStatus: org.planStatus || 'PENDING_PAYMENT',
    trialEndsAt: org.trialEndsAt ? org.trialEndsAt.slice(0, 10) : '',
    published: org.published,
    ownerIsSuperAdmin: org.ownerIsSuperAdmin,
    adminNote: org.adminNote || '',
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function formatEuros(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}
