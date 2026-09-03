import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VIELUSOS_SUBDOMAIN, vielusosLogoUrl } from '@/lib/vielusos';

export const dynamic = 'force-dynamic';

export async function GET() {
  const site = await prisma.site.findUnique({ where: { subdomain: VIELUSOS_SUBDOMAIN }, select: { header: true, footer: true } });
  const logoUrl = vielusosLogoUrl(site);
  return NextResponse.json({
    name: 'VIELUSOS',
    short_name: 'VIELUSOS',
    start_url: '/vielusos-admin',
    display: 'standalone',
    background_color: '#0b0b10',
    theme_color: '#0b0b10',
    icons: [{ src: logoUrl, sizes: 'any', type: logoUrl.startsWith('data:image/svg') ? 'image/svg+xml' : 'image/png' }],
  }, { headers: { 'Cache-Control': 'no-store' } });
}
