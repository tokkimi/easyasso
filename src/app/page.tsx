import Link from 'next/link';
import { Check, MousePointerClick, Palette, HandCoins, Users, BarChart3, Globe, Sparkles, WandSparkles, FileText, RefreshCw, ExternalLink, Gift, Zap, Clock, Wallet, HeartHandshake, Recycle, Server, Gauge } from 'lucide-react';

import { PLANS } from '@/lib/plans';

const PRICE = process.env.NEXT_PUBLIC_PRICE_EUR || '250';
const ANNUAL = PLANS.annual.amountEur;

const features = [
  { icon: MousePointerClick, title: 'Éditeur visuel bloc par bloc', text: 'Cliquez, écrivez, glissez. Ce que vous voyez est ce que vos visiteurs verront.' },
  { icon: Palette, title: '50 couleurs & boutons sur mesure', text: 'Titres, textes, images, vidéos, réseaux sociaux, alignements et boutons configurables.' },
  { icon: HandCoins, title: 'Dons, reçus & campagnes', text: 'Collectez via Stripe, virement, chèque, HelloAsso en un clic ou cagnotte Leetchi. Reçus fiscaux et classement des donateurs.' },
  { icon: Users, title: 'CRM & équipe', text: 'Base de donateurs, rôles et permissions détaillés pour vos bénévoles.' },
  { icon: BarChart3, title: 'Comptabilité complète', text: 'Recettes, dépenses, catégories, exports comptables et statistiques.' },
  { icon: Globe, title: 'Votre nom de domaine', text: 'Un sous-domaine offert immédiatement, votre domaine personnalisé en quelques clics.' },
];

const steps = [
  { n: '1', title: 'Créez votre compte', text: 'Renseignez le nom de votre association.' },
  { n: '2', title: 'Testez 3 jours gratuitement', text: 'Aucune carte bancaire à l’inscription.' },
  { n: '3', title: 'Votre site est en ligne', text: 'Une adresse est générée automatiquement pour vous.' },
  { n: '4', title: `Gardez EasyAsso dès ${ANNUAL} € / an`, text: `${ANNUAL} € par an ou ${PRICE} € à vie — par virement, depuis votre tableau de bord.` },
];

const magicTools = [
  { icon: FileText, title: 'CGV et mentions légales générées', text: 'EasyAsso prépare des documents détaillés à partir des informations légales de l’association, puis vous pouvez les modifier.' },
  { icon: HandCoins, title: 'Questionnaire de dons prêt à l’emploi', text: 'Montants proposés, don libre, coordonnées donateur, carte, HelloAsso, virement ou chèque : tout est déjà structuré.' },
  { icon: ExternalLink, title: 'HelloAsso connecté en un clic', text: 'Collez simplement votre lien HelloAsso : EasyAsso l’ajoute automatiquement au formulaire de dons de votre site.' },
  { icon: Gift, title: 'Cagnotte Leetchi intégrée', text: 'Ajoutez votre lien Leetchi pour afficher une cagnotte avec jauge et bouton de participation directement sur le site.' },
  { icon: Globe, title: 'Site et espace en français ou en anglais', text: 'La langue choisie à l’inscription ou dans les réglages est respectée dans le générateur, le profil et les pages créées.' },
  { icon: Users, title: 'Contact, messages et données utiles', text: 'Les vraies coordonnées, le formulaire de contact, les messages reçus et les informations donateurs remontent dans le tableau de bord.' },
];

