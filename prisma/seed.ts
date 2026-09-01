import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createOrganizationForUser } from '../src/lib/bootstrap';
import { DEFAULT_THEME } from '../src/lib/colors';
import { SYSTEM_ROLE_PERMISSIONS } from '../src/lib/permissions';
import { defaultStyleFor, type BlockType } from '../src/lib/blocks';
import {
  IMPACT_SUBDOMAIN,
  IMPACT_HOST,
  IMPACT_BRAND,
  IMPACT_LOGIN_EMAIL,
  IMPACT_LOGIN_PASSWORD,
  IMPACT_CONTACT_EMAIL,
  IMPACT_SOCIALS,
  IMPACT_TRACKS,
  IMPACT_STATS,
  IMPACT_VIDEOS,
  IMPACT_INSTAGRAM_POSTS,
  IMPACT_TIKTOK_POSTS,
} from '../src/lib/impact';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@easyasso.fr';
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Demo user already exists, skipping.');
    return;
  }

  const user = await prisma.user.create({ data: { name: 'Marie Démo', email, passwordHash } });
  const org = await createOrganizationForUser(user.id, 'Les Amis du Quartier');

  // Activate + publish so the demo is fully usable
  await prisma.organization.update({
    where: { id: org.id },
    data: { planStatus: 'ACTIVE', paidAt: new Date(), site: { update: { published: true } } },
  });

  // Seed donors + donations
  const donorsData = [
    { firstName: 'Jean', lastName: 'Martin', email: 'jean@example.com', city: 'Lyon' },
    { firstName: 'Sophie', lastName: 'Bernard', email: 'sophie@example.com', city: 'Paris' },
    { firstName: 'Ahmed', lastName: 'Khaled', email: 'ahmed@example.com', city: 'Marseille' },
    { firstName: 'Claire', lastName: 'Petit', email: 'claire@example.com', city: 'Nantes' },
  ];
  const donors = [];
  for (const d of donorsData) {
    donors.push(await prisma.donor.create({ data: { organizationId: org.id, ...d } }));
  }

  const campaign = await prisma.campaign.create({
    data: { organizationId: org.id, name: 'Rénovation du local', description: 'Aidez-nous à rénover notre local associatif.', goalCents: 500000, status: 'ACTIVE' },
  });

  const amounts = [5000, 15000, 3000, 25000, 8000, 12000, 4000, 30000];
  for (let i = 0; i < amounts.length; i++) {
    await prisma.donation.create({
      data: {
        organizationId: org.id,
        donorId: donors[i % donors.length].id,
        campaignId: i % 2 === 0 ? campaign.id : null,
        amountCents: amounts[i],
        method: ['CASH', 'CHECK', 'TRANSFER', 'STRIPE'][i % 4],
        status: 'COMPLETED',
        donatedAt: new Date(Date.now() - i * 15 * 86400000),
      },
    });
  }

  await prisma.transaction.createMany({
    data: [
      { organizationId: org.id, kind: 'EXPENSE', label: 'Location salle', amountCents: 12000 },
      { organizationId: org.id, kind: 'EXPENSE', label: 'Matériel', amountCents: 8500 },
      { organizationId: org.id, kind: 'INCOME', label: 'Subvention mairie', amountCents: 50000 },
    ],
  });

  console.log('✅ Seed terminé.');
  console.log('   Connexion démo : demo@easyasso.fr / demo1234');
}

