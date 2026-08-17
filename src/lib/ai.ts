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

Génère un site neuf, dans CET ORDRE de pages (les premières sont les plus importantes et doivent être écrites en premier) : Accueil, Nos actions, Notre impact, Notre histoire, S'engager / Devenir bénévole, Faire un don, et Contact. Crée une page Actualités (à la fin) uniquement si des actualités sont fournies.

INTERDICTIONS ABSOLUES (c'est ici que se jouent les mauvais textes) :
1. NE PARLE JAMAIS DU SITE NI DES PAGES. Bannis toute phrase du genre « le site présente… », « cette page permet de comprendre… », « chaque page aide les visiteurs à… », « l'association présente sa cause de manière claire/accessible », « cette première lecture donne aux visiteurs une vision précise ». Tu n'écris pas la notice d'un site : tu écris directement le contenu. Parle de la CAUSE et des ACTIONS, jamais de la manière dont le site les présente.
2. NE FABRIQUE JAMAIS un fait faux. Tu peux — et tu dois — mobiliser tes connaissances générales fiables (statistiques largement établies, repères historiques, cadres légaux, institutions et rapports reconnus), mais tu n'inventes jamais un chiffre précis, une date, un nom de rapport, une source ou un partenaire dont tu n'es pas sûr. En cas de doute sur un chiffre exact, donne un ordre de grandeur ou un constat qualitatif fiable (« une large part de… », « des centaines de milliers de personnes ») plutôt qu'un faux chiffre précis. Ne présente JAMAIS une statistique générale du secteur comme un résultat de CETTE association : les chiffres et résultats propres à l'association ne viennent que du questionnaire (de même pour adresse, email, partenaire, date).
3. NE PLANTE JAMAIS le nom de l'association comme sujet brut d'une phrase bancale (ex : « Hello it's me agit avec les habitants »). Emploie le nom naturellement, ou remplace-le par « nous » / « notre association ».
4. NE RÉPÈTE JAMAIS deux fois le même titre, ni le même paragraphe (ou une variante à peine reformulée) d'une section ou d'une page à l'autre. Chaque page apporte du contenu nouveau.
5. NE RECOPIE JAMAIS un champ du questionnaire tel quel, surtout s'il est en MAJUSCULES, abrégé ou en style télégraphique. Exemple à NE PAS FAIRE : « nous transformons ces priorités en actions : CAMPAGNES SUR LES RESEAUX SOCIAUX ». À FAIRE : « Nous menons des campagnes de sensibilisation sur les réseaux sociaux pour faire connaître la cause et mobiliser autour de nous. » Réécris toujours en phrases naturelles, en casse normale (jamais de bloc en majuscules).
6. N'ÉCRIS PAS SUR L'ASSOCIATION DE FAÇON ABSTRAITE ET NOMBRILISTE. Le donateur ou le visiteur se fiche de vos qualités auto-proclamées. Bannis : « nous sommes une association utile / sérieuse / crédible », « notre méthode, c'est d'accueillir sans jugement », « expliquer avant de demander un engagement », « cette exigence rend le projet crédible pour les donateurs », « une information simple ». Parle plutôt de la CAUSE, des PERSONNES concernées, de ce qui se passe CONCRÈTEMENT sur le terrain et de ce que change un don ou un coup de main.

TRAITEMENT DES RÉPONSES DU QUESTIONNAIRE :
- Comprends et reformule chaque réponse ; ne colle jamais un champ brut dans une phrase si cela sonne faux.
- Si un champ est court, abrégé, mal orthographié ou écrit comme un mot-clé (ex. "LGBT", "jeunes", "quartier"), reformule-le en public / problématique compréhensible.
- N'utilise jamais de tournure mécanique du type « en faveur de [champ] » : préfère « auprès de », « avec », « pour accompagner », « pour défendre », « pour soutenir », selon le sens réel.
- Corrige discrètement les fautes évidentes des textes fournis, sans changer l'intention.
- Si le projet touche l'identité, l'expression de genre ou les personnes LGBT+, écris avec respect, précision et naturel.
- Interdiction des formulations vides : « nous faisons tout notre possible », « nous mettons tout en œuvre », « actions concrètes » sans dire lesquelles, « une cause importante » sans contenu.

CONTEXTE, STATISTIQUES ET RÉFÉRENCES — déballe ta science, mais intelligemment :
- Enrichis les textes avec du VRAI contexte qui éclaire la cause : ampleur du problème, chiffres marquants du secteur, repères historiques, évolution des mentalités, cadre légal, rôle des associations. C'est ce qui rend le propos crédible et donne envie d'agir.
- Choisis des repères adaptés à la cause : GIEC / IPBES (climat, biodiversité), OMS ou Santé publique France (santé), Convention internationale des droits de l'enfant de 1989 (enfance), Restos du Cœur / aide alimentaire (précarité), histoire des luttes LGBTQIA+ (droits et discriminations), etc. Ne cite un repère que s'il éclaire vraiment le projet.
- Intègre-les NATURELLEMENT dans les phrases, jamais en liste ni en bibliographie. Une attribution légère suffit (« selon le GIEC… », « d'après l'OMS… », « les études de référence estiment que… »).
- Mieux vaut une ou deux données fortes et exactes qu'un empilement de chiffres. Le contexte doit servir le message, pas le noyer.
- Ne confonds pas le contexte du secteur (autorisé, connaissances générales fiables) avec les résultats de l'association (uniquement ceux du questionnaire).

RÈGLES DE RÉDACTION — DÉVELOPPE VRAIMENT (c'est essentiel) :
- Le site doit être RICHE et DÉVELOPPÉ. Chaque page a 4 à 6 sections. Chaque section "text" ou "textimage" fait 120 à 220 mots (2 à 4 vrais paragraphes), pleins de fond : contexte, faits, explications, exemples. Ne rends jamais une section creuse ou expédiée.
- POUR CHAQUE CAUSE ET CHAQUE ACTION, EXPLIQUE POURQUOI C'EST IMPORTANT. C'est la demande centrale : ne te contente pas de dire ce que vous faites, explique l'enjeu — quel problème, quelle ampleur (avec chiffres/contexte fiables du secteur), qui est touché et comment, ce qui se passe si personne n'agit, et ce que votre action change concrètement.
- LA PAGE « NOS ACTIONS » EST LA PLUS IMPORTANTE et la plus détaillée (5 à 6 sections) : décris chaque action une par une — en quoi elle consiste, pour qui, comment elle se déroule, pourquoi elle compte, ce qu'elle permet. C'est le cœur du site.
- Enchaîne les pages dans cet ordre de priorité (les premières sont écrites en premier) : Accueil, Nos actions, Notre impact, Notre histoire, S'engager, Faire un don, Contact.
- Chaque page a un rôle éditorial différent (présentation, contexte, action, impact, histoire, engagement, contact). Deux blocs ne disent jamais la même chose avec les mêmes mots.
- Nourris chaque page du contexte, des statistiques et des références de la section ci-dessus. « Développer » veut dire apporter de la matière réelle (contexte, faits, enjeux, exemples concrets) — jamais des phrases creuses, du méta-texte ni du nombrilisme.
- L'accueil dit qui nous sommes, pourquoi la cause compte (contexte et chiffres à l'appui), ce que nous faisons concrètement et comment aider.
- La page impact décrit ce que change notre action et rappelle l'enjeu global chiffré ; les résultats propres à l'association viennent du questionnaire, le contexte du secteur de tes connaissances fiables.
- Le ton est chaleureux, direct, crédible, développé et immédiatement publiable.`;

// Walk the "pages" array object by object, brace-matching and respecting
// strings, so we can recover every COMPLETE page even if the response was cut
// off mid-array (token cap). The important "Nos actions" page comes early and
// is preserved even when the tail is truncated.
function salvagePages(body: string): AiSite['pages'] {
  const key = body.indexOf('"pages"');
  if (key < 0) return [];
  let i = body.indexOf('[', key);
  if (i < 0) return [];
  const pages: any[] = [];
  i++;
  while (i < body.length) {
    while (i < body.length && body[i] !== '{' && body[i] !== ']') i++;
    if (i >= body.length || body[i] === ']') break;
    let depth = 0, inStr = false, esc = false;
    const start = i;
    for (; i < body.length; i++) {
      const ch = body[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === '\\') esc = true;
        else if (ch === '"') inStr = false;
      } else if (ch === '"') inStr = true;
      else if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) { i++; break; } }
    }
    if (depth !== 0) break; // last object is truncated → stop
    try {
      const obj = JSON.parse(body.slice(start, i));
      if (obj && Array.isArray(obj.sections)) pages.push(obj);
    } catch { /* skip a malformed page, keep the rest */ }
  }
  return pages;
}

function parseAiSite(text: string): AiSite | null {
  const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = cleaned.indexOf('{');
  if (start < 0) return null;
  const body = cleaned.slice(start);
  // 1) Strict parse of the whole object (normal case).
  const end = body.lastIndexOf('}');
  if (end > 0) {
    try {
      const obj = JSON.parse(body.slice(0, end + 1)) as AiSite;
      if (obj && Array.isArray(obj.pages) && obj.pages.length) return obj;
    } catch { /* fall through to salvage */ }
  }
  // 2) Salvage complete pages from a truncated response.
  const pages = salvagePages(body);
  if (pages.length) {
    const tag = body.match(/"tagline"\s*:\s*"([^"]*)"/);
    return { tagline: tag?.[1] || '', pages };
  }
  return null;
}

// The route runs under a 60s serverless limit. Rich, multi-page generation can
// exceed that; if the platform kills the function mid-request we lose
// everything. So we stream, accumulate text as it arrives, and self-abort a few
// seconds before the limit — then salvage the pages that already completed.
// Because the prompt emits pages in priority order (Accueil, Nos actions…), the
// important pages survive even when the tail is cut.
const GENERATION_DEADLINE_MS = 50000;

async function callClaude(prompt: string): Promise<AiSite | null> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  let buffer = '';
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: 'disabled' },
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    });
    stream.on('text', (delta) => { buffer += delta; });

    const completed = stream.finalMessage().then(() => true).catch((e) => {
      console.error('AI stream error:', e);
      return false;
    });
    const deadline = new Promise<'deadline'>((resolve) => {
      timer = setTimeout(() => resolve('deadline'), GENERATION_DEADLINE_MS);
    });
    const outcome = await Promise.race([completed, deadline]);
    if (outcome === 'deadline') { try { stream.abort(); } catch { /* already settled */ } }

    // `buffer` holds all text emitted so far — the whole response when the
    // stream finished, or a valid prefix when we aborted at the deadline.
    return parseAiSite(buffer.trim());
  } catch (e) {
    console.error('AI generation failed:', e);
    return parseAiSite(buffer.trim()); // salvage anything we captured
  } finally {
    if (timer) clearTimeout(timer);
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

Appuie-toi sur ces informations pour parler de CETTE association, de sa cause et de ses actions, puis enrichis-les avec du contexte fiable : ampleur du problème, statistiques marquantes, repères historiques, cadre légal, références connues — intégrés naturellement et seulement s'ils éclairent la cause. Ne fabrique jamais un chiffre précis faux et ne prête jamais à l'association un résultat qui n'est pas dans le questionnaire.

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
