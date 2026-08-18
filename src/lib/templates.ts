// 10 ready-made association website structures. Each ships a DISTINCT layout,
// font and colour scheme, plus theme-coherent placeholder photos (keyword-based,
// not random). The association only swaps text, photos, videos and links.
import { defaultStyleFor, type BlockType } from './blocks';

// Curated, cause-coherent stock photos served from Unsplash's image CDN
// (reliable and cacheable; no API key needed to hotlink a known photo id).
// Each cause has a small hand-picked set so the images always match the theme.
const TEMPLATE_PHOTOS: Record<string, string[]> = {
  'solidarite-alimentaire': ['1547592180-85f173990554', '1593113598332-cd288d649433', '1488459716781-31db52582fe9'],
  'enfance-education': ['1509062522246-3755977927d7', '1497486751825-1233686d5d80', '1542810634-71277d95dcbb'],
  'protection-animale': ['1450778869180-41d0601e046e', '1444212477490-ca407925329e', '1517849845537-4d257902454a'],
  environnement: ['1441974231531-c6227db76b6e', '1472396961693-142e6e269027', '1500530855697-b586d89ba3ee'],
  'sante-handicap': ['1576091160399-112ba8d25d1d', '1584515933487-779824d29309', '1576765608622-067973a79f53'],
  'culture-patrimoine': ['1564399579883-451a5d44ec08', '1500534314209-a25ddb2bd429', '1482160549825-59d1b23cb208'],
  'club-sportif': ['1461896836934-ffe607ba8211', '1517466787929-bc90951d0974', '1526232761682-d26e03ac148e'],
  humanitaire: ['1488521787991-ed7bbaae773c', '1469571486292-0ba58a3f068b', '1532629345422-7515f3d16bb6'],
  'solidarite-locale': ['1529156069898-49953e39b3ac', '1511632765486-a01980e01a18', '1531206715517-5c0ba140b2b8'],
  aines: ['1544005313-94ddf0286df2', '1581579438747-1dc8d17bbce4', '1551836022-d5d88e9218df'],
};
const DEFAULT_PHOTOS = ['1521737604893-d14cc237f11d', '1531206715517-5c0ba140b2b8', '1488521787991-ed7bbaae773c'];

