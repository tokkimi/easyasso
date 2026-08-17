import { requirePlatformAdmin } from '@/lib/platform-admin';
import { prisma } from '@/lib/prisma';
import { siteUrlFor } from '@/lib/utils';
import { AdminClient } from './admin-client';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await requirePlatformAdmin();
  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      site: true,
      memberships: {
        where: { systemRole: 'OWNER' },
        include: { user: true },
        take: 1,
      },
    },
  });

  return (
    <AdminClient
      organizations={organizations.map((org) => {
        const owner = org.memberships[0]?.user;
        const profile = (org.profile || {}) as Record<string, any>;
        const manual = (profile.easyassoManualPayment || {}) as Record<string, any>;
        return {
          id: org.id,
          name: org.name,
          planStatus: org.planStatus,
          createdAt: org.createdAt.toISOString(),
          paidAt: org.paidAt ? org.paidAt.toISOString() : null,
          ownerEmail: owner?.email || '',
          ownerName: owner?.name || '',
          siteUrl: org.site ? siteUrlFor(org.site.subdomain, org.site.customDomain, org.site.domainVerified) : '#',
          manual: {
            reference: manual.reference || '',
            amountEur: manual.amountEur || 250,
            status: manual.status || '',
            requestedAt: manual.requestedAt || '',
            proofSubmittedAt: manual.proofSubmittedAt || '',
            proofNote: manual.proofNote || '',
            proofFile: manual.proofFile || null,
          },
        };
      })}
    />
  );
}
