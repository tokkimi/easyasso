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
  | 'html';

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
}[] = [
  { type: 'heading', label: 'Titre', icon: 'Heading', description: 'Un grand titre' },
  { type: 'text', label: 'Texte', icon: 'Type', description: 'Un paragraphe' },
  { type: 'image', label: 'Image', icon: 'Image', description: 'Une photo ou illustration' },
  { type: 'video', label: 'Vidéo', icon: 'Video', description: 'YouTube, Vimeo…' },
  { type: 'button', label: 'Bouton', icon: 'MousePointerClick', description: 'Un bouton cliquable' },
  { type: 'social', label: 'Réseaux sociaux', icon: 'Share2', description: 'Vos liens sociaux' },
  { type: 'columns', label: 'Colonnes', icon: 'Columns', description: '2 ou 3 colonnes de texte' },
  { type: 'spacer', label: 'Espace', icon: 'MoveVertical', description: 'Un espace vide' },
  { type: 'html', label: 'HTML / Intégration', icon: 'Code', description: 'HelloAsso, carte, code' },
];

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