const unsplash = (photoId: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

// A per-site photo dispenser that never returns the same image twice (until the
// whole pool is exhausted). It serves the association's uploaded photos first,
// then the cause's own themed photos, then every other verified photo.
export function createPhotoAllocator(causeId: string, userPhotos: string[] = []) {
  // Stay STRICTLY within the cause's own themed photos so images always match
  // the announced cause. (We cycle within them rather than borrow off-theme
  // photos from other causes.)
  const stock = TEMPLATE_PHOTOS[causeId]?.length ? TEMPLATE_PHOTOS[causeId] : DEFAULT_PHOTOS;
  const users = userPhotos.filter(Boolean);
  let u = 0;
  let s = 0;
  return (w = 1200, h = 800): string => {
    if (u < users.length) return users[u++];
    const id = stock[s % stock.length];
    s++;
    return unsplash(id, w, h);
  };
}

type Layout = 'classic' | 'impact' | 'editorial' | 'visual' | 'warm';

interface Card { icon: string; title: string; text: string }

interface TemplateDef {
  id: string;
  name: string;
  category: string;
  tagline: string;
  layout: Layout;
  font: string;
  kw: string;        // primary photo keyword
  primary: string;
  headerBg: string;
  headerText: string;
  footerBg: string;
  footerText: string;
  ctaBg: string;
  heroTitle: string;
  heroSubtitle: string;
  introTitle: string;
  introText: string;
  storyTitle: string;
  storyText: string;
  cards: Card[];
  donText: string;
}

const DEFS: TemplateDef[] = [
  {
    id: 'solidarite-alimentaire', name: 'Solidarité alimentaire', category: 'Aide alimentaire',
    tagline: 'Distribution de repas, épiceries solidaires, maraudes',
    layout: 'warm', font: 'poppins', kw: 'food,volunteer',
    primary: '#e0402b', headerBg: '#ffffff', headerText: '#1f2937', footerBg: '#7f1d1d', footerText: '#fee2e2', ctaBg: '#fff1f0',
    heroTitle: 'Personne ne devrait avoir faim', heroSubtitle: 'Chaque jour, nous distribuons des repas aux plus démunis.',
    introTitle: 'Notre mission', introText: 'Nous collectons, préparons et distribuons des denrées alimentaires aux personnes en difficulté, dans la dignité et la chaleur humaine.',
    storyTitle: 'Sur le terrain', storyText: 'Distributions, maraudes et épiceries solidaires : nos bénévoles agissent au plus près des besoins, toute l’année.',
    cards: [
      { icon: 'HandHeart', title: 'Distributions', text: 'Des milliers de repas servis chaque semaine.' },
      { icon: 'Users', title: 'Nos bénévoles', text: 'Une équipe mobilisée toute l’année.' },
      { icon: 'Gift', title: 'Faire un don', text: 'Votre soutien finance des repas concrets.' },
    ],
    donText: 'Avec 20 €, vous offrez 10 repas chauds. Votre don ouvre droit à une réduction d’impôt de 75 %.',
  },
  {
    id: 'enfance-education', name: 'Enfance & éducation', category: 'Enfance',
    tagline: 'Protéger les enfants, financer leur scolarité',
    layout: 'classic', font: 'montserrat', kw: 'children,school',
    primary: '#d81f4a', headerBg: '#ffffff', headerText: '#1f2937', footerBg: '#831843', footerText: '#fce7f3', ctaBg: '#fff1f5',
    heroTitle: 'Chaque enfant mérite un avenir', heroSubtitle: 'Nous protégeons les enfants et leur donnons accès à l’éducation.',
    introTitle: 'Agir pour l’enfance', introText: 'De l’aide d’urgence aux programmes éducatifs de long terme, nous accompagnons les enfants les plus vulnérables et leurs familles.',
    storyTitle: 'Notre approche', storyText: 'Scolarisation, santé et protection : nous construisons avec les familles un environnement où chaque enfant peut grandir.',
    cards: [
      { icon: 'BookOpen', title: 'Éducation', text: 'Fournitures, écoles et soutien scolaire.' },
      { icon: 'Heart', title: 'Santé', text: 'Soins et prévention pour les plus jeunes.' },
      { icon: 'Shield', title: 'Protection', text: 'Un environnement sûr pour grandir.' },
    ],
    donText: 'Votre générosité offre à un enfant des fournitures, des repas et un accompagnement scolaire.',
  },
  {
    id: 'protection-animale', name: 'Protection animale', category: 'Animaux',
    tagline: 'Refuge, adoptions, sauvetage d’animaux',
    layout: 'visual', font: 'sans', kw: 'dog,cat',
    primary: '#0f766e', headerBg: '#ffffff', headerText: '#1f2937', footerBg: '#134e4a', footerText: '#ccfbf1', ctaBg: '#effcf9',
    heroTitle: 'Une seconde chance pour eux', heroSubtitle: 'Nous recueillons, soignons et faisons adopter les animaux abandonnés.',
    introTitle: 'Notre refuge', introText: 'Chaque année, nous sauvons des centaines d’animaux. Nous les soignons, les socialisons et leur trouvons une famille aimante.',
    storyTitle: 'Ils cherchent une famille', storyText: 'Découvrez nos pensionnaires à l’adoption et venez les rencontrer au refuge.',
    cards: [
      { icon: 'HandHeart', title: 'Adoption', text: 'Trouvez votre futur compagnon.' },
      { icon: 'Heart', title: 'Soins', text: 'Vétérinaire, nourriture, abri.' },
      { icon: 'Users', title: 'Bénévolat', text: 'Rejoignez notre équipe au refuge.' },
    ],
    donText: 'Votre don finance la nourriture et les soins vétérinaires de nos pensionnaires.',
  },
  {
    id: 'environnement', name: 'Environnement & climat', category: 'Écologie',
    tagline: 'Reforestation, biodiversité, actions climat',
    layout: 'editorial', font: 'merriweather', kw: 'forest,nature',
    primary: '#16a34a', headerBg: '#ffffff', headerText: '#14532d', footerBg: '#14532d', footerText: '#dcfce7', ctaBg: '#f0fdf4',
    heroTitle: 'Protégeons notre planète', heroSubtitle: 'Ensemble, agissons pour la nature, le climat et la biodiversité.',
    introTitle: 'Nos combats', introText: 'Nous menons des actions concrètes de terrain : plantations, nettoyages, sensibilisation et défense de la biodiversité locale.',
    storyTitle: 'Une histoire d’engagement', storyText: 'Née d’un collectif de citoyens, notre association agit aujourd’hui sur tout le territoire pour préserver le vivant.',
    cards: [
      { icon: 'Leaf', title: 'Reforestation', text: 'Des milliers d’arbres plantés.' },
      { icon: 'Sparkles', title: 'Sensibilisation', text: 'Ateliers et interventions scolaires.' },
      { icon: 'Handshake', title: 'Mobilisation', text: 'Des bénévoles partout en France.' },
    ],
    donText: 'Avec 10 €, nous plantons et entretenons 5 arbres. Agissez pour les générations futures.',
  },
  {
    id: 'sante-handicap', name: 'Santé & handicap', category: 'Santé',
    tagline: 'Accompagnement, recherche, inclusion',
    layout: 'classic', font: 'sans', kw: 'health,care',
    primary: '#2563eb', headerBg: '#ffffff', headerText: '#1e3a8a', footerBg: '#1e3a8a', footerText: '#dbeafe', ctaBg: '#eff6ff',
    heroTitle: 'Accompagner, soigner, inclure', heroSubtitle: 'Nous soutenons les personnes malades ou en situation de handicap et leurs proches.',
    introTitle: 'Notre engagement', introText: 'Écoute, accompagnement au quotidien, financement de la recherche et actions pour une société plus inclusive.',
    storyTitle: 'Notre impact', storyText: 'Grâce à vous, nous finançons des projets de recherche et accompagnons chaque année des milliers de familles.',
    cards: [
      { icon: 'Heart', title: 'Accompagnement', text: 'Un soutien humain et durable.' },
      { icon: 'Shield', title: 'Recherche', text: 'Nous finançons des projets médicaux.' },
      { icon: 'Users', title: 'Inclusion', text: 'Pour une société ouverte à tous.' },
    ],
    donText: 'Votre don soutient l’accompagnement des patients et le financement de la recherche.',
  },
  {
    id: 'culture-patrimoine', name: 'Culture & patrimoine', category: 'Culture',
    tagline: 'Festival, musée, sauvegarde du patrimoine',
    layout: 'editorial', font: 'playfair', kw: 'concert,art',
    primary: '#7e22ce', headerBg: '#ffffff', headerText: '#581c87', footerBg: '#581c87', footerText: '#f3e8ff', ctaBg: '#faf5ff',
    heroTitle: 'Faire vivre la culture', heroSubtitle: 'Nous créons, transmettons et préservons le patrimoine et la création artistique.',
    introTitle: 'Notre association', introText: 'Expositions, spectacles, ateliers et restauration du patrimoine : nous rendons la culture accessible à toutes et tous.',
    storyTitle: 'Une aventure culturelle', storyText: 'De la première exposition à nos festivals, retour sur une histoire faite de passion et de partage.',
    cards: [
      { icon: 'Star', title: 'Événements', text: 'Concerts, festivals, expositions.' },
      { icon: 'BookOpen', title: 'Ateliers', text: 'Transmission et pratique artistique.' },
      { icon: 'Sparkles', title: 'Patrimoine', text: 'Préserver ce qui nous rassemble.' },
    ],
    donText: 'Votre soutien permet d’organiser nos événements et de rendre la culture accessible à tous.',
  },
  {
    id: 'club-sportif', name: 'Club sportif', category: 'Sport',
    tagline: 'Club, école de sport, compétitions',
    layout: 'impact', font: 'montserrat', kw: 'football,sport',
    primary: '#ea580c', headerBg: '#0f172a', headerText: '#f8fafc', footerBg: '#0f172a', footerText: '#e2e8f0', ctaBg: '#fff7ed',
    heroTitle: 'Rejoignez le club', heroSubtitle: 'Un club pour tous les âges et tous les niveaux.',
    introTitle: 'Notre club', introText: 'École de sport, équipes compétitives et loisirs : nous accueillons chacun dans un esprit convivial et sportif.',
    storyTitle: 'L’esprit d’équipe', storyText: 'Des jeunes aux vétérans, nous partageons la même passion et les mêmes valeurs sur et en dehors du terrain.',
    cards: [
      { icon: 'Star', title: 'Nos équipes', text: 'Des jeunes aux vétérans.' },
      { icon: 'Users', title: 'Inscriptions', text: 'Rejoignez-nous cette saison.' },
      { icon: 'Handshake', title: 'Partenaires', text: 'Sponsors et soutiens locaux.' },
    ],
    donText: 'Votre soutien finance les équipements, les déplacements et l’accès au sport pour tous.',
  },
  {
    id: 'humanitaire', name: 'Humanitaire international', category: 'Humanitaire',
    tagline: 'Urgence, accès à l’eau, développement',
    layout: 'impact', font: 'sans', kw: 'humanitarian,water',
    primary: '#0284c7', headerBg: '#0c4a6e', headerText: '#e0f2fe', footerBg: '#0c4a6e', footerText: '#e0f2fe', ctaBg: '#f0f9ff',
    heroTitle: 'Agir là où c’est urgent', heroSubtitle: 'Nous intervenons auprès des populations vulnérables partout dans le monde.',
    introTitle: 'Nos missions', introText: 'De l’aide d’urgence aux projets de développement durable, nous agissons aux côtés des communautés locales.',
    storyTitle: 'Sur tous les fronts', storyText: 'Urgence, eau potable, santé, éducation : nos équipes se déploient là où les besoins sont les plus grands.',
    cards: [
      { icon: 'HandHeart', title: 'Urgence', text: 'Réponse rapide aux crises.' },
      { icon: 'Leaf', title: 'Accès à l’eau', text: 'Puits et assainissement.' },
      { icon: 'BookOpen', title: 'Développement', text: 'Éducation et autonomie.' },
    ],
    donText: 'Votre don finance de l’aide d’urgence et des projets durables sur le terrain.',
  },
  {
    id: 'solidarite-locale', name: 'Solidarité de quartier', category: 'Solidarité locale',
    tagline: 'Entraide, lien social, actions de proximité',
    layout: 'warm', font: 'poppins', kw: 'community,people',
    primary: '#0d9488', headerBg: '#ffffff', headerText: '#134e4a', footerBg: '#134e4a', footerText: '#ccfbf1', ctaBg: '#f0fdfa',
    heroTitle: 'Ensemble dans notre quartier', heroSubtitle: 'Nous créons du lien et de l’entraide entre habitants.',
    introTitle: 'Notre association', introText: 'Accompagnement, activités, événements de quartier et coups de main : nous tissons la solidarité de proximité.',
    storyTitle: 'Au cœur du quartier', storyText: 'Un local, des bénévoles et beaucoup d’énergie : depuis nos débuts, nous rapprochons les habitants.',
    cards: [
      { icon: 'Users', title: 'Entraide', text: 'Un réseau d’habitants solidaires.' },
      { icon: 'Sparkles', title: 'Activités', text: 'Ateliers, sorties, rencontres.' },
      { icon: 'Handshake', title: 'Bénévolat', text: 'Donnez un peu de votre temps.' },
    ],
    donText: 'Votre don soutient nos actions de proximité et nos moments de partage.',
  },
  {
    id: 'aines', name: 'Aide aux aînés', category: 'Personnes âgées',
    tagline: 'Lutte contre l’isolement, visites, aide au quotidien',
    layout: 'visual', font: 'merriweather', kw: 'elderly,senior',
    primary: '#4f46e5', headerBg: '#ffffff', headerText: '#312e81', footerBg: '#312e81', footerText: '#e0e7ff', ctaBg: '#eef2ff',
    heroTitle: 'Rompre l’isolement des aînés', heroSubtitle: 'Nous accompagnons les personnes âgées avec des visites et de l’écoute.',
    introTitle: 'Notre mission', introText: 'Visites de convivialité, aide administrative, sorties et lien social : nous luttons contre la solitude des aînés.',
    storyTitle: 'Des liens précieux', storyText: 'Chaque visite compte : nos bénévoles apportent présence, écoute et sourires à celles et ceux qui en ont besoin.',
    cards: [
      { icon: 'Heart', title: 'Visites', text: 'De la présence et de l’écoute.' },
      { icon: 'HandHeart', title: 'Aide au quotidien', text: 'Courses, démarches, accompagnement.' },
      { icon: 'Users', title: 'Bénévoles', text: 'Offrez du temps aux aînés.' },
    ],
    donText: 'Votre don permet d’organiser des visites et de rompre l’isolement de nos aînés.',
  },
];

// Cause-coherent placeholder photo for a template id. Used by the AI generator
// (src/lib/ai.ts) as a fallback image when a section has no supplied photo.
// `slot` keeps different image slots stable and distinct.
export function templateImage(id: string, slot = 0, w = 1400, h = 800) {
  const photos = TEMPLATE_PHOTOS[id]?.length ? TEMPLATE_PHOTOS[id] : DEFAULT_PHOTOS;
  return unsplash(photos[Math.abs(slot) % photos.length], w, h);
}

type BlockSeed = { type: BlockType; content: Record<string, unknown>; style?: Record<string, unknown> };

function seed(list: BlockSeed[]) {
  return list.map((b, order) => ({
    type: b.type, order, content: b.content, style: { ...defaultStyleFor(b.type), ...(b.style || {}) },
  }));
}

export interface BuiltTemplate {
  id: string; name: string; category: string; tagline: string; preview: string;
  theme: any; header: any; footer: any;
  pages: { title: string; slug: string; isHome: boolean; showInNav: boolean; blocks: any[] }[];
}

// ---- Per-layout HOME page composition (this is what makes them look different) ----
function homeBlocks(d: TemplateDef): BlockSeed[] {
  const img = (n: number, w = 1200, h = 700) => templateImage(d.id, n, w, h);
  const gallery6 = { columns: 3, images: [img(11, 600, 600), img(12, 600, 600), img(13, 600, 600), img(14, 600, 600), img(15, 600, 600), img(16, 600, 600)] };
  const gallery4 = { columns: 4, images: [img(21, 600, 600), img(22, 600, 600), img(23, 600, 600), img(24, 600, 600), img(25, 600, 600), img(26, 600, 600), img(27, 600, 600), img(28, 600, 600)] };
  const cards = { columns: 3, items: d.cards };
  const donateWhite = { text: 'Faire un don', href: '/don', color: '#ffffff', variant: 'solid', align: 'center' };
  const cta: BlockSeed = { type: 'cta', content: { title: 'Votre don a un impact réel', text: d.donText, button: { text: 'Je fais un don', href: '/don', color: d.primary, variant: 'solid', align: 'center' } }, style: { background: d.ctaBg, paddingY: 48 } };
  const banner = (h: number, overlay: number, n = 1): BlockSeed => ({ type: 'banner', content: { image: img(n, 1600, 760), title: d.heroTitle, subtitle: d.heroSubtitle, overlay, height: h, button: donateWhite } });
  const intro = (side: 'left' | 'right', n = 2): BlockSeed => ({ type: 'textimage', content: { title: d.introTitle, text: d.introText, image: img(n, 900, 700), imageSide: side, button: { text: 'Découvrir', href: '/notre-action', color: d.primary, variant: 'outline', align: side === 'right' ? 'left' : 'right' } } });
  const story = (side: 'left' | 'right', n = 3): BlockSeed => ({ type: 'textimage', content: { title: d.storyTitle, text: d.storyText, image: img(n, 900, 700), imageSide: side } });
  const slideshow: BlockSeed = { type: 'slideshow', content: { interval: 4, slides: [{ image: img(31, 1400, 640), caption: d.storyTitle }, { image: img(32, 1400, 640), caption: 'Grâce à vous' }, { image: img(33, 1400, 640), caption: 'Une équipe engagée' }] } };

  switch (d.layout) {
    case 'impact':
      return seed([
        banner(560, 55, 1),
        { type: 'cta', content: { title: d.heroSubtitle, text: d.donText, button: { text: 'Rejoindre / Donner', href: '/don', color: d.primary, variant: 'solid', align: 'center' } }, style: { background: d.ctaBg, paddingY: 40 } },
        { type: 'cards', content: cards },
        story('left'),
        slideshow,
      ]);
    case 'editorial':
      return seed([
        banner(380, 40, 1),
        { type: 'heading', content: { text: d.introTitle }, style: { align: 'center', fontSize: 34, paddingY: 24 } },
        { type: 'text', content: { text: d.introText }, style: { align: 'center', fontSize: 19, paddingY: 8 } },
        intro('left'),
        story('right'),
        cta,
      ]);
    case 'visual':
      return seed([
        slideshow,
        { type: 'heading', content: { text: d.heroTitle }, style: { align: 'center', fontSize: 36, paddingY: 24 } },
        { type: 'gallery', content: gallery4 },
        { type: 'cards', content: cards },
        intro('right'),
        cta,
      ]);
    case 'warm':
      return seed([
        banner(480, 45, 1),
        { type: 'cards', content: cards },
        intro('right'),
        { type: 'text', content: { text: d.storyText }, style: { align: 'center', fontSize: 19, paddingY: 20 } },
        { type: 'gallery', content: gallery6 },
        cta,
      ]);
    case 'classic':
    default:
      return seed([
        banner(480, 45, 1),
        intro('right'),
        { type: 'cards', content: cards },
        { type: 'gallery', content: gallery6 },
        cta,
      ]);
  }
}

function build(d: TemplateDef): BuiltTemplate {
  const img = (n: number, w = 1400, h = 720) => templateImage(d.id, n, w, h);
  const donateBtn = { text: 'Faire un don', href: '/don', color: d.primary, variant: 'solid', align: 'center' };
  const headerDark = d.headerBg !== '#ffffff';
  return {
    id: d.id, name: d.name, category: d.category, tagline: d.tagline,
    preview: img(1, 800, 500),
    theme: { primary: d.primary, secondary: d.footerBg, background: '#ffffff', text: '#1f2937', font: d.font },
    header: {
      logoText: 'Votre association', showNav: true, sticky: true,
      background: d.headerBg, textColor: d.headerText,
      cta: { text: 'Faire un don', href: '/don', color: headerDark ? '#ffffff' : d.primary, variant: 'solid', align: 'right' },
    },
    footer: {
      logoText: 'Votre association', text: d.tagline,
      showNewsletter: true, newsletterTitle: 'Recevez nos actualités',
      showCgv: true, cgvContent: 'Conditions générales à compléter.',
      showMentions: true, mentionsContent: 'Mentions légales à compléter.',
      allRightsText: `© ${new Date().getFullYear()} Votre association. Tous droits réservés.`,
      background: d.footerBg, textColor: d.footerText,
      columns: [
        { title: 'Association', links: [{ label: 'Accueil', href: '/' }, { label: 'Notre action', href: '/notre-action' }] },
        { title: 'Nous soutenir', links: [{ label: 'Faire un don', href: '/don' }, { label: 'Contact', href: '/contact' }] },
      ],
    },
    pages: [
      { title: 'Accueil', slug: 'accueil', isHome: true, showInNav: true, blocks: homeBlocks(d) },
      {
        title: 'Notre action', slug: 'notre-action', isHome: false, showInNav: true,
        blocks: seed([
          { type: 'heading', content: { text: 'Notre action' } },
          { type: 'text', content: { text: d.introText } },
          { type: 'slideshow', content: { interval: 4, slides: [{ image: img(41, 1400, 640), caption: 'Sur le terrain' }, { image: img(42, 1400, 640), caption: 'Grâce à vous' }, { image: img(43, 1400, 640), caption: 'Une équipe engagée' }] } },
          { type: 'cards', content: { columns: 3, items: d.cards } },
        ]),
      },
      {
        title: 'Faire un don', slug: 'don', isHome: false, showInNav: true,
        blocks: seed([
          { type: 'banner', content: { image: img(44, 1600, 500), title: 'Soutenez notre association', subtitle: d.donText, overlay: 50, height: 380, button: { text: 'Je donne maintenant', href: '#don', color: '#ffffff', variant: 'solid', align: 'center' } } },
          { type: 'text', content: { text: 'Vous pouvez faire un don en ligne, par chèque ou par virement. Collez ici votre lien HelloAsso ou votre formulaire de don.' } },
          { type: 'html', content: { html: '<!-- Collez ici le code d’intégration HelloAsso, ou un bouton vers votre page de don -->' } },
          { type: 'cta', content: { title: 'Merci de votre générosité', text: d.donText, button: donateBtn }, style: { background: d.ctaBg, paddingY: 44 } },
        ]),
      },
      {
        title: 'Actualités', slug: 'actualites', isHome: false, showInNav: true,
        blocks: seed([
          { type: 'heading', content: { text: 'Nos actualités' } },
          { type: 'cards', content: { columns: 3, items: [
            { icon: 'Sparkles', title: 'Un nouvel événement', text: 'Racontez ici votre dernière action ou actualité.' },
            { icon: 'Star', title: 'Merci à nos bénévoles', text: 'Mettez en avant vos équipes et vos réussites.' },
            { icon: 'Gift', title: 'Appel aux dons', text: 'Lancez votre prochaine campagne de collecte.' },
          ] } },
        ]),
      },
      {
        title: 'Contact', slug: 'contact', isHome: false, showInNav: true,
        blocks: seed([
          { type: 'heading', content: { text: 'Nous contacter' } },
          { type: 'text', content: { text: 'Écrivez-nous à contact@votre-association.fr — ou retrouvez-nous sur les réseaux sociaux.' } },
          { type: 'social', content: { social: { align: 'center', facebook: '', instagram: '' } } },
        ]),
      },
    ],
  };
}

export const TEMPLATES: BuiltTemplate[] = DEFS.map(build);

export function getTemplate(id: string): BuiltTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
