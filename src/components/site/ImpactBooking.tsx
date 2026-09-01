'use client';

import { useState } from 'react';
import { ArrowLeft, CalendarDays, CheckCircle2, Send } from 'lucide-react';
import { LanguageSwitcher, useLanguage } from '@/components/language-provider';

type BookingCopy = {
  title?: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  formTitle?: string;
  formTitleEn?: string;
};

export function ImpactBooking({ organizationId, copy = {} }: { organizationId: string; copy?: BookingCopy }) {
  const { locale } = useLanguage();
  const en = locale === 'en';
  const [form, setForm] = useState({ requestType: 'Booking / date', name: '', company: '', email: '', artist: 'IMPACT', location: '', date: '', budget: '', project: '', website: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState('sending');
    const message = [`Type : ${form.requestType}`, `Société / organisation : ${form.company || '—'}`, `Artiste : ${form.artist}`, `Ville / pays : ${form.location}`, `Date souhaitée : ${form.date || '—'}`, `Budget indicatif : ${form.budget || '—'}`, '', form.project].join('\n');
    const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ organizationId, name: form.name, email: form.email, phone: '', subject: `Booking IMPACT · ${form.requestType}`, message, website: form.website }) });
    setState(response.ok ? 'sent' : 'error');
  }

  const field = 'w-full rounded-xl border border-[#4cc9ff]/25 bg-white/[0.05] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#4cc9ff]/70 focus:bg-white/[0.08] focus:shadow-[0_0_18px_rgba(47,107,255,.35)]';
  const headingFont = { fontFamily: '"Space Grotesk", Arial, sans-serif' as const };
  return (
    <main className="flex-1 px-5 py-10 text-white md:px-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4"><a href="/" className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-white/50 transition hover:text-[#9dc7ff]"><ArrowLeft className="h-4 w-4" />{en ? 'Back' : 'Retour'}</a><LanguageSwitcher variant="inline" /></div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-16">
          <section>
            <p className="text-[10px] uppercase tracking-[0.48em] text-[#9dc7ff]">IMPACT · BOOKING</p>
            <h1 className="mt-5 text-5xl font-bold uppercase leading-[.95] tracking-[0.1em] md:text-7xl" style={{ ...headingFont, textShadow: '0 0 28px rgba(47,107,255,.6)' }}>{en ? copy.titleEn || 'Send a clear brief' : copy.title || 'Envoyer un brief clair'}</h1>
            <p className="mt-7 max-w-md font-light leading-7 text-white/55">{en ? copy.descriptionEn || 'Booking, media, partnerships or a direct professional enquiry concerning IMPACT.' : copy.description || 'Booking, média, partenariat ou demande professionnelle directe concernant IMPACT.'}</p>
            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-[#4cc9ff]/18 bg-[#4cc9ff]/10 sm:grid-cols-2 lg:grid-cols-1">
              {[['Booking', en ? 'Clubs, festivals, private events' : 'Clubs, festivals, événements privés'], ['Live / DJ set', en ? 'Formats, riders, technical needs' : 'Formats, riders, besoins techniques'], [en ? 'Professional enquiries' : 'Demandes pros', en ? 'Media, brands and partnerships' : 'Médias, marques et partenariats']].map(([title, text]) => <div key={title} className="bg-[#05070f]/85 p-5"><p className="text-sm font-medium uppercase tracking-[0.16em]" style={headingFont}>{title}</p><p className="mt-2 text-xs leading-5 text-white/45">{text}</p></div>)}
            </div>
          </section>

          <section className="rounded-[2rem] border border-[#4cc9ff]/20 bg-[#070b1a]/40 p-5 shadow-[0_0_60px_-20px_rgba(47,107,255,.7)] backdrop-blur-xl sm:p-8">
            {state === 'sent' ? <div className="grid min-h-[32rem] place-items-center text-center"><div><CheckCircle2 className="mx-auto h-12 w-12 text-[#4cc9ff]" /><h2 className="mt-5 text-3xl text-white" style={headingFont}>{en ? 'Request sent' : 'Demande envoyée'}</h2><p className="mt-3 text-white/50">{en ? 'Thank you. The booking request has been received.' : 'Merci. La demande de booking a bien été reçue.'}</p></div></div> : <form onSubmit={submit} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-[#4cc9ff]/15 pb-5"><CalendarDays className="h-5 w-5 text-[#4cc9ff]" /><div><p className="text-xs uppercase tracking-[0.3em] text-white/40">01 · 02 · 03</p><h2 className="mt-1 text-xl font-light uppercase tracking-[0.12em]" style={headingFont}>{en ? copy.formTitleEn || 'Contact · Project' : copy.formTitle || 'Contact · Projet'}</h2></div></div>
              <input className="hidden" tabIndex={-1} value={form.website} onChange={(e) => set('website', e.target.value)} />
              <label className="block"><span className="mb-2 block text-[10px] uppercase tracking-[0.22em] text-white/45">{en ? 'Your request' : 'Votre demande'}</span><select className={field} value={form.requestType} onChange={(e) => set('requestType', e.target.value)}><option className="bg-neutral-950">Booking / date</option><option className="bg-neutral-950">Média / interview</option><option className="bg-neutral-950">Partenariat / marque</option><option className="bg-neutral-950">Autre demande professionnelle</option></select></label>
              <div className="grid gap-4 sm:grid-cols-2"><input required className={field} placeholder={en ? 'Full name' : 'Nom / prénom'} value={form.name} onChange={(e) => set('name', e.target.value)} /><input className={field} placeholder={en ? 'Company / organisation' : 'Société / organisation'} value={form.company} onChange={(e) => set('company', e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2"><input required type="email" className={field} placeholder={en ? 'Professional email' : 'E-mail professionnel'} value={form.email} onChange={(e) => set('email', e.target.value)} /><input className={field} value={form.artist} readOnly aria-label={en ? 'Artist' : 'Artiste concerné'} /></div>
              <div className="grid gap-4 sm:grid-cols-2"><input required className={field} placeholder={en ? 'City / country' : 'Ville / pays'} value={form.location} onChange={(e) => set('location', e.target.value)} /><input type="date" className={field} value={form.date} onChange={(e) => set('date', e.target.value)} aria-label={en ? 'Desired date' : 'Date souhaitée'} /></div>
              <input className={field} placeholder={en ? 'Indicative budget, fee or to be discussed' : 'Budget indicatif, cachet ou à définir'} value={form.budget} onChange={(e) => set('budget', e.target.value)} />
              <textarea required minLength={10} className={`${field} min-h-40 resize-y`} placeholder={en ? 'Project / request' : 'Projet / demande'} value={form.project} onChange={(e) => set('project', e.target.value)} />
              {state === 'error' && <p className="text-sm text-red-300">{en ? 'The request could not be sent. Please check the fields.' : 'La demande n’a pas pu être envoyée. Vérifiez les champs.'}</p>}
              <button disabled={state === 'sending'} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2f6bff] px-5 py-4 text-xs font-bold uppercase tracking-[0.22em] text-white shadow-[0_0_28px_rgba(47,107,255,.6)] transition hover:bg-[#4c82ff] disabled:opacity-50"><Send className="h-4 w-4" />{state === 'sending' ? (en ? 'Sending…' : 'Envoi…') : (en ? 'Send request' : 'Envoyer la demande')}</button>
            </form>}
          </section>
        </div>
      </div>
    </main>
  );
}
