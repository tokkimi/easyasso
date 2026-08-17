import Link from 'next/link';
import { Check, MousePointerClick, Palette, HandCoins, Users, BarChart3, Globe } from 'lucide-react';

const PRICE = process.env.NEXT_PUBLIC_PRICE_EUR || '250';

const features = [
  { icon: MousePointerClick, title: 'Éditeur visuel bloc par bloc', text: 'Cliquez, écrivez, glissez. Ce que vous voyez est ce que vos visiteurs verront.' },
  { icon: Palette, title: '50 couleurs & boutons sur mesure', text: 'Titres, textes, images, vidéos, réseaux sociaux, alignements et boutons configurables.' },
  { icon: HandCoins, title: 'Dons, reçus & campagnes', text: 'Collectez via Stripe ou reliez HelloAsso. Reçus fiscaux et classement des donateurs.' },
  { icon: Users, title: 'CRM & équipe', text: 'Base de donateurs, rôles et permissions détaillés pour vos bénévoles.' },
  { icon: BarChart3, title: 'Comptabilité complète', text: 'Recettes, dépenses, catégories, exports comptables et statistiques.' },
  { icon: Globe, title: 'Votre nom de domaine', text: 'Un sous-domaine offert immédiatement, votre domaine personnalisé en quelques clics.' },
];

const steps = [
  { n: '1', title: 'Créez votre compte', text: 'Renseignez le nom de votre association.' },
  { n: '2', title: `Réglez ${PRICE} €`, text: 'Paiement unique et sécurisé. Accès immédiat.' },
  { n: '3', title: 'Votre site est en ligne', text: 'Une adresse est générée automatiquement pour vous.' },
  { n: '4', title: 'Personnalisez tout', text: 'Puis reliez votre propre nom de domaine.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-brand-700">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">E</span>
          Easy Asso
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="btn btn-ghost">Connexion</Link>
          <Link href="/register" className="btn btn-primary">Créer mon site</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-10 text-center">
        <span className="badge bg-brand-50 text-brand-700">Pensé pour les associations, simple pour tous</span>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl">
          Le site de votre association,<br /> en ligne en <span className="text-brand-600">quelques minutes</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
          Créez, éditez et gérez tout vous-même, sans aucune compétence technique. Dons, donateurs,
          comptabilité et statistiques inclus. En totale autonomie.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register" className="btn btn-primary px-6 py-3 text-base">
            Commencer — {PRICE} € une seule fois
          </Link>
          <Link href="/login" className="btn btn-ghost px-6 py-3 text-base">J’ai déjà un compte</Link>
        </div>
        <p className="mt-3 text-sm text-gray-500">Paiement unique · Site illimité · Sans engagement</p>
      </section>

      {/* Steps */}
      <section className="border-y border-gray-100 bg-gray-50 py-14">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="card">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-lg font-bold text-white">{s.n}</div>
              <h3 className="mt-4 font-bold text-gray-900">{s.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Tout est inclus</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
          Un backend très complet, une interface “pour les nuls”. Vous gardez le contrôle de A à Z.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card">
              <f.icon className="h-8 w-8 text-brand-600" />
              <h3 className="mt-4 text-lg font-bold text-gray-900">{f.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-center text-white shadow-xl">
          <h2 className="text-2xl font-bold">Une offre unique, tout compris</h2>
          <div className="mt-4 text-6xl font-extrabold">{PRICE} €</div>
          <p className="mt-1 text-brand-100">paiement unique — pas d’abonnement caché</p>
          <ul className="mx-auto mt-6 max-w-md space-y-2 text-left">
            {['Éditeur visuel complet', 'Sous-domaine offert + domaine perso', 'Dons, reçus & campagnes', 'CRM donateurs & équipe', 'Comptabilité & statistiques', 'Support Stripe & HelloAsso'].map((i) => (
              <li key={i} className="flex items-center gap-2"><Check className="h-5 w-5 text-brand-200" /> {i}</li>
            ))}
          </ul>
          <Link href="/register" className="btn mt-8 bg-white px-8 py-3 text-base text-brand-700 hover:bg-brand-50">
            Créer le site de mon association
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Easy Asso · Créé pour les associations
      </footer>
    </div>
  );
}
