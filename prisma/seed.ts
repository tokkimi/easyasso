import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createOrganizationForUser } from '../src/lib/bootstrap';
import { getTemplate } from '../src/lib/templates';
import { applyTemplateToSite } from '../src/lib/apply-template';
import { DEFAULT_THEME } from '../src/lib/colors';
import { SYSTEM_ROLE_PERMISSIONS } from '../src/lib/permissions';
import { IMPACT_SUBDOMAIN, IMPACT_HOST, IMPACT_BRAND } from '../src/lib/impact';

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

// IMPACT — a second art-directed artist profile (parallel to VIELUSOS), created
// as a free/comped tenant (no paid subscription). Idempotent: skips if it
// already exists so re-seeding never disturbs VIELUSOS or any other site.
async function seedImpact() {
  const existing = await prisma.site.findUnique({ where: { subdomain: IMPACT_SUBDOMAIN } });
  if (existing) { console.log('IMPACT profile already exists, skipping.'); return; }

  const email = 'impact@easyasso.fr';
  const passwordHash = await bcrypt.hash('impact1234', 10);
  const user = (await prisma.user.findUnique({ where: { email } }))
    || (await prisma.user.create({ data: { name: 'IMPACT', email, passwordHash, emailVerified: new Date() } }));

  let slug = 'impact';
  let i = 1;
  while (await prisma.organization.findUnique({ where: { slug } })) slug = `impact-${i++}`;

  const profile = {
    language: 'fr' as const,
    slogan: 'RAW · ELECTRONIC · ENERGY',
    email,
    instagram: 'https://www.instagram.com/impactdj_raw',
  };
  const theme = { ...DEFAULT_THEME, primary: IMPACT_BRAND.accent, background: IMPACT_BRAND.surface, text: '#eaf2ff', font: 'sans' };

  const org = await prisma.organization.create({
    data: {
      name: 'IMPACT',
      slug,
      planStatus: 'ACTIVE', // comped: fully live, no payment required
      paidAt: new Date(),
      profile: profile as any,
      memberships: { create: { userId: user.id, systemRole: 'OWNER' } },
      site: {
        create: {
          name: 'IMPACT',
          subdomain: IMPACT_SUBDOMAIN,
          customDomain: IMPACT_HOST,
          domainVerified: true,
          published: true,
          theme: theme as any,
          header: { logoText: 'IMPACT' } as any,
          footer: { logoText: 'IMPACT', allRightsText: `© ${new Date().getFullYear()} IMPACT.` } as any,
        },
      },
      roles: {
        create: [
          { name: 'Manager', isSystem: false, permissions: SYSTEM_ROLE_PERMISSIONS.EDITOR },
        ],
      },
    },
    include: { site: true },
  });

  // Populate with a dark electro/club music template, then force the IMPACT art
  // direction (electric blue) + social links on top. The IMPACT branding overlay
  // (impact-site CSS, ImpactHero/ImpactBio) recolours it into the final look.
  const template = getTemplate('music-neon');
  if (template) await applyTemplateToSite(org.site!.id, template, 'IMPACT', profile);

  const site = await prisma.site.findUniqueOrThrow({ where: { id: org.site!.id }, select: { header: true, footer: true } });
  const header = { ...((site.header as any) || {}), logoText: 'IMPACT', social: { instagram: 'https://www.instagram.com/impactdj_raw', tiktok: 'https://www.tiktok.com/@impactdj_raw' } };
  const footer = { ...((site.footer as any) || {}), logoText: 'IMPACT' };
  await prisma.site.update({
    where: { id: org.site!.id },
    data: { theme: theme as any, header: header as any, footer: footer as any, customDomain: IMPACT_HOST, domainVerified: true, published: true },
  });

  console.log('✅ Profil IMPACT créé (compte offert, sans abonnement payant).');
  console.log('   Connexion IMPACT : impact@easyasso.fr / impact1234');
  console.log(`   URL interne : /s/${IMPACT_SUBDOMAIN}  ·  domaine : https://${IMPACT_HOST}  ·  admin : /impact-admin`);
}

main()
  .then(seedImpact)
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
