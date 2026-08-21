import Link from 'next/link';
import Image from 'next/image';
import { Check, MousePointerClick, Palette, HandCoins, BarChart3, Globe, Sparkles, WandSparkles, FileText, RefreshCw, ExternalLink, Gift, Zap, Clock, Wallet, HeartHandshake, Recycle, Server, Gauge, Store, MessageSquareText } from 'lucide-react';

import { PLANS } from '@/lib/plans';

const PRICE = process.env.NEXT_PUBLIC_PRICE_EUR || '250';
const ANNUAL = PLANS.annual.amountEur;
const MONTHLY = PLANS.monthly.amountEur;

const steps = [
  { n: '1', title: 'Créez votre compte', text: 'Renseignez le nom de votre projet (association, boutique…).' },
  { n: '2', title: 'Testez 3 jours gratuitement', text: 'Aucune carte bancaire à l’inscription.' },
  { n: '3', title: 'Votre site est en ligne', text: 'Une adresse est générée automatiquement pour vous.' },
  { n: '4', title: `Gardez EasyAsso dès ${MONTHLY} € / mois`, text: `${MONTHLY} €/mois, ${ANNUAL} €/an ou ${PRICE} € à vie — par carte ou virement, depuis votre tableau de bord.` },
];

const magicTools = [
  { icon: MousePointerClick, title: 'Éditeur visuel bloc par bloc', text: 'Pages, menus, textes, images, vidéos, boutons et couleurs restent modifiables directement.' },
  { icon: Palette, title: '50 couleurs & boutons sur mesure', text: 'Titres, réseaux sociaux, alignements, boutons pleins ou contours : tout se personnalise simplement.' },
  { icon: Store, title: 'Boutique / commerce inclus', text: 'Produits, univers de marque, pages boutique et contenus adaptés si le projet vend quelque chose.' },
  { icon: HandCoins, title: 'Dons, reçus & campagnes', text: 'Collecte par carte, virement, chèque, HelloAsso ou Leetchi, avec suivi des donateurs et reçus.' },
  { icon: FileText, title: 'CGV et mentions légales générées', text: 'EasyAsso prépare des documents détaillés à partir des informations légales de l’association, puis vous pouvez les modifier.' },
  { icon: HandCoins, title: 'Questionnaire de dons prêt à l’emploi', text: 'Montants proposés, don libre, coordonnées donateur, carte, HelloAsso, virement ou chèque : tout est déjà structuré.' },
  { icon: ExternalLink, title: 'HelloAsso connecté en un clic', text: 'Collez simplement votre lien HelloAsso : EasyAsso l’ajoute automatiquement au formulaire de dons de votre site.' },
  { icon: Gift, title: 'Cagnotte Leetchi intégrée', text: 'Ajoutez votre lien Leetchi pour afficher une cagnotte avec jauge et bouton de participation directement sur le site.' },
  { icon: BarChart3, title: 'CRM, stats et comptabilité', text: 'Dons, donateurs, reçus, recettes, dépenses, exports et statistiques remontent dans le tableau de bord.' },
  { icon: Globe, title: 'Nom de domaine guidé', text: 'Sous-domaine immédiat, domaine personnalisé seulement quand il est vraiment prêt.' },
  { icon: Globe, title: 'Site et espace en français ou en anglais', text: 'La langue choisie à l’inscription ou dans les réglages est respectée dans le générateur, le profil et les pages créées.' },
  { icon: MessageSquareText, title: 'Contact et messagerie', text: 'Les vraies coordonnées, le formulaire de contact et les messages reçus arrivent dans l’espace utilisateur.' },
];