const atouts = [
  { icon: Zap, title: 'Droit à l’essentiel', text: 'Un parcours simple qui va à ce qui compte : présenter l’association, collecter des dons, gérer le reste. Pas d’usine à gaz.' },
  { icon: Clock, title: 'En ligne en quelques minutes', text: 'L’outil magique rédige et structure votre site à partir de quelques informations. Vous ajustez ensuite librement.' },
  { icon: Wallet, title: 'Un prix pensé pour les associations', text: `${ANNUAL} € par an, ou un paiement unique de ${PRICE} € à vie — loin des milliers d’euros d’une agence et d’un hébergement annuel.` },
  { icon: MousePointerClick, title: 'Autonomie totale', text: 'Vous créez, modifiez et gérez tout vous-même, sans dépendre d’un prestataire ni d’aucune compétence technique.' },
  { icon: HandCoins, title: 'Vraiment tout-en-un', text: 'Site, dons, reçus fiscaux, CRM donateurs, comptabilité, statistiques et référencement réunis au même endroit.' },
  { icon: HeartHandshake, title: 'Accessible à toutes', text: 'Pensé pour les petites structures sans budget : une présence professionnelle ne devrait pas être réservée à celles qui peuvent se l’offrir.' },
];

const eco = [
  { icon: Recycle, title: 'Mutualisé', text: 'Une infrastructure partagée plutôt qu’un site sur-mesure par association.' },
  { icon: Server, title: 'Pages en cache', text: 'Servies depuis un CDN : moins de calcul à chaque visite.' },
  { icon: Gauge, title: 'Images optimisées', text: 'Compressées et dimensionnées pour alléger le chargement.' },
  { icon: FileText, title: 'Dématérialisé', text: 'Reçus, newsletters et dons en ligne : moins de papier et d’envois.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" aria-label="EasyAsso — accueil" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/easyasso-logo.png" alt="EasyAsso" className="h-14 w-auto sm:h-16" />
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="btn btn-ghost">Connexion</Link>
          <Link href="/register" className="btn btn-primary">Créer mon site</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-10 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2"><span className="badge bg-brand-50 text-brand-700">Pensé pour les associations, simple pour tous</span><span className="badge bg-green-100 text-green-800">3 jours gratuits, sans carte bancaire</span></div>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl">
          Le site de votre association,<br /> en ligne en <span className="text-brand-600">quelques minutes</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
          Créez, éditez et gérez tout vous-même, sans aucune compétence technique. Dons, donateurs,
          comptabilité et statistiques inclus. En totale autonomie.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register" className="btn btn-primary px-6 py-3 text-base">
            <span>Commencer — dès</span> {ANNUAL} <span>€ / an</span>
          </Link>
          <Link href="/login" className="btn btn-ghost px-6 py-3 text-base">J’ai déjà un compte</Link>
        </div>
        <p className="mt-3 text-sm font-medium text-green-700">Testez tout gratuitement pendant 3 jours. Payez seulement si EasyAsso vous convient.</p>
        <p className="mt-1 text-sm text-gray-500">{ANNUAL} € / an ou {PRICE} € à vie · Site illimité · Sans engagement</p>
      </section>

      {/* Magic builder */}
      <section className="overflow-hidden border-y border-indigo-100 bg-gradient-to-b from-indigo-50/70 to-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge bg-indigo-100 text-indigo-700"><Sparkles className="mr-1 h-3.5 w-3.5" /> Découvrez l’outil magique</span>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-gray-900 md:text-5xl">Votre association racontée avec justesse, votre site créé en quelques minutes</h2>
            <p className="mt-5 text-lg leading-8 text-gray-600">Renseignez votre cause, votre histoire, vos actions et vos coordonnées. L’outil magique transforme ces informations en un véritable site complet, structuré et différent pour chaque association.</p>
          </div>

          <div className="mt-12 grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              {[
                ['1. Parlez-nous de votre association', 'Un questionnaire simple, prérempli avec les informations déjà enregistrées dans vos réglages.'],
                ['2. Laissez la magie opérer', 'L’outil rédige des textes développés, choisit une structure adaptée à votre cause et compose toutes les pages.'],
                ['3. Gardez le contrôle', 'Tout est immédiatement modifiable dans l’éditeur visuel : textes, images, couleurs, boutons, pages, menu et pied de page.'],
              ].map(([title, text], index) => (
                <div key={title} className="flex gap-4 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white">{index === 0 ? <FileText className="h-5 w-5" /> : index === 1 ? <WandSparkles className="h-5 w-5" /> : <MousePointerClick className="h-5 w-5" />}</div>
                  <div><h3 className="font-bold text-gray-900">{title}</h3><p className="mt-1 text-sm leading-6 text-gray-600">{text}</p></div>
                </div>
              ))}
            </div>

            <div className="relative rounded-3xl border border-indigo-200 bg-white p-3 shadow-2xl shadow-indigo-200/60">
              <div className="rounded-2xl bg-gray-950 p-5 text-white">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2 font-bold"><Sparkles className="h-5 w-5 text-violet-300" /> Générateur magique</div>
                  <span className="rounded-full bg-green-400/15 px-3 py-1 text-xs font-semibold text-green-300">Aucune page générique copiée-collée</span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white/10 p-4"><p className="text-xs uppercase tracking-wider text-violet-200">Cause</p><p className="mt-1 font-semibold">Protection animale</p></div>
                  <div className="rounded-xl bg-white/10 p-4"><p className="text-xs uppercase tracking-wider text-violet-200">Création</p><p className="mt-1 font-semibold">2018 · Nantes</p></div>
                  <div className="rounded-xl bg-white/10 p-4 sm:col-span-2"><p className="text-xs uppercase tracking-wider text-violet-200">Mission</p><p className="mt-1 text-sm leading-6 text-gray-200">Recueillir, soigner et replacer les animaux abandonnés tout en sensibilisant les familles à une adoption responsable.</p></div>
                </div>
                <div className="mt-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 p-4">
                  <div className="flex items-center gap-3"><WandSparkles className="h-6 w-6" /><div><p className="font-bold">7 pages et 31 sections prêtes</p><p className="text-sm text-indigo-100">Textes approfondis · navigation · appels à l’action · contact</p></div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex gap-4"><RefreshCw className="mt-1 h-6 w-6 shrink-0 text-brand-600" /><div><h3 className="text-lg font-bold text-gray-900">Un nouveau départ à chaque génération</h3><p className="mt-1 text-sm leading-6 text-gray-600">Lorsque vous recommencez, l’ancien site est entièrement remplacé. Aucun ancien texte, logo ou bloc ne vient polluer la nouvelle création.</p></div></div>
            <Link href="/register" className="btn btn-primary px-6 py-3">Essayer l’outil magique <Sparkles className="h-4 w-4" /></Link>
          </div>

          <div className="mt-8 rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-extrabold text-gray-900">Il prépare aussi les parties compliquées</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">Pas besoin de savoir rédiger une page légale, construire un appel au don ou organiser les informations du tableau de bord : l’outil magique pose les bases, vous ajustez ensuite si besoin.</p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {magicTools.map((tool) => (
                <div key={tool.title} className="flex gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <tool.icon className="mt-1 h-5 w-5 shrink-0 text-brand-600" />
                  <div><h4 className="font-bold text-gray-900">{tool.title}</h4><p className="mt-1 text-sm leading-6 text-gray-600">{tool.text}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Démarche responsable + empreinte estimée */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 to-white p-8 md:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <span className="badge bg-green-100 text-green-800">Démarche responsable</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900">Un site utile, et plus sobre</h2>
            <p className="mt-3 leading-8 text-gray-600">
              Le numérique n’est jamais sans impact. Notre approche est de le réduire concrètement : une seule infrastructure partagée par toutes les
              associations plutôt que des sites sur-mesure refaits tous les trois ans, des pages légères servies depuis un cache, des images compressées,
              et la dématérialisation des reçus, des newsletters et des dons.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {eco.map((e) => (
                <li key={e.title} className="flex gap-3">
                  <e.icon className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />
                  <div><p className="font-semibold text-gray-900">{e.title}</p><p className="text-sm text-gray-600">{e.text}</p></div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-green-100">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">Empreinte estimée</p>
            <p className="mt-2 text-5xl font-black text-gray-900">≈ 0,3 g</p>
            <p className="mt-1 text-sm text-gray-600">de CO₂e par page vue (estimation)</p>
            <p className="mt-4 text-xs leading-5 text-gray-500">
              Estimation basée sur le poids de nos pages et le modèle Sustainable Web Design. À titre de repère, une page web classique est souvent
              plus lourde et émet davantage. Le numérique reste un usage à impact : nous cherchons à le réduire, pas à le nier.
            </p>
          </div>
        </div>
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

      {/* Pourquoi Easy Asso */}
      <section className="border-t border-gray-100 bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">Pourquoi Easy Asso</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Easy Asso est né d’une conviction simple : une association ne devrait pas avoir besoin du budget d’une agence pour exister en ligne.
              Nous avons conçu un outil qui va droit à l’essentiel, à un prix pensé pour les petites structures, pour que chacune puisse se présenter,
              collecter des dons et gérer son activité — sans compétence technique et sans y passer des semaines.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {atouts.map((a) => (
              <div key={a.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700"><a.icon className="h-5 w-5" /></div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{a.title}</h3>
                <p className="mt-1 text-sm leading-6 text-gray-600">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">Deux formules, tout compris</h2>
          <p className="mt-3 text-lg text-gray-600">Choisissez ce qui vous convient : un abonnement annuel léger ou un accès à vie. Mêmes fonctionnalités. Paiement par virement bancaire.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Annual */}
          <div className="flex flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-700">Annuel</p>
            <div className="mt-3 text-5xl font-extrabold text-gray-900">{ANNUAL} €<span className="text-lg font-medium text-gray-500"> / an</span></div>
            <p className="mt-1 text-gray-500">Idéal pour démarrer sans gros budget.</p>
            <ul className="mt-6 flex-1 space-y-2 text-left text-gray-700">
              {['Éditeur visuel complet', 'Sous-domaine offert + domaine perso', 'Dons, reçus & campagnes', 'CRM donateurs & équipe', 'Comptabilité & statistiques', 'Support Stripe, HelloAsso & Leetchi'].map((i) => (
                <li key={i} className="flex items-center gap-2"><Check className="h-5 w-5 text-green-600" /> {i}</li>
              ))}
            </ul>
            <Link href="/register?plan=annual" className="btn btn-ghost mt-8 w-full py-3 text-base">Choisir l’annuel — {ANNUAL} € / an</Link>
          </div>
          {/* Lifetime */}
          <div className="relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white shadow-xl">
            <span className="absolute right-6 top-6 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">Le plus tranquille</span>
            <p className="text-sm font-bold uppercase tracking-wide text-brand-100">À vie</p>
            <div className="mt-3 text-5xl font-extrabold">{PRICE} €<span className="text-lg font-medium text-brand-100"> une fois</span></div>
            <p className="mt-1 text-brand-100">Un seul paiement, plus jamais d’abonnement.</p>
            <ul className="mt-6 flex-1 space-y-2 text-left">
              {['Tout ce qui est inclus dans l’annuel', 'Aucun renouvellement à gérer', 'Hébergé à vie', 'Toutes les mises à jour incluses'].map((i) => (
                <li key={i} className="flex items-center gap-2"><Check className="h-5 w-5 text-brand-200" /> {i}</li>
              ))}
            </ul>
            <Link href="/register?plan=lifetime" className="btn mt-8 w-full bg-white py-3 text-base text-brand-700 hover:bg-brand-50">Choisir à vie — {PRICE} €</Link>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">Vous pouvez tester gratuitement 3 jours avant de choisir, et changer de formule à tout moment avant de payer.</p>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-500">
        <div>© {new Date().getFullYear()} Easy Asso · Une Digitale · Créé pour les associations</div>
        <nav className="mt-3 flex flex-wrap justify-center gap-4">
          <Link href="/cgv" className="hover:text-brand-700">CGV</Link>
          <Link href="/mentions-legales" className="hover:text-brand-700">Mentions légales</Link>
          <Link href="/mentions-legales#donnees-personnelles" className="hover:text-brand-700">Confidentialité</Link>
        </nav>
      </footer>
    </div>
  );
}
