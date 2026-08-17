import { prisma } from './prisma';
import { randomSubdomain } from './utils';
import { DEFAULT_HEADER, DEFAULT_FOOTER, defaultContentFor, defaultStyleFor } from './blocks';
import { DEFAULT_THEME } from './colors';
import { SYSTEM_ROLE_PERMISSIONS } from './permissions';

// Creates an organization + default site + starter pages for a user, and makes
// the user the OWNER. Returns the created organization.
export async function createOrganizationForUser(userId: string, assoName: string) {
  const baseSlug = assoName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'association';

  // Ensure unique org slug
  let slug = baseSlug;
  let i = 1;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  // Ensure unique subdomain
  let subdomain = randomSubdomain();
  while (await prisma.site.findUnique({ where: { subdomain } })) {
    subdomain = randomSubdomain();
  }

  const org = await prisma.organization.create({
    data: {
      name: assoName,
      slug,
      planStatus: 'PENDING_PAYMENT',
      memberships: { create: { userId, systemRole: 'OWNER' } },
      site: {
        create: {
          name: assoName,
          subdomain,
          theme: DEFAULT_THEME as any,
          header: { ...DEFAULT_HEADER, logoText: assoName } as any,
          footer: {
            ...DEFAULT_FOOTER,
            logoText: assoName,
            allRightsText: `© ${new Date().getFullYear()} ${assoName}. Tous droits réservés.`,
          } as any,
        },
      },
      // Seed a couple of default custom roles mirroring system roles (editable)
      roles: {
        create: [
          { name: 'Bénévole communication', isSystem: false, permissions: SYSTEM_ROLE_PERMISSIONS.EDITOR },
          { name: 'Trésorier', isSystem: false, permissions: SYSTEM_ROLE_PERMISSIONS.ACCOUNTANT },
        ],
      },
      // Default accounting categories
      categories: {
        create: [
          { name: 'Dons', kind: 'INCOME', color: '#22c55e' },
          { name: 'Cotisations', kind: 'INCOME', color: '#0ea5e9' },
          { name: 'Subventions', kind: 'INCOME', color: '#a855f7' },
          { name: 'Frais de fonctionnement', kind: 'EXPENSE', color: '#f97316' },
          { name: 'Événements', kind: 'EXPENSE', color: '#ec4899' },
        ],
      },
    },
    include: { site: true },
  });

  // Create starter pages with a few blocks each
  const home = await prisma.page.create({
    data: { siteId: org.site!.id, title: 'Accueil', slug: 'accueil', order: 0, isHome: true },
  });
  await prisma.block.createMany({
    data: [
      { pageId: home.id, type: 'heading', order: 0, content: { text: `Bienvenue chez ${assoName}` } as any, style: defaultStyleFor('heading') as any },
      { pageId: home.id, type: 'text', order: 1, content: defaultContentFor('text') as any, style: defaultStyleFor('text') as any },
      { pageId: home.id, type: 'button', order: 2, content: { button: { text: 'Faire un don', href: '/don', color: '#1b5df5', variant: 'solid', align: 'center' } } as any, style: { align: 'center', paddingY: 16 } as any },
    ],
  });

  const don = await prisma.page.create({
    data: { siteId: org.site!.id, title: 'Faire un don', slug: 'don', order: 1 },
  });
  await prisma.block.createMany({
    data: [
      { pageId: don.id, type: 'heading', order: 0, content: { text: 'Soutenez notre action' } as any, style: defaultStyleFor('heading') as any },
      { pageId: don.id, type: 'text', order: 1, content: { text: 'Votre don nous permet d’agir concrètement. Merci pour votre générosité.' } as any, style: defaultStyleFor('text') as any },
    ],
  });

  const contact = await prisma.page.create({
    data: { siteId: org.site!.id, title: 'Contact', slug: 'contact', order: 2 },
  });
  await prisma.block.create({
    data: { pageId: contact.id, type: 'heading', order: 0, content: { text: 'Nous contacter' } as any, style: defaultStyleFor('heading') as any },
  });

  return org;
}
