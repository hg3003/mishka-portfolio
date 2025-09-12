// frontend/src/pages/PortfolioDetail.tsx

import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDuplicatePortfolio, usePortfolio } from '../hooks/useApi';
import type { Portfolio } from '../services/types';
import { API_URL } from '../lib/api';
import { useGeneratePortfolio } from '../hooks/useApi';

const formatDateTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString() : '—';

function buildPdfUrl(filePath?: string | null): string | undefined {
  if (!filePath) return undefined;
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  return `${API_URL}${filePath}`;
}



export default function PortfolioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: resp, isLoading, error } = usePortfolio(id as string);
  const duplicateMutation = useDuplicatePortfolio();
  const generateMutation = useGeneratePortfolio();

  const portfolio: Portfolio | undefined = (resp && (resp as any).data) || undefined;
  const pdfUrl = buildPdfUrl(portfolio?.filePath);

  if (isLoading) return <div className="p-6 text-gray-500">Loading…</div>;
  if (error || !portfolio) return <div className="p-6 text-red-600">Failed to load portfolio.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{portfolio.portfolioName}</h1>
          <div className="text-sm text-gray-600">
            {portfolio.portfolioType} · {(portfolio._count?.projects ?? portfolio.projects?.length ?? 0)} projects · Updated {formatDateTime(portfolio.updatedAt)}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            className="px-3 py-2 border rounded bg-white text-black disabled:opacity-50"
            onClick={() => generateMutation.mutate(portfolio.id)}
            disabled={generateMutation.isLoading}
            title={pdfUrl ? 'Regenerate PDF' : 'Generate PDF'}
          >
            {generateMutation.isLoading ? 'Generating…' : pdfUrl ? 'Regenerate' : 'Generate'}
          </button>
          <button
            type="button"
            className="px-3 py-2 border rounded bg-white text-black"
            onClick={() =>
              duplicateMutation.mutate(portfolio.id, {
                onSuccess: (res: any) => {
                  const created = res?.data;
                  if (created?.id) navigate(`/portfolios/${created.id}`);
                },
              })
            }
            disabled={duplicateMutation.isLoading}
          >
            Duplicate
          </button>
          <Link
            to={`/portfolios/${portfolio.id}/preview`}
            className="px-3 py-2 border rounded bg-white text-black"
            title="HTML Preview"
          >
            Preview (HTML)
          </Link>
          <a
            className={`px-3 py-2 border rounded ${pdfUrl ? 'bg-white text-black' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            aria-disabled={!pdfUrl}
            href={pdfUrl || undefined}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              if (!pdfUrl) e.preventDefault();
            }}
          >
            Download PDF
          </a>
        </div>
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold">Included Projects</h2>
        <div className="border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 border-b">#</th>
                <th className="text-left px-3 py-2 border-b">Project</th>
                <th className="text-left px-3 py-2 border-b">Assets</th>
              </tr>
            </thead>
            <tbody>
              {(portfolio.projects || [])
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((it, idx) => (
                  <tr key={`${it.projectId}-${idx}`} className="border-b">
                    <td className="px-3 py-2">{idx + 1}</td>
                    <td className="px-3 py-2">{it.project?.projectName || it.projectId}</td>
                    <td className="px-3 py-2">{Array.isArray(it.includedAssets) ? it.includedAssets.length : 0}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <div>
        <Link to="/portfolios" className="text-sm underline">
          ← Back to list
        </Link>
      </div>
    </div>
  );
}