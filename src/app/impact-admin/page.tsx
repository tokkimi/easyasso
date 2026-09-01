import type { Metadata } from 'next';
import { ImpactAdminLogin } from '@/components/impact-admin-login';

export const metadata: Metadata = {
  title: { absolute: 'IMPACT · Administration' },
  description: 'Administration du site officiel IMPACT.',
  icons: { icon: [{ url: '/impact/logo.svg' }], apple: [{ url: '/impact/logo.svg' }] },
  robots: { index: false, follow: false },
};

export default function ImpactAdminPage() {
  return <ImpactAdminLogin />;
}
