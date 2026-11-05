'use client';
import { useEffect, useState } from 'react';

// Shown instead of Next's bare "This page couldn't load" when a public page
// fails (usually the database waking up). Retries on its own once, then lets
// the visitor retry.
export function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [retrying, setRetrying] = useState(true);

  useEffect(() => {
    const key = `easyasso-retry-${typeof window !== 'undefined' ? window.location.pathname : ''}`;
    // Auto-retry unless we already did so for this page in the last 30 s.
    let already = false;
    try { already = Date.now() - Number(sessionStorage.getItem(key) || 0) < 30_000; sessionStorage.setItem(key, String(Date.now())); } catch {}
    if (already) { setRetrying(false); return; }
    const t = setTimeout(() => window.location.reload(), 1500);
    return () => clearTimeout(t);
  }, []);

  function retry() {
    try { sessionStorage.removeItem(`easyasso-retry-${window.location.pathname}`); } catch {}
    setRetrying(true);
    reset();
    window.location.reload();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-950 px-4 text-center text-white">
      <div className="max-w-md">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" style={{ animationPlayState: retrying ? 'running' : 'paused' }} />
        <h1 className="mt-6 text-2xl font-bold">{retrying ? 'Chargement du site…' : 'Le site met un peu de temps à répondre.'}</h1>
        {!retrying && (
          <>
            <p className="mt-3 text-white/60">Merci de réessayer dans quelques secondes.</p>
            <button onClick={retry} className="mt-6 rounded-xl bg-white px-6 py-3 font-bold text-neutral-900">Réessayer</button>
          </>
        )}
      </div>
    </main>
  );
}
