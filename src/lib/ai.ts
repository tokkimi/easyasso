import Anthropic from '@anthropic-ai/sdk';
import { getTemplate, TEMPLATES, templateImage, type BuiltTemplate } from './templates';
import { pickTemplateId, type GenerateInput } from './generate';
import { defaultStyleFor } from './blocks';

// Default to a fast, cost-appropriate model for per-signup generation.
// Override with ANTHROPIC_MODEL (e.g. claude-opus-5) if desired.
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

export function aiEnabled() {
  return !!process.env.ANTHROPIC_API_KEY;
}

type Section =
  | { type: 'banner'; title: string; subtitle?: string }
  | { type: 'heading'; text: string }
  | { type: 'text'; text: string }
  | { type: 'textimage'; title?: string; text: string; imageSide?: 'left' | 'right' }
  | { type: 'cards'; title?: string; items: { icon?: string; title: string; text: string }[] }
  | { type: 'cta'; title: string; text?: string; buttonText?: string }
  | { type: 'gallery' };

interface AiSite {
  tagline: string;
  pages: { title: string; slug: string; isHome?: boolean; sections: Section[] }[];
}

const SYSTEM = `Tu es directeur éditorial, concepteur-rédacteur senior et expert des associations françaises.
À partir des informations d'une association, tu rédiges le contenu COMPLET d'un site vitrine, en français, avec des textes riches, chaleureux, concrets et bien écrits (pas de texte générique de remplissage).

Tu réponds UNIQUEMENT avec un objet JSON valide (aucun texte avant ou après, pas de balises markdown), respectant ce format :
{
  "tagline": "phrase courte d'accroche",
  "pages": [
    { "title": "Accueil", "slug": "accueil", "isHome": true, "sections": [ ... ] },
    ...
  ]
}
Chaque "section" a un "type" parmi :
- {"type":"banner","title":"...","subtitle":"..."}  (grande bannière, uniquement en haut de l'accueil)
- {"type":"heading","text":"..."}
- {"type":"text","text":"paragraphe(s) développé(s), 2 à 5 phrases"}
- {"type":"textimage","title":"...","text":"paragraphe développé","imageSide":"right"}
- {"type":"cards","title":"...","items":[{"icon":"Heart","title":"...","text":"..."}]}  (icônes possibles: Heart, Users, HandHeart, HandCoins, Star, Gift, Leaf, Home, BookOpen, Shield, Sparkles, Handshake)
- {"type":"cta","title":"...","text":"...","buttonText":"Faire un don"}
- {"type":"gallery"}  (galerie de photos, sans contenu)

Génère obligatoirement un site entièrement neuf comprenant au minimum : Accueil, Notre histoire, Nos actions, Notre impact, S'engager / Devenir bénévole, Faire un don, Actualités et Contact.

RÈGLES ÉDITORIALES OBLIGATOIRES :
- Chaque page comporte 4 à 7 sections utiles et différentes.
- Chaque section de texte contient 120 à 220 mots, répartis en 2 à 4 paragraphes.
- Les cartes contiennent des explications concrètes de 35 à 70 mots chacune.
- L'accueil raconte la cause, la réponse de l'association, ses actions, son impact et les façons d'aider.
- La page histoire développe l'origine, les valeurs, la méthode et la vision.
- La page actions transforme toutes les informations fournies en programmes précis, jamais en généralités.
- La page impact explique les résultats attendus sans inventer de chiffres absents des réponses.
- La page engagement détaille bénévolat, adhésion, partenariat et relais de communication.
- Ne répète pas le même paragraphe d'une page à l'autre.
- N'invente jamais d'adresse, d'email, de chiffre, de partenaire, de date ou de résultat.
- Le ton doit être humain, crédible, spécifique à la cause et directement publiable.
- Utilise toutes les informations du questionnaire, même les détails secondaires.`;

async function callClaude(prompt: string): Promise<AiSite | null> {
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 14000,
      // Copywriting doesn't need thinking; disable for speed/latency.
      thinking: { type: 'disabled' },
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim();
    const json = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
    const start = json.indexOf('{');
    const end = json.lastIndexOf('}');
    if (start < 0 || end < 0) return null;
    return JSON.parse(json.slice(start, end + 1)) as AiSite;
  } catch (e) {
    console.error('AI generation failed:', e);
    return null;
  }
}

function buildPrompt(input: GenerateInput): string {
  const lines = [
    `Nom de l'association : ${input.name || 'Non précisé'}`,
    input.year ? `Année de création : ${input.year}` : '',
    input.mission ? `Mission / à propos : ${input.mission}` : '',
    input.functioning ? `Fonctionnement : ${input.functioning}` : '',
    input.actions ? `Actions / activités : ${input.actions}` : '',
    input.beneficiaries ? `Public aidé : ${input.beneficiaries}` : '',
    input.goodToKnow ? `Choses à savoir : ${input.goodToKnow}` : '',
    input.news ? `Actualités à publier : ${input.news}` : 'Aucune actualité fournie : ne pas créer de page Actualités.',
    input.city ? `Ville : ${input.city}` : '',
    input.email ? `Email de contact : ${input.email}` : '',
  ].filter(Boolean);
  return `Crée le site complet de cette association :\n\n${lines.join('\n')}`;
}

