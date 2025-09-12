// frontend/src/components/portfolio/AssetPickerGrid.tsx

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../../services/projects';
import type { ProjectAsset } from '../../services/types';
import { API_URL } from '../../lib/api';

interface UIAsset {
  id: string;
  fileName: string;
  url: string;
  thumbUrl?: string;
}

interface Props {
  projectId: string;
  selectedAssetIds: string[];
  heroAssetId?: string | null;
  onChange: (next: { assetIds: string[]; heroAssetId?: string | null }) => void;
}

function toUrl(base: string, path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${base}${path}`;
}

// Extract a web path rooted at /uploads from a stored filePath or fall back to an inferred path
function toWebUploadsPath(filePath: string | null | undefined, fileName: string): string {
  if (filePath) {
    // If the DB path already contains /uploads/, slice from there
    const idx = filePath.indexOf('/uploads/');
    if (idx >= 0) return filePath.slice(idx);
    // If it starts with uploads/ or /uploads, normalize to /uploads/...
    if (filePath.startsWith('uploads/')) return `/${filePath}`;
    if (filePath.startsWith('/uploads/')) return filePath;
    // If it looks like a relative projects path, prefix /uploads/
    if (filePath.startsWith('projects/')) return `/uploads/${filePath}`;
    if (filePath.startsWith('/projects/')) return `/uploads${filePath}`;
  }
  // Fallback: assume optimized location by file name
  return `/uploads/projects/optimized/${fileName}`;
}

function toThumbWebPath(webPath: string, fileName: string): string {
  // Prefer deriving from the known optimized path
  if (webPath.includes('/projects/optimized/')) {
    return webPath
      .replace('/projects/optimized/', '/projects/thumbnails/')
      .replace(/\.[^.]+$/, '_thumb.jpeg');
  }
  // Fallback: construct thumbnail path from fileName
  return `/uploads/projects/thumbnails/${fileName.replace(/\.[^.]+$/, '_thumb.jpeg')}`;
}

export const AssetPickerGrid: React.FC<Props> = ({
  projectId,
  selectedAssetIds,
  heroAssetId,
  onChange,
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['projectAssets', projectId],
    queryFn: () => projectsApi.getAssets(projectId),
    enabled: !!projectId,
  });

  const base = API_URL;

  const assets: UIAsset[] = useMemo(() => {
    const arr = (data && Array.isArray((data as any).data)) ? (data as any).data as ProjectAsset[] : [];
    return arr.map((a) => {
      // Prefer backend-provided URL if present (some endpoints may include it)
      const webPath = a.url
        ? undefined
        : toWebUploadsPath(a.filePath, a.fileName);
      const url = a.url || toUrl(base, webPath) || '';
      const thumbWebPath = a.thumbnailUrl
        ? undefined
        : toThumbWebPath(webPath || '', a.fileName);
      const thumb = a.thumbnailUrl || toUrl(base, thumbWebPath);

      return { id: a.id, fileName: a.fileName, url, thumbUrl: thumb };
    });
  }, [data, base]);


  const selectedSet = useMemo(() => new Set(selectedAssetIds), [selectedAssetIds]);

  const toggle = (asset: UIAsset) => {
    const next = new Set(selectedSet);
    if (next.has(asset.id)) next.delete(asset.id);
    else next.add(asset.id);
    onChange({ assetIds: Array.from(next), heroAssetId: heroAssetId ?? null });
  };

  const markHero = (asset: UIAsset) => {
    if (!selectedSet.has(asset.id)) return;
    onChange({ assetIds: selectedAssetIds, heroAssetId: asset.id });
  };

  if (isLoading) return <div className="text-gray-500 text-sm">Loading assets…</div>;
  if (error) return <div className="text-red-600 text-sm">Failed to load assets.</div>;
  if (assets.length === 0) return <div className="text-gray-500 text-sm">No assets for this project.</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {assets.map((asset) => {
        const selected = selectedSet.has(asset.id);
        const isHero = heroAssetId === asset.id;
        return (
          <div
            key={asset.id}
            className={[
              'relative border rounded overflow-hidden group',
              selected ? 'border-black' : 'border-gray-300',
            ].join(' ')}
          >
            <img
              src={asset.thumbUrl || asset.url}
              alt={asset.fileName}
              className="w-full h-28 object-cover"
              loading="lazy"
            />
            <div className="absolute top-1 left-1 flex items-center gap-1">
              <input
                id={`asset-${asset.id}`}
                type="checkbox"
                className="w-4 h-4 accent-black"
                checked={selected}
                onChange={() => toggle(asset)}
              />
              <label htmlFor={`asset-${asset.id}`} className="text-[10px] bg-white px-1 border rounded">
                Select
              </label>
            </div>
            <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => markHero(asset)}
                disabled={!selected}
                className={[
                  'text-[10px] px-2 py-1 border rounded',
                  isHero ? 'bg-black text-white border-black' : 'bg-white text-black border-black',
                ].join(' ')}
                title="Mark as hero"
              >
                {isHero ? 'Hero ✓' : 'Mark Hero'}
              </button>
              {selected && (
                <span className="text-[10px] bg-white px-1 border rounded">
                  Selected
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
