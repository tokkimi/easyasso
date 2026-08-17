// 10 ready-made association website structures. Each one ships a full theme,
// header, footer and several pages of pre-filled blocks — the association only
// swaps text, photos, videos and donation links.
import { defaultStyleFor, type BlockType } from './blocks';

const IMG = (seed: string, w = 1400, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

// Curated, cause-specific photography. Each template keeps one coherent visual
// universe instead of relying on random Picsum images (which could show shoes
// for an education association, for example).
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

export function templateImage(id: string, slot = 0, w = 1400, h = 800) {
  const photos = TEMPLATE_PHOTOS[id];
  if (!photos?.length) return IMG(`${id}-${slot}`, w, h);
  const photo = photos[slot % photos.length];
  return `https://images.unsplash.com/photo-${photo}?auto=format&fit=crop&w=${w}&h=${h}&q=85`;
}

interface Card { icon: string; title: string; text: string }

interface TemplateDef {
  id: string;
  name: string;
  category: string;
  tagline: string;
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
  cards: Card[];
  donText: string;
  seed: string;
}

const DEFS: TemplateDef[] = [
  {
    id: 'solidarite-alimentaire', name: 'Solidarité alimentaire', category: 'Aide alimentaire',
    tagline: 'Distribution de repas, épiceries solidaires, maraudes',
    primary: '#e0402b', headerBg: '#ffffff', headerText: '#1f2937', footerBg: '#7f1d1d', footerText: '#fee2e2', ctaBg: '#fff1f0',
    heroTitle: 'Personne ne devrait avoir faim', heroSubtitle: 'Chaque jour, nous distribuons des repas aux plus démunis. Avec vous, nous pouvons faire plus.',
    introTitle: 'Notre mission', introText: 'Nous collectons, préparons et distribuons des denrées alimentaires aux personnes en difficulté, partout sur notre territoire, dans la dignité et la chaleur humaine.',
    cards: [
      { icon: 'HandHeart', title: 'Distributions', text: 'Des milliers de repas servis chaque semaine.' },
      { icon: 'Users', title: 'Nos bénévoles', text: 'Une équipe mobilisée toute l’année.' },
      { icon: 'Gift', title: 'Faire un don', text: 'Votre soutien finance des repas concrets.' },
    ],
    donText: 'Avec 20 €, vous offrez 10 repas chauds. Votre don ouvre droit à une réduction d’impôt de 75 %.',
    seed: 'food',
  },
  {
    id: 'enfance-education', name: 'Enfance & éducation', category: 'Enfance',
    tagline: 'Protéger les enfants, financer leur scolarité',
    primary: '#d81f4a', headerBg: '#ffffff', headerText: '#1f2937', footerBg: '#831843', footerText: '#fce7f3', ctaBg: '#fff1f5',
    heroTitle: 'Chaque enfant mérite un avenir', heroSubtitle: 'Nous protégeons les enfants et leur donnons accès à l’éducation, à la santé et à la sécurité.',
    introTitle: 'Agir pour l’enfance', introText: 'De l’aide d’urgence aux programmes éducatifs de long terme, nous accompagnons les enfants les plus vulnérables et leurs familles.',
    cards: [
      { icon: 'BookOpen', title: 'Éducation', text: 'Fournitures, écoles et soutien scolaire.' },
      { icon: 'Heart', title: 'Santé', text: 'Soins et prévention pour les plus jeunes.' },
      { icon: 'Shield', title: 'Protection', text: 'Un environnement sûr pour grandir.' },
    ],
    donText: 'Votre générosité offre à un enfant des fournitures, des repas et un accompagnement scolaire.',
    seed: 'child',
  },
  {
    id: 'protection-animale', name: 'Protection animale', category: 'Animaux',
    tagline: 'Refuge, adoptions, sauvetage d’animaux',
    primary: '#0f766e', headerBg: '#ffffff', headerText: '#1f2937', footerBg: '#134e4a', footerText: '#ccfbf1', ctaBg: '#effcf9',
    heroTitle: 'Une seconde chance pour eux', heroSubtitle: 'Nous recueillons, soignons et faisons adopter les animaux abandonnés ou maltraités.',
    introTitle: 'Notre refuge', introText: 'Chaque année, nous sauvons des centaines d’animaux. Nous les soignons, les socialisons et leur trouvons une famille aimante.',
    cards: [
      { icon: 'HandHeart', title: 'Adoption', text: 'Trouvez votre futur compagnon.' },
      { icon: 'Heart', title: 'Soins', text: 'Vétérinaire, nourriture, abri.' },
      { icon: 'Users', title: 'Bénévolat', text: 'Rejoignez notre équipe au refuge.' },
    ],
    donText: 'Votre don finance la nourriture et les soins vétérinaires de nos pensionnaires.',
    seed: 'animal',
  },
  {
    id: 'environnement', name: 'Environnement & climat', category: 'Écologie',
    tagline: 'Reforestation, biodiversité, actions climat',
    primary: '#16a34a', headerBg: '#ffffff', headerText: '#14532d', footerBg: '#14532d', footerText: '#dcfce7', ctaBg: '#f0fdf4',
    heroTitle: 'Protégeons notre planète', heroSubtitle: 'Ensemble, agissons pour la nature, le climat et la biodiversité, dès aujourd’hui.',
    introTitle: 'Nos combats', introText: 'Nous menons des actions concrètes de terrain : plantations, nettoyages, sensibilisation et défense de la biodiversité locale.',
    cards: [
      { icon: 'Leaf', title: 'Reforestation', text: 'Des milliers d’arbres plantés.' },
      { icon: 'Sparkles', title: 'Sensibilisation', text: 'Ateliers et interventions scolaires.' },
      { icon: 'Handshake', title: 'Mobilisation', text: 'Des bénévoles partout en France.' },
    ],
    donText: 'Avec 10 €, nous plantons et entretenons 5 arbres. Agissez pour les générations futures.',
    seed: 'nature',
  },
  {
    id: 'sante-handicap', name: 'Santé & handicap', category: 'Santé',
    tagline: 'Accompagnement, recherche, inclusion',
    primary: '#2563eb', headerBg: '#ffffff', headerText: '#1e3a8a', footerBg: '#1e3a8a', footerText: '#dbeafe', ctaBg: '#eff6ff',
    heroTitle: 'Accompagner, soigner, inclure', heroSubtitle: 'Nous soutenons les personnes malades ou en situation de handicap et leurs proches.',
    introTitle: 'Notre engagement', introText: 'Écoute, accompagnement au quotidien, financement de la recherche et actions pour une société plus inclusive.',
    cards: [
      { icon: 'Heart', title: 'Accompagnement', text: 'Un soutien humain et durable.' },
      { icon: 'Shield', title: 'Recherche', text: 'Nous finançons des projets médicaux.' },
      { icon: 'Users', title: 'Inclusion', text: 'Pour une société ouverte à tous.' },
    ],
    donText: 'Votre don soutient l’accompagnement des patients et le financement de la recherche.',
    seed: 'health',
  },
  {
    id: 'culture-patrimoine', name: 'Culture & patrimoine', category: 'Culture',
    tagline: 'Festival, musée, sauvegarde du patrimoine',
    primary: '#7e22ce', headerBg: '#ffffff', headerText: '#581c87', footerBg: '#581c87', footerText: '#f3e8ff', ctaBg: '#faf5ff',
    heroTitle: 'Faire vivre la culture', heroSubtitle: 'Nous créons, transmettons et préservons le patrimoine et la création artistique.',
    introTitle: 'Notre association', introText: 'Expositions, spectacles, ateliers et restauration du patrimoine : nous rendons la culture accessible à toutes et tous.',
    cards: [
      { icon: 'Star', title: 'Événements', text: 'Concerts, festivals, expositions.' },
      { icon: 'BookOpen', title: 'Ateliers', text: 'Transmission et pratique artistique.' },
      { icon: 'Sparkles', title: 'Patrimoine', text: 'Préserver ce qui nous rassemble.' },
    ],
    donText: 'Votre soutien permet d’organiser nos événements et de rendre la culture accessible à tous.',
    seed: 'culture',
  },
  {
    id: 'club-sportif', name: 'Club sportif', category: 'Sport',
    tagline: 'Club, école de sport, compétitions',
    primary: '#ea580c', headerBg: '#0f172a', headerText: '#f8fafc', footerBg: '#0f172a', footerText: '#e2e8f0', ctaBg: '#fff7ed',
    heroTitle: 'Rejoignez le club', heroSubtitle: 'Un club pour tous les âges et tous les niveaux. Venez pratiquer, progresser et partager.',
    introTitle: 'Notre club', introText: 'École de sport, équipes compétitives et loisirs : nous accueillons chacun dans un esprit convivial et sportif.',
    cards: [
      { icon: 'Star', title: 'Nos équipes', text: 'Des jeunes aux vétérans.' },
      { icon: 'Users', title: 'Inscriptions', text: 'Rejoignez-nous cette saison.' },
      { icon: 'Handshake', title: 'Partenaires', text: 'Sponsors et soutiens locaux.' },
    ],
    donText: 'Votre soutien finance les équipements, les déplacements et l’accès au sport pour tous.',
    seed: 'sport',
  },
  {
    id: 'humanitaire', name: 'Humanitaire international', category: 'Humanitaire',
    tagline: 'Urgence, accès à l’eau, développement',
    primary: '#0284c7', headerBg: '#ffffff', headerText: '#0c4a6e', footerBg: '#0c4a6e', footerText: '#e0f2fe', ctaBg: '#f0f9ff',
    heroTitle: 'Agir là où c’est urgent', heroSubtitle: 'Nous intervenons auprès des populations vulnérables : urgence, eau, santé et développement.',
    introTitle: 'Nos missions', introText: 'De l’aide d’urgence aux projets de développement durable, nous agissons aux côtés des communautés locales.',
    cards: [
      { icon: 'HandHeart', title: 'Urgence', text: 'Réponse rapide aux crises.' },
      { icon: 'Leaf', title: 'Accès à l’eau', text: 'Puits et assainissement.' },
      { icon: 'BookOpen', title: 'Développement', text: 'Éducation et autonomie.' },
    ],
    donText: 'Votre don finance de l’aide d’urgence et des projets durables sur le terrain.',
    seed: 'humanitarian',
  },
  {
    id: 'solidarite-locale', name: 'Solidarité de quartier', category: 'Solidarité locale',
    tagline: 'Entraide, lien social, actions de proximité',
    primary: '#0d9488', headerBg: '#ffffff', headerText: '#134e4a', footerBg: '#134e4a', footerText: '#ccfbf1', ctaBg: '#f0fdfa',
    heroTitle: 'Ensemble dans notre quartier', heroSubtitle: 'Nous créons du lien et de l’entraide entre habitants, au plus près du terrain.',
    introTitle: 'Notre association', introText: 'Accompagnement, activités, événements de quartier et coups de main : nous tissons la solidarité de proximité.',
    cards: [
      { icon: 'Users', title: 'Entraide', text: 'Un réseau d’habitants solidaires.' },
      { icon: 'Sparkles', title: 'Activités', text: 'Ateliers, sorties, rencontres.' },
      { icon: 'Handshake', title: 'Bénévolat', text: 'Donnez un peu de votre temps.' },
    ],
    donText: 'Votre don soutient nos actions de proximité et nos moments de partage.',
    seed: 'community',
  },
  {
    id: 'aines', name: 'Aide aux aînés', category: 'Personnes âgées',
    tagline: 'Lutte contre l’isolement, visites, aide au quotidien',
    primary: '#4f46e5', headerBg: '#ffffff', headerText: '#312e81', footerBg: '#312e81', footerText: '#e0e7ff', ctaBg: '#eef2ff',
    heroTitle: 'Rompre l’isolement des aînés', heroSubtitle: 'Nous accompagnons les personnes âgées avec des visites, de l’écoute et de l’aide au quotidien.',
    introTitle: 'Notre mission', introText: 'Visites de convivialité, aide administrative, sorties et lien social : nous luttons contre la solitude des aînés.',
    cards: [
      { icon: 'Heart', title: 'Visites', text: 'De la présence et de l’écoute.' },
      { icon: 'HandHeart', title: 'Aide au quotidien', text: 'Courses, démarches, accompagnement.' },
      { icon: 'Users', title: 'Bénévoles', text: 'Offrez du temps aux aînés.' },
    ],
    donText: 'Votre don permet d’organiser des visites et de rompre l’isolement de nos aînés.',
    seed: 'senior',
  },
];

type BlockSeed = { type: BlockType; content: Record<string, unknown>; style?: Record<string, unknown> };

function blocks(list: BlockSeed[]) {
  return list.map((b, order) => ({
    type: b.type,
    order,
    content: b.content,
    style: { ...defaultStyleFor(b.type), ...(b.style || {}) },
  }));
}

export interface BuiltTemplate {
  id: string; name: string; category: string; tagline: string; preview: string;
  theme: any; header: any; footer: any;
  pages: { title: string; slug: string; isHome: boolean; showInNav: boolean; blocks: any[] }[];
}

function build(d: TemplateDef, layout: number): BuiltTemplate {
  const donateBtn = { text: 'Faire un don', href: '/don', color: d.primary, variant: 'solid', align: 'center' };
  const image = (slot: number, w = 1400, h = 800) => templateImage(d.id, slot, w, h);
  const hero = { type: 'banner' as const, content: { image: image(0, 1600, 760), title: d.heroTitle, subtitle: d.heroSubtitle, overlay: layout % 3 === 0 ? 58 : 42, height: layout % 2 ? 560 : 480, button: { text: 'Faire un don', href: '/don', color: '#ffffff', variant: 'solid', align: layout % 2 ? 'left' : 'center' } }, style: { paddingY: 0, align: layout % 2 ? 'left' : 'center' } };
  const intro = { type: 'textimage' as const, content: { title: d.introTitle, text: d.introText, image: image(1, 900, 700), imageSide: layout % 2 ? 'left' : 'right', button: { text: 'Découvrir', href: '/notre-action', color: d.primary, variant: 'outline', align: 'left' } }, style: { paddingY: layout % 3 === 0 ? 52 : 28, background: layout % 4 === 0 ? d.ctaBg : '#ffffff' } };
  const cardBlock = { type: 'cards' as const, content: { columns: layout % 4 === 3 ? 2 : 3, items: d.cards }, style: { paddingY: layout % 2 ? 48 : 28, background: layout % 3 === 1 ? d.ctaBg : '#ffffff' } };
  const gallery = { type: 'gallery' as const, content: { columns: layout % 3 === 0 ? 2 : 3, images: Array.from({ length: layout % 3 === 0 ? 4 : 6 }, (_, i) => image(i, 700, 700)) }, style: { paddingY: 28 } };
  const callout = { type: 'cta' as const, content: { title: 'Votre don a un impact réel', text: d.donText, button: donateBtn }, style: { background: d.ctaBg, paddingY: layout % 2 ? 64 : 44 } };
  // Ten genuinely different rhythms: editorial, immersive, mosaic, campaign,
  // community… The blocks, image balance, spacing and alignment vary, not only
  // the palette.
  const arrangements = [
    [hero, intro, cardBlock, gallery, callout],
    [hero, cardBlock, intro, callout],
    [intro, hero, gallery, cardBlock, callout],
    [hero, gallery, intro, cardBlock, callout],
    [hero, intro, callout, cardBlock],
    [cardBlock, hero, intro, gallery, callout],
    [hero, intro, gallery, callout],
    [intro, cardBlock, hero, callout],
    [hero, callout, intro, gallery, cardBlock],
    [hero, cardBlock, gallery, intro, callout],
  ];
  return {
    id: d.id,
    name: d.name,
    category: d.category,
    tagline: d.tagline,
    preview: image(0, 800, 500),
    theme: { primary: d.primary, secondary: d.footerBg, background: layout % 4 === 2 ? '#fffcf7' : '#ffffff', text: '#1f2937', font: ['sans','serif','rounded','sans','serif','rounded','sans','serif','rounded','sans'][layout] },
    header: {
      logoText: 'Votre association', showNav: true, sticky: true,
      background: d.headerBg, textColor: d.headerText,
      cta: { text: 'Faire un don', href: '/don', color: d.primary, variant: 'solid', align: 'right' },
    },
    footer: {
      logoText: 'Votre association',
      text: d.tagline,
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
      {
        title: 'Accueil', slug: 'accueil', isHome: true, showInNav: true,
        blocks: blocks(arrangements[layout]),
      },
      {
        title: 'Notre action', slug: 'notre-action', isHome: false, showInNav: true,
        blocks: blocks([
          { type: 'heading', content: { text: 'Notre action' } },
          { type: 'text', content: { text: d.introText } },
          { type: 'slideshow', content: { interval: 4, slides: [{ image: image(0, 1400, 640), caption: 'Sur le terrain' }, { image: image(1, 1400, 640), caption: 'Grâce à vous' }, { image: image(2, 1400, 640), caption: 'Une équipe engagée' }] } },
          { type: 'cards', content: { columns: 3, items: d.cards } },
        ]),
      },
      {
        title: 'Faire un don', slug: 'don', isHome: false, showInNav: true,
        blocks: blocks([
          { type: 'banner', content: { image: image(2, 1600, 500), title: 'Soutenez notre association', subtitle: d.donText, overlay: 50, height: 380, button: { text: 'Je donne maintenant', href: '#don', color: '#ffffff', variant: 'solid', align: 'center' } } },
          { type: 'text', content: { text: 'Vous pouvez faire un don en ligne, par chèque ou par virement. Collez ici votre lien HelloAsso ou votre formulaire de don.' } },
          { type: 'html', content: { html: '<!-- Collez ici le code d’intégration HelloAsso, ou un bouton vers votre page de don -->' } },
          { type: 'cta', content: { title: 'Merci de votre générosité', text: d.donText, button: { text: 'Faire un don', href: '#', color: d.primary, variant: 'solid', align: 'center' } }, style: { background: d.ctaBg, paddingY: 44 } },
        ]),
      },
      {
        title: 'Actualités', slug: 'actualites', isHome: false, showInNav: true,
        blocks: blocks([
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
        blocks: blocks([
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
