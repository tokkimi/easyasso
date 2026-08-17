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
  'Ce que l’outil prépare pour vous': 'What the builder creates for you',
  'Une page d’accueil convaincante': 'A compelling homepage', 'Votre histoire et votre mission': 'Your story and mission',
  'Des pages dédiées à vos actions': 'Dedicated pages for your activities', 'Une présentation claire de votre impact': 'A clear presentation of your impact',
  'Des parcours pour adhérer, aider ou donner': 'Journeys to join, help or donate', 'Une page contact avec vos vraies coordonnées': 'A contact page with your real details',
  'Essayer l’outil magique': 'Try the magic builder', 'Aucune page générique copiée-collée': 'No generic copy-and-paste pages',
};

const reverse = Object.fromEntries(Object.entries(translations).map(([fr, en]) => [en, fr]));
const LocaleContext = createContext({ locale: 'fr' as Locale, setLocale: (_: Locale) => {}, t: (value: string) => value });

function translateText(value: string, locale: Locale) {
  const leading = value.match(/^\s*/)?.[0] || '';
  const trailing = value.match(/\s*$/)?.[0] || '';
  const clean = value.trim();
  const translated = locale === 'en' ? translations[clean] : reverse[clean];
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
  useEffect(() => {
    const saved = localStorage.getItem('easyasso-language');
    const preferred = saved === 'en' || (!saved && navigator.language.toLowerCase().startsWith('en')) ? 'en' : 'fr';
    setLocaleState(preferred);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    translateTree(document.body, locale);
    const observer = new MutationObserver((changes) => changes.forEach((change) => {
      change.addedNodes.forEach((node) => translateTree(node, locale));
      if (change.type === 'characterData') translateTree(change.target, locale);
    }));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [locale]);
  const setLocale = (next: Locale) => {
    localStorage.setItem('easyasso-language', next);
    document.cookie = `easyasso-language=${next};path=/;max-age=31536000;samesite=lax`;
    setLocaleState(next);
  };
  const value = useMemo(() => ({ locale, setLocale, t: (text: string) => locale === 'en' ? translations[text] || text : text }), [locale]);
  const isAssociationSite = pathname.startsWith('/s/') || pathname.startsWith('/domain/') || pathname.startsWith('/theme-preview/');
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
