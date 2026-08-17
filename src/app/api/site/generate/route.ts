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
      news: b.news || undefined,
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
    const profile = (ctx.org.profile as Record<string, string>) || {};
    const legalName = profile.legalName || name;
    const legalDetails = [
      `Éditeur du site : ${legalName}`,
      profile.registrationNumber ? `Numéro d’enregistrement : ${profile.registrationNumber}` : '',
      profile.legalAddress ? `Siège social : ${profile.legalAddress}` : '',
      input.email ? `Contact : ${input.email}` : '',
      profile.publicationDirector ? `Responsable de publication : ${profile.publicationDirector}` : '',
    ].filter(Boolean).join('\n\n');
    const cgvContent = `Conditions générales d’utilisation du site de ${legalName}\n\nLe présent site informe le public sur les activités de l’association et permet, le cas échéant, d’effectuer des dons ou de prendre contact avec elle. Les informations communiquées doivent être utilisées de manière loyale.\n\nLes dons et paiements sont confirmés lors de leur validation par le prestataire de paiement. Un don définitivement encaissé ne constitue pas l’achat d’un produit ou service. Pour toute demande, utilisez les coordonnées publiées sur le site.\n\nLes textes, images et signes distinctifs restent la propriété de leurs titulaires. Toute reproduction non autorisée est interdite.\n\n${legalDetails}`;
    await prisma.site.update({
      where: { id: site.id },
      data: {
        name,
        published: true,
        footer: { ...(generated.footer as any), showCgv: true, showMentions: true, cgvContent, mentionsContent: legalDetails },
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) { return handleApiError(e); }
}
