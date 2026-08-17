import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createOrganizationForUser } from '@/lib/bootstrap';
import { sendVerificationEmail } from '@/lib/mail';

const schema = z.object({
  name: z.string().min(1),
  assoName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  language: z.enum(['fr', 'en']).default('fr'),
  startMode: z.enum(['trial', 'pay']).optional().default('trial'),
  phone: z.string().optional().default(''),
  city: z.string().optional().default(''),
  legalName: z.string().optional().default(''),
  registrationNumber: z.string().optional().default(''),
  legalAddress: z.string().optional().default(''),
  publicationDirector: z.string().optional().default(''),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Champs invalides', details: parsed.error.flatten() }, { status: 400 });
  }
  const { name, assoName, email, password, language, startMode, phone, city, legalName, registrationNumber, legalAddress, publicationDirector } = parsed.data;
  const lower = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: lower } });
  if (existing) {
    return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email: lower, passwordHash } });
  await createOrganizationForUser(user.id, assoName, language, startMode === 'pay', {
    email: lower,
    phone,
    city,
    legalName: legalName || assoName,
    registrationNumber,
    legalAddress,
    publicationDirector: publicationDirector || name,
  });
  await sendVerificationEmail(lower, language).catch((error) => console.error('Verification email failed', error));

  return NextResponse.json({ ok: true });
}
