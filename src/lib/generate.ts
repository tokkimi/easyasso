import { TEMPLATES, getTemplate, createPhotoAllocator, type BuiltTemplate } from './templates';
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
// Site-wide dispenser that never repeats an image (uploaded photos first, then
// the cause's themed photos — Unsplash-fetched when available, else curated).
function createImagePicker(photos: string[], seed: string, themePhotos: string[] = []) {
  return createPhotoAllocator(seed, photos, themePhotos);
}

function clean(value = '') {
  return value.replace(/\s+/g, ' ').trim();
}

function stripAccents(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function ensureSentence(value = '') {
  const v = clean(value);
  if (!v) return '';
  return /[.!?…]$/.test(v) ? v : `${v}.`;
}

// A field typed in ALL CAPS ("CAMPAGNES SUR LES RESEAUX SOCIAUX") reads as
// shouting when pasted into prose. Bring it back to a normal sentence case,
// leaving short acronyms (LGBT, SPA…) untouched.
function deShout(value = '') {
  const words = clean(value).split(' ');
  const deshouted = words.map((w) => {
    const letters = w.replace(/[^A-Za-zÀ-ÿ]/g, '');
    if (letters.length > 3 && letters === letters.toUpperCase()) return w.toLowerCase();
    return w;
  }).join(' ');
  return deshouted ? deshouted.charAt(0).toUpperCase() + deshouted.slice(1) : deshouted;
}

function polishUserText(value = '') {
  return ensureSentence(deShout(clean(value))
    .replace(/\bLGBTQIA\+?\b/gi, 'LGBTQIA+')
    .replace(/\bLGBTQ\+?\b/gi, 'LGBTQ+')
    .replace(/\bLGBT\+?\b/gi, 'LGBT+')
    .replace(/\bfille ou g[as]rcon\b/gi, 'filles, garçons et personnes non-binaires')
    .replace(/\bfille ou garçon\b/gi, 'filles, garçons et personnes non-binaires')
    .replace(/\bsi on veut\b/gi, 'librement')
  );
}

type CauseProfile = {
  id: string;
  audienceFr: string;
  audienceEn: string;
  missionFr: string;
  missionEn: string;
  actionFr: string;
  actionEn: string;
  impactFr: string;
  impactEn: string;
  cardsFr: { icon: string; title: string; text: string }[];
  cardsEn: { icon: string; title: string; text: string }[];
};

const CAUSES: CauseProfile[] = [
  {
    id: 'identity',
    audienceFr: 'les personnes LGBT+, les jeunes, les familles et toutes celles et ceux qui veulent vivre leur identité ou leur expression de genre librement',
    audienceEn: 'LGBTQ+ people, young people, families and anyone who wants to live their identity or gender expression freely',
    missionFr: 'Nous défendons une idée simple : chacun doit pouvoir choisir son apparence, ses vêtements et sa manière d’être sans subir de jugement, de moquerie ou d’exclusion. Nous créons un cadre rassurant où les personnes concernées sont écoutées, orientées et soutenues avec respect.',
    missionEn: 'The project is built on a simple idea: everyone should be able to choose how they look, dress and express themselves without judgement, mockery or exclusion. The association creates a safe setting where people can be listened to, guided and supported with respect.',
    actionFr: 'Les actions peuvent prendre la forme d’ateliers de sensibilisation, de temps d’échange, de ressources pédagogiques, d’accompagnement individuel et de campagnes de visibilité. L’objectif est d’aider chacun à mieux comprendre ces sujets et à construire des environnements plus accueillants.',
    actionEn: 'Activities may include awareness workshops, discussion groups, educational resources, individual support and visibility campaigns. The goal is to help people understand these issues better and build more welcoming environments.',
    impactFr: 'L’impact attendu est concret : davantage de confiance, moins d’isolement, des proches mieux informés et des lieux de vie plus respectueux. Chaque action vise à transformer une conviction en soutien réel pour les personnes concernées.',
    impactEn: 'The expected impact is practical: more confidence, less isolation, better-informed relatives and more respectful everyday spaces. Each action turns a conviction into real support for the people concerned.',
    cardsFr: [
      { icon: 'Users', title: 'Écoute', text: 'Créer des espaces où chacun peut parler de son vécu, poser ses questions et trouver une réponse respectueuse, sans jugement ni pression.' },
      { icon: 'BookOpen', title: 'Sensibilisation', text: 'Expliquer les enjeux liés à l’identité, au genre et aux discriminations avec des mots simples, accessibles aux familles, écoles, clubs et partenaires.' },
      { icon: 'Sparkles', title: 'Confiance', text: 'Encourager la liberté d’être soi-même et donner aux personnes concernées des repères pour avancer avec plus de sécurité et de sérénité.' },
    ],
    cardsEn: [
      { icon: 'Users', title: 'Listening', text: 'Create spaces where people can share their experience, ask questions and receive respectful answers without judgement or pressure.' },
      { icon: 'BookOpen', title: 'Awareness', text: 'Explain identity, gender and discrimination issues in clear words for families, schools, clubs and partners.' },
      { icon: 'Sparkles', title: 'Confidence', text: 'Encourage the freedom to be oneself and give people practical support to move forward with more safety and serenity.' },
    ],
  },
  {
    id: 'community',
    audienceFr: 'les habitants, bénévoles, adhérents et partenaires du territoire',
    audienceEn: 'local residents, volunteers, members and community partners',
    missionFr: 'Nous partons d’un besoin de proximité : renforcer les liens, repérer les difficultés et proposer des réponses simples, humaines et utiles au quotidien. Nous sommes un point d’appui local, qui rassemble les bonnes volontés autour d’actions concrètes.',
    missionEn: 'The project starts from a local need: strengthening relationships, identifying difficulties and offering simple, human and useful answers in everyday life. The association acts as a local anchor that brings goodwill together around concrete action.',
    actionFr: 'Les actions s’organisent autour de rencontres, d’entraide, d’ateliers, d’initiatives solidaires et de moments collectifs. Chaque proposition est pensée pour être facile à rejoindre, utile sur le terrain et adaptée aux besoins réellement exprimés.',
    actionEn: 'Activities are built around meetings, mutual aid, workshops, solidarity initiatives and collective moments. Each project is designed to be easy to join, useful on the ground and adapted to real needs.',
    impactFr: 'L’impact recherché est de rendre la solidarité plus visible et plus accessible : moins d’isolement, plus de coopération, des habitants mieux informés et une dynamique locale qui dure.',
    impactEn: 'The expected impact is to make solidarity more visible and accessible: less isolation, more cooperation, better-informed residents and a local dynamic that lasts.',
    cardsFr: [
      { icon: 'Handshake', title: 'Entraide', text: 'Mettre en relation les personnes, les compétences et les ressources disponibles pour répondre plus vite aux besoins du terrain.' },
      { icon: 'Home', title: 'Proximité', text: 'Rester proche des habitants et construire des actions à taille humaine, compréhensibles et faciles à rejoindre.' },
      { icon: 'Star', title: 'Mobilisation', text: 'Donner envie de participer, même ponctuellement, en montrant que chaque geste peut renforcer le collectif.' },
    ],
    cardsEn: [
      { icon: 'Handshake', title: 'Mutual aid', text: 'Connect people, skills and available resources so local needs can receive a quicker and more practical response.' },
      { icon: 'Home', title: 'Local presence', text: 'Stay close to residents and build human-scale initiatives that are clear, useful and easy to join.' },
      { icon: 'Star', title: 'Mobilisation', text: 'Encourage people to take part, even occasionally, by showing that every contribution can strengthen the community.' },
    ],
  },
];

function inferCause(input: GenerateInput) {
  const text = stripAccents([input.mission, input.functioning, input.goodToKnow, input.beneficiaries, input.actions, input.description, input.category].filter(Boolean).join(' ').toLowerCase());
  if (/\blgbt|lgbtq|genre|gender|jupe|vetement|identite|discrimin/.test(text)) return CAUSES[0];
  return CAUSES[1];
}

function audienceFrom(input: GenerateInput, cause: CauseProfile, language: 'fr' | 'en') {
  const raw = clean(input.beneficiaries || '');
  const normalized = stripAccents(raw.toLowerCase());
  if (!raw || raw.length < 4) return language === 'en' ? cause.audienceEn : cause.audienceFr;
  if (cause.id === 'identity' || /\blgbt|lgbtq|genre|jupe|fille|garcon|vetement|identite/.test(normalized)) {
    return language === 'en' ? cause.audienceEn : cause.audienceFr;
  }
  if (raw.length < 12 && !raw.includes(' ')) {
    return language === 'en' ? 'the people directly concerned by this cause' : 'les personnes directement concernées par cette cause';
  }
  return polishUserText(raw).replace(/[.!?…]$/, '');
}

function missionFrom(input: GenerateInput, cause: CauseProfile, name: string, language: 'fr' | 'en') {
  const raw = polishUserText(input.mission || input.description || '');
  const normalized = stripAccents(raw.toLowerCase());
  if (!raw) return language === 'en' ? cause.missionEn : cause.missionFr;
  if (cause.id === 'identity' && /\bjupe|vetement|fille|garcon|genre|lgbt/.test(normalized)) {
    return language === 'en' ? cause.missionEn : cause.missionFr;
  }
  if (raw.length < 90) {
    return language === 'en'
      ? `${name} is built around a clear commitment: ${raw} This starting point is transformed into concrete support, useful information and practical actions for the people concerned.`
      : `${name} porte un engagement clair : ${raw} Ce point de départ devient un projet concret, avec de l’écoute, des informations utiles et des actions pensées pour les personnes concernées.`;
  }
  return raw;
}

export interface GenerateInput {
  name: string;
  language?: 'fr' | 'en';
  // What the site is for: 'association' (default), 'shop', 'business', 'other'.
  kind?: string;
  // Chosen at magic generation: 'association' | 'shop' | 'other'. Drives the
  // questionnaire wording and the AI's tone / page structure.
  siteType?: 'association' | 'shop' | 'other';
  hasShop?: boolean;
  slogan?: string;
  generateCgv?: boolean;
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
  const language = input.language === 'en' ? 'en' : 'fr';
  const cause = inferCause(input);
  const audience = audienceFrom(input, cause, language);
  const mission = missionFrom(input, cause, name, language);
  const functioning = polishUserText(input.functioning || '');
  const actions = polishUserText(input.actions || '');
  const goodToKnow = polishUserText(input.goodToKnow || '');

  const yearSentence = input.year
    ? (language === 'en'
      ? `Founded in ${input.year}${input.city ? ` in ${input.city}` : ''}, ${name} has developed around a clear and useful purpose.`
      : `Créée en ${input.year}${input.city ? ` à ${input.city}` : ''}, ${name} s’est construite autour d’une utilité claire et d’un engagement de terrain.`)
    : '';
  const audienceSentence = language === 'en'
    ? `We work first and foremost alongside ${audience}, with concrete support and action on the ground.`
    : `Nous agissons en priorité auprès de ${audience}, avec un soutien et des actions concrètes sur le terrain.`;
  const valuesSentence = language === 'en'
    ? `Every action is shaped with and for the people concerned, and with the volunteers, members and partners who make it possible.`
    : `Chaque action est construite avec et pour les personnes concernées, ainsi qu’avec les bénévoles, adhérents et partenaires qui la rendent possible.`;
  const aboutText = para([yearSentence, mission, audienceSentence, valuesSentence]) ||
    (language === 'en' ? `${name} is a committed association with a clear mission and practical values.` : `${name} est une association engagée, avec une mission claire et des valeurs concrètes.`);

  const actionIntro = functioning || (language === 'en' ? cause.actionEn : cause.actionFr);
  const actionPrograms = actions
    ? (language === 'en'
      ? `In concrete terms, here is what we do: ${actions}`
      : `Concrètement, voici ce que nous faisons : ${actions}`)
    : (language === 'en' ? cause.actionEn : cause.actionFr);
  const audienceAction = language === 'en'
    ? `Beyond immediate help, we work to strengthen the confidence, autonomy and ability to act of ${audience}.`
    : `Au-delà de l’aide immédiate, nous cherchons à renforcer la confiance, l’autonomie et la capacité d’agir de ${audience}.`;
  const actionText = para([
    actionIntro,
    actionPrograms,
    audienceAction,
    language === 'en'
      ? 'Every skill, every idea and every hour given helps us go further.'
      : 'Chaque compétence, chaque idée et chaque heure donnée nous permettent d’aller plus loin.',
  ]);

  const goodToKnowText = goodToKnow ? para([goodToKnow]) : '';

  const contactText = para([
    input.email ? `Vous pouvez nous écrire à ${input.email}.` : '',
    input.city ? `Nous sommes basés à ${input.city}.` : '',
    'N’hésitez pas à nous contacter et à nous suivre sur les réseaux sociaux.',
  ]);

  const heroSubtitle = firstSentence(input.slogan || mission) || audience;
  const footerText = firstSentence(input.slogan || mission) || '';
  const cards = language === 'en' ? cause.cardsEn : cause.cardsFr;
  const impactText = language === 'en' ? cause.impactEn : cause.impactFr;

  return { name, aboutText, actionText, goodToKnowText, contactText, heroSubtitle, footerText, cards, impactText };
}

function reindex(pages: any[]) {
  for (const p of pages) p.blocks.forEach((b: any, i: number) => { b.order = i; });
}

// Produce a fully customized template from the questionnaire + assets.
export function buildGeneratedSite(input: GenerateInput, themePhotos: string[] = []): BuiltTemplate {
  const detectText = [input.mission, input.functioning, input.goodToKnow, input.beneficiaries, input.actions, input.description].filter(Boolean).join(' ');
  const id = pickTemplateId(detectText, input.category);
  const base = getTemplate(id) || TEMPLATES[0];
  const t: BuiltTemplate = JSON.parse(JSON.stringify(base));
  const copy = composeCopy(input);
  const photos = (input.photos || []).filter(Boolean);
  const image = createImagePicker(photos, id, themePhotos);

  t.id = `${base.id}-generated`;
  t.name = copy.name;
  t.header.logoText = copy.name;
  t.header.logoUrl = input.logoUrl || undefined;
  t.footer.logoText = copy.name;
  t.footer.logoUrl = input.logoUrl || undefined;
  t.footer.text = input.slogan?.trim() || (input.language === 'en' ? 'Together, we make a difference.' : 'Ensemble, faisons la différence.');
  if (!input.news?.trim()) {
    t.pages = t.pages.filter((page) => !/actualit|news/i.test(`${page.slug} ${page.title}`));
  }

  for (const page of t.pages) {
    for (const block of page.blocks) {
      const c: any = block.content;
      switch (block.type) {
        case 'banner':
          if (page.isHome) { c.title = copy.name; if (copy.heroSubtitle) c.subtitle = copy.heroSubtitle; }
          c.image = image(1600, 760);
          break;
        case 'textimage':
          if (page.isHome) c.title = input.language === 'en' ? 'Our mission' : 'Notre mission';
          c.text = copy.aboutText;
          c.image = image(900, 700);
          break;
        case 'gallery':
          c.images = Array.from({ length: (c.images?.length) || 6 }, () => image(600, 600));
          break;
        case 'slideshow':
          c.slides = Array.from({ length: Math.max(3, Math.min(Math.max(photos.length, 3), 5)) }, (_, i) => ({ image: image(1400, 640), caption: c.slides?.[i]?.caption || '' }));
          break;
        case 'text':
          if (page.isHome) c.text = copy.impactText;
          if (page.slug === 'notre-action') c.text = copy.actionText;
          if (page.slug === 'contact') c.text = copy.contactText;
          break;
        case 'cards':
          if (Array.isArray(c.items) && copy.cards?.length) {
            c.items = c.items.map((item: any, index: number) => ({
              ...item,
              ...(copy.cards[index % copy.cards.length] || {}),
            }));
          }
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

  // Reliable English fallback when the AI provider is unavailable: never
  // return a French template to an association whose saved language is English.
  if (input.language === 'en') {
    const block = (type: string, content: any) => ({ type, order: 0, content, style: defaultStyleFor(type as any) });
    const page = (title: string, slug: string, intro: string, extra: any[] = []) => ({
      title, slug, isHome: slug === 'home', showInNav: true,
      blocks: [block('heading', { text: title }), block('text', { text: intro }), ...extra],
    });
    const mission = input.mission || `${copy.name} brings people together around a meaningful cause.`;
    const englishImage = createImagePicker(photos, id, themePhotos);
    t.id = `${base.id}-generated`;
    t.header.logoText = copy.name;
    t.footer.logoText = copy.name;
    t.footer.text = input.slogan?.trim() || 'Together, we make a difference.';
    t.pages = [
      { title: 'Home', slug: 'home', isHome: true, showInNav: true, blocks: [
        block('banner', { image: englishImage(1600, 760), title: copy.name, subtitle: mission, overlay: 45, height: 460, button: { text: 'Support us', href: '/get-involved', color: '#ffffff', variant: 'solid', align: 'center' } }),
        block('textimage', { title: 'Our mission', text: mission, image: englishImage(900, 700), imageSide: 'right' }),
      ] },
      page('Our story', 'our-story', [input.year ? `Founded in ${input.year}, ${copy.name} has grown around a clear ambition.` : '', mission, input.functioning || 'Our members and volunteers work together to turn this ambition into practical, lasting action.'].filter(Boolean).join('\n\n')),
      page('Our work', 'our-work', input.actions || input.functioning || mission),
      page('Our impact', 'our-impact', [input.beneficiaries ? `We work alongside ${input.beneficiaries}.` : '', input.goodToKnow || '', 'We focus on useful action, responsible use of resources and lasting relationships with the people and partners around us.'].filter(Boolean).join('\n\n')),
      page('Get involved', 'get-involved', 'Volunteer, become a member, share our work or support a project. Every contribution helps our association move forward.', [block('cta', { title: 'Take action with us', text: 'Contact our team to find the best way to help.', button: { text: 'Contact us', href: '/contact', color: '#1b5df5', variant: 'solid', align: 'center' } })]),
      ...(input.news?.trim() ? [page('News', 'news', input.news)] : []),
      page('Contact', 'contact', [input.email ? `Email: ${input.email}` : '', input.city ? `Location: ${input.city}` : '', 'Questions, partnership ideas or ready to get involved? We would be delighted to hear from you.'].filter(Boolean).join('\n\n')),
    ];
  }

  reindex(t.pages);
  return t;
}
