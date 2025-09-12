import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function PrintCVPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['cv-renderable'],
    queryFn: async () => {
      const { data } = await api.get('/api/cv/renderable');
      return data;
    },
  });

  const mm = (v: number) => `${v * 3.7795}px`;

  if (isLoading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (error || !data?.success || !data.data) return <div style={{ padding: 16, color: 'red' }}>Failed to load CV preview.</div>;

  const renderable = data.data as any;
  const colors = renderable.colorScheme || { primary: '#000', secondary: '#666', accent: '#DC2626', text: '#000', light: '#F5F5F5' };
  const m = renderable.margins || { top: 15, bottom: 15, left: 15, right: 15 };

  return (
    <div className="print-cv bg-white" style={{ padding: 0, margin: 0 }}>
      <div
        className="relative bg-white shadow ring-1 ring-gray-200 print-page avoid-break"
        style={{ width: mm(210), height: mm(297), paddingTop: mm(m.top), paddingBottom: mm(m.bottom), paddingLeft: mm(m.left), paddingRight: mm(m.right) }}
      >
        <div className="swiss-page-number">01</div>
        <div className="mb-2">
          <div className="text-xl font-bold" style={{ color: colors.accent }}>Curriculum Vitae</div>
          {renderable.cv?.personalInfo && (
            <div className="mt-1 text-sm">
              <div className="font-semibold" style={{ color: colors.text }}>{renderable.cv.personalInfo.name || ''}</div>
              <div className="text-xs" style={{ color: colors.secondary }}>
                {[renderable.cv.personalInfo.professionalTitle, renderable.cv.personalInfo.location].filter(Boolean).join(' · ')}
              </div>
              <div className="text-[10px] swiss-year">
                {[renderable.cv.personalInfo.email, renderable.cv.personalInfo.phone, renderable.cv.personalInfo.websiteUrl, renderable.cv.personalInfo.linkedinUrl].filter(Boolean).join(' · ')}
              </div>
            </div>
          )}
        </div>

        {renderable.cv?.personalInfo?.professionalSummary && (
          <div className="text-[12px] leading-5 text-gray-800 mb-2">
            {renderable.cv.personalInfo.professionalSummary}
          </div>
        )}

        {renderable.cv?.experiences?.length ? (
          <div className="mb-2">
            <div className="swiss-section-title mb-1" style={{ textTransform: 'none' }}>Experience</div>
            <div className="space-y-1">
              {renderable.cv.experiences.map((e: any, idx: number) => (
                <div key={idx} className="text-[11px]">
                  <div className="font-medium" style={{ color: colors.text }}>{e.positionTitle} — {e.companyName}</div>
                  <div className="text-[10px] swiss-year">
                    {new Date(e.startDate).getFullYear()}-{e.endDate ? new Date(e.endDate).getFullYear() : 'Present'} · {e.location}
                  </div>
                  {e.description && (
                    <div className="text-[11px] text-gray-800">{e.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {renderable.cv?.education?.length ? (
          <div className="mb-2">
            <div className="swiss-section-title mb-1" style={{ textTransform: 'none' }}>Education</div>
            <div className="space-y-1">
              {renderable.cv.education.map((e: any, idx: number) => (
                <div key={idx} className="text-[11px]">
                  <div className="font-medium" style={{ color: colors.text }}>{e.degreeType}, {e.institutionName}</div>
                  <div className="text-[10px] swiss-year">
                    {new Date(e.startDate).getFullYear()}-{e.endDate ? new Date(e.endDate).getFullYear() : ''} · {e.location}
                  </div>
                  {e.grade && (
                    <div className="text-[11px] text-gray-800">{e.grade}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {renderable.cv?.skills?.length ? (
          <div>
            <div className="swiss-section-title mb-1" style={{ textTransform: 'none' }}>Skills</div>
            <div className="text-[11px] text-gray-800">
              {renderable.cv.skills.map((s: any) => s.skillName).join(' · ')}
            </div>
          </div>
        ) : null}
        <div className="absolute bottom-2 right-4 text-[10px]" style={{ color: colors.accent }}>
          01
        </div>
      </div>
    </div>
  );
}
