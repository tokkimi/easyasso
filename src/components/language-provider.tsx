'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Languages } from 'lucide-react';

type Locale = 'fr' | 'en';

const translations: Record<string, string> = {
  'Connexion': 'Log in', 'Créer mon site': 'Create my website', 'Créer un compte': 'Create an account',
  'Se connecter': 'Log in', 'Se déconnecter': 'Log out', 'Adresse e-mail': 'Email address', 'Mot de passe': 'Password',
  'Nom complet': 'Full name', 'Nom de l’association': 'Association name', 'Retour à l’accueil': 'Back to home',
  'Tableau de bord': 'Dashboard', 'Générateur magique': 'Magic generator', 'Éditeur du site': 'Website editor',
  'Identité (logo, couleurs)': 'Brand (logo, colors)', 'Modèles de site': 'Website templates', 'Dons': 'Donations',
  'Campagnes': 'Campaigns', 'Donateurs (CRM)': 'Donors (CRM)', 'Comptabilité': 'Accounting',
  'Statistiques': 'Analytics', 'Équipe & rôles': 'Team & roles', 'Réglages': 'Settings', 'Voir mon site': 'View my website',
  'en ligne': 'live', 'brouillon': 'draft', 'Enregistrer': 'Save', 'Annuler': 'Cancel', 'Supprimer': 'Delete',
  'Modifier': 'Edit', 'Ajouter': 'Add', 'Créer': 'Create', 'Fermer': 'Close', 'Continuer': 'Continue',
  'Accepter': 'Accept', 'Refuser': 'Reject', 'Cookies et confidentialité': 'Cookies and privacy',
  'EasyAsso utilise des cookies nécessaires au fonctionnement du site et, si vous l’acceptez, des cookies de mesure pour améliorer l’expérience.': 'EasyAsso uses cookies that are necessary for the website to work and, if you accept them, analytics cookies to improve the experience.',
  'Retour': 'Back', 'Suivant': 'Next', 'Rechercher': 'Search', 'Exporter': 'Export', 'Aucun résultat': 'No results',
  'Chargement…': 'Loading…', 'Vérification…': 'Checking…', 'Publié': 'Published', 'Non publié': 'Unpublished',
  'Accueil': 'Home', 'Pages': 'Pages', 'Titre': 'Title', 'Texte': 'Text', 'Image': 'Image', 'Vidéo': 'Video',
  'Bouton': 'Button', 'Couleur': 'Color', 'Alignement': 'Alignment', 'Gauche': 'Left', 'Centre': 'Center', 'Droite': 'Right',
  'Plein': 'Filled', 'Contour': 'Outline', 'Lien': 'Link', 'Nom': 'Name', 'E-mail': 'Email', 'Téléphone': 'Phone',
  'Date': 'Date', 'Montant': 'Amount', 'Statut': 'Status', 'Actions': 'Actions', 'Description': 'Description',
  'Catégorie': 'Category', 'Recette': 'Income', 'Dépense': 'Expense', 'Solde': 'Balance', 'Total': 'Total',
  'Donateur': 'Donor', 'Campagne': 'Campaign', 'Reçu fiscal': 'Tax receipt', 'Moyen de paiement': 'Payment method',
  'Ajouter une page': 'Add a page', 'Nouvelle page': 'New page', 'Renommer': 'Rename', 'Ajouter un bloc': 'Add a block',
  'Publier le site': 'Publish website', 'Dépublier': 'Unpublish', 'Aperçu': 'Preview', 'Prévisualiser': 'Preview',
  'Choisir ce modèle': 'Choose this template', 'Utiliser ce modèle': 'Use this template', 'Personnaliser': 'Customize',
  'Générer mon site': 'Generate my website', 'Génération en cours…': 'Generating your website…',
  'Votre site est prêt !': 'Your website is ready!', 'Cause / type d’association': 'Cause / association type',
  'Année de création': 'Year founded', 'Mission et raison d’être': 'Mission and purpose', 'Fonctionnement': 'How you operate',
  'Actions concrètes': 'Key activities', 'Public accompagné': 'People you support', 'Informations importantes': 'Key information',
  'Ville / territoire': 'City / area', 'E-mail public': 'Public email', 'Enregistrer la fiche': 'Save association profile',
  'Fiche de l’association': 'Association profile', 'Général': 'General', 'Adresse de votre site': 'Your website address',
  'Nom de domaine personnalisé': 'Custom domain', 'Adresse personnalisée de l’association': 'Custom association address',
  'J’ai déjà une adresse': 'I already own a domain', 'Je veux acheter une adresse': 'I want to buy a domain',
  'Quelle adresse appartient à l’association ?': 'Which domain belongs to the association?',
  'Vérifier si tout est prêt': 'Check if everything is ready', 'Branchement à terminer': 'Setup required', 'Prêt': 'Ready',
  'Abonnement': 'Plan', 'Paiement unique — accès à vie': 'One-time payment — lifetime access',
  'Créer une campagne': 'Create campaign', 'Ajouter un don': 'Add donation', 'Ajouter un donateur': 'Add donor',
  'Ajouter une transaction': 'Add transaction', 'Inviter un membre': 'Invite a member', 'Créer un rôle': 'Create role',
  'Meilleurs donateurs': 'Top donors', 'Dons récents': 'Recent donations', 'Activité récente': 'Recent activity',
  'Tous les donateurs': 'All donors', 'Toutes les campagnes': 'All campaigns', 'Toutes les transactions': 'All transactions',
  'Objectif': 'Goal', 'Collecté': 'Raised', 'Progression': 'Progress', 'Actif': 'Active', 'Terminée': 'Completed',
  'Rôle': 'Role', 'Permissions': 'Permissions', 'Propriétaire': 'Owner', 'Administrateur': 'Administrator',
  'Éditeur': 'Editor', 'Comptable': 'Accountant', 'Membre': 'Member', 'Lecteur': 'Viewer',
  'Logo principal': 'Main logo', 'Logo du pied de page': 'Footer logo', 'Couleurs de la marque': 'Brand colors',
  'Couleur principale': 'Primary color', 'Couleur secondaire': 'Secondary color', 'Importer une image': 'Upload an image',
  'Tout est inclus': 'Everything is included', 'Une offre unique, tout compris': 'One simple, all-inclusive offer',
  'paiement unique — pas d’abonnement caché': 'one-time payment — no hidden subscription',
  'Créer le site de mon association': 'Create my association website', 'J’ai déjà un compte': 'I already have an account',
  'Paiement unique · Site illimité · Sans engagement': 'One-time payment · Unlimited website · No commitment',
  'Pensé pour les associations, simple pour tous': 'Built for associations, simple for everyone',
  'Le site de votre association,': 'Your association website,', 'en ligne en': 'online in', 'quelques minutes': 'just a few minutes',
  'Créez, éditez et gérez tout vous-même, sans aucune compétence technique. Dons, donateurs,': 'Create, edit and manage everything yourself, with no technical skills. Donations, donors,',
  'comptabilité et statistiques inclus. En totale autonomie.': 'accounting and analytics included. Completely independently.',
  'Commencer — 250 € une seule fois': 'Get started — €250 once',
  'Commencer —': 'Get started —', '€ une seule fois': '€ once',
  '3 jours gratuits, sans carte bancaire': '3-day free trial, no credit card required',
  'Testez tout gratuitement pendant 3 jours. Payez seulement si EasyAsso vous convient.': 'Try everything free for 3 days. Pay only if EasyAsso works for you.',
  'Cliquez, écrivez, glissez. Ce que vous voyez est ce que vos visiteurs verront.': 'Click, write and arrange. What you see is what your visitors will see.',
  'Titres, textes, images, vidéos, réseaux sociaux, alignements et boutons configurables.': 'Configurable headings, copy, images, videos, social links, alignment and buttons.',
  'Collectez via Stripe ou reliez HelloAsso. Reçus fiscaux et classement des donateurs.': 'Collect through Stripe or connect HelloAsso. Tax receipts and donor rankings.',
  'Base de donateurs, rôles et permissions détaillés pour vos bénévoles.': 'Donor database, detailed roles and permissions for your volunteers.',
  'Recettes, dépenses, catégories, exports comptables et statistiques.': 'Income, expenses, categories, accounting exports and analytics.',
  'Un sous-domaine offert immédiatement, votre domaine personnalisé en quelques clics.': 'A free instant subdomain, plus your custom domain in a few clicks.',
  'Renseignez le nom de votre association.': 'Enter your association name.',
  'Paiement unique et sécurisé. Accès immédiat.': 'Secure one-time payment. Immediate access.',
  'Une adresse est générée automatiquement pour vous.': 'An address is generated automatically for you.',
  'Puis reliez votre propre nom de domaine.': 'Then connect your own domain.',
  'Actualités à publier (optionnel)': 'News to publish (optional)',
  'La page Actualités sera créée uniquement si vous ajoutez du contenu ici.': 'The News page is created only when you add content here.',
  'Réseaux sociaux': 'Social media', 'Informations légales': 'Legal information',
  'Nom légal complet': 'Full legal name', 'Numéro RNA / SIREN / enregistrement': 'RNA / SIREN / registration number',
  'Adresse du siège social': 'Registered office address', 'Responsable de publication': 'Publication manager',
  'Éditeur visuel bloc par bloc': 'Block-by-block visual editor', '50 couleurs & boutons sur mesure': '50 colors & custom buttons',
  'Dons, reçus & campagnes': 'Donations, receipts & campaigns', 'CRM & équipe': 'CRM & team',
  'Comptabilité complète': 'Complete accounting', 'Votre nom de domaine': 'Your custom domain',
  'Créez votre compte': 'Create your account', 'Votre site est en ligne': 'Your website goes live',
  'Personnalisez tout': 'Customize everything', 'Réglez 250 €': 'Pay €250',
  'Une erreur est survenue.': 'Something went wrong.', 'Impossible d’enregistrer.': 'Unable to save.',
  'Découvrez l’outil magique': 'Discover the magic builder',
  'Votre association racontée avec justesse, votre site créé en quelques minutes': 'Your association told authentically, your website created in minutes',
  'Renseignez votre cause, votre histoire, vos actions et vos coordonnées. L’outil magique transforme ces informations en un véritable site complet, structuré et différent pour chaque association.': 'Share your cause, story, activities and contact details. The magic builder turns them into a complete, structured website uniquely crafted for each association.',
  '1. Parlez-nous de votre association': '1. Tell us about your association',
  'Un questionnaire simple, prérempli avec les informations déjà enregistrées dans vos réglages.': 'A simple questionnaire, pre-filled with the information already saved in your settings.',
  '2. Laissez la magie opérer': '2. Let the magic happen',
  'L’outil rédige des textes développés, choisit une structure adaptée à votre cause et compose toutes les pages.': 'The builder writes substantial copy, chooses a structure suited to your cause and creates every page.',
  '3. Gardez le contrôle': '3. Stay in control',
  'Tout est immédiatement modifiable dans l’éditeur visuel : textes, images, couleurs, boutons, pages, menu et pied de page.': 'Everything is immediately editable in the visual editor: copy, images, colors, buttons, pages, navigation and footer.',
  'Un nouveau départ à chaque génération': 'A fresh start with every generation',
  'Lorsque vous recommencez, l’ancien site est entièrement remplacé. Aucun ancien texte, logo ou bloc ne vient polluer la nouvelle création.': 'When you start again, the previous website is fully replaced. No old copy, logo or block carries over into the new creation.',
  'Il prépare aussi les parties compliquées': 'It also prepares the complicated parts',
  'Pas besoin de savoir rédiger une page légale, construire un appel au don ou organiser les informations du tableau de bord : l’outil magique pose les bases, vous ajustez ensuite si besoin.': 'No need to know how to write legal pages, build a donation journey or organize dashboard data: the magic builder lays the groundwork, and you adjust it afterwards if needed.',
  'CGV et mentions légales générées': 'Generated terms and legal notices',
  'EasyAsso prépare des documents détaillés à partir des informations légales de l’association, puis vous pouvez les modifier.': 'EasyAsso prepares detailed documents from the association’s legal information, and you can edit them afterwards.',
  'Questionnaire de dons prêt à l’emploi': 'Ready-to-use donation questionnaire',
  'Montants proposés, don libre, coordonnées donateur, carte, virement ou chèque : tout est déjà structuré.': 'Suggested amounts, custom donation, donor details, card, bank transfer or cheque: everything is already structured.',
  'Site et espace en français ou en anglais': 'Website and workspace in French or English',
  'La langue choisie à l’inscription ou dans les réglages est respectée dans le générateur, le profil et les pages créées.': 'The language chosen at registration or in settings is respected in the generator, profile and generated pages.',
  'Contact, messages et données utiles': 'Contact, messages and useful data',
  'Les vraies coordonnées, le formulaire de contact, les messages reçus et les informations donateurs remontent dans le tableau de bord.': 'Real contact details, the contact form, received messages and donor information all flow back into the dashboard.',
  'Ce que l’outil prépare pour vous': 'What the builder creates for you',
  'Une page d’accueil convaincante': 'A compelling homepage', 'Votre histoire et votre mission': 'Your story and mission',
  'Des pages dédiées à vos actions': 'Dedicated pages for your activities', 'Une présentation claire de votre impact': 'A clear presentation of your impact',
  'Des parcours pour adhérer, aider ou donner': 'Journeys to join, help or donate', 'Une page contact avec vos vraies coordonnées': 'A contact page with your real details',
  'Essayer l’outil magique': 'Try the magic builder', 'Aucune page générique copiée-collée': 'No generic copy-and-paste pages',
  'Créer le site de votre association': 'Create your association website', 'Votre nom': 'Your name', '6 caractères minimum': '6 characters minimum',
  'Déjà un compte ?': 'Already have an account?', 'Pas encore de compte ?': 'New to EasyAsso?', 'Votre site est activé 🎉': 'Your website is active 🎉',
  'Choisir le style de mon site': 'Choose my website style', 'Aller directement au tableau de bord': 'Go straight to the dashboard',
  'Votre adresse générée automatiquement': 'Your automatically generated address', 'Vous pourrez relier votre propre nom de domaine ensuite.': 'You can connect your own domain afterwards.',
  'Répondez au petit questionnaire : votre site complet, avec des textes développés, se crée tout seul.': 'Answer a short questionnaire: your complete website, with substantial copy, creates itself.',
  'À propos / votre mission ★': 'About you / your mission ★', 'Champ le plus important — sert de base à tous les textes.': 'The most important field — it is the foundation for all your copy.',
  'Comment fonctionne l’association ?': 'How does the association operate?', 'Vos actions concrètes': 'Your key activities', 'Public aidé / bénéficiaires': 'People supported / beneficiaries',
  'Détection automatique ✨': 'Automatic detection ✨', 'Bon à savoir': 'Good to know', 'Email de contact': 'Contact email', 'Logo (optionnel)': 'Logo (optional)',
  'Vos photos (optionnel)': 'Your photos (optional)', 'Ajouter une photo': 'Add a photo', 'Création de votre site…': 'Creating your website…',
  '★ champ requis. Vous pourrez tout modifier ensuite dans l’éditeur.': '★ required field. You can edit everything afterwards.',
  'Voici la situation de votre association en un coup d’œil.': 'Here is your association at a glance.', 'Créez votre site en un clic ✨': 'Create your website in one click ✨',
  'Lancer le générateur': 'Launch the builder', 'Logo, polices & couleurs': 'Logo, fonts & colors', 'Choisir un modèle': 'Choose a template', 'Éditer mon site': 'Edit my website',
  'Dons des 12 derniers mois': 'Donations over the last 12 months', 'Derniers dons': 'Latest donations', 'Aucun don enregistré pour le moment.': 'No donations recorded yet.',
  'Identité du site': 'Website identity', 'Enregistré': 'Saved', 'Police d’écriture': 'Font', 'Couleurs du site': 'Website colors',
  'Couleur principale (boutons, accents)': 'Primary color (buttons, accents)', 'Couleur de fond du site': 'Website background color', 'Couleur du texte': 'Text color',
  'Votre association': 'Your association', 'Faire un don': 'Donate', 'Ensemble, changeons les choses': 'Together, let’s make a difference',
  'Bouton plein': 'Filled button', 'Bouton contour': 'Outline button', 'Importer': 'Upload', 'Retirer': 'Remove', 'Traitement…': 'Processing…', 'Choisir une image': 'Choose an image',
  'Votre base de contacts et le classement des meilleurs donateurs.': 'Your contact database and top donor ranking.', 'Rechercher un donateur…': 'Search donors…',
  'Aucun donateur': 'No donors', 'Total donné': 'Total donated', 'Prénom': 'First name', 'Code postal': 'Postal code', 'Particulier': 'Individual', 'Entreprise': 'Company', 'Notes': 'Notes',
  'Nouveau': 'New', 'Nouvelle': 'New', 'Libellé': 'Description', 'Aucune': 'None', 'Opération': 'Transaction', 'Export comptable': 'Accounting export',
  'Catégories :': 'Categories:', '+ ajouter': '+ add', 'Aucune opération enregistrée': 'No transactions recorded', 'Ajouter une opération': 'Add a transaction',
  'Nouvelle opération': 'New transaction', 'Nouvelle catégorie': 'New category', 'Recettes, dépenses, catégories et solde de votre association.': 'Income, expenses, categories and your association balance.',
  'Nom, adresse du site, nom de domaine et abonnement.': 'Name, website address, domain and plan.', 'Nom de l’association / du site': 'Association / website name',
  'Choisir une cause': 'Choose a cause', 'Votre adresse gratuite, disponible immédiatement :': 'Your free address, available immediately:',
  'Par exemple mon-association.fr': 'For example my-association.org', 'Nous vous guidons, sans abonnement d’hébergement inutile': 'We guide you, with no unnecessary hosting plan',
  '1. Choisissez et achetez votre adresse': '1. Choose and purchase your domain', 'Chercher une adresse disponible': 'Find an available domain', 'Dernière étape': 'Final step',
  'Gérez vos bénévoles et leurs permissions, dans le détail.': 'Manage volunteers and their permissions in detail.', 'Inviter': 'Invite', 'Membres': 'Members', '(vous)': '(you)',
  'Invitations en attente': 'Pending invitations', 'Rôles personnalisés': 'Custom roles', 'Nouveau rôle': 'New role',
  'Aucun rôle personnalisé. Les rôles système suffisent souvent.': 'No custom roles. System roles are often enough.', 'Envoyer l’invitation': 'Send invitation',
  'Nom du rôle': 'Role name', 'Enregistrer le rôle': 'Save role', 'Choisissez le style de votre site': 'Choose your website style',
  'Choisir': 'Choose', 'Appliquer ce modèle ?': 'Apply this template?', 'Appliquer': 'Apply', 'Audience du site': 'Website audience', 'Visiteurs': 'Visitors', 'Vues': 'Views',
  'Protection animale': 'Animal welfare', 'Environnement': 'Environment', 'Santé & handicap': 'Health & disability', 'Culture & patrimoine': 'Culture & heritage',
  'Club sportif': 'Sports club', 'Humanitaire': 'Humanitarian aid', 'Solidarité locale': 'Local solidarity', 'Aînés': 'Older people', 'Enfance & éducation': 'Children & education',
};

