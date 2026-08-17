import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createOrganizationForUser } from '@/lib/bootstrap';

const schema = z.object({
  name: z.string().min(1),
  assoName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  language: z.enum(['fr', 'en']).default('fr'),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Champs invalides', details: parsed.error.flatten() }, { status: 400 });
  }
  const { name, assoName, email, password, language } = parsed.data;
  const lower = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: lower } });
  if (existing) {
    return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email: lower, passwordHash } });
  await createOrganizationForUser(user.id, assoName, language);

  return NextResponse.json({ ok: true });
}
