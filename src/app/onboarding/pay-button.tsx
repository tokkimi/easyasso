'use client';
import { useState } from 'react';

export function PayButton({ price, demo }: { price: string; demo: boolean }) {
  const [loading, setLoading] = useState(false);
  async function pay() {
    setLoading(true);
    const res = await fetch('/api/checkout', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }
  return (
    <button onClick={pay} disabled={loading} className="btn btn-primary w-full py-3 text-base">
      {loading ? 'Redirection…' : demo ? `Activer mon site (démo — ${price} €)` : `Payer ${price} € et activer`}
    </button>
  );
}
