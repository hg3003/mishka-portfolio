// frontend/src/pages/Portfolios.tsx
import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDeletePortfolio, useDuplicatePortfolio, usePortfolios } from '../hooks/useApi';
import type { Portfolio } from '../services/types';
import { API_URL } from '../lib/api';

const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

function buildPdfUrl(filePath?: string | null): string | undefined {
  if (!filePath) return undefined;
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  return `${API_URL}${filePath}`;
}

export default function PortfoliosPage() {
  const { data: resp, isLoading, error } = usePortfolios();
  const navigate = useNavigate();
  const duplicateMutation = useDuplicatePortfolio();
  const deleteMutation = useDeletePortfolio();

  // Your services return ApiResponse<Portfolio[]>
  const portfolios: Portfolio[] = useMemo(() => {
    const arr = (resp && Array.isArray((resp as any).data)) ? (resp as any).data : [];
    return arr;
  }, [resp]);

  const [filter, setFilter] = useState<'ALL' | 'SAMPLE' | 'FULL'>('ALL');

  const filtered = useMemo(() => {
    if (filter === 'ALL') return portfolios;
    return portfolios.filter((p) => p.portfolioType === filter);
  }, [portfolios, filter]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Portfolios</h1>
        <Link
          to="/portfolios/new"
          className="border border-black bg-black text-white px-4 py-2 rounded"
        >
          New Portfolio
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1 border rounded ${filter === 'ALL' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('SAMPLE')}
          className={`px-3 py-1 border rounded ${filter === 'SAMPLE' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'}`}
        >
          Sample
        </button>
        <button
          onClick={() => setFilter('FULL')}
          className={`px-3 py-1 border rounded ${filter === 'FULL' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'}`}
        >
          Full
        </button>
      </div>

      {isLoading && <div className="text-gray-500">Loading portfolios…</div>}
      {error && <div className="text-red-600">Failed to load portfolios.</div>}
      {resp && (resp as any).success === false && !error && (
        <div className="text-red-600">Failed to load portfolios.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const projectCount = p._count?.projects ?? (Array.isArray(p.projects) ? p.projects.length : 0);
          const pdfUrl = buildPdfUrl(p.filePath);
          return (
            <div key={p.id} className="swiss-card border rounded p-4 bg-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">{p.portfolioName}</h2>
                <span className="text-xs px-2 py-1 border rounded">
                  {p.portfolioType}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {projectCount} projects · Created {formatDate(p.createdAt)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1 border rounded bg-white text-black"
                  onClick={() => navigate(`/portfolios/${p.id}`)}
                >
                  Open
                </button>
                <button
                  type="button"
                  className="px-3 py-1 border rounded bg-white text-black disabled:opacity-50"
                  disabled={duplicateMutation.isLoading}
                  onClick={() =>
                    duplicateMutation.mutate(p.id, {
                      onSuccess: (res: any) => {
                        // ApiResponse<Portfolio>
                        const created = res?.data;
                        if (created?.id) navigate(`/portfolios/${created.id}`);
                      },
                    })
                  }
                  title="Duplicate"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  className="px-3 py-1 border rounded bg-white text-black disabled:opacity-50"
                  disabled={deleteMutation.isLoading}
                  onClick={() => deleteMutation.mutate(p.id)}
                  title="Delete"
                >
                  Delete
                </button>
                <a
                  className={`px-3 py-1 border rounded ${pdfUrl ? 'bg-white text-black' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  aria-disabled={!pdfUrl}
                  href={pdfUrl || undefined}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    if (!pdfUrl) e.preventDefault();
                  }}
                >
                  Download
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}