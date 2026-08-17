import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { requireOrg, planAccess } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { siteUrlFor } from '@/lib/utils';
import { isPlatformAdmin } from '@/lib/platform-admin';
import { Sidebar } from './sidebar';
import { EmailVerificationBanner } from './email-verification-banner';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireOrg();
  const org = ctx.organization!;
  const access = planAccess(org);
  if (!access.hasAccess) redirect('/onboarding'); // trial expired or unpaid → paywall

  const site = await prisma.site.findUnique({ where: { organizationId: org.id } });
  const unreadMessages = await prisma.contactMessage.count({ where: { organizationId: org.id, readAt: null, archivedAt: null } });
  const siteUrl = site ? siteUrlFor(site.subdomain, site.customDomain, site.domainVerified) : '#';
  const platformAdmin = isPlatformAdmin(ctx.user);

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <Sidebar
        orgName={org.name}
        userName={ctx.user.name || ctx.user.email}
        permissions={Array.from(ctx.permissions)}
        siteUrl={siteUrl}
        published={site?.published ?? false}
        unreadMessages={unreadMessages}
      />
      <main className="flex-1 lg:ml-64">
        {access.isTrial && (
          <div className="flex flex-wrap items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white">
            <Clock className="h-4 w-4" />
            {access.daysLeft > 0
              ? <>Période d’essai : <strong>{access.daysLeft} jour{access.daysLeft > 1 ? 's' : ''}</strong> restant{access.daysLeft > 1 ? 's' : ''}. Débloquez votre site à vie.</>
              : <>Votre essai se termine aujourd’hui. Activez votre site pour ne pas perdre l’accès.</>}
            <Link href="/onboarding" className="ml-1 rounded-md bg-white px-3 py-1 text-xs font-bold text-amber-700 hover:bg-amber-50">Payer 250 € (à vie)</Link>
          </div>
        )}
        {!ctx.user.emailVerified && <EmailVerificationBanner />}
        {platformAdmin && (
          <div className="border-b border-brand-100 bg-brand-50 px-4 py-2 text-center text-sm font-semibold text-brand-800">
            Vous êtes admin EasyAsso · <Link href="/admin" className="underline">ouvrir l’administration globale</Link>
          </div>
        )}
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
