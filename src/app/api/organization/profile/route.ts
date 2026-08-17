import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  year: z.string().max(4).optional().default(''),
  category: z.string().max(80).optional().default(''),
  mission: z.string().max(6000).optional().default(''),
  functioning: z.string().max(6000).optional().default(''),
  actions: z.string().max(6000).optional().default(''),
  beneficiaries: z.string().max(2000).optional().default(''),
  goodToKnow: z.string().max(6000).optional().default(''),
  city: z.string().max(200).optional().default(''),
  email: z.string().email().or(z.literal('')).optional().default(''),
  legalName: z.string().max(300).optional().default(''),
  registrationNumber: z.string().max(120).optional().default(''),
  legalAddress: z.string().max(500).optional().default(''),
  publicationDirector: z.string().max(300).optional().default(''),
  facebook: z.string().url().or(z.literal('')).optional().default(''),
  instagram: z.string().url().or(z.literal('')).optional().default(''),
  linkedin: z.string().url().or(z.literal('')).optional().default(''),
  youtube: z.string().url().or(z.literal('')).optional().default(''),
});

export async function PATCH(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.ORG_SETTINGS);
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Informations invalides.' }, { status: 400 });
    const org = await prisma.organization.update({ where: { id: ctx.org.id }, data: { profile: parsed.data }, select: { profile: true, name: true } });
    const site = await prisma.site.findUnique({ where: { organizationId: ctx.org.id } });
    if (site) {
      const footer = (site.footer as any) || {};
      const legalName = parsed.data.legalName || org.name;
      const legalDetails = [
        `Éditeur du site : ${legalName}`,
        parsed.data.registrationNumber ? `Numéro d’enregistrement : ${parsed.data.registrationNumber}` : '',
        parsed.data.legalAddress ? `Siège social : ${parsed.data.legalAddress}` : '',
        parsed.data.email ? `Contact : ${parsed.data.email}` : '',
        parsed.data.publicationDirector ? `Responsable de publication : ${parsed.data.publicationDirector}` : '',
      ].filter(Boolean).join('\n\n');
      const socialLinks = [
        ['Facebook', parsed.data.facebook], ['Instagram', parsed.data.instagram],
        ['LinkedIn', parsed.data.linkedin], ['YouTube', parsed.data.youtube],
      ].filter((entry) => entry[1]).map(([label, href]) => ({ label, href }));
      const baseColumns = (footer.columns || []).filter((column: any) => column.title !== 'Réseaux sociaux');
      await prisma.site.update({ where: { id: site.id }, data: { footer: {
        ...footer,
        showCgv: true,
        showMentions: true,
        mentionsContent: legalDetails,
        cgvContent: `Conditions générales d’utilisation du site de ${legalName}\n\nCe site présente les activités de l’association et permet, le cas échéant, de la contacter ou de lui adresser un don. Les paiements sont confirmés par le prestataire de paiement. Un don ne constitue pas l’achat d’un produit ou service.\n\nLes contenus restent la propriété de leurs titulaires. Toute reproduction non autorisée est interdite.\n\n${legalDetails}`,
        columns: socialLinks.length ? [...baseColumns, { title: 'Réseaux sociaux', links: socialLinks }] : baseColumns,
      } } });
    }
    return NextResponse.json(org.profile);
  } catch (e) { return handleApiError(e); }
}