const atouts = [
  { icon: Zap, title: 'Droit à l’essentiel', text: 'Un parcours simple qui va à ce qui compte : présenter votre projet, vendre ou collecter des dons, gérer le reste. Pas d’usine à gaz.' },
  { icon: Clock, title: 'En ligne en quelques minutes', text: 'L’outil magique rédige et structure votre site à partir de quelques informations. Vous ajustez ensuite librement.' },
  { icon: Wallet, title: 'Un prix pensé pour les associations', text: `Dès ${MONTHLY} € par mois, ${ANNUAL} € par an, ou un paiement unique de ${PRICE} € à vie — loin des milliers d’euros d’une agence et d’un hébergement annuel.` },
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

const magicScreens = [
  { src: '/home-showcase/magic-association.png', alt: 'Questionnaire magique pour association', title: 'Questionnaire association' },
  { src: '/home-showcase/magic-shop.png', alt: 'Questionnaire magique pour boutique', title: 'Questionnaire boutique' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" aria-label="EasyAsso — accueil" className="shrink-0">
          <Image src="/easyasso-logo.png" alt="EasyAsso" width={156} height={82} priority className="h-14 w-auto sm:h-16" />
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="btn btn-ghost">Connexion</Link>
          <Link href="/register" className="btn btn-primary">Créer mon site</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-10 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2"><span className="badge bg-brand-50 text-brand-700">Désormais ouvert à tous</span><span className="badge bg-green-100 text-green-800">3 jours gratuits, sans carte bancaire</span></div>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl">
          Votre site internet,<br /> en ligne en <span className="text-brand-600">quelques minutes</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
          Associations, boutiques, entreprises, créateurs : créez, éditez et gérez tout vous-même,
          sans aucune compétence technique. Dons, ventes, contacts, comptabilité et statistiques inclus.
          En totale autonomie.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register" className="btn btn-primary px-6 py-3 text-base">
            <span>Commencer — dès</span> {MONTHLY} <span>€ / mois</span>
          </Link>
          <Link href="/login" className="btn btn-ghost px-6 py-3 text-base">J’ai déjà un compte</Link>
        </div>
        <p className="mt-3 text-sm font-medium text-green-700">Testez tout gratuitement pendant 3 jours. Payez seulement si EasyAsso vous convient.</p>
        <p className="mt-1 text-sm text-gray-500">{MONTHLY} € / mois, {ANNUAL} € / an ou {PRICE} € à vie · Site illimité · Sans engagement</p>
      </section>

      {/* Magic builder */}
      <section className="overflow-hidden border-y border-indigo-100 bg-gradient-to-b from-indigo-50/70 to-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge bg-indigo-100 text-indigo-700"><Sparkles className="mr-1 h-3.5 w-3.5" /> Découvrez l’outil magique</span>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-gray-900 md:text-5xl">Votre projet raconté avec justesse, votre site créé en quelques minutes</h2>
            <p className="mt-5 text-lg leading-8 text-gray-600">Renseignez votre activité, votre histoire, ce que vous faites et vos coordonnées. L’outil magique transforme ces informations en un véritable site complet, structuré et différent pour chaque projet.</p>
          </div>

          <div className="mt-12 grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              {[
                ['1. Parlez-nous de votre projet', 'Un questionnaire simple, prérempli avec les informations déjà enregistrées dans vos réglages.'],
                ['2. Laissez la magie opérer', 'L’outil rédige des textes développés, choisit une structure adaptée à votre activité et compose toutes les pages.'],
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

          <div className="mt-12 grid gap-8 rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-sm lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:p-8">
            <div>
              <span className="badge bg-brand-50 text-brand-700">Aperçu scrollable</span>
              <h3 className="mt-4 text-3xl font-extrabold leading-tight text-gray-900">Un questionnaire clair, pas un tunnel compliqué</h3>
              <p className="mt-4 text-base leading-8 text-gray-600">Les utilisateurs voient tout de suite quoi remplir selon leur projet : association, boutique / commerce ou autre site. Logo, mission, offre, actualités, CGV et mentions légales restent guidés.</p>
              <p className="mt-3 text-sm leading-6 text-gray-500">À droite, faites défiler les captures pour voir les deux versions du questionnaire. Sur mobile, le défilement se fait naturellement au doigt.</p>
              <div className="mt-6 grid gap-3 text-sm text-gray-700 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl bg-indigo-50 p-4"><strong className="text-gray-900">Association</strong><span className="mt-1 block text-gray-600">Cause, mission, fonctionnement, dons, CGV et actualités.</span></div>
                <div className="rounded-2xl bg-violet-50 p-4"><strong className="text-gray-900">Boutique / commerce</strong><span className="mt-1 block text-gray-600">Univers de marque, offre, logo, pages et boutique prête à remplir.</span></div>
              </div>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute -left-3 top-1/2 hidden -translate-y-1/2 flex-col gap-2 lg:flex"><span className="h-2 w-2 rounded-full bg-brand-600" /><span className="h-2 w-2 rounded-full bg-brand-300" /></div>
              <div className="pointer-events-none absolute -right-3 top-1/2 hidden -translate-y-1/2 flex-col gap-2 lg:flex"><span className="h-2 w-2 rounded-full bg-brand-300" /><span className="h-2 w-2 rounded-full bg-brand-600" /></div>
              <div className="max-h-[540px] snap-y snap-mandatory overflow-y-auto rounded-[1.75rem] border border-indigo-100 bg-gradient-to-b from-indigo-50 to-white p-4 shadow-inner [scrollbar-width:thin] sm:max-h-[620px]">
                <div className="space-y-5">
                  {magicScreens.map((screen) => (
                    <figure key={screen.src} className="snap-start overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
                      <Image src={screen.src} alt={screen.alt} width={760} height={980} sizes="(max-width: 1024px) 92vw, 560px" className="h-auto w-full" />
                      <figcaption className="border-t border-gray-100 bg-white px-4 py-3 text-center text-sm font-extrabold text-gray-800">{screen.title}</figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex gap-4"><RefreshCw className="mt-1 h-6 w-6 shrink-0 text-brand-600" /><div><h3 className="text-lg font-bold text-gray-900">Un nouveau départ à chaque génération</h3><p className="mt-1 text-sm leading-6 text-gray-600">Lorsque vous recommencez, l’ancien site est entièrement remplacé. Aucun ancien texte, logo ou bloc ne vient polluer la nouvelle création.</p></div></div>
            <Link href="/register" className="btn btn-primary px-6 py-3">Essayer l’outil magique <Sparkles className="h-4 w-4" /></Link>
          </div>

          <div className="mt-8 rounded-3xl border border-indigo-100 bg-white px-5 py-8 shadow-sm sm:px-7 lg:px-9">
            <div className="mx-auto max-w-3xl text-center">
              <h3 className="text-2xl font-extrabold text-gray-900 md:text-3xl">Tout est inclus</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600 md:text-base md:leading-7">Un backend très complet, une interface “pour les nuls”. Pas besoin de savoir rédiger une page légale, construire un appel au don, lancer une boutique ou organiser les informations du tableau de bord : EasyAsso pose les bases, vous gardez le contrôle de A à Z.</p>
            </div>

            <figure className="mx-auto mt-7 max-w-3xl">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-indigo-100/70">
                <Image src="/home-showcase/dashboard.webp" alt="Aperçu du tableau de bord EasyAsso" fill sizes="(max-width: 768px) 92vw, 760px" className="object-cover object-top" />
              </div>
              <figcaption className="mx-auto mt-3 max-w-2xl text-center text-sm font-semibold text-gray-700">Tableau de bord : boutique, dons, CRM, comptabilité, statistiques et édition du site au même endroit.</figcaption>
            </figure>

            <div className="-mx-5 mt-8 flex snap-x gap-3 overflow-x-auto px-5 pb-2 sm:mx-auto sm:grid sm:max-w-5xl sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
              {magicTools.map((tool) => (
                <div key={tool.title} className="flex min-w-[44vw] snap-start flex-col rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:min-w-0">
                  <tool.icon className="h-5 w-5 shrink-0 text-brand-600" />
                  <h4 className="mt-3 text-sm font-extrabold leading-5 text-gray-900">{tool.title}</h4>
                  <p className="mt-2 text-xs leading-5 text-gray-600">{tool.text}</p>
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

      {/* Pourquoi Easy Asso */}
      <section className="border-t border-gray-100 bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">Pourquoi Easy Asso</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Easy Asso est né d’une conviction simple : une association, une boutique ou un porteur de projet ne devrait pas avoir besoin du budget d’une agence pour exister en ligne.
              Nous avons conçu un outil qui va droit à l’essentiel, à un prix pensé pour les petites structures, pour que chacun puisse se présenter,
              vendre ou collecter des dons et gérer son activité — sans compétence technique et sans y passer des semaines.
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
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">Trois formules, tout compris</h2>
          <p className="mt-3 text-lg text-gray-600">Choisissez ce qui vous convient : au mois, à l’année ou à vie. Mêmes fonctionnalités. Paiement par carte ou par virement.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Monthly */}
          <div className="flex flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-700">Mensuel</p>
            <div className="mt-3 text-5xl font-extrabold text-gray-900">{MONTHLY} €<span className="text-lg font-medium text-gray-500"> / mois</span></div>
            <p className="mt-1 text-gray-500">Sans engagement, résiliable à tout moment.</p>
            <ul className="mt-6 flex-1 space-y-2 text-left text-gray-700">
              {['Éditeur visuel complet', 'Sous-domaine offert + domaine perso', 'Dons, reçus & campagnes', 'CRM donateurs & équipe', 'Comptabilité & statistiques'].map((i) => (
                <li key={i} className="flex items-center gap-2"><Check className="h-5 w-5 text-green-600" /> {i}</li>
              ))}
            </ul>
            <Link href="/register?plan=monthly" className="btn btn-ghost mt-8 w-full py-3 text-base">Choisir le mensuel — {MONTHLY} € / mois</Link>
          </div>
          {/* Annual */}
          <div className="flex flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-700">Annuel</p>
            <div className="mt-3 text-5xl font-extrabold text-gray-900">{ANNUAL} €<span className="text-lg font-medium text-gray-500"> / an</span></div>
            <p className="mt-1 text-gray-500">2 mois offerts par rapport au mensuel.</p>
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
        <div>© {new Date().getFullYear()} Easy Asso · Une Digitale · Pour les associations, les boutiques et les créateurs</div>
        <nav className="mt-3 flex flex-wrap justify-center gap-4">
          <Link href="/cgv" className="hover:text-brand-700">CGV</Link>
          <Link href="/mentions-legales" className="hover:text-brand-700">Mentions légales</Link>
          <Link href="/mentions-legales#donnees-personnelles" className="hover:text-brand-700">Confidentialité</Link>
        </nav>
      </footer>
    </div>
  );
}
