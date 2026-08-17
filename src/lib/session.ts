import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';
import { prisma } from './prisma';
import { permissionsForMembership, type Permission, type SystemRole } from './permissions';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  const id = (session?.user as any)?.id as string | undefined;
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}

export interface OrgContext {
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
  organization: Awaited<ReturnType<typeof prisma.organization.findFirst>>;
  membership: { systemRole: SystemRole };
  permissions: Set<string>;
}

// Loads the current user's primary organization + effective permissions.
export async function requireOrg(): Promise<OrgContext> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    include: { organization: true, role: true },
    orderBy: { createdAt: 'asc' },
  });

  if (!membership) redirect('/onboarding');

  const permissions = permissionsForMembership(
    membership.systemRole as SystemRole,
    membership.role?.permissions
  );

  return {
    user,
    organization: membership.organization,
    membership: { systemRole: membership.systemRole as SystemRole },
    permissions,
  };
}

export async function requirePermission(permission: Permission): Promise<OrgContext> {
  const ctx = await requireOrg();
  if (!ctx.permissions.has(permission)) redirect('/dashboard?denied=1');
  return ctx;
}

// Trial / subscription access state for an organization.
export function planAccess(org: { planStatus: string; trialEndsAt: Date | null } | null) {
  if (!org) return { hasAccess: false, isTrial: false, daysLeft: 0, expired: true };
  if (org.planStatus === 'ACTIVE') return { hasAccess: true, isTrial: false, daysLeft: 0, expired: false };
  if (org.planStatus === 'TRIAL' && org.trialEndsAt) {
    const ms = new Date(org.trialEndsAt).getTime() - Date.now();
    const daysLeft = Math.max(0, Math.ceil(ms / 86400000));
    return { hasAccess: ms > 0, isTrial: true, daysLeft, expired: ms <= 0 };
  }
  return { hasAccess: false, isTrial: org.planStatus === 'TRIAL', daysLeft: 0, expired: true };
}
