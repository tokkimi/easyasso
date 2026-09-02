import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { currentCustomer, destroyCustomerSession } from '@/lib/customer-session';

const profileSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().max(120).optional(),
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  phone: z.string().max(40).optional(),
  email: z.string().email().optional(),
  locale: z.enum(['fr', 'en']).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
  address: z.object({
    label: z.string().max(80).default('Adresse principale'),
    recipientName: z.string().max(120).default(''),
    phone: z.string().max(40).default(''),
    line1: z.string().min(2).max(200),
    line2: z.string().max(200).default(''),
    postalCode: z.string().min(2).max(24),
    city: z.string().min(2).max(100),
    region: z.string().max(100).default(''),
    countryCode: z.string().length(2).transform((v) => v.toUpperCase()),
  }).optional(),
});

export async function GET(req: Request) {
  const organizationId = new URL(req.url).searchParams.get('organizationId') || '';
  const customer = await currentCustomer(organizationId);
  if (!customer) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  const profile = await prisma.customerProfile.findUnique({
    where: { id: customer.id },
    select: {
      id: true, email: true, name: true, firstName: true, lastName: true, phone: true, locale: true,
      addresses: { orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }] },
      orders: {
        orderBy: { createdAt: 'desc' }, take: 50,
        include: { items: true, events: { where: { visibleToCustomer: true }, orderBy: { createdAt: 'desc' } } },
      },
    },
  });
  return NextResponse.json({ profile });
}

export async function PATCH(req: Request) {
  const parsed = profileSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Informations invalides.' }, { status: 400 });
  const customer = await currentCustomer(parsed.data.organizationId);
  if (!customer) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });
  if (parsed.data.newPassword) {
    if (!customer.passwordHash || !parsed.data.currentPassword || !(await bcrypt.compare(parsed.data.currentPassword, customer.passwordHash))) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 400 });
    }
  }
  if (parsed.data.email && parsed.data.email.trim().toLowerCase() !== customer.email && (!parsed.data.currentPassword || !customer.passwordHash || !(await bcrypt.compare(parsed.data.currentPassword, customer.passwordHash)))) {
    return NextResponse.json({ error: 'Saisissez votre mot de passe actuel pour modifier l’adresse email.' }, { status: 400 });
  }
  const { address } = parsed.data;
  await prisma.$transaction(async (tx) => {
    await tx.customerProfile.update({
      where: { id: customer.id },
      data: {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name.trim() } : {}),
        ...(parsed.data.firstName !== undefined ? { firstName: parsed.data.firstName.trim() } : {}),
        ...(parsed.data.lastName !== undefined ? { lastName: parsed.data.lastName.trim() } : {}),
        ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone.trim() } : {}),
        ...(parsed.data.email !== undefined ? { email: parsed.data.email.trim().toLowerCase() } : {}),
        ...(parsed.data.locale ? { locale: parsed.data.locale } : {}),
        ...(parsed.data.newPassword ? { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10) } : {}),
      },
    });
    if (address) {
      await tx.customerAddress.updateMany({ where: { customerProfileId: customer.id }, data: { isDefault: false } });
      const existing = await tx.customerAddress.findFirst({ where: { customerProfileId: customer.id }, orderBy: { updatedAt: 'desc' } });
      if (existing) await tx.customerAddress.update({ where: { id: existing.id }, data: { ...address, isDefault: true } });
      else await tx.customerAddress.create({ data: { ...address, customerProfileId: customer.id, isDefault: true } });
    }
  });
  return GET(new Request(`${new URL(req.url).origin}/api/public/customer-account?organizationId=${encodeURIComponent(parsed.data.organizationId)}`));
}

export async function DELETE() {
  await destroyCustomerSession();
  return NextResponse.json({ ok: true });
}
