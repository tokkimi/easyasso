import { redirect } from 'next/navigation';
import { requireOrg } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { siteUrlFor } from '@/lib/utils';
import { Sidebar } from './sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireOrg();
  const org = ctx.organization!;
  if (org.planStatus !== 'ACTIVE') redirect('/onboarding');

  const site = await prisma.site.findUnique({ where: { organizationId: org.id } });
  const siteUrl = site ? siteUrlFor(site.subdomain, site.customDomain) : '#';

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <Sidebar
        orgName={org.name}
        userName={ctx.user.name || ctx.user.email}
        permissions={Array.from(ctx.permissions)}
        siteUrl={siteUrl}
        published={site?.published ?? false}
      />
      <main className="flex-1 lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
