import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

// Toggle the online shop on/off for this organization (stored on the profile).
export async function PATCH(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const body = await req.json().catch(() => ({}));
    const enabled = !!body.enabled;
    const org = await prisma.organization.findUnique({ where: { id: ctx.org.id } });
    await prisma.organization.update({
      where: { id: ctx.org.id },
      data: { profile: { ...((org?.profile as any) || {}), hasShop: enabled, shopEnabled: enabled } },
    });
    return NextResponse.json({ ok: true, enabled });
  } catch (e) { return handleApiError(e); }
}
