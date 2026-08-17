import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { buildGeneratedSite, type GenerateInput } from '@/lib/generate';
import { aiGenerateSite } from '@/lib/ai';
import { applyTemplateToSite } from '@/lib/apply-template';

// AI copywriting can take 20-40s; allow up to 60s.
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const b = await req.json();
    const name = (b.name || '').trim() || ctx.org.name;

    if (b.name && b.name.trim() && b.name.trim() !== ctx.org.name) {
      await prisma.organization.update({ where: { id: ctx.org.id }, data: { name: b.name.trim() } });
    }

    const input: GenerateInput = {
      name,
      year: b.year || undefined,
      mission: b.mission || b.description || undefined,
      functioning: b.functioning || undefined,
      goodToKnow: b.goodToKnow || undefined,
      beneficiaries: b.beneficiaries || undefined,
      actions: b.actions || undefined,
      city: b.city || undefined,
      email: b.email || undefined,
      category: b.category || undefined,
      logoUrl: b.logoUrl || undefined,
      photos: Array.isArray(b.photos) ? b.photos.slice(0, 8) : [],
    };

    // Try AI generation first (rich, all pages); fall back to the deterministic
    // builder if no API key or the model call fails.
    const generated = (await aiGenerateSite(input)) || buildGeneratedSite(input);

    const site = await prisma.site.findUniqueOrThrow({ where: { organizationId: ctx.org.id } });
    await applyTemplateToSite(site.id, generated, name);
    await prisma.site.update({ where: { id: site.id }, data: { name, published: true } });
    return NextResponse.json({ ok: true });
  } catch (e) { return handleApiError(e); }
}
