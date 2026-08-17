import Link from 'next/link';
import { Check, MousePointerClick, Palette, HandCoins, Users, BarChart3, Globe, Sparkles, WandSparkles, FileText, RefreshCw } from 'lucide-react';

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

const magicTools = [
  { icon: FileText, title: 'CGV et mentions légales générées', text: 'EasyAsso prépare des documents détaillés à partir des informations légales de l’association, puis vous pouvez les modifier.' },
  { icon: HandCoins, title: 'Questionnaire de dons prêt à l’emploi', text: 'Montants proposés, don libre, coordonnées donateur, carte, virement ou chèque : tout est déjà structuré.' },
  { icon: Globe, title: 'Site et espace en français ou en anglais', text: 'La langue choisie à l’inscription ou dans les réglages est respectée dans le générateur, le profil et les pages créées.' },
  { icon: Users, title: 'Contact, messages et données utiles', text: 'Les vraies coordonnées, le formulaire de contact, les messages reçus et les informations donateurs remontent dans le tableau de bord.' },
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
            <span>Commencer —</span> {PRICE} <span>€ une seule fois</span>
          </Link>
          <Link href="/login" className="btn btn-ghost px-6 py-3 text-base">J’ai déjà un compte</Link>
        </div>
        <p className="mt-3 text-sm font-medium text-green-700">Testez tout gratuitement pendant 3 jours. Payez seulement si EasyAsso vous convient.</p>
        <p className="mt-1 text-sm text-gray-500">Paiement unique · Site illimité · Sans engagement</p>
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
