'use client';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { COLOR_PALETTE } from '@/lib/colors';
import type { Align } from '@/lib/blocks';

export function ColorGrid({ value, onChange }: { value?: string; onChange: (c: string) => void }) {
  return (
    <div className="grid grid-cols-9 gap-1.5">
      {COLOR_PALETTE.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          title={c}
          className={`h-6 w-6 rounded-md ring-offset-1 transition ${value === c ? 'ring-2 ring-brand-600' : 'ring-1 ring-black/10'}`}
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

export function AlignPicker({ value, onChange }: { value?: Align; onChange: (a: Align) => void }) {
  const opts: { v: Align; Icon: any }[] = [
    { v: 'left', Icon: AlignLeft },
    { v: 'center', Icon: AlignCenter },
    { v: 'right', Icon: AlignRight },
  ];
  return (
    <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
      {opts.map(({ v, Icon }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`grid h-8 w-8 place-items-center rounded-md ${value === v ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
      {children}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-brand-600' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${checked ? 'left-5' : 'left-0.5'}`} />
      </button>
    </label>
  );
}
