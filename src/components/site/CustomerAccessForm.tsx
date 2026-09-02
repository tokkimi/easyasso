'use client';

import { FormEvent, useEffect, useState } from 'react';

type CustomerProfile = { id: string; email: string; name: string; firstName?: string; lastName?: string; phone?: string; locale?: string; addresses?: any[]; orders?: any[] };

export function CustomerAccessForm({
  organizationId,
  organizationName,
  locale,
  branded = false,
  brandKey,
}: {
  organizationId: string;
  organizationName: string;
  locale: 'fr' | 'en';
  branded?: boolean;
  brandKey?: string;
}) {
  const en = locale === 'en';
  const impact = brandKey === 'impact';
  const storageKey = `easyasso-customer-${organizationId}`;
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.email) setEmail(data.email);
        if (data.name) setName(data.name);
      }
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    fetch(`/api/public/customer-account?organizationId=${encodeURIComponent(organizationId)}`).then(async (r) => {
      if (r.ok) { const d = await r.json(); setProfile(d.profile || null); }
    }).finally(() => setChecking(false));
  }, [organizationId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const response = await fetch('/api/public/customer-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId, email, name, password }),
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok || !data.profile) {
      setError(data.error || (en ? 'Unable to open the customer account.' : 'Impossible d’ouvrir le profil client.'));
      return;
    }
    try { localStorage.setItem(storageKey, JSON.stringify(data.profile)); } catch {}
    const account = await fetch(`/api/public/customer-account?organizationId=${encodeURIComponent(organizationId)}`).then((r) => r.json()).catch(() => ({}));
    setProfile(account.profile || data.profile);
    setMessage(en
      ? `Customer account opened for ${data.profile.email}.`
      : `Profil client ouvert pour ${data.profile.email}.`);
  }

  if (checking) return <div className="mt-8 rounded-2xl bg-white/80 p-8 text-center font-semibold text-[#07101f]">Chargement de votre espace client…</div>;
  if (profile) return <CustomerAccount profile={profile} organizationId={organizationId} locale={locale} impact={impact} onProfile={setProfile} />;

  return (
    <form onSubmit={submit} className={`mt-8 rounded-2xl p-4 text-left sm:p-6 ${impact ? 'impact-customer-form' : branded ? 'bg-transparent ring-1 ring-white/15 backdrop-blur-md' : 'bg-gray-50'}`}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={`text-sm font-bold ${impact ? 'text-[#07101f]/80' : branded ? 'text-white/85' : 'text-gray-700'}`}>
          {en ? 'Name' : 'Nom'}
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={en ? 'Your name' : 'Votre nom'}
            className={`input mt-2 ${impact ? 'impact-customer-input' : branded ? 'border-white/25 !bg-[#111118] !text-white placeholder:!text-white/45' : 'bg-white'}`}
          />
        </label>
        <label className={`text-sm font-bold ${impact ? 'text-[#07101f]/80' : branded ? 'text-white/85' : 'text-gray-700'}`}>
          {en ? 'Email address' : 'Adresse email'}
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
            placeholder={en ? 'you@example.com' : 'vous@email.fr'}
            className={`input mt-2 ${impact ? 'impact-customer-input' : branded ? 'border-white/25 !bg-[#111118] !text-white placeholder:!text-white/45' : 'bg-white'}`}
          />
        </label>
      </div>
      <label className={`mt-3 block text-sm font-bold ${impact ? 'text-[#07101f]/80' : branded ? 'text-white/85' : 'text-gray-700'}`}>
        {en ? 'Password' : 'Mot de passe'}
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          required
          minLength={6}
          placeholder={en ? '6 characters minimum' : '6 caractères minimum'}
          className={`input mt-2 ${impact ? 'impact-customer-input' : branded ? 'border-white/25 !bg-[#111118] !text-white placeholder:!text-white/45' : 'bg-white'}`}
        />
      </label>
      <button disabled={loading} className={`mt-4 w-full rounded-xl px-5 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-60 ${impact ? 'impact-customer-submit' : branded ? '!bg-[#d33f5c]' : 'bg-[var(--brand)]'}`}>
        {loading ? (en ? 'Opening…' : 'Ouverture…') : (en ? 'Sign in / create my customer account' : 'Connexion / inscription client')}
      </button>
      {message && <p className="mt-3 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{message}</p>}
      {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      <p className={`mt-3 text-xs ${impact ? 'text-[#07101f]/50' : branded ? 'text-white/55' : 'text-gray-500'}`}>
        {en
          ? (branded ? `This customer account belongs to ${organizationName}'s website.` : `This customer account belongs to ${organizationName}'s website and is separate from the EasyAsso creator dashboard.`)
          : (branded ? `Ce profil client appartient au site de ${organizationName}.` : `Ce profil client appartient au site de ${organizationName} et reste séparé du tableau de bord créateur EasyAsso.`)}
      </p>
    </form>
  );
}

function CustomerAccount({ profile, organizationId, locale, impact, onProfile }: { profile: CustomerProfile; organizationId: string; locale: 'fr'|'en'; impact: boolean; onProfile: (p: CustomerProfile|null)=>void }) {
  const en=locale==='en'; const address=profile.addresses?.[0]||{};
  const [form,setForm]=useState({email:profile.email||'',name:profile.name||'',firstName:profile.firstName||'',lastName:profile.lastName||'',phone:profile.phone||'',line1:address.line1||'',line2:address.line2||'',postalCode:address.postalCode||'',city:address.city||'',region:address.region||'',countryCode:address.countryCode||'FR',currentPassword:'',newPassword:''});
  const [saving,setSaving]=useState(false); const [message,setMessage]=useState(''); const [error,setError]=useState('');
  async function save(){setSaving(true);setError('');setMessage('');const r=await fetch('/api/public/customer-account',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({organizationId,email:form.email,name:form.name,firstName:form.firstName,lastName:form.lastName,phone:form.phone,currentPassword:form.currentPassword||undefined,newPassword:form.newPassword||undefined,address:form.line1?{label:'Adresse principale',recipientName:form.name,phone:form.phone,line1:form.line1,line2:form.line2,postalCode:form.postalCode,city:form.city,region:form.region,countryCode:form.countryCode}:undefined})});const d=await r.json().catch(()=>({}));setSaving(false);if(!r.ok){setError(d.error||'Enregistrement impossible.');return;}setMessage(en?'Account updated.':'Profil mis à jour.');onProfile(d.profile);}
  async function logout(){await fetch('/api/public/customer-account',{method:'DELETE'});onProfile(null);}
  const orders=profile.orders||[];
  return <div className={`mt-8 rounded-3xl p-5 text-left sm:p-7 ${impact?'bg-white/90 text-[#07101f] shadow-2xl ring-1 ring-[#4169ff]/20':'bg-white text-gray-900 ring-1 ring-gray-200'}`}>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#4169ff]">IMPACT · ESPACE CLIENT</p><h2 className="mt-1 text-2xl font-black">{en?'My account':'Mon compte'}</h2><p className="text-sm text-gray-500">{profile.email}</p></div><button onClick={logout} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600">{en?'Sign out':'Déconnexion'}</button></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]"><section><h3 className="font-black">{en?'Details & delivery address':'Coordonnées & adresse de livraison'}</h3><div className="mt-3 grid gap-3 sm:grid-cols-2"><Input label="Prénom" value={form.firstName} onChange={v=>setForm({...form,firstName:v})}/><Input label="Nom" value={form.lastName} onChange={v=>setForm({...form,lastName:v})}/><Input label="Nom affiché" value={form.name} onChange={v=>setForm({...form,name:v})}/><Input label="Téléphone" value={form.phone} onChange={v=>setForm({...form,phone:v})}/><div className="sm:col-span-2"><Input label="Adresse email" type="email" value={form.email} onChange={v=>setForm({...form,email:v})}/></div><div className="sm:col-span-2"><Input label="Adresse" autoComplete="street-address" value={form.line1} onChange={v=>setForm({...form,line1:v})}/></div><div className="sm:col-span-2"><Input label="Complément" value={form.line2} onChange={v=>setForm({...form,line2:v})}/></div><Input label="Code postal" autoComplete="postal-code" value={form.postalCode} onChange={v=>setForm({...form,postalCode:v})}/><Input label="Ville" autoComplete="address-level2" value={form.city} onChange={v=>setForm({...form,city:v})}/><Input label="Région" autoComplete="address-level1" value={form.region} onChange={v=>setForm({...form,region:v})}/><label className="text-sm font-bold text-gray-700">Pays<select className="input mt-1" value={form.countryCode} onChange={e=>setForm({...form,countryCode:e.target.value})}><option value="FR">France</option><option value="BE">Belgique</option><option value="CH">Suisse</option><option value="LU">Luxembourg</option><option value="MC">Monaco</option></select></label></div><h3 className="mt-6 font-black">Sécurité</h3><div className="mt-3 grid gap-3 sm:grid-cols-2"><Input label="Mot de passe actuel" type="password" value={form.currentPassword} onChange={v=>setForm({...form,currentPassword:v})}/><Input label="Nouveau mot de passe" type="password" value={form.newPassword} onChange={v=>setForm({...form,newPassword:v})}/></div><button onClick={save} disabled={saving} className="mt-4 w-full rounded-xl bg-[#4169ff] px-5 py-3 font-black text-white">{saving?'Enregistrement…':'Enregistrer mes informations'}</button>{message&&<p className="mt-2 text-sm font-bold text-green-700">{message}</p>}{error&&<p className="mt-2 text-sm font-bold text-red-700">{error}</p>}</section>
    <section><h3 className="font-black">{en?'My orders':'Mes commandes'}</h3><div className="mt-3 space-y-3">{orders.length?orders.map((o:any)=><div key={o.id} className="rounded-2xl border border-gray-200 p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-black">#{String(o.orderNumber).slice(-10).toUpperCase()}</p><p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString('fr-FR')} · {o.items.map((i:any)=>`${i.quantity}× ${i.name}`).join(', ')}</p></div><span className={`rounded-full px-2 py-1 text-xs font-bold ${o.deliveryStatus==='DELIVERED'?'bg-green-100 text-green-700':o.deliveryStatus==='IN_TRANSIT'?'bg-blue-100 text-blue-700':'bg-amber-100 text-amber-700'}`}>{o.deliveryStatus==='DELIVERED'?'Livrée':o.deliveryStatus==='IN_TRANSIT'?'En transit':o.fulfillmentStatus==='PREPARING'?'En préparation':'Confirmée'}</span></div>{o.trackingNumber&&<a href={o.trackingUrl||'#'} target="_blank" rel="noreferrer" className="mt-3 block rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">Suivre le colis · {o.carrier} {o.trackingNumber}</a>}<div className="mt-3 space-y-2">{o.events?.slice(0,4).map((e:any)=><div key={e.id} className="border-l-2 border-blue-200 pl-3"><p className="text-sm font-bold">{e.title}</p><p className="text-xs text-gray-500">{e.detail}</p></div>)}</div></div>):<p className="rounded-2xl bg-gray-50 p-8 text-center text-sm text-gray-400">Aucune commande pour le moment.</p>}</div></section></div>
  </div>;
}
function Input({label,value,onChange,type='text',autoComplete}:{label:string;value:string;onChange:(v:string)=>void;type?:string;autoComplete?:string}){return <label className="text-sm font-bold text-gray-700">{label}<input className="input mt-1 !bg-white !text-[#07101f]" type={type} autoComplete={autoComplete} value={value} onChange={e=>onChange(e.target.value)}/></label>}
