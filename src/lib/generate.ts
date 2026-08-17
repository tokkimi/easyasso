import { TEMPLATES, getTemplate, type BuiltTemplate } from './templates';
import { defaultStyleFor } from './blocks';

// Keyword signals to auto-pick the closest template from a free description.
const KEYWORDS: Record<string, string[]> = {
  'solidarite-alimentaire': ['alimentaire', 'repas', 'faim', 'nourriture', 'banque', 'épicerie', 'maraude', 'distribution', 'précarité', 'sans-abri'],
  'enfance-education': ['enfant', 'enfance', 'école', 'scolaire', 'éducation', 'jeunesse', 'orphelin', 'parrainage', 'jeunes'],
  'protection-animale': ['animal', 'animaux', 'chien', 'chat', 'refuge', 'adoption', 'spa', 'faune', 'maltraitance'],
  'environnement': ['environnement', 'climat', 'nature', 'planète', 'écologie', 'arbre', 'forêt', 'biodiversité', 'océan', 'déchet', 'pollution'],
  'sante-handicap': ['santé', 'maladie', 'handicap', 'médical', 'recherche', 'patient', 'hôpital', 'soin', 'cancer', 'autisme'],
  'culture-patrimoine': ['culture', 'patrimoine', 'art', 'musée', 'festival', 'musique', 'théâtre', 'histoire', 'spectacle', 'exposition'],
  'club-sportif': ['sport', 'club', 'football', 'basket', 'rugby', 'tennis', 'équipe', 'entraînement', 'compétition', 'gym', 'athlé'],
  'humanitaire': ['humanitaire', 'urgence', 'réfugié', 'international', 'eau', 'développement', 'afrique', 'crise', 'catastrophe'],
  'solidarite-locale': ['quartier', 'local', 'entraide', 'voisin', 'proximité', 'lien social', 'commune', 'habitant', 'insertion'],
  'aines': ['âgé', 'aîné', 'senior', 'personnes âgées', 'isolement', 'ehpad', 'retraité', 'solitude', 'vieillesse'],
};

export function pickTemplateId(text: string, category?: string): string {
  if (category && getTemplate(category)) return category;
  const t = (text || '').toLowerCase();
  let best = 'solidarite-locale';
  let bestScore = 0;
  for (const [id, words] of Object.entries(KEYWORDS)) {
    const score = words.reduce((s, w) => (t.includes(w) ? s + 1 : s), 0);
    if (score > bestScore) { bestScore = score; best = id; }
  }
  return best;
}

function firstSentence(text: string): string {
  const s = (text || '').trim().split(/(?<=[.!?])\s/)[0] || '';
  return s.length > 160 ? s.slice(0, 157) + '…' : s;
}
function para(parts: (string | undefined)[]): string {
  return parts.map((p) => (p || '').trim()).filter(Boolean).join('\n\n');
}
function fillPhotos(photos: string[], fallback: string[], n: number): string[] {
  if (!photos.length) return fallback.slice(0, n);
  return Array.from({ length: n }, (_, i) => photos[i % photos.length]);
}

export interface GenerateInput {
  name: string;
  year?: string;
  mission?: string;       // à propos / mission principale
  functioning?: string;   // comment l'association fonctionne
  goodToKnow?: string;    // choses à savoir
  beneficiaries?: string; // public aidé
  actions?: string;       // actions concrètes / activités
  news?: string;
  city?: string;
  email?: string;
  category?: string;
  logoUrl?: string;
  photos?: string[];
  description?: string;   // legacy free text
}

