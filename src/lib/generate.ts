import { TEMPLATES, getTemplate, type BuiltTemplate } from './templates';

// Keyword signals to auto-pick the closest template from a free description.
const KEYWORDS: Record<string, string[]> = {
  'solidarite-alimentaire': ['alimentaire', 'repas', 'faim', 'nourriture', 'banque', 'épicerie', 'maraude', 'distribution', 'précarité', 'sans-abri'],
  'enfance-education': ['enfant', 'enfance', 'école', 'scolaire', 'éducation', 'jeunesse', 'orphelin', 'parrainage', 'jeunes'],
  'protection-animale': ['animal', 'animaux', 'chien', 'chat', 'refuge', 'adoption', 'spa', 'faune', 'maltraitance animale'],
  'environnement': ['environnement', 'climat', 'nature', 'planète', 'écologie', 'arbre', 'forêt', 'biodiversité', 'océan', 'déchet', 'pollution'],
  'sante-handicap': ['santé', 'maladie', 'handicap', 'médical', 'recherche', 'patient', 'hôpital', 'soin', 'cancer', 'autisme'],
  'culture-patrimoine': ['culture', 'patrimoine', 'art', 'musée', 'festival', 'musique', 'théâtre', 'histoire', 'spectacle', 'exposition'],
  'club-sportif': ['sport', 'club', 'football', 'basket', 'rugby', 'tennis', 'équipe', 'entraînement', 'compétition', 'gym', 'athlé'],
  'humanitaire': ['humanitaire', 'urgence', 'réfugié', 'international', 'eau', 'développement', 'afrique', 'crise', 'catastrophe'],
  'solidarite-locale': ['quartier', 'local', 'entraide', 'voisin', 'proximité', 'lien social', 'commune', 'habitant', 'insertion'],
  'aines': ['âgé', 'aîné', 'senior', 'personnes âgées', 'isolement', 'ehpad', 'retraité', 'solitude', 'vieillesse'],
};

export function pickTemplateId(description: string, category?: string): string {
  if (category && getTemplate(category)) return category;
  const text = (description || '').toLowerCase();
  let best = 'solidarite-locale';
  let bestScore = 0;
  for (const [id, words] of Object.entries(KEYWORDS)) {
    const score = words.reduce((s, w) => (text.includes(w) ? s + 1 : s), 0);
    if (score > bestScore) { bestScore = score; best = id; }
  }
  return best;
}

function firstSentence(text: string): string {
  const s = (text || '').trim().split(/(?<=[.!?])\s/)[0];
  return s.length > 160 ? s.slice(0, 157) + '…' : s;
}

// Fill an array of n slots from available photos (repeat if fewer than n).
function fillPhotos(photos: string[], fallback: string[], n: number): string[] {
  if (!photos.length) return fallback.slice(0, n);
  return Array.from({ length: n }, (_, i) => photos[i % photos.length]);
}

export interface GenerateInput {
  name: string;
  description: string;
  category?: string;
  logoUrl?: string;
  photos?: string[];
}

// Produce a fully customized template from a free description + assets.
export function buildGeneratedSite(input: GenerateInput): BuiltTemplate {
  const id = pickTemplateId(input.description, input.category);
  const base = getTemplate(id) || TEMPLATES[0];
  const t: BuiltTemplate = JSON.parse(JSON.stringify(base));
  const name = input.name?.trim() || 'Votre association';
  const photos = (input.photos || []).filter(Boolean);
  const desc = input.description?.trim();
  const subtitle = desc ? firstSentence(desc) : t.pages[0].blocks[0]?.content?.subtitle;

  t.name = name;
  t.header.logoText = name;
  t.header.logoUrl = input.logoUrl || undefined;
  t.footer.logoText = name;
  t.footer.logoUrl = input.logoUrl || undefined;
  if (desc) t.footer.text = firstSentence(desc);

  for (const page of t.pages) {
    for (const block of page.blocks) {
      const c: any = block.content;
      switch (block.type) {
        case 'banner':
          if (page.isHome) { c.title = name; if (subtitle) c.subtitle = subtitle; }
          if (photos[0]) c.image = photos[0];
          break;
        case 'textimage':
          if (desc) c.text = desc;
          if (photos.length) c.image = photos[1 % photos.length] || photos[0];
          break;
        case 'gallery':
          if (photos.length) c.images = fillPhotos(photos, c.images || [], (c.images?.length) || 6);
          break;
        case 'slideshow':
          if (photos.length) c.slides = fillPhotos(photos, [], Math.max(3, Math.min(photos.length, 5))).map((img, i) => ({ image: img, caption: (c.slides?.[i]?.caption) || '' }));
          break;
        case 'text':
          if (desc && page.slug === 'notre-action') c.text = desc;
          break;
      }
    }
  }
  return t;
}
