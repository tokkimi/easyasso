import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError, ApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

async function owned(id: string, orgId: string) {
  const d = await prisma.donation.findUnique({ where: { id } });
  if (!d || d.organizationId !== orgId) throw new ApiError(404, 'Don introuvable');
  return d;
}

// Issue a fiscal receipt: { issueReceipt: true } — or delete.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await requireApiPermission(PERMISSIONS.RECEIPTS_MANAGE);
    await owned(id, ctx.org.id);
    const year = new Date().getFullYear();
    const count = await prisma.donation.count({ where: { organizationId: ctx.org.id, receiptIssued: true } });
    const receiptNumber = `${year}-${String(count + 1).padStart(4, '0')}`;
    const d = await prisma.donation.update({ where: { id }, data: { receiptIssued: true, receiptNumber } });
    return NextResponse.json(d);
  } catch (e) { return handleApiError(e); }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await requireApiPermission(PERMISSIONS.DONATIONS_EDIT);
    await owned(id, ctx.org.id);
    await prisma.donation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) { return handleApiError(e); }
}
