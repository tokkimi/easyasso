import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { rateLimit, rateLimitExceeded } from '@/lib/rate-limit';

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token') || '';
  const invitation = await prisma.invitation.findUnique({ where: { token }, include: { organization: true, role: true } });
  if (!invitation || invitation.acceptedAt) return NextResponse.json({ error: 'Cette invitation est invalide ou déjà utilisée.' }, { status: 404 });
  return NextResponse.json({ invitation: { email: invitation.email, organizationName: invitation.organization.name, roleName: invitation.role?.name || invitation.systemRole, existingAccount: Boolean(await prisma.user.findUnique({ where: { email: invitation.email } })) } });
}

export async function POST(req: Request) {
  if (!rateLimit(req, 'accept-invitation', 20, 60 * 60 * 1000).ok) return rateLimitExceeded();
  const b = await req.json().catch(() => ({}));
  const token = String(b.token || ''); const password = String(b.password || ''); const name = String(b.name || '').trim();
  if (!token || password.length < 6) return NextResponse.json({ error: 'Mot de passe invalide.' }, { status: 400 });
  const invitation = await prisma.invitation.findUnique({ where: { token }, include: { role: true } });
  if (!invitation || invitation.acceptedAt) return NextResponse.json({ error: 'Cette invitation est invalide ou déjà utilisée.' }, { status: 404 });
  let user = await prisma.user.findUnique({ where: { email: invitation.email } });
  if (user) {
    if (!user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) return NextResponse.json({ error: 'Mot de passe incorrect pour ce compte.' }, { status: 401 });
  } else {
    if (!name) return NextResponse.json({ error: 'Votre nom est requis.' }, { status: 400 });
    user = await prisma.user.create({ data: { email: invitation.email, name, passwordHash: await bcrypt.hash(password, 10), emailVerified: new Date() } });
  }
  await prisma.$transaction([
    prisma.membership.upsert({
      where: { userId_organizationId: { userId: user.id, organizationId: invitation.organizationId } },
      create: { userId: user.id, organizationId: invitation.organizationId, systemRole: invitation.systemRole, roleId: invitation.roleId },
      update: { systemRole: invitation.systemRole, roleId: invitation.roleId },
    }),
    prisma.invitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date() } }),
  ]);
  return NextResponse.json({ ok: true, email: invitation.email });
}