// IMPACT — an independent, complimentary artist workspace. This function only
// targets the dedicated IMPACT subdomain; it never reads or writes VIELUSOS.
async function seedImpact() {
  const existing = await prisma.site.findUnique({ where: { subdomain: IMPACT_SUBDOMAIN }, include: { organization: true } });
  const previousProfile = ((existing?.organization.profile as any) || {}) as Record<string, any>;
  const needsContentSetup = Number(previousProfile.impactSeedVersion || 0) < 10;
  const passwordHash = await bcrypt.hash(IMPACT_LOGIN_PASSWORD, 10);
  const legacyEasyAssoUser = await prisma.user.findUnique({ where: { email: 'impact@easyasso.fr' } });
  const legacyAgencyUser = await prisma.user.findUnique({ where: { email: 'contact@skorm-agency.com' } });
  let user = await prisma.user.findUnique({ where: { email: IMPACT_LOGIN_EMAIL } });
  if (!user && existing) {
    for (const legacyUser of [legacyAgencyUser, legacyEasyAssoUser]) {
      if (!legacyUser) continue;
      const ownsImpact = await prisma.membership.findUnique({ where: { userId_organizationId: { userId: legacyUser.id, organizationId: existing.organizationId } } });
      if (ownsImpact) {
        user = await prisma.user.update({ where: { id: legacyUser.id }, data: { name: 'IMPACT', email: IMPACT_LOGIN_EMAIL, passwordHash, emailVerified: new Date() } });
        break;
      }
    }
  }
  if (!user) user = await prisma.user.create({ data: { name: 'IMPACT', email: IMPACT_LOGIN_EMAIL, passwordHash, emailVerified: new Date() } });

  const profile = {
    ...previousProfile,
    impactSeedVersion: 10,
    language: 'fr' as const,
    slogan: 'RAW · ELECTRONIC · ENERGY',
    email: IMPACT_CONTACT_EMAIL,
    mission: previousProfile.mission || 'Rawstyle DJ/Producer · Resident Normandy Hard Night.',
    instagram: IMPACT_SOCIALS.instagram,
    tiktok: IMPACT_SOCIALS.tiktok,
    spotify: IMPACT_SOCIALS.spotify,
    soundcloud: IMPACT_SOCIALS.soundcloud,
    deezer: IMPACT_SOCIALS.deezer,
    youtube: IMPACT_SOCIALS.youtube,
    applemusic: IMPACT_SOCIALS.applemusic,
    hasShop: previousProfile.hasShop ?? false,
    shopEnabled: previousProfile.shopEnabled ?? false,
  };
  const theme = { ...DEFAULT_THEME, primary: IMPACT_BRAND.accent, background: IMPACT_BRAND.surface, text: '#eaf2ff', font: 'sans' };

  let organizationId: string;
  let siteId: string;
  if (existing) {
    organizationId = existing.organizationId;
    siteId = existing.id;
    await prisma.organization.update({
      where: { id: organizationId },
      data: { name: 'IMPACT', planStatus: 'ACTIVE', paidAt: null, stripeCustomerId: null, stripeSessionId: null, profile: profile as any },
    });
    await prisma.membership.upsert({
      where: { userId_organizationId: { userId: user.id, organizationId } },
      update: { systemRole: 'OWNER' },
      create: { userId: user.id, organizationId, systemRole: 'OWNER' },
    });
    for (const legacyUser of [legacyAgencyUser, legacyEasyAssoUser]) {
      if (legacyUser && legacyUser.id !== user.id) {
        await prisma.membership.deleteMany({ where: { userId: legacyUser.id, organizationId } });
      }
    }
  } else {
    let slug = 'impact';
    let i = 1;
    while (await prisma.organization.findUnique({ where: { slug } })) slug = `impact-${i++}`;
    const org = await prisma.organization.create({
      data: {
        name: 'IMPACT', slug, planStatus: 'ACTIVE', paidAt: null, profile: profile as any,
        memberships: { create: { userId: user.id, systemRole: 'OWNER' } },
        site: { create: { name: 'IMPACT', subdomain: IMPACT_SUBDOMAIN, customDomain: IMPACT_HOST, domainVerified: true, published: true, theme: theme as any, header: { logoText: 'IMPACT' } as any, footer: { logoText: 'IMPACT' } as any } },
        roles: { create: [{ name: 'Manager', isSystem: false, permissions: SYSTEM_ROLE_PERMISSIONS.EDITOR }] },
      },
      include: { site: true },
    });
    organizationId = org.id;
    siteId = org.site!.id;
  }

  await prisma.role.upsert({
    where: { organizationId_name: { organizationId, name: 'Manager' } },
    update: { permissions: SYSTEM_ROLE_PERMISSIONS.EDITOR },
    create: { organizationId, name: 'Manager', isSystem: false, permissions: SYSTEM_ROLE_PERMISSIONS.EDITOR },
  });

  const headerDefaults = {
    logoText: 'IMPACT', logoUrl: IMPACT_BRAND.logoUrl, showNav: true, sticky: true,
    background: IMPACT_BRAND.surface, textColor: '#eaf2ff', showCta: true,
    cta: { text: 'BOOKING', href: '/booking', color: IMPACT_BRAND.accent, variant: 'solid', align: 'right' },
    social: IMPACT_SOCIALS,
    vielusosHero: { videoUrl: '/impact/hero-teaser-web.mp4', darkVideoUrl: '/impact/hero-dark-skeleton.mp4', showLogo: false, showName: false, showTagline: false },
    vielusosBio: { images: ['/impact/gallery/impact-gallery-01.jpg', '/impact/gallery/impact-gallery-02.jpg', '/impact/gallery/impact-gallery-03.jpg', '/impact/gallery/impact-gallery-04.jpg', '/impact/gallery/impact-gallery-05.jpg', '/impact/profile.jpg', '/impact/profile-2.jpg'], eyebrowFr: 'IMPACT · ARTISTE', eyebrowEn: 'IMPACT · ARTIST', titleFr: 'À PROPOS', titleEn: 'ABOUT' },
  };
  const footerDefaults = {
    logoText: 'IMPACT', logoUrl: IMPACT_BRAND.logoUrl, text: 'RAW · ELECTRONIC · ENERGY',
    background: IMPACT_BRAND.surface, textColor: '#eaf2ff', showNewsletter: true,
    backgroundVideoUrl: '/impact/footer-walk-impact.mp4',
    newsletterTitle: 'REJOINDRE LA COMMUNAUTÉ', showCgv: false, showMentions: false,
    allRightsText: `© ${new Date().getFullYear()} IMPACT. Tous droits réservés.`,
    showContactBubble: true, contactBubbleColor: IMPACT_BRAND.surface, contactBubbleTextColor: '#eaf2ff',
    contactBubbleEmail: IMPACT_CONTACT_EMAIL, contactBubbleShowPhone: false, contactBubbleShowSms: false,
    contactBubbleShowEmail: true, contactBubbleShowMessage: true, contactBubbleShowBooking: true,
    contactBubbleBookingHref: '/booking', bookingTitle: 'Envoyer un brief clair', bookingTitleEn: 'Send a clear brief',
    bookingDescription: 'Booking, média, partenariat ou demande professionnelle directe concernant IMPACT.',
    bookingDescriptionEn: 'Booking, media, partnerships or a direct professional enquiry concerning IMPACT.',
    bookingFormTitle: 'Contact · Projet', bookingFormTitleEn: 'Contact · Project',
    pageSlugs: ['accueil', 'sons', 'videos', 'bio', 'galerie', 'booking', 'boutique'], columns: [],
  };
  // Always refresh the public shell so the banner stays clean and independent.
  const header = { ...((existing?.header as any) || {}), ...headerDefaults };
  const footer = { ...((existing?.footer as any) || {}), ...footerDefaults };
  await prisma.site.update({
    where: { id: siteId },
    data: { name: 'IMPACT', theme: theme as any, header: header as any, footer: footer as any, customDomain: IMPACT_HOST, domainVerified: true, published: true },
  });

  if (needsContentSetup || !existing) {
    const streamingLinks = { spotify: IMPACT_SOCIALS.spotify, deezer: IMPACT_SOCIALS.deezer, appleMusic: IMPACT_SOCIALS.applemusic, soundcloud: IMPACT_SOCIALS.soundcloud, youtube: IMPACT_SOCIALS.youtube };
    const players = IMPACT_TRACKS.map((track) => ({ platform: track.source, url: track.url, title: track.title, artist: track.artist, releaseDate: track.releaseDate }));
    const pages: Array<{ title: string; slug: string; order: number; isHome?: boolean; showInNav?: boolean; description: string; blocks: Array<{ type: BlockType; content: any }> }> = [
      { title: 'Accueil', slug: 'accueil', order: 0, isHome: true, description: 'Site officiel IMPACT · Rawstyle DJ/Producer.', blocks: [
        { type: 'streaming', content: { variant: 'impact', title: 'ÉCOUTER IMPACT', linkStyle: 'text-white', glowColor: IMPACT_BRAND.neon, links: streamingLinks } },
        { type: 'tracks', content: { variant: 'impact', title: 'DERNIÈRES SORTIES', subtitle: 'Latest releases', tracks: IMPACT_TRACKS } },
        { type: 'stats', content: { variant: 'impact', eyebrow: 'Repères publics', title: 'IMPACT EN CHIFFRES', intro: 'Chiffres relevés sur les profils officiels au moment de la mise à jour.', source: 'Sources : Spotify artiste officiel et SoundCloud officiel IMPACT.', items: IMPACT_STATS } },
        { type: 'videos', content: { title: 'LIVE · IMPACT', videos: IMPACT_VIDEOS.slice(0, 5) } },
        { type: 'social', content: { variant: 'impact', social: { align: 'center', ...IMPACT_SOCIALS, appleMusic: IMPACT_SOCIALS.applemusic } } },
        { type: 'instagram', content: { variant: 'impact', title: 'IMPACT SUR INSTAGRAM', username: 'impactdj_raw', url: IMPACT_SOCIALS.instagram, count: 15, postUrls: IMPACT_INSTAGRAM_POSTS, tiktokTitle: 'IMPACT SUR TIKTOK', tiktokUsername: 'impactdj_raw', tiktokUrl: IMPACT_SOCIALS.tiktok, tiktokPostUrls: IMPACT_TIKTOK_POSTS } },
      ] },
      { title: 'Sons', slug: 'sons', order: 1, description: 'Toutes les sorties et plateformes officielles d’IMPACT.', blocks: [
        { type: 'tracks', content: { variant: 'impact', title: 'TOUS LES SONS', subtitle: 'Official releases', tracks: IMPACT_TRACKS } },
        { type: 'players', content: { title: 'LECTEURS OFFICIELS', intro: 'Écoutez les sorties directement sur les plateformes officielles.', sort: 'newest', items: players } },
        { type: 'streaming', content: { variant: 'impact', title: 'TOUTES LES PLATEFORMES', linkStyle: 'text-white', glowColor: IMPACT_BRAND.neon, links: streamingLinks } },
      ] },
      { title: 'Vidéos', slug: 'videos', order: 2, description: 'Lives et vidéos officielles d’IMPACT.', blocks: [
        { type: 'videos', content: { title: 'LIVE · ESKAPE', videos: [...IMPACT_VIDEOS, { title: 'YOU MADE IT · OFFICIAL', url: 'https://www.youtube.com/watch?v=RSdKmX2BH7o' }] } },
      ] },
      { title: 'Bio', slug: 'bio', order: 3, description: 'Biographie et univers artistique d’IMPACT.', blocks: [] },
      { title: 'Galerie', slug: 'galerie', order: 4, description: 'Photos officielles d’IMPACT.', blocks: [
        { type: 'gallery', content: { variant: 'impact', columns: 3, images: ['/impact/gallery/impact-gallery-01.jpg', '/impact/gallery/impact-gallery-02.jpg', '/impact/gallery/impact-gallery-03.jpg', '/impact/gallery/impact-gallery-04.jpg', '/impact/gallery/impact-gallery-05.jpg', '/impact/profile.jpg', '/impact/profile-2.jpg'] } },
      ] },
      { title: 'Booking', slug: 'booking', order: 5, description: 'Booking et demandes professionnelles pour IMPACT.', blocks: [] },
      { title: 'Boutique', slug: 'boutique', order: 6, showInNav: Boolean(profile.shopEnabled), description: 'Boutique officielle IMPACT.', blocks: [
        { type: 'banner', content: { backgroundType: 'image', image: '/impact/profile-2.jpg', title: 'BOUTIQUE IMPACT', subtitle: 'Drops, éditions limitées et merchandising.', overlay: 55, height: 360, contentPosition: 'center', textAlign: 'center' } },
        { type: 'shop', content: { title: 'SHOP', intro: '', search: true, showCategories: true, columns: 4 } },
      ] },
    ];
    await prisma.page.deleteMany({ where: { siteId, slug: { notIn: pages.map((page) => page.slug) } } });
    for (const pageData of pages) {
      const page = await prisma.page.upsert({
        where: { siteId_slug: { siteId, slug: pageData.slug } },
        update: { title: pageData.title, order: pageData.order, isHome: Boolean(pageData.isHome), showInNav: pageData.showInNav ?? true, seoTitle: `${pageData.title} · IMPACT`, seoDescription: pageData.description },
        create: { siteId, title: pageData.title, slug: pageData.slug, order: pageData.order, isHome: Boolean(pageData.isHome), showInNav: pageData.showInNav ?? true, seoTitle: `${pageData.title} · IMPACT`, seoDescription: pageData.description },
      });
      await prisma.block.deleteMany({ where: { pageId: page.id } });
      if (pageData.blocks.length) await prisma.block.createMany({ data: pageData.blocks.map((block, order) => ({ pageId: page.id, type: block.type, order, content: block.content as any, style: defaultStyleFor(block.type) as any })) });
    }
  }

  console.log('✅ Profil IMPACT prêt (compte offert, sans abonnement payant).');
  console.log(`   Connexion IMPACT : ${IMPACT_LOGIN_EMAIL} / ${IMPACT_LOGIN_PASSWORD}`);
  console.log(`   URL interne : /s/${IMPACT_SUBDOMAIN}  ·  domaine : https://${IMPACT_HOST}  ·  admin : /impact-admin`);
}

main()
  .then(seedImpact)
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
