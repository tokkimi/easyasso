import { requirePlatformAdmin } from '@/lib/platform-admin';
import { prisma } from '@/lib/prisma';
import { siteUrlFor } from '@/lib/utils';
import { AdminClient } from './admin-client';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await requirePlatformAdmin();
  const [organizations, userCount, contactCount] = await Promise.all([
    prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        site: true,
        memberships: {
          where: { systemRole: 'OWNER' },
          include: { user: true },
          take: 1,
        },
        platformMessages: { orderBy: { createdAt: 'asc' }, take: 200 },
      },
    }),
    prisma.user.count(),
    prisma.contactMessage.count(),
  ]);
  const validatedRevenue = organizations.filter((org) => org.planStatus === 'ACTIVE').length * 250;
  const pendingRevenue = organizations.filter((org) => org.planStatus !== 'ACTIVE').length * 250;

  return (
    <AdminClient
      stats={{
        organizations: organizations.length,
        users: userCount,
        active: organizations.filter((org) => org.planStatus === 'ACTIVE').length,
        pending: organizations.filter((org) => org.planStatus !== 'ACTIVE').length,
        trials: organizations.filter((org) => org.planStatus === 'TRIAL').length,
        validatedRevenue,
        pendingRevenue,
        contactMessages: contactCount,
      }}
      organizations={organizations.map((org) => {
        const owner = org.memberships[0]?.user;
        const profile = (org.profile || {}) as Record<string, any>;
        const manual = (profile.easyassoManualPayment || {}) as Record<string, any>;
        return {
          id: org.id,
          name: org.name,
          planStatus: org.planStatus,
          createdAt: org.createdAt.toISOString(),
          trialEndsAt: org.trialEndsAt ? org.trialEndsAt.toISOString() : null,
          paidAt: org.paidAt ? org.paidAt.toISOString() : null,
          ownerId: owner?.id || '',
          ownerEmail: owner?.email || '',
          ownerName: owner?.name || '',
          ownerEmailVerified: owner?.emailVerified ? owner.emailVerified.toISOString() : null,
          ownerIsSuperAdmin: owner?.isSuperAdmin || false,
          published: org.site?.published || false,
          adminNote: String(profile.platformAdminNote || ''),
          siteUrl: org.site ? siteUrlFor(org.site.subdomain, org.site.customDomain, org.site.domainVerified) : '#',
          manual: {
            reference: manual.reference || '',
            amountEur: manual.amountEur || 250,
            status: manual.status || '',
            requestedAt: manual.requestedAt || '',
            validatedAt: manual.validatedAt || '',
            bankReference: manual.bankReference || '',
            proofSubmittedAt: manual.proofSubmittedAt || '',
            proofNote: manual.proofNote || '',
            proofFile: manual.proofFile || null,
          },
          thread: org.platformMessages.map((m) => ({ id: m.id, fromAdmin: m.fromAdmin, authorName: m.authorName, body: m.body, createdAt: m.createdAt.toISOString() })),
          unreadFromOrg: org.platformMessages.filter((m) => !m.fromAdmin && !m.readByAdmin).length,
        };
      })}
    />
  );
}
