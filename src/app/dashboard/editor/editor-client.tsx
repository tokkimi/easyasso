'use client';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Plus, Trash2, ArrowUp, ArrowDown, Monitor, Smartphone, Eye, Home, GripVertical,
  Type, Heading, Image as ImageIcon, Video, MousePointerClick, Share2, Columns, MoveVertical, Code,
  PanelTop, PanelBottom, Palette, Files, ChevronLeft, Check,
} from 'lucide-react';
import { BLOCK_LIBRARY, type BlockType, type ButtonConfig } from '@/lib/blocks';
import { PublicBlock } from '@/components/site/PublicBlock';
import { ColorGrid, AlignPicker, Field, Toggle } from './controls';

const ICONS: Record<string, any> = {
  Heading, Type, Image: ImageIcon, Video, MousePointerClick, Share2, Columns, MoveVertical, Code,
};

type Block = { id: string; type: string; order: number; content: any; style: any };
type Page = { id: string; title: string; slug: string; isHome: boolean; showInNav: boolean; order: number; blocks: Block[] };
type Site = { id: string; name: string; subdomain: string; customDomain: string | null; published: boolean; header: any; footer: any; theme: any; pages: Page[] };

async function api(url: string, method: string, body?: any) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Erreur');
  return res.json();
}

export function EditorClient({ site: initial, canEdit, canPublish, siteUrl }: { site: Site; canEdit: boolean; canPublish: boolean; siteUrl: string }) {
  const [pages, setPages] = useState<Page[]>(initial.pages);
  const [activeId, setActiveId] = useState<string>(initial.pages[0]?.id);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [tab, setTab] = useState<'blocks' | 'header' | 'footer' | 'theme'>('blocks');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [header, setHeader] = useState(initial.header || {});
  const [footer, setFooter] = useState(initial.footer || {});
  const [published, setPublished] = useState(initial.published);
  const [saving, setSaving] = useState<string>('');
  const [showPalette, setShowPalette] = useState(false);

  const active = pages.find((p) => p.id === activeId);
  const block = active?.blocks.find((b) => b.id === selectedBlock) || null;

  const flash = (m: string) => { setSaving(m); setTimeout(() => setSaving(''), 1200); };

  // ---- debounced site save (header/footer) ----
  const siteTimer = useRef<any>(undefined);
  const saveSite = useCallback((patch: any) => {
    clearTimeout(siteTimer.current);
    siteTimer.current = setTimeout(async () => {
      try { await api('/api/site', 'PATCH', patch); flash('Enregistré'); } catch { flash('Erreur'); }
    }, 600);
  }, []);

  // ---- block operations ----
  const blockTimer = useRef<Record<string, any>>({});
  function patchBlockLocal(id: string, changes: Partial<Block>) {
    setPages((ps) => ps.map((p) => p.id !== activeId ? p : { ...p, blocks: p.blocks.map((b) => b.id === id ? { ...b, ...changes } : b) }));
  }
  function saveBlock(id: string, data: { content?: any; style?: any }) {
    clearTimeout(blockTimer.current[id]);
    blockTimer.current[id] = setTimeout(async () => {
      try { await api(`/api/blocks/${id}`, 'PATCH', data); flash('Enregistré'); } catch { flash('Erreur'); }
    }, 500);
  }
  function updateContent(id: string, content: any) { patchBlockLocal(id, { content }); saveBlock(id, { content }); }
  function updateStyle(id: string, style: any) { patchBlockLocal(id, { style }); saveBlock(id, { style }); }

  async function addBlock(type: BlockType) {
    const created = await api('/api/blocks', 'POST', { pageId: activeId, type });
    setPages((ps) => ps.map((p) => p.id === activeId ? { ...p, blocks: [...p.blocks, created] } : p));
    setSelectedBlock(created.id);
    setShowPalette(false);
    flash('Bloc ajouté');
  }
  async function deleteBlock(id: string) {
    setPages((ps) => ps.map((p) => p.id === activeId ? { ...p, blocks: p.blocks.filter((b) => b.id !== id) } : p));
    setSelectedBlock(null);
    await api(`/api/blocks/${id}`, 'DELETE').catch(() => {});
  }
  async function moveBlock(id: string, dir: -1 | 1) {
    if (!active) return;
    const idx = active.blocks.findIndex((b) => b.id === id);
    const to = idx + dir;
    if (to < 0 || to >= active.blocks.length) return;
    const arr = [...active.blocks];
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    setPages((ps) => ps.map((p) => p.id === activeId ? { ...p, blocks: arr } : p));
    await api('/api/blocks', 'PATCH', { pageId: activeId, ids: arr.map((b) => b.id) }).catch(() => {});
  }

  // ---- page operations ----
  async function addPage() {
    const title = prompt('Nom de la nouvelle page ?', 'Nouvelle page');
    if (!title) return;
    const created = await api('/api/pages', 'POST', { title });
    setPages((ps) => [...ps, { ...created, blocks: [] }]);
    setActiveId(created.id);
    setSelectedBlock(null);
  }
  async function renamePage(id: string) {
    const p = pages.find((x) => x.id === id);
    const title = prompt('Renommer la page', p?.title);
    if (!title) return;
    const updated = await api(`/api/pages/${id}`, 'PATCH', { title });
    setPages((ps) => ps.map((x) => x.id === id ? { ...x, title: updated.title } : x));
  }
  async function deletePage(id: string) {
    const p = pages.find((x) => x.id === id);
    if (p?.isHome) { alert('Impossible de supprimer la page d’accueil.'); return; }
    if (!confirm(`Supprimer la page “${p?.title}” ?`)) return;
    setPages((ps) => ps.filter((x) => x.id !== id));
    if (activeId === id) setActiveId(pages.find((x) => x.id !== id)!.id);
    await api(`/api/pages/${id}`, 'DELETE').catch(() => {});
  }
  async function setHome(id: string) {
    setPages((ps) => ps.map((x) => ({ ...x, isHome: x.id === id })));
    await api(`/api/pages/${id}`, 'PATCH', { setHome: true }).catch(() => {});
  }
  async function toggleNav(id: string, showInNav: boolean) {
    setPages((ps) => ps.map((x) => x.id === id ? { ...x, showInNav } : x));
    await api(`/api/pages/${id}`, 'PATCH', { showInNav }).catch(() => {});
  }

  async function togglePublish() {
    const next = !published;
    setPublished(next);
    await api('/api/site', 'PATCH', { published: next }).catch(() => setPublished(!next));
    flash(next ? 'Site publié' : 'Site dépublié');
  }

  const width = device === 'mobile' ? 390 : 900;

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-gray-100 lg:left-64">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-2">
        <a href="/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" /> Tableau de bord
        </a>
        <div className="flex items-center gap-2">
          {saving && <span className="flex items-center gap-1 text-xs text-green-600"><Check className="h-3 w-3" />{saving}</span>}
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
            <button onClick={() => setDevice('desktop')} className={`rounded p-1.5 ${device === 'desktop' ? 'bg-gray-900 text-white' : 'text-gray-500'}`}><Monitor className="h-4 w-4" /></button>
            <button onClick={() => setDevice('mobile')} className={`rounded p-1.5 ${device === 'mobile' ? 'bg-gray-900 text-white' : 'text-gray-500'}`}><Smartphone className="h-4 w-4" /></button>
          </div>
          <a href={siteUrl} target="_blank" rel="noreferrer" className="btn btn-ghost !py-1.5 text-sm"><Eye className="h-4 w-4" /> Aperçu</a>
          {canPublish && (
            <button onClick={togglePublish} className={`btn !py-1.5 text-sm ${published ? 'btn-ghost' : 'btn-primary'}`}>
              {published ? 'En ligne ✓' : 'Publier'}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: pages */}
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-3 md:block">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-gray-400"><Files className="h-3.5 w-3.5" /> Pages</span>
            {canEdit && <button onClick={addPage} className="text-brand-600 hover:text-brand-700"><Plus className="h-4 w-4" /></button>}
          </div>
          <ul className="space-y-1">
            {pages.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => { setActiveId(p.id); setSelectedBlock(null); setTab('blocks'); }}
                  className={`group flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-sm ${activeId === p.id ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {p.isHome && <Home className="h-3.5 w-3.5 shrink-0" />}
                  <span className="flex-1 truncate">{p.title}</span>
                </button>
                {activeId === p.id && canEdit && (
                  <div className="mt-1 flex flex-wrap gap-2 px-2 text-[11px] text-gray-400">
                    <button onClick={() => renamePage(p.id)} className="hover:text-gray-700">Renommer</button>
                    {!p.isHome && <button onClick={() => setHome(p.id)} className="hover:text-gray-700">Accueil</button>}
                    {!p.isHome && <button onClick={() => deletePage(p.id)} className="hover:text-red-600">Suppr.</button>}
                    <label className="flex items-center gap-1"><input type="checkbox" checked={p.showInNav} onChange={(e) => toggleNav(p.id, e.target.checked)} /> menu</label>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-1 border-t border-gray-100 pt-4">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">Site</span>
            <button onClick={() => { setTab('header'); setSelectedBlock(null); }} className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${tab === 'header' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-100'}`}><PanelTop className="h-4 w-4" /> En-tête</button>
            <button onClick={() => { setTab('footer'); setSelectedBlock(null); }} className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${tab === 'footer' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-100'}`}><PanelBottom className="h-4 w-4" /> Pied de page</button>
          </div>
        </aside>

        {/* Center: canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <div className="mx-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition-all" style={{ maxWidth: width }}>
            {active?.blocks.length === 0 && (
              <div className="py-16 text-center text-gray-400">
                <p>Page vide.</p>
                {canEdit && <button onClick={() => setShowPalette(true)} className="btn btn-primary mt-4 mx-auto">Ajouter un bloc</button>}
              </div>
            )}
            {active?.blocks.map((b, i) => (
              <div
                key={b.id}
                onClick={() => canEdit && (setSelectedBlock(b.id), setTab('blocks'))}
                className={`group relative cursor-pointer ${selectedBlock === b.id ? 'ring-2 ring-brand-500' : 'hover:ring-1 hover:ring-brand-200'}`}
              >
                <PublicBlock type={b.type} content={b.content} style={b.style} />
                {canEdit && selectedBlock === b.id && (
                  <div className="absolute right-2 top-2 flex gap-1 rounded-lg bg-gray-900/90 p-1 text-white">
                    <button onClick={(e) => { e.stopPropagation(); moveBlock(b.id, -1); }} disabled={i === 0} className="rounded p-1 hover:bg-white/20 disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); moveBlock(b.id, 1); }} disabled={i === active.blocks.length - 1} className="rounded p-1 hover:bg-white/20 disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteBlock(b.id); }} className="rounded p-1 hover:bg-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                )}
              </div>
            ))}
            {canEdit && active && active.blocks.length > 0 && (
              <div className="border-t border-dashed border-gray-200 p-3 text-center">
                <button onClick={() => setShowPalette(true)} className="btn btn-ghost mx-auto text-sm"><Plus className="h-4 w-4" /> Ajouter un bloc</button>
              </div>
            )}
          </div>
        </div>

        {/* Right: inspector */}
        {canEdit && (
          <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-gray-200 bg-white p-4 lg:block">
            {tab === 'blocks' && block && (
              <BlockInspector block={block} onContent={(c) => updateContent(block.id, c)} onStyle={(s) => updateStyle(block.id, s)} onDelete={() => deleteBlock(block.id)} />
            )}
            {tab === 'blocks' && !block && (
              <div className="text-sm text-gray-500">
                <p className="font-medium text-gray-700">Sélectionnez un bloc</p>
                <p className="mt-1">Cliquez sur un élément de la page pour le modifier, ou ajoutez-en un nouveau.</p>
                <button onClick={() => setShowPalette(true)} className="btn btn-primary mt-4 w-full"><Plus className="h-4 w-4" /> Ajouter un bloc</button>
              </div>
            )}
            {tab === 'header' && <HeaderEditor value={header} onChange={(h) => { setHeader(h); saveSite({ header: h }); }} />}
            {tab === 'footer' && <FooterEditor value={footer} onChange={(f) => { setFooter(f); saveSite({ footer: f }); }} />}
          </aside>
        )}
      </div>

      {/* Block palette modal */}
      {showPalette && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setShowPalette(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 font-bold text-gray-900">Choisir un type de bloc</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BLOCK_LIBRARY.map((b) => {
                const Icon = ICONS[b.icon] || Type;
                return (
                  <button key={b.type} onClick={() => addBlock(b.type)} className="flex flex-col items-start gap-1 rounded-xl border border-gray-200 p-3 text-left hover:border-brand-400 hover:bg-brand-50">
                    <Icon className="h-5 w-5 text-brand-600" />
                    <span className="text-sm font-semibold text-gray-900">{b.label}</span>
                    <span className="text-xs text-gray-500">{b.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------- Block inspector -------------------------
function BlockInspector({ block, onContent, onStyle, onDelete }: { block: Block; onContent: (c: any) => void; onStyle: (s: any) => void; onDelete: () => void }) {
  const c = block.content || {};
  const s = block.style || {};
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold capitalize text-gray-900">{BLOCK_LIBRARY.find((b) => b.type === block.type)?.label || block.type}</h3>
        <button onClick={onDelete} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
      </div>

      {(block.type === 'heading' || block.type === 'text') && (
        <>
          <Field label="Texte"><textarea className="input min-h-[90px]" value={c.text || ''} onChange={(e) => onContent({ ...c, text: e.target.value })} /></Field>
          <Field label="Alignement"><AlignPicker value={s.align} onChange={(a) => onStyle({ ...s, align: a })} /></Field>
          <Field label="Taille du texte"><input type="range" min={12} max={64} value={s.fontSize || 20} onChange={(e) => onStyle({ ...s, fontSize: +e.target.value })} className="w-full" /></Field>
          <Field label="Couleur du texte"><ColorGrid value={s.color} onChange={(col) => onStyle({ ...s, color: col })} /></Field>
        </>
      )}

      {block.type === 'image' && (
        <>
          <Field label="URL de l’image"><input className="input" placeholder="https://…" value={c.url || ''} onChange={(e) => onContent({ ...c, url: e.target.value })} /></Field>
          <Field label="Texte alternatif"><input className="input" value={c.alt || ''} onChange={(e) => onContent({ ...c, alt: e.target.value })} /></Field>
          <Field label="Légende"><input className="input" value={c.caption || ''} onChange={(e) => onContent({ ...c, caption: e.target.value })} /></Field>
          <Field label="Alignement"><AlignPicker value={s.align} onChange={(a) => onStyle({ ...s, align: a })} /></Field>
        </>
      )}

      {block.type === 'video' && (
        <Field label="Lien vidéo (YouTube, Vimeo…)"><input className="input" placeholder="https://youtube.com/…" value={c.url || ''} onChange={(e) => onContent({ ...c, url: e.target.value })} /></Field>
      )}

      {block.type === 'button' && <ButtonEditor value={c.button} onChange={(b) => onContent({ ...c, button: b })} />}

      {block.type === 'social' && <SocialEditor value={c.social} onChange={(soc) => onContent({ ...c, social: soc })} />}

      {block.type === 'columns' && (
        <>
          <Field label="Nombre de colonnes">
            <select className="input" value={(c.columns || []).length} onChange={(e) => {
              const n = +e.target.value; const cur = c.columns || [];
              const next = Array.from({ length: n }, (_, i) => cur[i] ?? `Colonne ${i + 1}`);
              onContent({ ...c, columns: next });
            }}>
              <option value={2}>2 colonnes</option><option value={3}>3 colonnes</option>
            </select>
          </Field>
          {(c.columns || []).map((col: string, i: number) => (
            <Field key={i} label={`Colonne ${i + 1}`}>
              <textarea className="input min-h-[70px]" value={col} onChange={(e) => { const next = [...c.columns]; next[i] = e.target.value; onContent({ ...c, columns: next }); }} />
            </Field>
          ))}
        </>
      )}

      {block.type === 'spacer' && (
        <Field label={`Hauteur : ${c.height || 40}px`}><input type="range" min={10} max={200} value={c.height || 40} onChange={(e) => onContent({ ...c, height: +e.target.value })} className="w-full" /></Field>
      )}

      {block.type === 'html' && (
        <Field label="Code HTML / intégration (HelloAsso, carte…)"><textarea className="input min-h-[140px] font-mono text-xs" value={c.html || ''} onChange={(e) => onContent({ ...c, html: e.target.value })} /></Field>
      )}

      <Field label="Espacement vertical"><input type="range" min={0} max={80} value={s.paddingY ?? 16} onChange={(e) => onStyle({ ...s, paddingY: +e.target.value })} className="w-full" /></Field>
    </div>
  );
}

function ButtonEditor({ value, onChange }: { value?: ButtonConfig; onChange: (b: ButtonConfig) => void }) {
  const b: ButtonConfig = value || { text: 'Bouton', href: '#', color: '#1b5df5', variant: 'solid', align: 'center' };
  const set = (patch: Partial<ButtonConfig>) => onChange({ ...b, ...patch });
  return (
    <div className="space-y-3">
      <Field label="Texte du bouton"><input className="input" value={b.text} onChange={(e) => set({ text: e.target.value })} /></Field>
      <Field label="Lien (URL ou /page)"><input className="input" value={b.href} onChange={(e) => set({ href: e.target.value })} /></Field>
      <Field label="Style">
        <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
          <button type="button" onClick={() => set({ variant: 'solid' })} className={`rounded-md px-3 py-1.5 text-sm ${b.variant === 'solid' ? 'bg-brand-600 text-white' : 'text-gray-600'}`}>Plein</button>
          <button type="button" onClick={() => set({ variant: 'outline' })} className={`rounded-md px-3 py-1.5 text-sm ${b.variant === 'outline' ? 'bg-brand-600 text-white' : 'text-gray-600'}`}>Contour</button>
        </div>
      </Field>
      <Field label="Alignement"><AlignPicker value={b.align} onChange={(a) => set({ align: a })} /></Field>
      <Field label="Couleur"><ColorGrid value={b.color} onChange={(col) => set({ color: col })} /></Field>
    </div>
  );
}

function SocialEditor({ value, onChange }: { value?: any; onChange: (s: any) => void }) {
  const s = value || { align: 'center' };
  const set = (patch: any) => onChange({ ...s, ...patch });
  const nets = ['facebook', 'instagram', 'twitter', 'youtube', 'linkedin'];
  return (
    <div className="space-y-3">
      {nets.map((n) => (
        <Field key={n} label={n}><input className="input" placeholder={`https://${n}.com/…`} value={s[n] || ''} onChange={(e) => set({ [n]: e.target.value })} /></Field>
      ))}
      <Field label="Alignement"><AlignPicker value={s.align} onChange={(a) => set({ align: a })} /></Field>
    </div>
  );
}

// ------------------------- Header / Footer editors -------------------------
function HeaderEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const h = value; const set = (patch: any) => onChange({ ...h, ...patch });
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900">En-tête</h3>
      <Field label="Texte du logo"><input className="input" value={h.logoText || ''} onChange={(e) => set({ logoText: e.target.value })} /></Field>
      <Field label="Logo (URL d’image, optionnel)"><input className="input" placeholder="https://…" value={h.logoUrl || ''} onChange={(e) => set({ logoUrl: e.target.value })} /></Field>
      <Toggle checked={h.showNav ?? true} onChange={(v) => set({ showNav: v })} label="Afficher le menu" />
      <Toggle checked={h.sticky ?? true} onChange={(v) => set({ sticky: v })} label="En-tête fixe au défilement" />
      <Field label="Couleur de fond"><ColorGrid value={h.background} onChange={(c) => set({ background: c })} /></Field>
      <Field label="Couleur du texte"><ColorGrid value={h.textColor} onChange={(c) => set({ textColor: c })} /></Field>
      <div className="border-t border-gray-100 pt-3">
        <p className="mb-2 text-sm font-semibold text-gray-700">Bouton d’action</p>
        <ButtonEditor value={h.cta} onChange={(cta) => set({ cta })} />
      </div>
    </div>
  );
}

function FooterEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const f = value; const set = (patch: any) => onChange({ ...f, ...patch });
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900">Pied de page</h3>
      <Field label="Texte du logo"><input className="input" value={f.logoText || ''} onChange={(e) => set({ logoText: e.target.value })} /></Field>
      <Field label="Logo (URL d’image)"><input className="input" value={f.logoUrl || ''} onChange={(e) => set({ logoUrl: e.target.value })} /></Field>
      <Field label="Texte de présentation"><textarea className="input min-h-[70px]" value={f.text || ''} onChange={(e) => set({ text: e.target.value })} /></Field>
      <Field label="Texte “tous droits réservés”"><input className="input" value={f.allRightsText || ''} onChange={(e) => set({ allRightsText: e.target.value })} /></Field>
      <div className="border-t border-gray-100 pt-3">
        <Toggle checked={f.showNewsletter ?? true} onChange={(v) => set({ showNewsletter: v })} label="Bloc newsletter" />
        {f.showNewsletter && <Field label="Titre de la newsletter"><input className="input" value={f.newsletterTitle || ''} onChange={(e) => set({ newsletterTitle: e.target.value })} /></Field>}
      </div>
      <div className="border-t border-gray-100 pt-3 space-y-2">
        <Toggle checked={f.showCgv ?? true} onChange={(v) => set({ showCgv: v })} label="Afficher lien CGV" />
        {f.showCgv && <Field label="Contenu CGV"><textarea className="input min-h-[70px]" value={f.cgvContent || ''} onChange={(e) => set({ cgvContent: e.target.value })} /></Field>}
        <Toggle checked={f.showMentions ?? true} onChange={(v) => set({ showMentions: v })} label="Afficher mentions légales" />
        {f.showMentions && <Field label="Contenu mentions légales"><textarea className="input min-h-[70px]" value={f.mentionsContent || ''} onChange={(e) => set({ mentionsContent: e.target.value })} /></Field>}
      </div>
      <Field label="Couleur de fond"><ColorGrid value={f.background} onChange={(c) => set({ background: c })} /></Field>
      <Field label="Couleur du texte"><ColorGrid value={f.textColor} onChange={(c) => set({ textColor: c })} /></Field>
    </div>
  );
}
