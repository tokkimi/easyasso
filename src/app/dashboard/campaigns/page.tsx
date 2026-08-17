import { requirePermission } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { PERMISSIONS } from '@/lib/permissions';
import { CampaignsClient } from './client';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const ctx = await requirePermission(PERMISSIONS.CAMPAIGNS_VIEW);
  const orgId = ctx.organization!.id;
  const campaigns = await prisma.campaign.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: 'desc' } });
  const sums = await prisma.donation.groupBy({
    by: ['campaignId'], where: { organizationId: orgId, status: 'COMPLETED' }, _sum: { amountCents: true },
  });
  const raised: Record<string, number> = {};
  sums.forEach((s) => { if (s.campaignId) raised[s.campaignId] = s._sum.amountCents || 0; });
  return (
    <CampaignsClient
      campaigns={JSON.parse(JSON.stringify(campaigns))}
      raised={raised}
      canEdit={ctx.permissions.has(PERMISSIONS.CAMPAIGNS_EDIT)}
    />
  );
}
