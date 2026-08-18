'use client';
import { useEffect, useState } from 'react';
import { Archive, Mail, MailOpen, Phone, Reply, Send, ShieldCheck } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/ui';

type Message = { id: string; name: string; email: string; phone?: string; subject?: string; message: string; readAt?: string; createdAt: string };
type PlatformMsg = { id: string; fromAdmin: boolean; authorName: string; body: string; createdAt: string };

export function MessagesClient({ initial, conversation = [] }: { initial: Message[]; conversation?: PlatformMsg[] }) {
  const [messages, setMessages] = useState(initial);
  const [selected, setSelected] = useState<Message | null>(initial[0] || null);
  async function action(message: Message, type: 'read' | 'unread' | 'archive') {
    await fetch('/api/messages', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: message.id, action: type }) });
    if (type === 'archive') { setMessages((all) => all.filter((item) => item.id !== message.id)); setSelected(null); }
    else {
      const readAt = type === 'read' ? new Date().toISOString() : undefined;
      setMessages((all) => all.map((item) => item.id === message.id ? { ...item, readAt } : item));
      setSelected((current) => current?.id === message.id ? { ...current, readAt } : current);
    }
  }
  function open(message: Message) { setSelected(message); if (!message.readAt) action(message, 'read'); }
  return (
    <div>
      <PageHeader title="Messagerie" subtitle="Vos échanges avec l’équipe EasyAsso et les messages envoyés depuis votre site." />
      <EasyAssoConversation initial={conversation} />
      <h2 className="mb-3 mt-8 text-lg font-extrabold text-gray-900">Messages depuis votre site</h2>
      {!messages.length ? <EmptyState title="Aucun message" text="Les nouveaux messages envoyés depuis votre site apparaîtront ici." /> : (
        <div className="grid min-h-[560px] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 lg:grid-cols-[340px_1fr]">
          <div className="border-b border-gray-200 lg:border-b-0 lg:border-r">
            {messages.map((message) => <button key={message.id} onClick={() => open(message)} className={`block w-full border-b border-gray-100 p-4 text-left ${selected?.id === message.id ? 'bg-brand-50' : 'hover:bg-gray-50'}`}>
              <div className="flex items-center justify-between gap-2"><span className={`${message.readAt ? 'font-medium' : 'font-extrabold'} text-gray-900`}>{message.name}</span>{!message.readAt && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />}</div>
              <p className="mt-1 truncate text-sm font-medium text-gray-700">{message.subject || 'Message depuis le site'}</p>
              <p className="mt-1 truncate text-xs text-gray-500">{message.message}</p>
            </button>)}
          </div>
          <div className="p-5 md:p-8">{selected && <>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-5"><div><h2 className="text-xl font-extrabold text-gray-900">{selected.subject || 'Message depuis le site'}</h2><p className="mt-1 text-sm text-gray-500">Reçu le {new Date(selected.createdAt).toLocaleString('fr-FR')}</p></div><div className="flex gap-2"><button onClick={() => action(selected, selected.readAt ? 'unread' : 'read')} className="btn btn-ghost">{selected.readAt ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}</button><button onClick={() => action(selected, 'archive')} className="btn btn-ghost"><Archive className="h-4 w-4" /></button></div></div>
            <div className="mt-5 rounded-xl bg-gray-50 p-4"><p className="font-bold text-gray-900">{selected.name}</p><a href={`mailto:${selected.email}`} className="mt-1 block text-sm text-brand-600">{selected.email}</a>{selected.phone && <a href={`tel:${selected.phone}`} className="mt-1 flex items-center gap-1 text-sm text-gray-600"><Phone className="h-3.5 w-3.5" />{selected.phone}</a>}</div>
            <p className="mt-6 whitespace-pre-wrap leading-7 text-gray-700">{selected.message}</p>
            <a href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject || 'Votre message'}`)}`} className="btn btn-primary mt-8"><Reply className="h-4 w-4" /> Répondre par e-mail</a>
          </>}</div>
        </div>
      )}
    </div>
  );
}

function EasyAssoConversation({ initial }: { initial: PlatformMsg[] }) {
  const [thread, setThread] = useState(initial);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (initial.some((m) => m.fromAdmin)) fetch('/api/messages/platform', { method: 'PATCH' }).catch(() => {});
  }, [initial]);

  async function send() {
    if (!body.trim()) return;
    setSending(true);
    const res = await fetch('/api/messages/platform', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body: body.trim() }) });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) { alert(data.error || 'Envoi impossible.'); return; }
    if (data.message) setThread((t) => [...t, data.message]);
    setBody('');
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700"><ShieldCheck className="h-5 w-5" /></span>
        <div>
          <h2 className="font-extrabold text-gray-900">Équipe EasyAsso</h2>
          <p className="text-xs text-gray-500">Une question ou un besoin ? Écrivez directement à l’équipe.</p>
        </div>
      </div>
      <div className="mt-4 max-h-72 space-y-2 overflow-y-auto rounded-xl bg-gray-50 p-3">
        {thread.length === 0 && <p className="py-6 text-center text-sm text-gray-400">Aucun message pour l’instant. Écrivez-nous ci-dessous.</p>}
        {thread.map((m) => (
          <div key={m.id} className={`flex ${m.fromAdmin ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.fromAdmin ? 'bg-white ring-1 ring-gray-200 text-gray-800' : 'bg-brand-600 text-white'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
              <p className={`mt-1 text-[11px] ${m.fromAdmin ? 'text-gray-500' : 'text-white/70'}`}>{m.authorName} · {new Date(m.createdAt).toLocaleString('fr-FR')}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <textarea className="input min-h-[64px] flex-1" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Votre message à l’équipe EasyAsso…" />
        <button onClick={send} disabled={sending || !body.trim()} className="btn btn-primary disabled:opacity-50"><Send className="h-4 w-4" /> {sending ? 'Envoi…' : 'Envoyer'}</button>
      </div>
    </section>
  );
}
