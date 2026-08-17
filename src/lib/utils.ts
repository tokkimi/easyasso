import { customAlphabet } from 'nanoid';

// URL-safe slug fragments (no ambiguous chars)
const nano = customAlphabet('23456789abcdefghijkmnpqrstuvwxyz', 8);

const ASSO_WORDS = ['colibri', 'oasis', 'phenix', 'boreal', 'solidaire', 'lumiere', 'horizon', 'elan', 'graine', 'ruche'];

// Generate a random, friendly subdomain like "oasis-8kd2fa"
export function randomSubdomain(): string {
  const word = ASSO_WORDS[Math.floor(Math.random() * ASSO_WORDS.length)];
  return `${word}-${nano()}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'page';
}

export function formatEuros(cents: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export function formatDate(d: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(d));
}

export function token(): string {
  return customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 32)();
}

export function rootDomain(): string {
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
}

export function siteUrlFor(subdomain: string, customDomain?: string | null): string {
  if (customDomain) return `https://${customDomain}`;
  const root = rootDomain();
  const protocol = root.includes('localhost') ? 'http' : 'https';
  // Path-based routing keeps it working on Vercel without wildcard DNS setup
  return `${protocol}://${root.replace(/\/$/, '')}/s/${subdomain}`;
}
