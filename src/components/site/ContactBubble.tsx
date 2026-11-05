'use client';

import { useEffect, useRef, useState } from 'react';
import { Phone, MessageSquare, Mail, MessagesSquare, CalendarDays, X, Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

type Props = {
  name: string;
  slogan?: string;
  sloganEn?: string;
  logoUrl?: string;
  email?: string;
  phone?: string;
  organizationId?: string;
  locale?: 'fr' | 'en';
  position?: 'left' | 'right';
  backgroundColor?: string;
  textColor?: string;
  showPhone?: boolean;
  showSms?: boolean;
  showEmail?: boolean;
  showMessage?: boolean;
  branded?: boolean;
  showBooking?: boolean;
  bookingLabel?: string;
  bookingLabelEn?: string;
  bookingSubtitle?: string;
  bookingSubtitleEn?: string;
  bookingHref?: string;
};

export function ContactBubble({ name, slogan, sloganEn, logoUrl, email, phone, organizationId, locale, position = 'right', backgroundColor = '#171717', textColor = '#ffffff', showPhone = true, showSms = true, showEmail = true, showMessage = true, branded = false, showBooking = false, bookingLabel = 'Booking', bookingLabelEn, bookingSubtitle = 'Dates, événements et demandes professionnelles', bookingSubtitleEn, bookingHref = '/booking' }: Props) {
  const { locale: activeLocale } = useLanguage();
  const en = activeLocale === 'en' || (!activeLocale && locale === 'en');
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'menu' | 'message'>('menu');
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  // The bubble can be dragged anywhere on the screen (finger or mouse) so it
  // never hides content; its position is remembered on this device.
  const boxRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ startX: number; startY: number; baseX: number; baseY: number; minX: number; maxX: number; minY: number; maxY: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);
  const storageKey = `easyasso-bubble-${organizationId || 'site'}`;
  useEffect(() => {
    try { const saved = JSON.parse(localStorage.getItem(storageKey) || 'null'); if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') setOffset(saved); } catch {}
  }, [storageKey]);
  function onPointerDown(e: React.PointerEvent) {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;
    drag.current = {
      startX: e.clientX, startY: e.clientY, baseX: offset.x, baseY: offset.y,
      minX: offset.x - rect.left + 8, maxX: offset.x + (window.innerWidth - rect.right) - 8,
      minY: offset.y - rect.top + 8, maxY: offset.y + (window.innerHeight - rect.bottom) - 8,
      moved: false,
    };
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    if (!d.moved) { d.moved = true; (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); }
    setOffset({ x: Math.min(d.maxX, Math.max(d.minX, d.baseX + dx)), y: Math.min(d.maxY, Math.max(d.minY, d.baseY + dy)) });
  }
  function onPointerUp() {
    const d = drag.current;
    drag.current = null;
    if (d?.moved) {
      justDragged.current = true;
      setTimeout(() => { justDragged.current = false; }, 0);
      setOffset((o) => { try { localStorage.setItem(storageKey, JSON.stringify(o)); } catch {} return o; });
    }
  }
  const set = (k: string, v: string) => setForm((c) => ({ ...c, [k]: v }));

  const initial = (name || 'A').trim().charAt(0).toUpperCase();

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId) return;
    setState('sending');
    const res = await fetch('/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, subject: en ? 'Message via contact bubble' : 'Message via la bulle de contact', phone: '', organizationId }),
    });
    if (!res.ok) { setState('error'); return; }
    setState('sent');
    setForm({ name: '', email: '', message: '', website: '' });
  }

  const Avatar = (
    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-transparent">
      {logoUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={logoUrl} alt={name} className="h-full w-full object-contain p-0.5" />
        : <div className="grid h-full w-full place-items-center text-base font-bold text-white/90">{initial}</div>}
    </div>
  );

  const Identity = (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      {Avatar}
      <div className="min-w-0 text-left">
        <p className="truncate text-sm font-bold text-white">{name}</p>
        {(en ? sloganEn || slogan : slogan) && <p className="truncate text-[11px] text-white/70">{en ? sloganEn || slogan : slogan}</p>}
      </div>
      <span className="relative ml-auto flex h-3.5 w-3.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
        <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-white/30" />
      </span>
    </div>
  );

  const Row = ({ icon: Icon, title, subtitle, ...rest }: any) => (
    <button type="button" {...rest} className="flex w-full items-center gap-3 border-t border-white/10 px-4 py-3 text-left transition hover:bg-white/5 first:border-t-0">
      <Icon className="h-5 w-5 shrink-0 text-white/80" strokeWidth={1.6} />
      <span className="min-w-0">
        <span className="block text-base font-semibold text-white">{title}</span>
        {subtitle && <span className="block truncate text-xs text-white/60">{subtitle}</span>}
      </span>
    </button>
  );

  return (
    <div ref={boxRef} className={`easyasso-contact-bubble fixed bottom-4 z-[100] w-[min(92vw,20rem)] font-sans ${position === 'left' ? 'left-4' : 'right-4'}`} style={{ color: textColor, transform: `translate(${offset.x}px, ${offset.y}px)`, touchAction: 'none' }} data-no-translate>
      {/* Hidden while the cart or another full-screen panel is open. */}
      <style>{`body[data-overlay-open] .easyasso-contact-bubble { display: none !important; }`}</style>
      {open && (
        <div className={`mb-3 overflow-hidden rounded-3xl border border-white/15 text-white shadow-2xl backdrop-blur-2xl ${branded ? 'bg-neutral-900/50' : ''}`} style={branded ? undefined : { backgroundColor: `${backgroundColor}d9`, color: textColor }}>
          <div className="flex items-start justify-between px-4 pb-3 pt-4">
            <h3 className="max-w-[12rem] text-lg font-bold leading-tight">{en ? 'How can we help?' : 'Comment nous joindre ?'}</h3>
            <button type="button" aria-label={en ? 'Close' : 'Fermer'} onClick={() => { setOpen(false); setView('menu'); setState('idle'); }} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white/80 transition hover:bg-white/20"><X className="h-4 w-4" /></button>
          </div>

          {view === 'menu' && (
            <div>
              {showPhone && phone && <Row icon={Phone} title={en ? 'Call' : 'Appeler'} subtitle={phone} onClick={() => { window.location.href = `tel:${phone.replace(/\s+/g, '')}`; }} />}
              {showSms && phone && <Row icon={MessageSquare} title={en ? 'Send a text' : 'Envoyer un SMS'} subtitle={en ? 'Direct reply on mobile' : 'Réponse directe sur mobile'} onClick={() => { window.location.href = `sms:${phone.replace(/\s+/g, '')}`; }} />}
              {showEmail && email && <Row icon={Mail} title={en ? 'Send an email' : 'Envoyer un courriel'} subtitle={email} onClick={() => { window.location.href = `mailto:${email}`; }} />}
              {showBooking && <Row icon={CalendarDays} title={en ? bookingLabelEn || bookingLabel : bookingLabel} subtitle={en ? bookingSubtitleEn || bookingSubtitle : bookingSubtitle} onClick={() => { window.location.href = bookingHref; }} />}
              {showMessage && organizationId && <Row icon={MessagesSquare} title={en ? 'Messaging' : 'Messagerie'} subtitle={en ? 'Write to us right here' : 'Écrivez-nous directement ici'} onClick={() => setView('message')} />}
            </div>
          )}

          {view === 'message' && (
            <div className="border-t border-white/10 px-5 py-4">
              {state === 'sent' ? (
                <div className="py-4 text-center">
                  <CheckCircle2 className="mx-auto h-9 w-9 text-green-400" />
                  <p className="mt-2 font-semibold">{en ? 'Message sent. Thank you!' : 'Message envoyé. Merci !'}</p>
                </div>
              ) : (
                <form onSubmit={send} className="space-y-3">
                  <input className="hidden" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} />
                  <input className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/50 outline-none focus:border-white/40" required placeholder={en ? 'Your name' : 'Votre nom'} value={form.name} onChange={(e) => set('name', e.target.value)} />
                  <input className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/50 outline-none focus:border-white/40" required type="email" placeholder={en ? 'Your email' : 'Votre e-mail'} value={form.email} onChange={(e) => set('email', e.target.value)} />
                  <textarea className="min-h-24 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/50 outline-none focus:border-white/40" required minLength={10} placeholder={en ? 'Your message' : 'Votre message'} value={form.message} onChange={(e) => set('message', e.target.value)} />
                  {state === 'error' && <p className="text-sm text-red-300">{en ? 'Could not send. Please try again.' : 'Envoi impossible. Réessayez.'}</p>}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setView('menu')} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/20">{en ? 'Back' : 'Retour'}</button>
                    <button disabled={state === 'sending'} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-neutral-900 transition hover:opacity-90 disabled:opacity-60"><Send className="h-4 w-4" />{state === 'sending' ? (en ? 'Sending…' : 'Envoi…') : (en ? 'Send' : 'Envoyer')}</button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 border-t border-white/10 bg-black/20 px-4 py-3">{Identity}</div>
        </div>
      )}

      {!open && (
        <button type="button" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onDragStart={(e) => e.preventDefault()} onClick={() => { if (!justDragged.current) setOpen(true); }} title={en ? 'Drag to move' : 'Glisser pour déplacer'} className={`flex w-full cursor-grab select-none active:cursor-grabbing [&_img]:pointer-events-none items-center gap-3 rounded-3xl border border-white/15 px-4 py-2.5 text-white shadow-2xl backdrop-blur-2xl transition ${branded ? 'bg-neutral-900/50 hover:bg-neutral-900/60' : 'hover:brightness-110'}`} style={branded ? undefined : { backgroundColor: `${backgroundColor}d9`, color: textColor }}>
          {Identity}
        </button>
      )}
    </div>
  );
}
