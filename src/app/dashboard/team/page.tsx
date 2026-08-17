import { requirePermission } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { PERMISSIONS, PERMISSION_GROUPS, SYSTEM_ROLE_LABELS } from '@/lib/permissions';
import { TeamClient } from './client';

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const ctx = await requirePermission(PERMISSIONS.TEAM_VIEW);
  const orgId = ctx.organization!.id;
  const [memberships, roles, invitations] = await Promise.all([
    prisma.membership.findMany({ where: { organizationId: orgId }, include: { user: true, role: true }, orderBy: { createdAt: 'asc' } }),
    prisma.role.findMany({ where: { organizationId: orgId }, orderBy: { name: 'asc' } }),
    prisma.invitation.findMany({ where: { organizationId: orgId, acceptedAt: null }, orderBy: { createdAt: 'desc' } }),
  ]);
  return (
    <TeamClient
      members={JSON.parse(JSON.stringify(memberships))}
      roles={JSON.parse(JSON.stringify(roles))}
      invitations={JSON.parse(JSON.stringify(invitations))}
      groups={PERMISSION_GROUPS}
      roleLabels={SYSTEM_ROLE_LABELS}
      canManageTeam={ctx.permissions.has(PERMISSIONS.TEAM_MANAGE)}
      canManageRoles={ctx.permissions.has(PERMISSIONS.ROLES_MANAGE)}
      currentUserId={ctx.user.id}
    />
  );
}
