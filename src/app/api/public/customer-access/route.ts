import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { rateLimit, rateLimitExceeded } from '@/lib/rate-limit';
import { createCustomerSession } from '@/lib/customer-session';

const schema = z.object({
  organizationId: z.string().min(1),
  email: z.string().email(),
  name: z.string().max(120).optional().default(''),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  if (!rateLimit(req, 'customer-access', 20, 60 * 60 * 1000).ok) return rateLimitExceeded();
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });

  const organization = await prisma.organization.findUnique({ where: { id: parsed.data.organizationId }, select: { id: true } });
  if (!organization) return NextResponse.json({ error: 'Site introuvable.' }, { status: 404 });

  const email = parsed.data.email.trim().toLowerCase();
  const name = parsed.data.name.trim();
  const existing = await prisma.customerProfile.findUnique({
    where: { organizationId_email: { organizationId: organization.id, email } },
    select: { id: true, email: true, name: true, passwordHash: true },
  });
  if (existing?.passwordHash) {
    const ok = await bcrypt.compare(parsed.data.password, existing.passwordHash);
    if (!ok) return NextResponse.json({ error: 'Email ou mot de passe incorrect.' }, { status: 401 });
  }
  const passwordHash = existing?.passwordHash || await bcrypt.hash(parsed.data.password, 10);
  const profile = existing
    ? await prisma.customerProfile.update({
      where: { id: existing.id },
      data: { ...(name ? { name } : {}), passwordHash, lastSeenAt: new Date() },
      select: { id: true, email: true, name: true },
    })
    : await prisma.customerProfile.create({
      data: { organizationId: organization.id, email, name, passwordHash },
      select: { id: true, email: true, name: true },
    });

  await createCustomerSession(profile.id);
  await prisma.order.updateMany({
    where: { organizationId: organization.id, customerEmail: email, customerProfileId: null },
    data: { customerProfileId: profile.id },
  });

  return NextResponse.json({ profile });
}
