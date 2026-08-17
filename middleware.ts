import { NextResponse, type NextRequest } from 'next/server';

// Maps custom domains to the internal /domain/<host> renderer. The app's own
// domain (root) and Vercel preview URLs are served normally.
export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').split(':')[0].toLowerCase();
  const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost').split(':')[0].toLowerCase();

  const isRoot =
    host === root ||
    host === `www.${root}` ||
    host === 'localhost' ||
    host.endsWith('.vercel.app') ||
    host === '127.0.0.1';

  if (isRoot) return NextResponse.next();

  // Any other host is treated as a linked custom domain.
  const url = req.nextUrl.clone();
  const path = url.pathname === '/' ? '' : url.pathname;
  url.pathname = `/domain/${encodeURIComponent(host)}${path}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, API routes and static assets.
  matcher: ['/((?!_next/|api/|favicon.ico|robots.txt).*)'],
};
