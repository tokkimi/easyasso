import { NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/mail';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { memberships: { take: 1, include: { organization: true } } },
    });
    if (user) {
      const language = ((user.memberships[0]?.organization.profile as any)?.language === 'en' ? 'en' : 'fr') as 'fr' | 'en';
      await sendPasswordResetEmail(email, language).catch((error) => console.error('Password reset email failed', error));
    }
  }
  return NextResponse.json({ ok: true });
}
