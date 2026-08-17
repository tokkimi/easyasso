import Stripe from 'stripe';

export const isDemoMode = process.env.DEMO_MODE === '1' || !process.env.STRIPE_SECRET_KEY;

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' })
  : null;

export const PRICE_EUR = Number(process.env.NEXT_PUBLIC_PRICE_EUR || '250');
