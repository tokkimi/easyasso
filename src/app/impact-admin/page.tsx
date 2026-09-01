import type { Metadata } from 'next';
import { ImpactAdminLogin } from '@/components/impact-admin-login';
import { IMPACT_ICONS } from '@/lib/impact';

export const metadata: Metadata = {
  title: { absolute: 'IMPACT · Administration' },
  description: 'Administration du site officiel IMPACT.',
  icons: { icon: IMPACT_ICONS, apple: IMPACT_ICONS },
  robots: { index: false, follow: false },
};

export default function ImpactAdminPage() {
  return <ImpactAdminLogin />;
}
