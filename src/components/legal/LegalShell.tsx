import Link from 'next/link';
import type { ReactNode } from 'react';
import { platformLegal, platformLegalMissingFields } from '@/lib/platform-legal';

function StatusCard() {
  if (platformLegalMissingFields.length === 0) return null;
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
      <p className="font-extrabold">Informations administratives EasyAsso à compléter</p>
      <p className="mt-2 leading-6">
        Les pages sont en place et complètes dans leur structure. Les champs ci-dessous doivent être remplacés par les informations officielles de {platformLegal.companyName} dès qu’elles sont confirmées.
      </p>
      <ul className="mt-3 grid gap-1 sm:grid-cols-2">
        {platformLegalMissingFields.map(([label]) => (
          <li key={label}>• {label}</li>
        ))}
      </ul>
    </div>
  );
}

export function LegalShell({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="flex items-center gap-3" aria-label="Retour à l’accueil EasyAsso">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/easyasso-logo.png" alt="EasyAsso" className="h-12 w-auto" />
          </Link>
          <Link href="/register" className="btn btn-primary">Créer mon site</Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">{platformLegal.companyName}</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-950 md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600">{intro}</p>
        <p className="mt-3 text-sm text-gray-500">Dernière mise à jour : {platformLegal.updatedAt}</p>
        <div className="mt-8">
          <StatusCard />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="legal-content max-w-none">
          {children}
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-gray-50 px-6 py-8 text-sm text-gray-600">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {platformLegal.brand} · {platformLegal.companyName}</span>
          <nav className="flex flex-wrap gap-4">
            <Link href="/cgv" className="hover:text-brand-700">CGV</Link>
            <Link href="/mentions-legales" className="hover:text-brand-700">Mentions légales</Link>
            <Link href="/mentions-legales#donnees-personnelles" className="hover:text-brand-700">Confidentialité</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

export function LegalInfoTable() {
  const rows = [
    ['Éditeur du site', platformLegal.companyName],
    ['Nom commercial / service', platformLegal.serviceName],
    ['Forme juridique', platformLegal.legalForm],
    ['Immatriculation', platformLegal.registrationNumber],
    ['TVA intracommunautaire', platformLegal.vatNumber],
    ['Siège social', platformLegal.registeredAddress],
    ['Directeur ou directrice de publication', platformLegal.publicationDirector],
    ['Contact', platformLegal.contactEmail],
  ];

  return (
    <div className="not-prose mt-5 overflow-hidden rounded-2xl border border-gray-200">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1 border-b border-gray-100 p-4 last:border-b-0 sm:grid-cols-[220px_1fr]">
          <dt className="font-bold text-gray-950">{label}</dt>
          <dd className="text-gray-700">{value}</dd>
        </div>
      ))}
    </div>
  );
}
