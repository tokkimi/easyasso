import Anthropic from '@anthropic-ai/sdk';
import { getTemplate, TEMPLATES, templateImage, type BuiltTemplate } from './templates';
import { pickTemplateId, type GenerateInput } from './generate';
import { defaultStyleFor } from './blocks';

// Default to a strong copywriting model for per-signup generation.
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

const SYSTEM = `Tu es le concepteur-rédacteur de l'association. Tu n'es PAS un observateur qui décrit l'association : tu écris le site À SA PLACE, de l'intérieur, à la première personne du pluriel ("nous", "notre association", "nos bénévoles"). Le lecteur doit avoir l'impression que ce sont les membres eux-mêmes qui parlent de leur cause.

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
- {"type":"text","text":"paragraphe(s)"}
- {"type":"textimage","title":"...","text":"paragraphe","imageSide":"right"}
- {"type":"cards","title":"...","items":[{"icon":"Heart","title":"...","text":"..."}]}  (icônes possibles: Heart, Users, HandHeart, HandCoins, Star, Gift, Leaf, Home, BookOpen, Shield, Sparkles, Handshake)
- {"type":"cta","title":"...","text":"...","buttonText":"Faire un don"}
- {"type":"gallery"}  (galerie de photos, sans contenu)

Génère un site neuf comprenant : Accueil, Notre histoire, Nos actions, Notre impact, S'engager / Devenir bénévole, Faire un don, et Contact. Crée une page Actualités uniquement si des actualités sont fournies.

INTERDICTIONS ABSOLUES (c'est ici que se jouent les mauvais textes) :
1. NE PARLE JAMAIS DU SITE NI DES PAGES. Bannis toute phrase du genre « le site présente… », « cette page permet de comprendre… », « chaque page aide les visiteurs à… », « l'association présente sa cause de manière claire/accessible », « cette première lecture donne aux visiteurs une vision précise ». Tu n'écris pas la notice d'un site : tu écris directement le contenu. Parle de la CAUSE et des ACTIONS, jamais de la manière dont le site les présente.
2. AUCUNE MISE EN CONTEXTE STATISTIQUE OU DOCUMENTAIRE. Interdiction totale de citer des rapports, études, organismes ou repères « connus » (GIEC, IPBES, OMS, conventions internationales, etc.), même s'ils te semblent pertinents, ainsi que toute statistique, tout « constat social » général ou tout contexte historique inventé. N'utilise QUE les faits fournis dans le questionnaire. Aucun chiffre, date, lieu, partenaire, email ou résultat qui ne serait pas explicitement donné.
3. NE PLANTE JAMAIS le nom de l'association comme sujet brut d'une phrase bancale (ex : « Hello it's me agit avec les habitants »). Emploie le nom naturellement, ou remplace-le par « nous » / « notre association ».
4. NE RÉPÈTE JAMAIS deux fois le même titre, ni le même paragraphe d'une section ou d'une page à l'autre.

TRAITEMENT DES RÉPONSES DU QUESTIONNAIRE :
- Comprends et reformule chaque réponse ; ne colle jamais un champ brut dans une phrase si cela sonne faux.
- Si un champ est court, abrégé, mal orthographié ou écrit comme un mot-clé (ex. "LGBT", "jeunes", "quartier"), reformule-le en public / problématique compréhensible.
- N'utilise jamais de tournure mécanique du type « en faveur de [champ] » : préfère « auprès de », « avec », « pour accompagner », « pour défendre », « pour soutenir », selon le sens réel.
- Corrige discrètement les fautes évidentes des textes fournis, sans changer l'intention.
- Si le projet touche l'identité, l'expression de genre ou les personnes LGBT+, écris avec respect, précision et naturel.
- Interdiction des formulations vides : « nous faisons tout notre possible », « nous mettons tout en œuvre », « actions concrètes » sans dire lesquelles, « une cause importante » sans contenu.

RÈGLES DE RÉDACTION :
- Chaque page comporte 3 à 6 sections utiles, chacune avec un rôle éditorial différent (présentation, méthode, action, impact, engagement, contact). Deux blocs ne disent jamais la même chose avec les mêmes mots.
- Écris des textes concrets et humains. Longueur ADAPTÉE à la matière fournie : si l'association donne peu d'informations, fais des paragraphes courts et précis (2 à 4 phrases) — NE COMBLE JAMAIS le vide avec du contexte générique ou du remplissage. Développe seulement quand tu as de la vraie matière à raconter.
- L'accueil dit qui nous sommes, ce que nous faisons concrètement et comment aider — directement, sans méta-discours.
- La page actions transforme les informations fournies en actions concrètes et nommées.
- La page impact décrit ce que change notre action, sans inventer de chiffres.
- Le ton est chaleureux, direct, crédible et immédiatement publiable.`;

