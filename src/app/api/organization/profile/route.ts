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
});

export async function PATCH(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.ORG_SETTINGS);
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Informations invalides.' }, { status: 400 });
    const org = await prisma.organization.update({ where: { id: ctx.org.id }, data: { profile: parsed.data }, select: { profile: true } });
    return NextResponse.json(org.profile);
  } catch (e) { return handleApiError(e); }
}
