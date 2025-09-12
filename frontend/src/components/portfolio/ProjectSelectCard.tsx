// frontend/src/components/portfolio/ProjectSelectCard.tsx

import React from 'react';

type ProjectSummary = {
  id: string;
  name: string;
  year?: number | null;
  type?: string | null;
  assetCount?: number | null;
};

interface Props {
  project: ProjectSummary;
  selected: boolean;
  index: number;
  onToggle: (id: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}


export const ProjectSelectCard: React.FC<Props> = ({ project, selected, index, onToggle, onMove }) => {
  // Simple HTML5 drag & drop
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', String(index));
  };
  const handleDrop = (e: React.DragEvent) => {
    const from = Number(e.dataTransfer.getData('text/plain'));
    if (!Number.isNaN(from) && from !== index) {
      onMove(from, index);
    }
  };

  return (
    <div
      className={[
        'border rounded p-3 flex items-center justify-between gap-3',
        selected ? 'border-black bg-white' : 'border-gray-300 bg-white',
      ].join(' ')}
      draggable
      onDragStart={handleDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-3">
        <input
          id={`project-${project.id}`}
          type="checkbox"
          className="w-4 h-4"
          checked={selected}
          onChange={() => onToggle(project.id)}
        />
        <label htmlFor={`project-${project.id}`} className="cursor-pointer">
          <div className="font-medium">{project.name}</div>
          <div className="text-xs text-gray-500">
            {project.year ?? '—'} · {project.type ?? '—'} · {project.assetCount ?? 0} assets
          </div>
        </label>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="swiss-button px-2 py-1 text-xs border border-gray-300 bg-white text-black"
          onClick={() => onMove(index, Math.max(0, index - 1))}
          disabled={index === 0}
          aria-label="Move up"
          title="Move up"
        >
          ↑
        </button>
        <button
          type="button"
          className="swiss-button px-2 py-1 text-xs border border-gray-300 bg-white text-black"
          onClick={() => onMove(index, index + 1)}
          aria-label="Move down"
          title="Move down"
        >
          ↓
        </button>
      </div>
    </div>
  );
};