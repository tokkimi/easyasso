// The two ways an association can keep EasyAsso after the free trial.
export type PlanId = 'lifetime' | 'annual';

const LIFETIME_EUR = Number(process.env.NEXT_PUBLIC_PRICE_EUR || '250');
const ANNUAL_EUR = Number(process.env.NEXT_PUBLIC_PRICE_ANNUAL_EUR || '99');

export const PLANS = {
  lifetime: { id: 'lifetime' as PlanId, amountEur: LIFETIME_EUR, name: 'À vie', period: 'paiement unique', unit: 'à vie' },
  annual: { id: 'annual' as PlanId, amountEur: ANNUAL_EUR, name: 'Annuel', period: 'par an', unit: '/ an' },
} as const;

export function isPlanId(value: unknown): value is PlanId {
  return value === 'annual' || value === 'lifetime';
}

export function planFor(id?: string | null) {
  return id === 'annual' ? PLANS.annual : PLANS.lifetime;
}
