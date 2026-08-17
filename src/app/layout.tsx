import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/icon-192.png', type: 'image/png', sizes: '192x192' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  title: 'Easy Asso — Créez le site de votre association, sans compétence technique',
  description:
    'Easy Asso permet à toute association de créer un site professionnel, collecter des dons, gérer ses donateurs et sa comptabilité, en toute autonomie.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
