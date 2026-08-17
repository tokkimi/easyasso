'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Download, FileText, Trash2, X } from 'lucide-react';
import { PageHeader, Stat, EmptyState } from '@/components/ui';
import { formatEuros, formatDate } from '@/lib/utils';

const METHODS = ['CASH', 'CHECK', 'TRANSFER', 'STRIPE', 'HELLOASSO', 'OTHER'];
const METHOD_LABELS: Record<string, string> = { CASH: 'Espèces', CHECK: 'Chèque', TRANSFER: 'Virement', STRIPE: 'Stripe', HELLOASSO: 'HelloAsso', OTHER: 'Autre' };

export function DonationsClient({ donations, donors, campaigns, canEdit, canReceipt, canExport }: any) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ amountEuros: '', donorId: '', campaignId: '', method: 'CASH', donatedAt: new Date().toISOString().slice(0, 10) });
  const [busy, setBusy] = useState(false);

  const total = donations.filter((d: any) => d.status === 'COMPLETED').reduce((s: number, d: any) => s + d.amountCents, 0);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch('/api/donations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setBusy(false); setOpen(false);
    setForm({ amountEuros: '', donorId: '', campaignId: '', method: 'CASH', donatedAt: new Date().toISOString().slice(0, 10) });
    router.refresh();
  }
  async function issueReceipt(id: string) { await fetch(`/api/donations/${id}`, { method: 'PATCH' }); router.refresh(); }
  async function remove(id: string) { if (!confirm('Supprimer ce don ?')) return; await fetch(`/api/donations/${id}`, { method: 'DELETE' }); router.refresh(); }

  return (
    <div>
      <PageHeader title="Dons" subtitle="Enregistrez et suivez tous les dons reçus."
        action={
          <div className="flex gap-2">
            {canExport && <a href="/api/export?type=donations" className="btn btn-ghost"><Download className="h-4 w-4" /> Exporter</a>}
            {canEdit && <button onClick={() => setOpen(true)} className="btn btn-primary"><Plus className="h-4 w-4" /> Ajouter un don</button>}
          </div>
        } />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Total collecté" value={formatEuros(total)} accent="text-green-600" />
        <Stat label="Nombre de dons" value={String(donations.length)} />
        <Stat label="Reçus émis" value={String(donations.filter((d: any) => d.receiptIssued).length)} />
      </div>

      {donations.length === 0 ? (
        <EmptyState title="Aucun don pour le moment" text="Ajoutez un don manuellement, ou connectez Stripe / HelloAsso pour les recevoir automatiquement.">
          {canEdit && <button onClick={() => setOpen(true)} className="btn btn-primary"><Plus className="h-4 w-4" /> Ajouter un don</button>}
        </EmptyState>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-gray-400">
              <tr><th className="pb-3">Date</th><th className="pb-3">Donateur</th><th className="pb-3">Campagne</th><th className="pb-3">Méthode</th><th className="pb-3 text-right">Montant</th><th className="pb-3">Reçu</th><th></th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {donations.map((d: any) => (
                <tr key={d.id}>
                  <td className="py-3 text-gray-500">{formatDate(d.donatedAt)}</td>
                  <td className="py-3 font-medium">{d.donor ? `${d.donor.firstName} ${d.donor.lastName}` : 'Anonyme'}</td>
                  <td className="py-3 text-gray-500">{d.campaign?.name || '—'}</td>
                  <td className="py-3 text-gray-500">{METHOD_LABELS[d.method] || d.method}</td>
                  <td className="py-3 text-right font-semibold">{formatEuros(d.amountCents)}</td>
                  <td className="py-3">
                    {d.receiptIssued ? <span className="badge bg-green-100 text-green-700">{d.receiptNumber}</span>
                      : canReceipt ? <button onClick={() => issueReceipt(d.id)} className="flex items-center gap-1 text-xs text-brand-600 hover:underline"><FileText className="h-3 w-3" /> Émettre</button>
                      : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="py-3 text-right">{canEdit && <button onClick={() => remove(d.id)} className="text-gray-300 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={add} className="w-full max-w-md rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="font-bold">Nouveau don</h3><button type="button" onClick={() => setOpen(false)}><X className="h-5 w-5 text-gray-400" /></button></div>
            <div className="space-y-3">
              <div><label className="label">Montant (€)</label><input type="number" step="0.01" required className="input" value={form.amountEuros} onChange={(e) => setForm({ ...form, amountEuros: e.target.value })} /></div>
              <div><label className="label">Donateur</label>
                <select className="input" value={form.donorId} onChange={(e) => setForm({ ...form, donorId: e.target.value })}>
                  <option value="">Anonyme</option>
                  {donors.map((d: any) => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
                </select>
              </div>
              <div><label className="label">Campagne</label>
                <select className="input" value={form.campaignId} onChange={(e) => setForm({ ...form, campaignId: e.target.value })}>
                  <option value="">Aucune</option>
                  {campaigns.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Méthode</label>
                  <select className="input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                    {METHODS.map((m) => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}
                  </select>
                </div>
                <div><label className="label">Date</label><input type="date" className="input" value={form.donatedAt} onChange={(e) => setForm({ ...form, donatedAt: e.target.value })} /></div>
              </div>
            </div>
            <button disabled={busy} className="btn btn-primary mt-5 w-full">{busy ? '…' : 'Enregistrer le don'}</button>
          </form>
        </div>
      )}
    </div>
  );
}