const reverse = Object.fromEntries(Object.entries(translations).map(([fr, en]) => [en, fr]));
const LocaleContext = createContext({ locale: 'fr' as Locale, setLocale: (_: Locale) => {}, t: (value: string) => value });

function translateText(value: string, locale: Locale) {
  const leading = value.match(/^\s*/)?.[0] || '';
  const trailing = value.match(/\s*$/)?.[0] || '';
  const clean = value.trim();
  const table = locale === 'en' ? translations : reverse;
  let translated = table[clean];
  // Partial matching is useful to translate French sentences containing a
  // dynamic value. Never run it in reverse: "Continue" inside "Continuer"
  // would otherwise become "Continuerr" after a DOM update.
  if (!translated && locale === 'en' && clean.length > 8) {
    let partial = clean;
    for (const [source, target] of Object.entries(table)) {
      if (source.length >= 8 && partial.includes(source)) partial = partial.replaceAll(source, target);
    }
    if (partial !== clean) translated = partial;
  }
  return translated ? `${leading}${translated}${trailing}` : value;
}

function translateTree(root: Node, locale: Locale) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    if (node.parentElement?.closest('[data-no-translate], script, style')) return;
    const next = translateText(node.nodeValue || '', locale);
    if (next !== node.nodeValue) node.nodeValue = next;
  });
  if (root instanceof Element) {
    [root, ...Array.from(root.querySelectorAll('[placeholder],[title],[aria-label]'))].forEach((element) => {
      ['placeholder', 'title', 'aria-label'].forEach((attr) => {
        const value = element.getAttribute(attr);
        if (value) element.setAttribute(attr, translateText(value, locale));
      });
    });
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr');
  const pathname = usePathname();
  const isAssociationSite = pathname.startsWith('/s/') || pathname.startsWith('/domain/') || pathname.startsWith('/theme-preview/');
  useEffect(() => {
    const saved = localStorage.getItem('easyasso-language');
    const preferred = saved === 'en' || (!saved && navigator.language.toLowerCase().startsWith('en')) ? 'en' : 'fr';
    setLocaleState(preferred);
  }, []);
  useEffect(() => {
    if (!pathname.startsWith('/dashboard')) return;
    fetch('/api/organization/profile').then((response) => response.ok ? response.json() : null).then((profile) => {
      if (profile?.language === 'fr' || profile?.language === 'en') {
        localStorage.setItem('easyasso-language', profile.language);
        setLocaleState(profile.language);
      }
    }).catch(() => {});
    const onProfileLanguage = (event: Event) => {
      const language = (event as CustomEvent).detail;
      if (language === 'fr' || language === 'en') setLocaleState(language);
    };
    window.addEventListener('easyasso-language-change', onProfileLanguage);
    return () => window.removeEventListener('easyasso-language-change', onProfileLanguage);
  }, [pathname]);
  useEffect(() => {
    if (isAssociationSite) return;
    document.documentElement.lang = locale;
    translateTree(document.body, locale);
    const observer = new MutationObserver((changes) => changes.forEach((change) => {
      change.addedNodes.forEach((node) => translateTree(node, locale));
      if (change.type === 'characterData') translateTree(change.target, locale);
    }));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [locale, isAssociationSite]);
  const setLocale = (next: Locale) => {
    localStorage.setItem('easyasso-language', next);
    document.cookie = `easyasso-language=${next};path=/;max-age=31536000;samesite=lax`;
    setLocaleState(next);
  };
  const value = useMemo(() => ({ locale, setLocale, t: (text: string) => locale === 'en' ? translations[text] || text : text }), [locale]);
  return <LocaleContext.Provider value={value}>{children}{!isAssociationSite && <LanguageSwitcher />}</LocaleContext.Provider>;
}

export function useLanguage() { return useContext(LocaleContext); }

export function LanguageSwitcher() {
  const { locale, setLocale } = useContext(LocaleContext);
  return (
    <button type="button" onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')} className="fixed bottom-4 right-4 z-[100] flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-lg hover:border-brand-300 hover:text-brand-700" aria-label={locale === 'fr' ? 'Switch to English' : 'Passer en français'} data-no-translate>
      <Languages className="h-4 w-4" /> {locale === 'fr' ? 'EN' : 'FR'}
    </button>
  );
}
