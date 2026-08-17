const AIRWALLEX_API = process.env.AIRWALLEX_API_URL || 'https://api.airwallex.com/api/v1';

export const airwallexConfigured = Boolean(process.env.AIRWALLEX_CLIENT_ID && process.env.AIRWALLEX_API_KEY);

async function accessToken() {
  const response = await fetch(`${AIRWALLEX_API}/authentication/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': process.env.AIRWALLEX_CLIENT_ID!,
      'x-api-key': process.env.AIRWALLEX_API_KEY!,
    },
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.token) throw new Error(data.message || 'Authentification Airwallex impossible');
  return data.token as string;
}

export async function createAirwallexPaymentLink(input: { organizationId: string; organizationName: string; amount: number }) {
  const token = await accessToken();
  const response = await fetch(`${AIRWALLEX_API}/pa/payment_links/create`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'EasyAsso — création de votre site associatif',
      description: `Accès à vie pour ${input.organizationName}`,
      amount: input.amount,
      currency: 'EUR',
      reusable: false,
      reference: `easyasso-${input.organizationId}`,
      metadata: { organizationId: input.organizationId, product: 'easyasso-lifetime' },
      collectable_shopper_info: { billing_address: false, message: false, phone_number: false, reference: false, shipping_address: false },
    }),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.id || !data.url) throw new Error(data.message || 'Création du paiement Airwallex impossible');
  return { id: data.id as string, url: data.url as string };
}
