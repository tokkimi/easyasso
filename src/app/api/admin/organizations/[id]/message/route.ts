import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requirePlatformAdmin } from '@/lib/platform-admin';
import { prisma } from '@/lib/prisma';

// Name the association sees when the platform team writes to them.
const SENDER_NAME = 'Easy Asso Manager';

const schema = z.object({
  subject: z.string().trim().max(200).optional().default(''),
  message: z.string().trim().min(1).max(8000),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requirePlatformAdmin();
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Message invalide.' }, { status: 400 });

  const org = await prisma.organization.findUnique({ where: { id }, select: { id: true } });
  if (!org) return NextResponse.json({ error: 'Organisation introuvable.' }, { status: 404 });

  await prisma.contactMessage.create({
    data: {
      organizationId: id,
      name: SENDER_NAME,
      email: admin.email || 'manager@easyasso',
      subject: parsed.data.subject || 'Message de l’équipe EasyAsso',
      message: parsed.data.message,
    },
  });

  return NextResponse.json({ ok: true });
}
