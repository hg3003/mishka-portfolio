import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { portfoliosApi } from '../services/portfolios';
import { SwissMinimalPreview } from '../components/portfolio/SwissMinimalPreview';

export default function PortfolioHtmlPreview() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['portfolio-renderable', id],
    queryFn: () => portfoliosApi.getRenderable(id!),
    enabled: !!id,
  });

  if (isLoading) return <div>Loading…</div>;
  if (error || !data?.success || !data.data) return <div>Failed to load preview.</div>;

  return (
    <div className="p-4 overflow-auto bg-gray-100">
      <SwissMinimalPreview data={data.data} />
    </div>
  );
}