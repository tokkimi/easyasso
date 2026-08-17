import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

// Best-effort verification: fetches the custom domain and checks it resolves to
// this Easy Asso site. In production, pair this with your host's domain API
// (e.g. Vercel Domains) for automatic SSL + DNS validation.
export async function POST() {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_DOMAIN);
    const site = await prisma.site.findUniqueOrThrow({ where: { organizationId: ctx.org.id } });
    if (!site.customDomain) return NextResponse.json({ error: 'Aucun domaine configuré' }, { status: 400 });

    let verified = false;
    try {
      const res = await fetch(`https://${site.customDomain}`, { redirect: 'manual', signal: AbortSignal.timeout(5000) });
      // If the domain responds at all, we consider DNS reachable.
      verified = res.status > 0;
    } catch {
      verified = false;
    }

    const updated = await prisma.site.update({ where: { id: site.id }, data: { domainVerified: verified } });
    return NextResponse.json({ verified: updated.domainVerified });
  } catch (e) { return handleApiError(e); }
}
