import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createOrganizationForUser } from '@/lib/bootstrap';
import { sendVerificationEmail } from '@/lib/mail';

const schema = z.object({
  name: z.string().trim().min(1),
  assoName: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  language: z.enum(['fr', 'en']).default('fr'),
  phone: z.string().trim().min(1, 'Téléphone obligatoire'),
  city: z.string().trim().min(1, 'Ville obligatoire'),
  legalName: z.string().trim().min(1, 'Nom légal obligatoire'),
  registrationNumber: z.string().trim().min(1, 'Numéro d’enregistrement obligatoire'),
  legalAddress: z.string().trim().min(1, 'Adresse légale obligatoire'),
  publicationDirector: z.string().trim().min(1, 'Directeur de publication obligatoire'),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Champs invalides', details: parsed.error.flatten() }, { status: 400 });
  }
  const { name, assoName, email, password, language, phone, city, legalName, registrationNumber, legalAddress, publicationDirector } = parsed.data;
  const lower = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: lower } });
  if (existing) {
    return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email: lower, passwordHash } });
  await createOrganizationForUser(user.id, assoName, language, false, {
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
