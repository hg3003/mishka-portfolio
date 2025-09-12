import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, type AppSettings } from '../services/settings';

const schemes = {
  classic: { label: 'Classic (Red)', accent: '#DC2626' },
  modernBlue: { label: 'Modern (Blue)', accent: '#2563EB' },
  warmMinimal: { label: 'Warm (Orange)', accent: '#EA580C' },
} as const;

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get });
  const updateMutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });

  const initial = data?.data as AppSettings | undefined;
  const [form, setForm] = useState<{ colorScheme: 'classic'|'modernBlue'|'warmMinimal'; margins: { top: number; bottom: number; left: number; right: number } } | null>(null);

  const current = useMemo(() => {
    return form ?? (initial ? { colorScheme: initial.colorScheme, margins: initial.margins } : null);
  }, [form, initial]);

  if (isLoading || !current) return <div className="p-6">Loading…</div>;

  const onSave = () => {
    updateMutation.mutate(current);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <section className="border rounded p-4">
        <h2 className="font-semibold mb-3">Theme</h2>
        <div className="space-y-2">
          {(Object.keys(schemes) as Array<'classic'|'modernBlue'|'warmMinimal'>).map((k) => (
            <label key={k} className="flex items-center gap-2">
              <input
                type="radio"
                name="scheme"
                checked={current.colorScheme === k}
                onChange={() => setForm({ ...(current as any), colorScheme: k })}
              />
              <span>{schemes[k].label}</span>
              <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: schemes[k].accent }} />
            </label>
          ))}
        </div>
      </section>

      <section className="border rounded p-4">
        <h2 className="font-semibold mb-3">Global Margins (mm)</h2>
        <div className="grid grid-cols-4 gap-3 text-sm">
          {(['top','right','bottom','left'] as const).map((side) => (
            <label key={side} className="flex items-center gap-2">
              <span className="capitalize w-16">{side}</span>
              <input
                type="number"
                className="swiss-input w-24"
                min={0}
                max={40}
                step={1}
                value={(current.margins as any)[side]}
                onChange={(e) => setForm({ ...(current as any), margins: { ...current.margins, [side]: Number(e.target.value) || 0 } })}
              />
            </label>
          ))}
        </div>
      </section>

      <div>
        <button
          type="button"
          onClick={onSave}
          disabled={updateMutation.isPending}
          className="px-4 py-2 border rounded bg-black text-white disabled:opacity-50"
        >
          {updateMutation.isPending ? 'Saving…' : 'Save Settings'}
        </button>
        {updateMutation.isSuccess && (
          <span className="ml-3 text-sm text-green-700">Saved.</span>
        )}
      </div>
    </div>
  );
}
