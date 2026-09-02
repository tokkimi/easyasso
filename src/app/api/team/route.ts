import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { token } from '@/lib/utils';
import { sendTeamInvitationEmail } from '@/lib/mail';
import { appBaseUrl } from '@/lib/utils';

// Invite a member by email: { email, systemRole }
export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.TEAM_MANAGE);
    const b = await req.json();
    const email = String(b.email || '').toLowerCase();
    if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    const roleId = b.roleId ? String(b.roleId) : null;
    const customRole = roleId ? await prisma.role.findFirst({ where: { id: roleId, organizationId: ctx.org.id } }) : null;
    if (roleId && !customRole) return NextResponse.json({ error: 'Rôle personnalisé introuvable.' }, { status: 400 });
    const systemRole = customRole ? 'MEMBER' : (b.systemRole || 'MEMBER');
    const roleName = customRole?.name || systemRole;

    // If user exists, add membership directly; else create an invitation.
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const existing = await prisma.membership.findUnique({
        where: { userId_organizationId: { userId: user.id, organizationId: ctx.org.id } },
      });
      if (existing) return NextResponse.json({ error: 'Déjà membre' }, { status: 409 });
      await prisma.membership.create({
        data: { userId: user.id, organizationId: ctx.org.id, systemRole, roleId: customRole?.id || null },
      });
      await sendTeamInvitationEmail({ email, token: '', organizationName: ctx.org.name, roleName }).catch((error) => console.error('Team notification email failed', error));
      return NextResponse.json({ ok: true, added: true, emailSent: Boolean(process.env.RESEND_API_KEY), inviteUrl: `${appBaseUrl()}/login` });
    }

    const inv = await prisma.invitation.upsert({
      where: { organizationId_email: { organizationId: ctx.org.id, email } },
      update: { systemRole, roleId: customRole?.id || null, token: token() },
      create: { organizationId: ctx.org.id, email, systemRole, roleId: customRole?.id || null, token: token(), invitedById: ctx.userId },
    });
    const mail = await sendTeamInvitationEmail({ email, token: inv.token, organizationName: ctx.org.name, roleName }).catch((error) => ({ error: String(error?.message || error) }));
    return NextResponse.json({ ok: true, invited: true, emailSent: !(mail as any)?.skipped && !(mail as any)?.error, inviteUrl: `${appBaseUrl()}/accept-invitation?token=${encodeURIComponent(inv.token)}` });
  } catch (e) { return handleApiError(e); }
}

// Update a member role: { membershipId, systemRole, roleId }
export async function PATCH(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.TEAM_MANAGE);
    const b = await req.json();
    const m = await prisma.membership.findUnique({ where: { id: b.membershipId } });
    if (!m || m.organizationId !== ctx.org.id) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    if (m.systemRole === 'OWNER') return NextResponse.json({ error: 'Le propriétaire ne peut pas être modifié.' }, { status: 400 });
    if (b.roleId) {
      const role = await prisma.role.findFirst({ where: { id: String(b.roleId), organizationId: ctx.org.id } });
      if (!role) return NextResponse.json({ error: 'Rôle personnalisé introuvable.' }, { status: 400 });
    }
    await prisma.membership.update({
      where: { id: b.membershipId },
      data: { systemRole: b.systemRole || m.systemRole, roleId: b.roleId === '' ? null : b.roleId ?? m.roleId },
    });
    return NextResponse.json({ ok: true });
  } catch (e) { return handleApiError(e); }
}

// Remove a member: { membershipId }
export async function DELETE(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.TEAM_MANAGE);
    const b = await req.json();
    const m = await prisma.membership.findUnique({ where: { id: b.membershipId } });
    if (!m || m.organizationId !== ctx.org.id) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    if (m.systemRole === 'OWNER') return NextResponse.json({ error: 'Impossible de retirer le propriétaire.' }, { status: 400 });
    await prisma.membership.delete({ where: { id: b.membershipId } });
    return NextResponse.json({ ok: true });
  } catch (e) { return handleApiError(e); }
}