async function callClaude(prompt: string): Promise<AiSite | null> {
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 14000,
      // Copywriting doesn't need extended thinking; `budget_tokens` is also
      // rejected (400) on claude-sonnet-5, which would break generation.
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
    input.slogan ? `Slogan exact à afficher dans le pied de page : ${input.slogan}` : '',
    input.city ? `Ville : ${input.city}` : '',
    input.email ? `Email de contact : ${input.email}` : '',
  ].filter(Boolean);
  const languageInstruction = input.language === 'en'
    ? 'Write the ENTIRE generated website in natural, professional English. Every title, paragraph, button and navigation label must be in English.'
    : 'Rédige l’intégralité du site en français naturel et professionnel.';
  return `${languageInstruction}

Important : les informations ci-dessous peuvent être courtes, mal orthographiées ou incomplètes. Tu dois les comprendre, les reformuler et les transformer en vrais textes de site. Ne recopie pas bêtement les mots du questionnaire dans des phrases toutes faites.

Reste STRICTEMENT dans le périmètre de ces informations : parle de cette association, de sa cause et de ses actions telles qu'elles sont décrites ici. N'ajoute aucun contexte historique ou social, aucune statistique, aucune étude et aucune référence extérieure, même s'ils te semblent pertinents. Si une information manque, écris moins plutôt que de combler avec du contexte générique.

Crée le site complet de cette association :

${lines.join('\n')}`;
}

// Convert AI sections into our block model, injecting the association's photos.
function sectionsToBlocks(sections: Section[], photos: string[], seed: string, isHome: boolean, language: 'fr' | 'en') {
  let photoIdx = 0;
  let fallbackIdx = 20;
  const donateLabel = language === 'en' ? 'Donate' : 'Faire un don';
  const nextPhoto = (w: number, h: number) => {
    if (photoIdx < photos.length) return photos[photoIdx++];
    return templateImage(seed, fallbackIdx++, w, h);
  };
  const blocks: any[] = [];
  for (const s of sections) {
    switch (s.type) {
      case 'banner':
        blocks.push({ type: 'banner', content: { image: nextPhoto(1600, 720), title: s.title, subtitle: s.subtitle || '', overlay: 45, height: 460, button: { text: donateLabel, href: '/don', color: '#ffffff', variant: 'solid', align: 'center' } } });
        break;
      case 'heading':
        blocks.push({ type: 'heading', content: { text: s.text } });
        break;
      case 'text':
        blocks.push({ type: 'text', content: { text: s.text } });
        break;
      case 'textimage':
        blocks.push({ type: 'textimage', content: { title: s.title || '', text: s.text, image: nextPhoto(900, 700), imageSide: s.imageSide || 'right' } });
        break;
      case 'cards':
        blocks.push({ type: 'cards', content: { columns: Math.min(3, Math.max(2, (s.items || []).length)) || 3, items: (s.items || []).slice(0, 4).map((it) => ({ icon: it.icon || 'Heart', title: it.title, text: it.text })) } });
        break;
      case 'cta':
        blocks.push({ type: 'cta', content: { title: s.title, text: s.text || '', button: { text: s.buttonText || donateLabel, href: '/don', color: '#1b5df5', variant: 'solid', align: 'center' } }, style: { paddingY: 44 } });
        break;
      case 'gallery':
        blocks.push({ type: 'gallery', content: { columns: 3, images: Array.from({ length: 6 }, () => nextPhoto(600, 600)) } });
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
  const language = input.language === 'en' ? 'en' : 'fr';

  t.id = `${base.id}-ai-generated`;
  t.name = name;
  t.header.logoText = name;
  t.header.logoUrl = input.logoUrl || undefined;
  t.footer.logoText = name;
  t.footer.logoUrl = input.logoUrl || undefined;
  t.footer.text = input.slogan?.trim() || (input.language === 'en' ? 'Together, we make a difference.' : 'Ensemble, faisons la différence.');

  const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'page';
  let homeAssigned = false;
  const usedSlugs = new Set<string>();

  const aiPages = ai.pages.filter((p) => input.news?.trim() || !/actualit|news/i.test(`${p.slug} ${p.title}`));
  t.pages = aiPages.slice(0, 8).map((p, i) => {
    let slug = slugify(p.slug || p.title || `page-${i}`);
    while (usedSlugs.has(slug)) slug = `${slug}-${i}`;
    usedSlugs.add(slug);
    const isHome = !homeAssigned && (p.isHome || i === 0);
    if (isHome) homeAssigned = true;
    return { title: p.title || `Page ${i + 1}`, slug: isHome ? 'accueil' : slug, isHome, showInNav: true, blocks: sectionsToBlocks(p.sections || [], photos, seed, isHome, language) };
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
    input.email ? `Email${language === 'en' ? '' : ' '} : ${input.email.trim()}` : '',
    input.city ? (language === 'en' ? `We are based in ${input.city.trim()}.` : `Nous sommes basés à ${input.city.trim()}.`) : '',
    language === 'en'
      ? 'A question, a partnership idea or ready to get involved? Contact us: our team will be happy to reply.'
      : 'Une question, une proposition de partenariat ou l’envie de nous rejoindre ? Contactez-nous : notre équipe vous répondra avec plaisir.',
  ].filter(Boolean).join('\n\n');
  contact.blocks.unshift(
    { type: 'heading', order: 0, content: { text: language === 'en' ? 'Let’s talk about your involvement' : 'Parlons de votre engagement' }, style: defaultStyleFor('heading') },
    { type: 'text', order: 1, content: { text: contactLines }, style: defaultStyleFor('text') },
  );
  contact.blocks.forEach((block: any, order: number) => { block.order = order; });

  return t;
}
