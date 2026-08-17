// Block type definitions used by the visual editor and the public renderer.

export type Align = 'left' | 'center' | 'right';

export interface ButtonConfig {
  text: string;
  href: string;
  color: string;
  variant: 'solid' | 'outline';
  align: Align;
}

export interface SocialConfig {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
  tiktok?: string;
  align: Align;
}

export type BlockType =
  | 'heading'
  | 'text'
  | 'image'
  | 'video'
  | 'social'
  | 'button'
  | 'columns'
  | 'spacer'
  | 'html'
  // Rich, ready-made layout blocks
  | 'banner'
  | 'textimage'
  | 'gallery'
  | 'slideshow'
  | 'cards'
  | 'cta'
  | 'contact'
  | 'donation';

export interface BlockStyle {
  align?: Align;
  color?: string;
  background?: string;
  fontSize?: number;
  paddingY?: number;
}

export const BLOCK_LIBRARY: {
  type: BlockType;
  label: string;
  icon: string;
  description: string;
  group: 'layouts' | 'basics';
}[] = [
  // Ready-made layouts (shown first — the easy way)
  { type: 'banner', label: 'Bannière photo', icon: 'GalleryThumbnails', description: 'Grande photo + titre + bouton', group: 'layouts' },
  { type: 'textimage', label: 'Texte + image', icon: 'PanelsTopLeft', description: 'Un texte à côté d’une image', group: 'layouts' },
  { type: 'gallery', label: 'Galerie photos', icon: 'GalleryHorizontalEnd', description: 'Plusieurs photos en grille', group: 'layouts' },
  { type: 'slideshow', label: 'Diaporama', icon: 'Images', description: 'Photos qui défilent', group: 'layouts' },
  { type: 'cards', label: 'Cartes / colonnes', icon: 'LayoutGrid', description: '2 à 4 blocs illustrés', group: 'layouts' },
  { type: 'cta', label: 'Appel au don', icon: 'Megaphone', description: 'Bandeau avec bouton d’action', group: 'layouts' },
  { type: 'contact', label: 'Contact complet', icon: 'Mail', description: 'Coordonnées + formulaire prêt à recevoir des messages', group: 'layouts' },
  { type: 'donation', label: 'Questionnaire de dons', icon: 'HandCoins', description: 'Montants, coordonnées donateur, carte, virement et chèque', group: 'layouts' },
  // Basic building blocks
  { type: 'heading', label: 'Titre', icon: 'Heading', description: 'Un grand titre', group: 'basics' },
  { type: 'text', label: 'Texte', icon: 'Type', description: 'Un paragraphe', group: 'basics' },
  { type: 'image', label: 'Image', icon: 'Image', description: 'Une photo ou illustration', group: 'basics' },
  { type: 'video', label: 'Vidéo', icon: 'Video', description: 'YouTube, Vimeo…', group: 'basics' },
  { type: 'button', label: 'Bouton', icon: 'MousePointerClick', description: 'Un bouton cliquable', group: 'basics' },
  { type: 'social', label: 'Réseaux sociaux', icon: 'Share2', description: 'Vos liens sociaux', group: 'basics' },
  { type: 'columns', label: 'Colonnes de texte', icon: 'Columns', description: '2 ou 3 colonnes de texte', group: 'basics' },
  { type: 'spacer', label: 'Espace', icon: 'MoveVertical', description: 'Un espace vide', group: 'basics' },
  { type: 'html', label: 'HTML / Intégration', icon: 'Code', description: 'HelloAsso, carte, code', group: 'basics' },
];

const PH = (seed: string, w = 1200, h = 700) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

