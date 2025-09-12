// frontend/src/pages/CreatePortfolio.tsx

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper } from '../components/portfolio/Stepper';
import { ProjectSelectCard } from '../components/portfolio/ProjectSelectCard';
import { AssetPickerGrid } from '../components/portfolio/AssetPickerGrid';
import { PortfolioSettings as PortfolioSettingsComponent } from '../components/portfolio/PortfolioSettings';
import type { PortfolioSettings } from '../components/portfolio/PortfolioSettings';

import { useCreatePortfolio, useProjects } from '../hooks/useApi';
import type { Project } from '../services/types';

type Step = 0 | 1 | 2 | 3;
type PortfolioType = 'SAMPLE' | 'FULL';

interface ProjectSummary {
  id: string;
  name: string;
  year?: number | null;
  type?: string | null;
  assetCount?: number | null;
}

function normalizeProjectsShape(input: any): any[] {
  if (!input) return [];
  // Common envelope patterns: { data: [...] } or { items: [...] } or raw array
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.data)) return input.data;
  if (Array.isArray(input.items)) return input.items;
  if (Array.isArray(input.projects)) return input.projects;
  return [];
}

function toSummary(p: Project): ProjectSummary {
  return {
    id: String(p.id),
    name: p.projectName ?? 'Untitled Project',
    year: (p.yearCompletion ?? p.yearStart) ?? null,
    type: p.projectType ?? null,
    assetCount: p._count?.assets ?? (Array.isArray(p.assets) ? p.assets.length : 0),
  };
}

