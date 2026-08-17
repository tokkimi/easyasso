import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireOrg } from '@/lib/session';
import { activateOrganization } from '@/lib/activation';
import { stripe } from '@/lib/stripe';
import { CheckCircle2 } from 'lucide-react';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; demo?: string }>;
}) {
  const params = await searchParams;
  const ctx = await requireOrg();
  const org = ctx.organization!;

  // Confirm the payment (fallback if webhook hasn't fired yet).
  if (org.planStatus !== 'ACTIVE') {
    if (params.demo) {
      await activateOrganization(org.id);
    } else if (params.session_id && stripe) {
      const s = await stripe.checkout.sessions.retrieve(params.session_id);
      if (s.payment_status === 'paid') await activateOrganization(org.id, s.id);
    }
  }

  const fresh = await (await import('@/lib/prisma')).prisma.organization.findUnique({ where: { id: org.id } });
  if (fresh?.planStatus !== 'ACTIVE') redirect('/onboarding?pending=1');

  return (
    <div className="grid min-h-screen place-items-center bg-gray-50 px-4">
      <div className="card w-full max-w-md text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Votre site est activé 🎉</h1>
        <p className="mt-2 text-gray-600">
          Bienvenue {ctx.user.name?.split(' ')[0]} ! Vous pouvez maintenant tout personnaliser en toute autonomie.
        </p>
        <Link href="/dashboard" className="btn btn-primary mt-6 w-full py-3">Accéder à mon tableau de bord</Link>
      </div>
    </div>
  );
}
