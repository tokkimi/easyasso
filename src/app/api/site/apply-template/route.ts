import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { getTemplate } from '@/lib/templates';
import { applyTemplateToSite } from '@/lib/apply-template';

export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const { templateId } = await req.json();
    const template = getTemplate(templateId);
    if (!template) return NextResponse.json({ error: 'Modèle introuvable' }, { status: 404 });
    const site = await prisma.site.findUniqueOrThrow({ where: { organizationId: ctx.org.id } });
    await applyTemplateToSite(site.id, template, ctx.org.name);
    return NextResponse.json({ ok: true });
  } catch (e) { return handleApiError(e); }
}