export default function CreatePortfolioPage() {
  const steps = ['Basic Info', 'Select Projects', 'Select Assets', 'Review'];
  const [step, setStep] = useState<Step>(0);

  // Step 1: basic
  const [name, setName] = useState('');
  const [type, setType] = useState<PortfolioType>('SAMPLE');
  const [includeCv, setIncludeCv] = useState(true);

  // Projects list (Step 2)
  const projectsQuery = useProjects();
  const rawProjectsEnvelope = projectsQuery?.data; // PaginatedResponse<Project> or ApiResponse<Project[]>
  const projects: ProjectSummary[] = useMemo(
    () => normalizeProjectsShape(rawProjectsEnvelope).map(toSummary),
    [rawProjectsEnvelope]
  );

  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<string[]>([]); // ordered project IDs

  // Initialize default order by recency (most recent first) once when projects load
  React.useEffect(() => {
    if (order.length === 0 && projects.length > 0) {
      const sorted = [...projects].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
      setOrder(sorted.map((p) => p.id));
    }
  }, [projects, order.length]);

  // Assets per selected project (Step 3)
  const [assetMap, setAssetMap] = useState<Record<string, { assetIds: string[]; heroAssetId?: string | null }>>({});

  // Portfolio settings state (for Swiss Design)
  const [portfolioSettings, setPortfolioSettings] = useState<PortfolioSettings>({
    colorScheme: 'classic',
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
    heroHeightMm: 200,
    stripHeightMm: 120,
    techHeightMm: 120,
    thumbHeightMm: 40,
  });

  const navigate = useNavigate();
  const createMutation = useCreatePortfolio();

  const limit = type === 'SAMPLE' ? { min: 3, max: 5 } : { min: 1, max: 50 };

  const canContinueFromStep0 = name.trim().length >= 3;
  const canContinueFromStep1 = selected.length >= limit.min && selected.length <= limit.max;
  const canContinueFromStep2 = selected.every((pid) => (assetMap[pid]?.assetIds?.length || 0) > 0);

  const orderedSelectedProjects: string[] = useMemo(() => {
    // Keep order in sync with selection
    const filtered = order.filter((id) => selected.includes(id));
    const missing = selected.filter((id) => !filtered.includes(id));
    return [...filtered, ...missing];
  }, [selected, order]);

  const idToProject = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const orderedProjectSummaries: ProjectSummary[] = useMemo(() => {
    return orderedSelectedProjects.map((id) => idToProject.get(id)).filter(Boolean) as ProjectSummary[];
  }, [idToProject, orderedSelectedProjects]);

  const toggleProject = (id: string) => {
    setSelected((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      // keep order aligned
      setOrder((ord) => {
        const set = new Set(next);
        const filtered = ord.filter((x) => set.has(x));
        const missing = next.filter((x) => !filtered.includes(x));
        return [...filtered, ...missing];
      });
      return next;
    });
  };

  const moveProject = (from: number, to: number) => {
    setOrder((prev) => {
      if (from < 0 || to < 0 || from >= prev.length || to >= prev.length) return prev;
      const copy = prev.slice();
      const [spliced] = copy.splice(from, 1);
      copy.splice(to, 0, spliced);
      return copy;
    });
  };

  const onAssetsChange = (projectId: string, next: { assetIds: string[]; heroAssetId?: string | null }) => {
    setAssetMap((prev) => ({ ...prev, [projectId]: next }));
  };

  // Page estimation (used to guide Sample portfolios)
  const MAX_SAMPLE_PAGES = 12;
  const estimatedProjectPages = useMemo(() => {
    return orderedSelectedProjects.reduce((sum, pid) => {
      const count = assetMap[pid]?.assetIds.length || 0;
      const pages = Math.max(1, Math.ceil(count / 2)); // ~2 images per page
      return sum + pages;
    }, 0);
  }, [orderedSelectedProjects, assetMap]);

  const totalEstimatedPages = 1 /* cover */ + estimatedProjectPages + (includeCv ? 1 : 0);
  const samplePageLimitExceeded = type === 'SAMPLE' && totalEstimatedPages > MAX_SAMPLE_PAGES;

  const startCreate = () => {
    const projectsPayload = orderedSelectedProjects.map((projectId, idx) => ({
      projectId,
      displayOrder: idx,
      includedAssets: assetMap[projectId]?.assetIds || [],
    }));

    createMutation.mutate(
      {
        portfolioName: name.trim(),
        portfolioType: type,
        cvIncluded: includeCv,
        projects: projectsPayload,
        settings: portfolioSettings, // Include Swiss Design settings
      },
      {
        onSuccess: (res: any) => {
          const created = res?.data; // ApiResponse<Portfolio>
          if (created?.id) {
            navigate(`/portfolios/${created.id}`);
          } else {
            // Fallback: go to list
            navigate('/portfolios');
          }
        },
      }
    );
  };

  // Basic loading/error UI for the projects list step
  const projectsLoading = projectsQuery?.isLoading;
  const projectsError = projectsQuery?.error;

  return (
    <div className="p-6">
      <Stepper steps={steps} current={step} onStepClick={(i) => setStep(i as Step)} />

      {step === 0 && (
        <section className="max-w-xl space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Portfolio Name
            </label>
            <input
              id="name"
              className="swiss-input w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g., Application – 2025 – Sample"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">At least 3 characters.</p>
          </div>

          <div>
            <span className="block text-sm font-medium mb-1">Type</span>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="SAMPLE"
                  checked={type === 'SAMPLE'}
                  onChange={() => setType('SAMPLE')}
                />
                <span>Sample (≤ 12 pages)</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="FULL"
                  checked={type === 'FULL'}
                  onChange={() => setType('FULL')}
                />
                <span>Full (40+ pages)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeCv}
                onChange={(e) => setIncludeCv(e.target.checked)}
              />
              <span>Include CV</span>
            </label>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-gray-500">
              Project selection limit: {limit.min}–{limit.max}
            </div>
            <button
              type="button"
              className={`px-4 py-2 border rounded ${canContinueFromStep0 ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-400 border-gray-200'}`}
              onClick={() => setStep(1)}
              disabled={!canContinueFromStep0}
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Select Projects</h2>
            <div className="text-sm text-gray-600">
              Selected {selected.length} / {limit.max} (min {limit.min})
            </div>
          </div>

          {projectsLoading && <div className="text-gray-500">Loading projects…</div>}
          {projectsError && <div className="text-red-600">Failed to load projects.</div>}

          {!projectsLoading && !projectsError && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projects.map((p) => {
                const currentIndex = orderedSelectedProjects.indexOf(p.id);
                return (
                  <ProjectSelectCard
                    key={p.id}
                    project={p}
                    selected={selected.includes(p.id)}
                    index={currentIndex === -1 ? orderedSelectedProjects.length : currentIndex}
                    onToggle={toggleProject}
                    onMove={moveProject}
                  />
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              className="px-4 py-2 border rounded bg-white text-black"
              onClick={() => setStep(0)}
            >
              Back
            </button>
            <button
              type="button"
              className={`px-4 py-2 border rounded ${canContinueFromStep1 ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-400 border-gray-200'}`}
              onClick={() => setStep(2)}
              disabled={!canContinueFromStep1}
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6">
          <h2 className="font-semibold">Select Assets per Project</h2>
          {orderedProjectSummaries.map((p) => {
            const state = assetMap[p.id] || { assetIds: [], heroAssetId: null };
            return (
              <div key={p.id} className="border rounded p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.year ?? '—'} · {p.type ?? '—'}</div>
                  </div>
                  <div className="text-xs text-gray-600">
                    Selected: {state.assetIds.length} {state.heroAssetId ? '· Hero set' : ''}
                  </div>
                </div>
                <AssetPickerGrid
                  projectId={p.id}
                  selectedAssetIds={state.assetIds}
                  heroAssetId={state.heroAssetId}
                  onChange={(next) => onAssetsChange(p.id, next)}
                />
              </div>
            );
          })}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              className="px-4 py-2 border rounded bg-white text-black"
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button
              type="button"
              className={`px-4 py-2 border rounded ${canContinueFromStep2 ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-400 border-gray-200'}`}
              onClick={() => setStep(3)}
              disabled={!canContinueFromStep2}
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-6">
          <h2 className="font-semibold">Review & Generate</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Summary */}
            <div className="space-y-4">
              <div className="border rounded p-4">
                <div className="font-medium mb-2">Summary</div>
                <ul className="text-sm list-disc ml-5 space-y-1">
                  <li>Name: {name}</li>
                  <li>Type: {type}</li>
                  <li>Include CV: {includeCv ? 'Yes' : 'No'}</li>
                  <li>Projects: {orderedSelectedProjects.length}</li>
                </ul>
              </div>
              
              <div className="border rounded p-4">
                <div className="font-medium mb-2">Estimated Page Count</div>
                <p className="text-sm text-gray-600">
                  Heuristic estimate based on assets (approx 1–2 images per page).
                </p>
                <ul className="text-sm list-disc ml-5 space-y-1">
                  {orderedProjectSummaries.map((p) => {
                    const count = assetMap[p.id]?.assetIds.length || 0;
                    const pages = Math.max(1, Math.ceil(count / 2));
                    return (
                      <li key={p.id}>
                        {p.name}: {count} assets → ~{pages} pages
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            
            {/* Right Column - Swiss Design Settings */}
            <div>
              <h3 className="font-medium mb-3">Swiss Design Settings</h3>
              <PortfolioSettingsComponent
                settings={portfolioSettings}
                onChange={setPortfolioSettings}
                projectCount={orderedSelectedProjects.length}
                estimatedPages={totalEstimatedPages}
              />
            </div>
          </div>

          {/* Sample portfolio guideline + estimate */}
          {type === 'SAMPLE' && (
            <div className={`text-sm ${samplePageLimitExceeded ? 'text-red-600' : 'text-gray-600'}`}>
              Guideline: Sample portfolios should be ≤ {MAX_SAMPLE_PAGES} pages. Estimated total: {totalEstimatedPages} page
              {totalEstimatedPages !== 1 ? 's' : ''}.
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              className="px-4 py-2 border rounded bg-white text-black"
              onClick={() => setStep(2)}
            >
              Back
            </button>
            <button
              type="button"
              className="px-4 py-2 border rounded bg-black text-white border-black disabled:opacity-50"
              onClick={startCreate}
              disabled={createMutation.isLoading || samplePageLimitExceeded}
            >
              Create Portfolio
            </button>
          </div>
        </section>
      )}
    </div>
  );
}