// Build developed, multi-paragraph copy from the questionnaire answers.
function composeCopy(input: GenerateInput) {
  const name = input.name?.trim() || 'notre association';
  const mission = (input.mission || input.description || '').trim();
  const yearSentence = input.year ? `Créée en ${input.year}, ${name} agit chaque jour au service de sa cause.` : '';
  const beneSentence = input.beneficiaries ? `Nous agissons en particulier en faveur de ${input.beneficiaries}.` : '';

  const valuesSentence = `Notre démarche repose sur l’écoute, la proximité et une action concrète, pensée avec les personnes concernées. Nous voulons inscrire chaque initiative dans la durée, mesurer son utilité et créer des liens solides entre bénéficiaires, bénévoles, adhérents et partenaires.`;
  const aboutText = para([yearSentence, mission, beneSentence, valuesSentence]) ||
    `${name} est une association engagée. Présentez ici votre mission et vos valeurs.`;

  const actionText = para([
    input.functioning || mission,
    input.actions ? `Sur le terrain, nous déployons plusieurs formes d’action complémentaires : ${input.actions}. Chaque intervention est préparée en fonction des besoins observés, organisée avec nos équipes puis améliorée grâce aux retours des participants.` : '',
    input.beneficiaries ? `Notre priorité est d’apporter une réponse accessible et respectueuse à ${input.beneficiaries}. Au-delà de l’aide immédiate, nous cherchons à renforcer l’autonomie, la confiance et la capacité d’agir de chacun.` : '',
    `Cette organisation nous permet de rester disponibles, de coordonner les bonnes volontés et de transformer les contributions reçues en actions visibles. Rejoindre l’association, c’est participer à un projet collectif dans lequel chaque compétence et chaque heure donnée peuvent faire une différence.`,
  ]) || 'Décrivez ici la manière dont votre association agit sur le terrain.';

  const goodToKnowText = (input.goodToKnow || '').trim();

  const contactText = para([
    input.email ? `Vous pouvez nous écrire à ${input.email}.` : '',
    input.city ? `Nous sommes basés à ${input.city}.` : '',
    'N’hésitez pas à nous contacter et à nous suivre sur les réseaux sociaux.',
  ]);

  const heroSubtitle = firstSentence(mission) || input.beneficiaries || '';
  const footerText = firstSentence(mission) || '';

  return { name, aboutText, actionText, goodToKnowText, contactText, heroSubtitle, footerText };
}

function reindex(pages: any[]) {
  for (const p of pages) p.blocks.forEach((b: any, i: number) => { b.order = i; });
}

// Produce a fully customized template from the questionnaire + assets.
export function buildGeneratedSite(input: GenerateInput): BuiltTemplate {
  const detectText = [input.mission, input.functioning, input.goodToKnow, input.beneficiaries, input.actions, input.description].filter(Boolean).join(' ');
  const id = pickTemplateId(detectText, input.category);
  const base = getTemplate(id) || TEMPLATES[0];
  const t: BuiltTemplate = JSON.parse(JSON.stringify(base));
  const copy = composeCopy(input);
  const photos = (input.photos || []).filter(Boolean);

  t.name = copy.name;
  t.header.logoText = copy.name;
  t.header.logoUrl = input.logoUrl || undefined;
  t.footer.logoText = copy.name;
  t.footer.logoUrl = input.logoUrl || undefined;
  if (copy.footerText) t.footer.text = copy.footerText;
  if (!input.news?.trim()) {
    t.pages = t.pages.filter((page) => page.slug !== 'actualites' && !/actualit/i.test(page.title));
  }

  for (const page of t.pages) {
    for (const block of page.blocks) {
      const c: any = block.content;
      switch (block.type) {
        case 'banner':
          if (page.isHome) { c.title = copy.name; if (copy.heroSubtitle) c.subtitle = copy.heroSubtitle; }
          if (photos[0]) c.image = photos[0];
          break;
        case 'textimage':
          c.text = copy.aboutText;
          if (photos.length) c.image = photos[1 % photos.length] || photos[0];
          break;
        case 'gallery':
          if (photos.length) c.images = fillPhotos(photos, c.images || [], (c.images?.length) || 6);
          break;
        case 'slideshow':
          if (photos.length) c.slides = fillPhotos(photos, [], Math.max(3, Math.min(photos.length, 5))).map((img, i) => ({ image: img, caption: c.slides?.[i]?.caption || '' }));
          break;
        case 'text':
          if (page.slug === 'notre-action') c.text = copy.actionText;
          if (page.slug === 'contact') c.text = copy.contactText;
          break;
      }
    }

    // Add a developed "Bon à savoir" section on the action page
    if (page.slug === 'notre-action' && copy.goodToKnowText) {
      page.blocks.push({ type: 'heading', order: 0, content: { text: 'Bon à savoir' }, style: defaultStyleFor('heading') });
      page.blocks.push({ type: 'text', order: 0, content: { text: copy.goodToKnowText }, style: defaultStyleFor('text') });
    }
  }

  // Same guarantee for the deterministic fallback: never lose submitted
  // contact data, even when a template changes its internal block order.
  const contact = t.pages.find((p) => p.slug === 'contact');
  if (contact && (input.email || input.city)) {
    const exact = [input.email ? `Email : ${input.email.trim()}` : '', input.city ? `Adresse : ${input.city.trim()}` : ''].filter(Boolean).join('\n\n');
    const text = contact.blocks.find((b: any) => b.type === 'text');
    if (text) text.content.text = `${exact}\n\n${copy.contactText}`;
  }

  reindex(t.pages);
  return t;
}