export function defaultContentFor(type: BlockType): Record<string, unknown> {
  switch (type) {
    case 'heading':
      return { text: 'Votre titre ici' };
    case 'text':
      return { text: 'Écrivez votre texte ici. Cliquez pour modifier.' };
    case 'image':
      return { url: '', alt: '', caption: '' };
    case 'video':
      return { url: '' };
    case 'button':
      return {
        button: { text: 'En savoir plus', href: '#', color: '#1b5df5', variant: 'solid', align: 'center' } as ButtonConfig,
      };
    case 'social':
      return { social: { align: 'center' } as SocialConfig };
    case 'columns':
      return { columns: ['Colonne 1', 'Colonne 2'] };
    case 'spacer':
      return { height: 40 };
    case 'html':
      return { html: '<!-- Collez ici un code d’intégration (HelloAsso, carte, formulaire) -->' };
    case 'banner':
      return {
        image: PH('banner', 1600, 700),
        title: 'Ensemble, changeons les choses',
        subtitle: 'Rejoignez notre association et soutenez notre cause.',
        overlay: 45,
        height: 460,
        button: { text: 'Faire un don', href: '/don', color: '#ffffff', variant: 'solid', align: 'center' } as ButtonConfig,
      };
    case 'textimage':
      return {
        title: 'Notre mission',
        text: 'Décrivez ici votre action, votre histoire ou vos valeurs. Ce texte s’affiche à côté d’une belle image.',
        image: PH('mission', 900, 700),
        imageSide: 'right',
        button: { text: 'En savoir plus', href: '#', color: '#1b5df5', variant: 'outline', align: 'left' } as ButtonConfig,
      };
    case 'gallery':
      return {
        columns: 3,
        images: [PH('g1', 600, 600), PH('g2', 600, 600), PH('g3', 600, 600), PH('g4', 600, 600), PH('g5', 600, 600), PH('g6', 600, 600)],
      };
    case 'slideshow':
      return {
        interval: 4,
        slides: [
          { image: PH('s1', 1400, 640), caption: 'Nos actions sur le terrain' },
          { image: PH('s2', 1400, 640), caption: 'Grâce à vos dons' },
          { image: PH('s3', 1400, 640), caption: 'Une équipe engagée' },
        ],
      };
    case 'cards':
      return {
        columns: 3,
        items: [
          { icon: 'Heart', title: 'Notre cause', text: 'Expliquez pourquoi votre association existe.' },
          { icon: 'Users', title: 'Nos bénévoles', text: 'Une équipe mobilisée au quotidien.' },
          { icon: 'HandHeart', title: 'Nous aider', text: 'Faites un don ou devenez bénévole.' },
        ],
      };
    case 'cta':
      return {
        title: 'Votre don a un impact réel',
        text: 'Chaque contribution nous permet d’agir concrètement. Merci de votre générosité.',
        button: { text: 'Je fais un don', href: '/don', color: '#1b5df5', variant: 'solid', align: 'center' } as ButtonConfig,
      };
    case 'contact':
      return { title: 'Contactez-nous', intro: 'Une question, une proposition ou envie de nous rejoindre ? Écrivez-nous.', email: '', phone: '', address: '', buttonText: 'Envoyer le message', successText: 'Merci, votre message a bien été envoyé.' };
    case 'donation':
      return { title: 'Soutenez notre action', intro: 'Votre générosité nous permet de poursuivre nos missions.', cardEnabled: false, stripeUrl: '', helloAssoUrl: '', transferEnabled: false, iban: '', bic: '', accountHolder: '', bankName: '', chequeEnabled: false, chequePayable: '', chequeAddress: '' };
    default:
      return {};
  }
}

export function defaultStyleFor(type: BlockType): BlockStyle {
  switch (type) {
    case 'heading':
      return { align: 'center', color: '#111827', fontSize: 36, paddingY: 16 };
    case 'text':
      return { align: 'left', color: '#374151', fontSize: 18, paddingY: 12 };
    case 'banner':
    case 'slideshow':
      return { paddingY: 0 };
    case 'textimage':
    case 'gallery':
    case 'cards':
      return { paddingY: 28 };
    case 'cta':
    case 'contact':
    case 'donation':
      return { paddingY: 40, background: '#f1f5ff' };
    default:
      return { align: 'center', paddingY: 16 };
  }
}

// ---- Header / Footer default configuration ----
export interface HeaderConfig {
  logoText: string;
  logoUrl?: string;
  showNav: boolean;
  sticky: boolean;
  background: string;
  textColor: string;
  cta?: ButtonConfig;
}

export interface FooterConfig {
  logoText: string;
  logoUrl?: string;
  text: string;
  showNewsletter: boolean;
  newsletterTitle: string;
  showCgv: boolean;
  cgvContent: string;
  showMentions: boolean;
  mentionsContent: string;
  allRightsText: string;
  background: string;
  textColor: string;
  columns: { title: string; links: { label: string; href: string }[] }[];
}

export const DEFAULT_HEADER: HeaderConfig = {
  logoText: 'Mon association',
  showNav: true,
  sticky: true,
  background: '#ffffff',
  textColor: '#1f2937',
  cta: { text: 'Faire un don', href: '/don', color: '#1b5df5', variant: 'solid', align: 'right' },
};

export const DEFAULT_FOOTER: FooterConfig = {
  logoText: 'Mon association',
  text: 'Ensemble, agissons pour une cause qui nous tient à cœur.',
  showNewsletter: true,
  newsletterTitle: 'Recevez nos actualités',
  showCgv: true,
  cgvContent: 'Conditions générales de vente / d’utilisation à compléter.',
  showMentions: true,
  mentionsContent: 'Mentions légales à compléter.',
  allRightsText: `© ${new Date().getFullYear()} Mon association. Tous droits réservés.`,
  background: '#111827',
  textColor: '#e5e7eb',
  columns: [
    { title: 'Association', links: [{ label: 'Accueil', href: '/' }] },
    { title: 'Nous soutenir', links: [{ label: 'Faire un don', href: '/don' }] },
  ],
};
