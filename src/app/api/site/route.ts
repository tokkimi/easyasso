import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

// Update site: header/footer/theme/publish/customDomain
export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    // Domain changes need a dedicated permission
    if (body.customDomain !== undefined) {
      const ctx = await requireApiPermission(PERMISSIONS.SITE_DOMAIN);
      const domain = String(body.customDomain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      const site = await prisma.site.update({
        where: { organizationId: ctx.org.id },
        data: { customDomain: domain || null, domainVerified: false },
      });
      return NextResponse.json(site);
    }

    const ctx = await requireApiPermission(body.published !== undefined ? PERMISSIONS.SITE_PUBLISH : PERMISSIONS.SITE_EDIT);
    const data: any = {};
    if (body.header !== undefined) data.header = body.header;
    if (body.footer !== undefined) data.footer = body.footer;
    if (body.theme !== undefined) data.theme = body.theme;
    if (body.name !== undefined) data.name = body.name;
    if (body.published !== undefined) data.published = !!body.published;
    const site = await prisma.site.update({ where: { organizationId: ctx.org.id }, data });
    return NextResponse.json(site);
  } catch (e) {
    return handleApiError(e);
  }
}
