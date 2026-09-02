import { createHash, randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const CUSTOMER_COOKIE = 'easyasso_customer_session';
const SESSION_DAYS = 30;

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function createCustomerSession(customerProfileId: string) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.customerSession.create({ data: { customerProfileId, tokenHash: hashToken(token), expiresAt } });
  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
}

export async function currentCustomer(organizationId?: string) {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.customerSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { customerProfile: true },
  });
  if (!session || session.expiresAt <= new Date()) return null;
  if (organizationId && session.customerProfile.organizationId !== organizationId) return null;
  await prisma.customerSession.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } }).catch(() => {});
  return session.customerProfile;
}

export async function destroyCustomerSession() {
  const jar = await cookies();
  const token = jar.get(CUSTOMER_COOKIE)?.value;
  if (token) await prisma.customerSession.deleteMany({ where: { tokenHash: hashToken(token) } }).catch(() => {});
  jar.set(CUSTOMER_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 });
}