// Convert AI sections into our block model, injecting the association's photos.
function sectionsToBlocks(sections: Section[], photos: string[], seed: string, isHome: boolean) {
  let photoIdx = 0;
  const nextPhoto = (fallback: string) => (photos.length ? photos[photoIdx++ % photos.length] : fallback);
  const blocks: any[] = [];
  for (const s of sections) {
    switch (s.type) {
      case 'banner':
        blocks.push({ type: 'banner', content: { image: nextPhoto(templateImage(seed, 0, 1600, 720)), title: s.title, subtitle: s.subtitle || '', overlay: 45, height: 460, button: { text: 'Faire un don', href: '/don', color: '#ffffff', variant: 'solid', align: 'center' } } });
        break;
      case 'heading':
        blocks.push({ type: 'heading', content: { text: s.text } });
        break;
      case 'text':
        blocks.push({ type: 'text', content: { text: s.text } });
        break;
      case 'textimage':
        blocks.push({ type: 'textimage', content: { title: s.title || '', text: s.text, image: nextPhoto(templateImage(seed, blocks.length + 1, 900, 700)), imageSide: s.imageSide || 'right' } });
        break;
      case 'cards':
        blocks.push({ type: 'cards', content: { columns: Math.min(3, Math.max(2, (s.items || []).length)) || 3, items: (s.items || []).slice(0, 4).map((it) => ({ icon: it.icon || 'Heart', title: it.title, text: it.text })) } });
        break;
      case 'cta':
        blocks.push({ type: 'cta', content: { title: s.title, text: s.text || '', button: { text: s.buttonText || 'Faire un don', href: '/don', color: '#1b5df5', variant: 'solid', align: 'center' } }, style: { paddingY: 44 } });
        break;
      case 'gallery':
        blocks.push({ type: 'gallery', content: { columns: 3, images: Array.from({ length: 6 }, (_, i) => nextPhoto(templateImage(seed, i, 600, 600))) } });
        break;
    }
  }
  return blocks.map((b, order) => ({ type: b.type, order, content: b.content, style: { ...defaultStyleFor(b.type), ...(b.style || {}) } }));
}

// Full AI generation → a customized template (theme/chrome from the closest
// preset, pages/content written by Claude).
export async function aiGenerateSite(input: GenerateInput): Promise<BuiltTemplate | null> {
  if (!aiEnabled()) return null;
  const ai = await callClaude(buildPrompt(input));
  if (!ai || !Array.isArray(ai.pages) || ai.pages.length === 0) return null;

  const detect = [input.mission, input.functioning, input.goodToKnow, input.beneficiaries, input.actions].filter(Boolean).join(' ');
  const baseId = pickTemplateId(detect, input.category);
  const base = getTemplate(baseId) || TEMPLATES[0];
  const t: BuiltTemplate = JSON.parse(JSON.stringify(base));
  const name = input.name?.trim() || 'Votre association';
  const photos = (input.photos || []).filter(Boolean);
  const seed = baseId;

  t.name = name;
  t.header.logoText = name;
  t.header.logoUrl = input.logoUrl || undefined;
  t.footer.logoText = name;
  t.footer.logoUrl = input.logoUrl || undefined;
  if (ai.tagline) t.footer.text = ai.tagline;

  const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'page';
  let homeAssigned = false;
  const usedSlugs = new Set<string>();

  const aiPages = ai.pages.filter((p) => input.news?.trim() || !/actualit/i.test(`${p.slug} ${p.title}`));
  t.pages = aiPages.slice(0, 8).map((p, i) => {
    let slug = slugify(p.slug || p.title || `page-${i}`);
    while (usedSlugs.has(slug)) slug = `${slug}-${i}`;
    usedSlugs.add(slug);
    const isHome = !homeAssigned && (p.isHome || i === 0);
    if (isHome) homeAssigned = true;
    return { title: p.title || `Page ${i + 1}`, slug: isHome ? 'accueil' : slug, isHome, showInNav: true, blocks: sectionsToBlocks(p.sections || [], photos, seed, isHome) };
  });
  if (!homeAssigned && t.pages[0]) t.pages[0].isHome = true;

  // Contact details are authoritative user data, not copywriting. Inject them
  // after the AI response so the model can never omit, alter or hallucinate
  // the email/city supplied in the questionnaire.
  let contact = t.pages.find((p) => p.slug === 'contact' || /contact/i.test(p.title));
  if (!contact) {
    contact = { title: 'Contact', slug: 'contact', isHome: false, showInNav: true, blocks: [] };
    t.pages.push(contact);
  }
  const contactLines = [
    input.email ? `Email : ${input.email.trim()}` : '',
    input.city ? `Nous sommes basés à ${input.city.trim()}.` : '',
    'Une question, une proposition de partenariat ou l’envie de nous rejoindre ? Contactez-nous : notre équipe vous répondra avec plaisir.',
  ].filter(Boolean).join('\n\n');
  contact.blocks.unshift(
    { type: 'heading', order: 0, content: { text: 'Parlons de votre engagement' }, style: defaultStyleFor('heading') },
    { type: 'text', order: 1, content: { text: contactLines }, style: defaultStyleFor('text') },
  );
  contact.blocks.forEach((block: any, order: number) => { block.order = order; });

  return t;
}
