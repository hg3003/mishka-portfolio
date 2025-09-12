// frontend/src/pages/PrintPortfolio.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { portfoliosApi } from '../services/portfolios';
import { SwissMinimalPreview } from '../components/portfolio/SwissMinimalPreview';

// Print-friendly page: renders the same HTML layout, but with print CSS via global stylesheet
export default function PrintPortfolioPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['portfolio-renderable', id],
    queryFn: () => portfoliosApi.getRenderable(id!),
    enabled: !!id,
  });

  if (isLoading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (error || !data?.success || !data.data) return <div style={{ padding: 16, color: 'red' }}>Failed to load preview.</div>;

  // Use a neutral background and reset app chrome; printing will use @page
  return (
    <div className="print-portfolio bg-white" style={{ padding: 0, margin: 0 }}>
      {/* Render pages directly; each page element applies its own A4 size and margins */}
      <SwissMinimalPreview data={data.data} />
    </div>
  );
}
