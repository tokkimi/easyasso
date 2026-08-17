import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({ orgId: z.string(), email: z.string().email() });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const { orgId, email } = parsed.data;
  await prisma.newsletterSubscriber
    .create({ data: { organizationId: orgId, email: email.toLowerCase() } })
    .catch(() => null); // ignore duplicates
  return NextResponse.json({ ok: true });
}
